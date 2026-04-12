"""
AI Stock Image Generator - Desktop Application
Batch generate AI images from CSV file with custom prompts and styling
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd
import os
import sys
from datetime import datetime
from pathlib import Path
import threading
import time
import requests
from PIL import Image
from io import BytesIO

# Import OpenAI for DALL-E (you can switch to other providers)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class ImageGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Stock Image Generator")
        self.root.geometry("700x500")
        self.root.resizable(False, False)
        
        self.csv_path = None
        self.output_folder = None
        self.is_generating = False
        self.current_progress = 0
        self.total_images = 0
        
        # API Configuration
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.api_provider = "openai"  # Options: openai, stability, replicate
        
        self.setup_ui()
        
    def setup_ui(self):
        """Create the user interface"""
        
        # Title
        title_label = tk.Label(
            self.root, 
            text="AI Stock Image Generator",
            font=("Arial", 20, "bold"),
            pady=20
        )
        title_label.pack()
        
        # CSV File Selection Frame
        csv_frame = tk.Frame(self.root, pady=10)
        csv_frame.pack(fill="x", padx=30)
        
        tk.Label(csv_frame, text="CSV File:", font=("Arial", 10)).pack(anchor="w")
        
        csv_input_frame = tk.Frame(csv_frame)
        csv_input_frame.pack(fill="x", pady=5)
        
        self.csv_entry = tk.Entry(csv_input_frame, font=("Arial", 10), state="readonly")
        self.csv_entry.pack(side="left", fill="x", expand=True)
        
        browse_btn = tk.Button(
            csv_input_frame,
            text="Browse",
            command=self.browse_csv,
            font=("Arial", 10),
            padx=15
        )
        browse_btn.pack(side="left", padx=(10, 0))
        
        # API Configuration Frame
        api_frame = tk.Frame(self.root, pady=10)
        api_frame.pack(fill="x", padx=30)
        
        tk.Label(
            api_frame,
            text="API Key (OpenAI/Stability):",
            font=("Arial", 10)
        ).pack(anchor="w")
        
        self.api_entry = tk.Entry(api_frame, font=("Arial", 10), show="*")
        self.api_entry.pack(fill="x", pady=5)
        self.api_entry.insert(0, self.api_key)
        
        # Info Label
        info_text = "CSV Format: filename, prompt, styling\nStyling: illustration, photorealistic, abstract, 3d, line art, random"
        info_label = tk.Label(
            self.root,
            text=info_text,
            font=("Arial", 9),
            fg="gray",
            justify="left"
        )
        info_label.pack(pady=10)
        
        # Progress Frame
        progress_frame = tk.Frame(self.root, pady=20)
        progress_frame.pack(fill="x", padx=30)
        
        # Progress Circle (using Canvas)
        self.canvas = tk.Canvas(progress_frame, width=150, height=150)
        self.canvas.pack()
        self.draw_progress_circle(0)
        
        # Status Label
        self.status_label = tk.Label(
            self.root,
            text="Ready to generate images",
            font=("Arial", 10),
            fg="blue"
        )
        self.status_label.pack(pady=10)
        
        # Generate Button
        self.generate_btn = tk.Button(
            self.root,
            text="Generate Images",
            command=self.start_generation,
            font=("Arial", 12, "bold"),
            bg="#4CAF50",
            fg="white",
            padx=30,
            pady=10,
            cursor="hand2"
        )
        self.generate_btn.pack(pady=10)
        
    def draw_progress_circle(self, percent):
        """Draw circular progress indicator"""
        self.canvas.delete("all")
        
        # Background circle
        self.canvas.create_oval(
            10, 10, 140, 140,
            outline="#e0e0e0",
            width=10
        )
        
        # Progress arc
        if percent > 0:
            extent = -360 * (percent / 100)
            self.canvas.create_arc(
                10, 10, 140, 140,
                start=90,
                extent=extent,
                outline="#4CAF50",
                width=10,
                style="arc"
            )
        
        # Percentage text
        self.canvas.create_text(
            75, 75,
            text=f"{int(percent)}%",
            font=("Arial", 24, "bold"),
            fill="#333"
        )
        
    def browse_csv(self):
        """Open file dialog to select CSV file"""
        filename = filedialog.askopenfilename(
            title="Select CSV File",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if filename:
            self.csv_path = filename
            self.csv_entry.config(state="normal")
            self.csv_entry.delete(0, tk.END)
            self.csv_entry.insert(0, filename)
            self.csv_entry.config(state="readonly")
            
            # Preview CSV
            try:
                df = pd.read_csv(filename)
                row_count = len(df)
                if row_count > 30:
                    messagebox.showwarning(
                        "Large CSV",
                        f"CSV contains {row_count} rows. Only the first 30 images will be generated."
                    )
                self.status_label.config(
                    text=f"CSV loaded: {min(row_count, 30)} images to generate",
                    fg="blue"
                )
            except Exception as e:
                messagebox.showerror("Error", f"Failed to read CSV: {str(e)}")
                self.csv_path = None
    
    def create_output_folder(self):
        """Create output folder with date and increment"""
        base_dir = Path(self.csv_path).parent
        date_str = datetime.now().strftime("%Y%m%d")
        
        # Find next available increment
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
            "random": ""  # No specific modifier
        }
        
        styling_lower = styling.lower().strip()
        return style_modifiers.get(styling_lower, "")
    
    def generate_image_openai(self, prompt, styling):
        """Generate image using OpenAI DALL-E"""
        if not OPENAI_AVAILABLE:
            raise Exception("OpenAI package not installed. Run: pip install openai")
        
        api_key = self.api_entry.get().strip()
        if not api_key:
            raise Exception("Please enter your OpenAI API key")
        
        client = OpenAI(api_key=api_key)
        
        # Modify prompt based on styling
        style_modifier = self.get_style_prompt_modifier(styling)
        full_prompt = f"{prompt}, {style_modifier}" if style_modifier else prompt
        
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=full_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            
            # Download image
            image_response = requests.get(image_url)
            image = Image.open(BytesIO(image_response.content))
            
            return image
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    def generate_placeholder_image(self, prompt, styling):
        """Generate placeholder image for testing (when no API key)"""
        # Create a simple colored rectangle with text
        from PIL import ImageDraw, ImageFont
        
        img = Image.new('RGB', (1024, 1024), color=(73, 109, 137))
        d = ImageDraw.Draw(img)
        
        # Add text
        text_lines = [
            "PLACEHOLDER IMAGE",
            f"Prompt: {prompt[:50]}...",
            f"Style: {styling}"
        ]
        
        y_offset = 400
        for line in text_lines:
            # Use default font since custom fonts might not be available
            d.text((100, y_offset), line, fill=(255, 255, 255))
            y_offset += 50
        
        return img
    
    def generate_images(self):
        """Generate all images from CSV"""
        try:
            # Read CSV
            df = pd.read_csv(self.csv_path)
            
            # Validate columns
            required_cols = ["filename", "prompt", "styling"]
            if not all(col in df.columns for col in required_cols):
                raise Exception(f"CSV must contain columns: {', '.join(required_cols)}")
            
            # Limit to 30 images
            df = df.head(30)
            self.total_images = len(df)
            
            # Create output folder
            self.output_folder = self.create_output_folder()
            
            # Get API key
            api_key = self.api_entry.get().strip()
            use_placeholder = not api_key or not OPENAI_AVAILABLE
            
            if use_placeholder:
                self.root.after(0, lambda: self.status_label.config(
                    text="⚠️ Using placeholder images (no API key)",
                    fg="orange"
                ))
            
            # Generate each image
            for idx, row in df.iterrows():
                if not self.is_generating:
                    break
                
                filename = row["filename"]
                prompt = row["prompt"]
                styling = row["styling"]
                
                # Ensure filename has extension
                if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    filename += ".png"
                
                # Update status
                self.root.after(0, lambda i=idx: self.status_label.config(
                    text=f"Generating: {i+1}/{self.total_images} - {filename}",
                    fg="green"
                ))
                
                try:
                    # Generate image
                    if use_placeholder:
                        image = self.generate_placeholder_image(prompt, styling)
                        time.sleep(0.5)  # Simulate API delay
                    else:
                        image = self.generate_image_openai(prompt, styling)
                    
                    # Save image
                    output_path = self.output_folder / filename
                    image.save(output_path)
                    
                    # Update progress
                    self.current_progress = int(((idx + 1) / self.total_images) * 100)
                    self.root.after(0, lambda p=self.current_progress: self.draw_progress_circle(p))
                    
                except Exception as e:
                    print(f"Error generating {filename}: {str(e)}")
                    # Continue with next image
                    continue
            
            # Complete
            if self.is_generating:
                self.root.after(0, self.generation_complete)
            else:
                self.root.after(0, self.generation_cancelled)
                
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", str(e)))
            self.root.after(0, self.reset_ui)
    
    def start_generation(self):
        """Start image generation process"""
        if not self.csv_path:
            messagebox.showwarning("No CSV", "Please select a CSV file first")
            return
        
        if self.is_generating:
            return
        
        self.is_generating = True
        self.current_progress = 0
        self.generate_btn.config(state="disabled", text="Generating...", bg="#ccc")
        self.draw_progress_circle(0)
        
        # Run generation in separate thread
        thread = threading.Thread(target=self.generate_images, daemon=True)
        thread.start()
    
    def generation_complete(self):
        """Handle completion of generation"""
        self.status_label.config(
            text=f"✓ Complete! {self.total_images} images generated",
            fg="green"
        )
        
        # Open output folder
        if self.output_folder:
            if sys.platform == "win32":
                os.startfile(self.output_folder)
            elif sys.platform == "darwin":
                os.system(f'open "{self.output_folder}"')
            else:
                os.system(f'xdg-open "{self.output_folder}"')
        
        self.reset_ui()
    
    def generation_cancelled(self):
        """Handle cancelled generation"""
        self.status_label.config(text="Generation cancelled", fg="red")
        self.reset_ui()
    
    def reset_ui(self):
        """Reset UI after generation"""
        self.is_generating = False
        self.generate_btn.config(
            state="normal",
            text="Generate Images",
            bg="#4CAF50"
        )


def main():
    root = tk.Tk()
    app = ImageGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()

