#!/usr/bin/env python3
import os
import subprocess
import threading
import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext, messagebox
from pathlib import Path
import json

# You must run: pip install openai
try:
    from openai import OpenAI
except ImportError:
    messagebox.showerror("Missing Library", "Please install the OpenAI library by running:\npip install openai")
    exit()

class SmartTranscriberGUI(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("🎙️ Agentic Audio & Transcription Studio")
        self.geometry("850x700")
        self.configure(bg="#0f0f11")
        self.style = ttk.Style(self)
        self.style.theme_use('clam')

        # Styling
        self.style.configure("TFrame", background="#0f0f11")
        self.style.configure("TLabel", background="#0f0f11", foreground="#a1a1aa", font=("Segoe UI", 10))
        self.style.configure("Header.TLabel", font=("Segoe UI", 12, "bold"), foreground="#ffffff")
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"), background="#27272a", foreground="#ffffff", borderwidth=0)
        self.style.map("TButton", background=[('active', '#3f3f46')])

        # State Variables
        self.input_file = tk.StringVar()
        self.api_key = tk.StringVar(value="")
        self.target_confidence = tk.DoubleVar(value=-0.4) # Logprob threshold. Closer to 0 is better.

        self.cancel_requested = False
        self.active_processes = []

        self._build_ui()
        self._check_ffmpeg()

    def _build_ui(self):
        main_frame = ttk.Frame(self, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # --- API Configuration ---
        api_frame = ttk.Frame(main_frame)
        api_frame.pack(fill=tk.X, pady=(0, 15))
        ttk.Label(api_frame, text="🔑 API CONFIGURATION", style="Header.TLabel").pack(anchor="w", pady=(0, 5))

        api_row = ttk.Frame(api_frame)
        api_row.pack(fill=tk.X)
        ttk.Label(api_row, text="OpenAI API Key:").pack(side=tk.LEFT, padx=(0, 10))
        ttk.Entry(api_row, textvariable=self.api_key, font=("Consolas", 10), show="*").pack(side=tk.LEFT, fill=tk.X, expand=True)

        # --- File Selection ---
        file_frame = ttk.Frame(main_frame)
        file_frame.pack(fill=tk.X, pady=15)
        ttk.Label(file_frame, text="📁 MEDIA SELECTION", style="Header.TLabel").pack(anchor="w", pady=(0, 5))

        file_row = ttk.Frame(file_frame)
        file_row.pack(fill=tk.X)
        ttk.Button(file_row, text="Select Video/Audio", command=self._browse_input, width=20).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Entry(file_row, textvariable=self.input_file, font=("Consolas", 10)).pack(side=tk.LEFT, fill=tk.X, expand=True)

        # --- Pipeline Settings ---
        settings_frame = ttk.Frame(main_frame)
        settings_frame.pack(fill=tk.X, pady=15)
        ttk.Label(settings_frame, text="⚙️ ITERATIVE ENGINE SETTINGS", style="Header.TLabel").pack(anchor="w", pady=(0, 5))

        ttk.Label(settings_frame, text="The engine will isolate audio, transcribe it, and check mathematical confidence.\nIf confidence is poor, it will apply aggressive noise reduction and re-transcribe.").pack(anchor="w")

        # --- Controls ---
        control_frame = ttk.Frame(main_frame)
        control_frame.pack(fill=tk.X, pady=15)

        self.btn_start = ttk.Button(control_frame, text="▶ START TRANSCRIPTION ENGINE", command=self._start_pipeline)
        self.btn_start.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        self.btn_stop = ttk.Button(control_frame, text="🛑 CANCEL", command=self._stop_pipeline, state=tk.DISABLED)
        self.btn_stop.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(5, 0))

        # --- Console ---
        console_frame = ttk.Frame(main_frame)
        console_frame.pack(fill=tk.BOTH, expand=True)

        self.console = scrolledtext.ScrolledText(console_frame, bg="#18181b", fg="#a1a1aa", font=("Consolas", 9), borderwidth=0)
        self.console.pack(fill=tk.BOTH, expand=True)

    def _log(self, message):
        self.console.insert(tk.END, message + "\n")
        self.console.see(tk.END)
        self.update_idletasks()

    def _browse_input(self):
        file = filedialog.askopenfilename(filetypes=[("Media Files", "*.mp4 *.mkv *.mov *.avi *.mp3 *.wav *.m4a")])
        if file: self.input_file.set(file)

    def _check_ffmpeg(self):
        try:
            subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except FileNotFoundError:
            self._log("❌ ERROR: FFmpeg not found. It is required for audio extraction.")
            self.btn_start.config(state=tk.DISABLED)

    def _stop_pipeline(self):
        self.cancel_requested = True
        self._log("\n🛑 Canceling... Terminating active FFmpeg processes.")
        for p in self.active_processes:
            try: p.kill()
            except: pass
        self.btn_stop.config(state=tk.DISABLED)

    def _start_pipeline(self):
        in_path = self.input_file.get()
        api_key = self.api_key.get().strip()

        if not in_path:
            messagebox.showwarning("Missing File", "Please select a media file.")
            return
        if not api_key:
            messagebox.showwarning("Missing API Key", "Please enter your OpenAI API key.")
            return

        self.btn_start.config(state=tk.DISABLED)
        self.btn_stop.config(state=tk.NORMAL)
        self.cancel_requested = False
        self.console.delete(1.0, tk.END)

        threading.Thread(target=self._run_pipeline_thread, args=(in_path, api_key), daemon=True).start()

    def _run_ffmpeg(self, cmd, task_name):
        try:
            creation_flags = 0x08000000 if os.name == 'nt' else 0
            process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, creationflags=creation_flags)
            self.active_processes.append(process)
            _, stderr = process.communicate()
            if process in self.active_processes: self.active_processes.remove(process)

            if process.returncode != 0 and not self.cancel_requested:
                err = stderr.decode('utf-8', errors='ignore')[-100:].replace('\n', ' ')
                self._log(f"   ⚠️ FFmpeg ERROR on {task_name}: {err}")
                return False
            return not self.cancel_requested
        except Exception as e:
            self._log(f"   ⚠️ EXECUTION ERROR on {task_name}: {str(e)}")
            return False

    def _run_pipeline_thread(self, input_file, api_key):
        try:
            source_path = Path(input_file)
            output_dir = source_path.parent / f"{source_path.stem}_Transcription"
            output_dir.mkdir(exist_ok=True)

            client = OpenAI(api_key=api_key)

            self._log("🚀 INITIATING AGENTIC TRANSCRIPTION PIPELINE")
            self._log(f"📂 Target: {source_path.name}")
            self._log("="*60)

            # ---------------------------------------------------------
            # PASS 0: Extract Raw Audio (16kHz, Mono) for Speech Models
            # ---------------------------------------------------------
            raw_audio_path = output_dir / "01_raw_audio.wav"
            self._log("\n[1/4] Extracting base audio track...")

            cmd_extract = [
                "ffmpeg", "-y", "-i", str(source_path),
                "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
                str(raw_audio_path)
            ]
            if not self._run_ffmpeg(cmd_extract, "Audio Extraction") or self.cancel_requested: return
            self._log("   ✅ Audio extracted successfully.")

            # ---------------------------------------------------------
            # PASS 1: Attempt Base Transcription
            # ---------------------------------------------------------
            self._log("\n[2/4] Executing Initial Transcription Pass...")
            transcription_result = self._transcribe_audio(client, raw_audio_path)
            if not transcription_result: return

            transcript_text, confidence = transcription_result

            self._log(f"   📊 Pass 1 Confidence Score (Logprob): {confidence:.2f}")

            # ---------------------------------------------------------
            # EVALUATION GATE
            # Logprobs generally range from 0 to -1.
            # Anything worse than -0.5 usually implies heavy noise or mumbling.
            # ---------------------------------------------------------
            final_audio = raw_audio_path

            if confidence < self.target_confidence.get():
                self._log(f"   ⚠️ Confidence is below threshold ({self.target_confidence.get()}). Audio is likely too noisy.")
                self._log("\n[3/4] Triggering Aggressive Audio Remediation...")

                clean_audio_path = output_dir / "02_cleaned_audio.wav"

                # FFmpeg Voice Isolation Filter:
                # 1. afftdn: Fast Fourier Transform DeNoise (cuts background hiss/hum)
                # 2. highpass/lowpass: Cuts off rumble and piercing highs, isolating the human vocal range (200Hz - 3000Hz)
                # 3. speechnorm: Normalizes the speaking volume so quiet words are boosted
                cmd_clean = [
                    "ffmpeg", "-y", "-i", str(raw_audio_path),
                    "-af", "highpass=f=200,lowpass=f=3000,afftdn=nf=-25,speechnorm=e=12.5:r=0.00001:l=1",
                    str(clean_audio_path)
                ]
                if not self._run_ffmpeg(cmd_clean, "Noise Reduction") or self.cancel_requested: return
                self._log("   ✅ Audio digitally washed. Vocal frequencies isolated.")

                self._log("\n[4/4] Executing Secondary Transcription Pass on Cleaned Audio...")
                transcription_result_2 = self._transcribe_audio(client, clean_audio_path)
                if not transcription_result_2: return

                transcript_text_2, confidence_2 = transcription_result_2
                self._log(f"   📊 Pass 2 Confidence Score (Logprob): {confidence_2:.2f}")

                # Take whichever transcript scored mathematically higher
                if confidence_2 > confidence:
                    self._log("   🏆 Pass 2 yielded better results. Using Cleaned Audio Transcript.")
                    transcript_text = transcript_text_2
                    final_audio = clean_audio_path
                else:
                    self._log("   🏆 Original audio still provided a better mathematical map. Reverting to Pass 1.")
            else:
                self._log("   ✅ Confidence is high. Bypassing noise reduction filters.")

            # ---------------------------------------------------------
            # OUTPUT & SAVE
            # ---------------------------------------------------------
            output_txt_path = output_dir / f"{source_path.stem}_FINAL_TRANSCRIPT.txt"
            with open(output_txt_path, "w", encoding="utf-8") as f:
                f.write(transcript_text)

            self._log("\n" + "="*60)
            self._log(f"🎉 SUCCESS! Pipeline Complete.")
            self._log(f"📄 Transcript saved to:\n{output_txt_path}")

        except Exception as e:
            self._log(f"\n❌ CRITICAL ERROR: {str(e)}")
        finally:
            self.btn_start.config(state=tk.NORMAL)
            self.btn_stop.config(state=tk.DISABLED)

    def _transcribe_audio(self, client, audio_filepath):
        """Sends audio to Whisper API, prompts for Midwestern English, and extracts text & confidence."""
        if self.cancel_requested: return None

        self._log(f"   📡 Uploading to Whisper API for analysis...")

        try:
            with open(audio_filepath, "rb") as audio_file:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json", # Required to get math confidence scores
                    # The Prompt is crucial. It primes the AI's contextual expectations before it hears a single word.
                    prompt="The following is a transcript of a person speaking Midwestern English from Indiana. They might say things like 'ope', 'you guys', or 'pop'. Ensure accurate transcription of regional dialect."
                )

            # Calculate average confidence across all spoken segments
            segments = response.segments
            if not segments:
                return response.text, -1.0 # No speech found

            total_logprob = sum(seg.avg_logprob for seg in segments)
            avg_logprob = total_logprob / len(segments)

            return response.text, avg_logprob

        except Exception as e:
            self._log(f"   ⚠️ API Call Failed: {str(e)}")
            return None

if __name__ == "__main__":
    app = SmartTranscriberGUI()
    app.mainloop()