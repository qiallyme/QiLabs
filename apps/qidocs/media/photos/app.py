"""
QiPics - AI Stock Image Generator
Modern desktop app with web-based UI
"""

import webview
import os
import sys
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
import threading
import time
import requests
from PIL import Image, ImageDraw
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import OpenAI for DALL-E
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class ImageGeneratorAPI:
    """Backend API for the image generator"""
    
    def __init__(self):
        self.csv_path = None
        self.output_folder = None
        self.is_generating = False
        self.current_progress = 0
        self.total_images = 0
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.window = None
        
    def set_window(self, window):
        """Set the webview window reference"""
        self.window = window
        
    def get_api_key(self):
        """Get the stored API key"""
        return self.api_key
    
    def set_api_key(self, key):
        """Store the API key"""
        self.api_key = key
        return {"success": True}
    
    def select_csv(self):
        """Open file dialog to select CSV"""
        file_types = ('CSV Files (*.csv)', 'All Files (*.*)')
        result = self.window.create_file_dialog(
            webview.OPEN_DIALOG,
            file_types=file_types
        )
        
        if result and len(result) > 0:
            self.csv_path = result[0]
            
            # Read and validate CSV
            try:
                df = pd.read_csv(self.csv_path)
                row_count = len(df)
                
                return {
                    "success": True,
                    "path": self.csv_path,
                    "count": min(row_count, 30),
                    "total": row_count,
                    "warning": "Only first 30 images will be generated" if row_count > 30 else None
                }
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No file selected"}
    
    def create_output_folder(self):
        """Create output folder with date and increment"""
        base_dir = Path(self.csv_path).parent
        date_str = datetime.now().strftime("%Y%m%d")
        
        increment = 1
        while True:
            folder_name = f"generated_images_{date_str}_{increment:03d}"
            folder_path = base_dir / folder_name
            if not folder_path.exists():
                folder_path.mkdir(parents=True, exist_ok=True)
                return folder_path
            increment += 1
    
    def get_style_prompt_modifier(self, styling):
        """Convert styling option to prompt modifier"""
        style_modifiers = {
            "illustration": "digital illustration style, artistic, illustrated",
            "photorealistic": "photorealistic, high quality photo, realistic photography",
            "abstract": "abstract art style, modern abstract, artistic interpretation",
            "3d": "3D rendered, cinema 4d style, three dimensional rendering",
            "line art": "line art style, clean lines, minimalist line drawing",
            "random": ""
        }
        
        styling_lower = styling.lower().strip()
        return style_modifiers.get(styling_lower, "")
    
    def generate_image_openai(self, prompt, styling):
        """Generate image using OpenAI DALL-E"""
        if not OPENAI_AVAILABLE:
            raise Exception("OpenAI package not installed")
        
        if not self.api_key:
            raise Exception("Please enter your OpenAI API key")
        
        client = OpenAI(api_key=self.api_key)
        
        style_modifier = self.get_style_prompt_modifier(styling)
        full_prompt = f"{prompt}, {style_modifier}" if style_modifier else prompt
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=full_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        image_response = requests.get(image_url)
        image = Image.open(BytesIO(image_response.content))
        
        return image
    
    def generate_placeholder_image(self, prompt, styling):
        """Generate placeholder image for testing"""
        img = Image.new('RGB', (1024, 1024), color=(73, 109, 137))
        d = ImageDraw.Draw(img)
        
        text_lines = [
            "PLACEHOLDER IMAGE",
            f"Prompt: {prompt[:50]}...",
            f"Style: {styling}"
        ]
        
        y_offset = 400
        for line in text_lines:
            d.text((100, y_offset), line, fill=(255, 255, 255))
            y_offset += 50
        
        return img
    
    def update_progress(self, current, total, filename, status="generating"):
        """Update progress via JavaScript"""
        if self.window:
            percent = int((current / total) * 100)
            self.window.evaluate_js(f"""
                updateProgress({percent}, {current}, {total}, "{filename}", "{status}");
            """)
    
    def generate_images_worker(self):
        """Worker thread for image generation"""
        try:
            df = pd.read_csv(self.csv_path)
            
            required_cols = ["filename", "prompt", "styling"]
            if not all(col in df.columns for col in required_cols):
                raise Exception(f"CSV must contain: {', '.join(required_cols)}")
            
            df = df.head(30)
            self.total_images = len(df)
            
            self.output_folder = self.create_output_folder()
            
            use_placeholder = not self.api_key or not OPENAI_AVAILABLE
            
            if use_placeholder:
                self.update_progress(0, self.total_images, "", "placeholder")
            
            for idx, row in df.iterrows():
                if not self.is_generating:
                    break
                
                filename = row["filename"]
                prompt = row["prompt"]
                styling = row["styling"]
                
                if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    filename += ".png"
                
                self.update_progress(idx, self.total_images, filename, "generating")
                
                try:
                    if use_placeholder:
                        image = self.generate_placeholder_image(prompt, styling)
                        time.sleep(0.5)
                    else:
                        image = self.generate_image_openai(prompt, styling)
                    
                    output_path = self.output_folder / filename
                    image.save(output_path)
                    
                except Exception as e:
                    print(f"Error generating {filename}: {str(e)}")
                    continue
            
            if self.is_generating:
                self.update_progress(self.total_images, self.total_images, "", "complete")
                self.open_output_folder()
            else:
                self.update_progress(0, self.total_images, "", "cancelled")
                
        except Exception as e:
            if self.window:
                self.window.evaluate_js(f'showError("{str(e)}");')
        finally:
            self.is_generating = False
    
    def start_generation(self):
        """Start the image generation process"""
        if not self.csv_path:
            return {"success": False, "error": "Please select a CSV file first"}
        
        if self.is_generating:
            return {"success": False, "error": "Generation already in progress"}
        
        self.is_generating = True
        thread = threading.Thread(target=self.generate_images_worker, daemon=True)
        thread.start()
        
        return {"success": True}
    
    def open_output_folder(self):
        """Open the output folder"""
        if self.output_folder:
            if sys.platform == "win32":
                os.startfile(self.output_folder)
            elif sys.platform == "darwin":
                os.system(f'open "{self.output_folder}"')
            else:
                os.system(f'xdg-open "{self.output_folder}"')


def get_html():
    """Return the HTML for the UI"""
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QiPics - AI Image Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            color: #555;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .input-group {
            display: flex;
            gap: 10px;
        }
        
        input[type="text"],
        input[type="password"] {
            flex: 1;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        .btn-generate {
            width: 100%;
            padding: 16px;
            font-size: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin-top: 20px;
        }
        
        .btn-generate:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-generate:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 12px 15px;
            border-radius: 4px;
            font-size: 13px;
            color: #666;
            line-height: 1.6;
        }
        
        .progress-container {
            margin: 30px 0;
            text-align: center;
        }
        
        .progress-circle {
            width: 180px;
            height: 180px;
            margin: 0 auto 20px;
            position: relative;
        }
        
        .progress-circle svg {
            transform: rotate(-90deg);
        }
        
        .progress-circle circle {
            fill: none;
            stroke-width: 10;
        }
        
        .progress-bg {
            stroke: #e0e0e0;
        }
        
        .progress-bar {
            stroke: #667eea;
            stroke-linecap: round;
            transition: stroke-dashoffset 0.5s ease;
        }
        
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        
        .status-text {
            color: #666;
            font-size: 14px;
            min-height: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
        }
        
        .status-text.success {
            color: #4caf50;
        }
        
        .status-text.error {
            color: #f44336;
        }
        
        .status-text.warning {
            color: #ff9800;
        }
        
        .file-path {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            word-break: break-all;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 QiPics</h1>
        <p class="subtitle">AI Stock Image Generator</p>
        
        <div class="section">
            <label>CSV File</label>
            <div class="input-group">
                <input type="text" id="csvPath" placeholder="Select a CSV file..." readonly>
                <button class="btn-secondary" onclick="selectCSV()">Browse</button>
            </div>
            <div id="csvInfo" class="file-path hidden"></div>
        </div>
        
        <div class="section">
            <label>API Key (OpenAI)</label>
            <input type="password" id="apiKey" placeholder="sk-...">
            <div class="info-box" style="margin-top: 8px;">
                Leave blank to generate test placeholders. Get your key at <b>platform.openai.com</b>
            </div>
        </div>
        
        <div class="info-box">
            <strong>CSV Format:</strong> filename, prompt, styling<br>
            <strong>Styles:</strong> illustration, photorealistic, abstract, 3d, line art, random
        </div>
        
        <div class="progress-container">
            <div class="progress-circle">
                <svg width="180" height="180">
                    <circle class="progress-bg" cx="90" cy="90" r="80"></circle>
                    <circle class="progress-bar" cx="90" cy="90" r="80" 
                            stroke-dasharray="502.4" 
                            stroke-dashoffset="502.4" 
                            id="progressCircle"></circle>
                </svg>
                <div class="progress-text" id="progressText">0%</div>
            </div>
            <div class="status-text" id="statusText">
                Ready to generate images
            </div>
        </div>
        
        <button class="btn-generate" id="generateBtn" onclick="startGeneration()">
            Generate Images
        </button>
    </div>
    
    <script>
        let csvLoaded = false;
        
        async function selectCSV() {
            const result = await pywebview.api.select_csv();
            if (result.success) {
                document.getElementById('csvPath').value = result.path.split(/[\\\\/]/).pop();
                document.getElementById('csvInfo').textContent = 
                    `📊 ${result.count} images will be generated` + 
                    (result.warning ? ` (${result.warning})` : '');
                document.getElementById('csvInfo').classList.remove('hidden');
                csvLoaded = true;
            } else {
                showError(result.error || 'Failed to load CSV');
            }
        }
        
        async function startGeneration() {
            if (!csvLoaded) {
                showError('Please select a CSV file first');
                return;
            }
            
            const apiKey = document.getElementById('apiKey').value.trim();
            if (apiKey) {
                await pywebview.api.set_api_key(apiKey);
            }
            
            const btn = document.getElementById('generateBtn');
            btn.disabled = true;
            btn.textContent = 'Generating...';
            
            const result = await pywebview.api.start_generation();
            if (!result.success) {
                showError(result.error);
                btn.disabled = false;
                btn.textContent = 'Generate Images';
            }
        }
        
        function updateProgress(percent, current, total, filename, status) {
            const circle = document.getElementById('progressCircle');
            const text = document.getElementById('progressText');
            const statusText = document.getElementById('statusText');
            const btn = document.getElementById('generateBtn');
            
            // Update circle
            const circumference = 502.4;
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            
            // Update percentage
            text.textContent = percent + '%';
            
            // Update status
            statusText.className = 'status-text';
            if (status === 'complete') {
                statusText.classList.add('success');
                statusText.innerHTML = `✓ Complete!<br>${total} images generated`;
                btn.disabled = false;
                btn.textContent = 'Generate Images';
            } else if (status === 'cancelled') {
                statusText.classList.add('error');
                statusText.textContent = 'Generation cancelled';
                btn.disabled = false;
                btn.textContent = 'Generate Images';
            } else if (status === 'placeholder') {
                statusText.classList.add('warning');
                statusText.textContent = '⚠️ Using placeholder images (no API key)';
            } else if (filename) {
                statusText.textContent = `Generating: ${current + 1}/${total}`;
                statusText.innerHTML += `<br><small>${filename}</small>`;
            }
        }
        
        function showError(message) {
            const statusText = document.getElementById('statusText');
            statusText.className = 'status-text error';
            statusText.textContent = '❌ ' + message;
        }
        
        // Load saved API key on startup
        window.addEventListener('pywebviewready', async function() {
            const apiKey = await pywebview.api.get_api_key();
            if (apiKey) {
                document.getElementById('apiKey').value = apiKey;
            }
        });
    </script>
</body>
</html>
    """


def main():
    """Main application entry point"""
    api = ImageGeneratorAPI()
    
    window = webview.create_window(
        'QiPics - AI Image Generator',
        html=get_html(),
        js_api=api,
        width=700,
        height=850,
        resizable=False,
        background_color='#667eea'
    )
    
    api.set_window(window)
    webview.start(debug=False)


if __name__ == '__main__':
    main()

