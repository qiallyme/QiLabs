#!/usr/bin/env python3
import os
import subprocess
import threading
import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext, messagebox
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
import shutil

class VideoPipelineGUI(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("🎬 Master Video Pipeline Control Center")
        self.geometry("800x650")
        self.configure(bg="#0f0f11")
        self.style = ttk.Style(self)
        self.style.theme_use('clam')

        # Styling
        self.style.configure("TFrame", background="#0f0f11")
        self.style.configure("TLabel", background="#0f0f11", foreground="#a1a1aa", font=("Segoe UI", 10))
        self.style.configure("Header.TLabel", font=("Segoe UI", 12, "bold"), foreground="#ffffff")
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"), background="#27272a", foreground="#ffffff", borderwidth=0)
        self.style.map("TButton", background=[('active', '#3f3f46')])
        self.style.configure("TRadiobutton", background="#0f0f11", foreground="#d4d4d8", font=("Segoe UI", 10))
        self.style.configure("TCheckbutton", background="#0f0f11", foreground="#d4d4d8", font=("Segoe UI", 10))

        # State Variables
        self.input_dir = tk.StringVar()

        self.step_combine = tk.BooleanVar(value=False)
        self.step_convert = tk.BooleanVar(value=True)
        self.step_flip = tk.BooleanVar(value=False)
        self.step_enhance = tk.BooleanVar(value=False)
        self.step_images = tk.BooleanVar(value=True)

        self.w_mode = tk.StringVar(value="FAST")
        self.w_encoder = tk.StringVar(value="Intel QSV (Hardware)")
        self.cancel_requested = False
        self.active_processes = []

        self._build_ui()
        self._check_ffmpeg()

    def _build_ui(self):
        main_frame = ttk.Frame(self, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # --- Directories ---
        dir_frame = ttk.Frame(main_frame)
        dir_frame.pack(fill=tk.X, pady=(0, 15))

        ttk.Label(dir_frame, text="📁 FOLDER CONFIGURATION", style="Header.TLabel").pack(anchor="w", pady=(0, 10))

        in_row = ttk.Frame(dir_frame)
        in_row.pack(fill=tk.X, pady=2)
        ttk.Button(in_row, text="Select Folder", command=self._browse_input, width=15).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Entry(in_row, textvariable=self.input_dir, font=("Consolas", 10)).pack(side=tk.LEFT, fill=tk.X, expand=True)

        ttk.Label(dir_frame, text="* Output will automatically be saved to a 'Processed_Output' folder inside this directory.", foreground="#71717a", font=("Segoe UI", 8, "italic")).pack(anchor="w", pady=(5, 0))

        # --- Pipeline Steps ---
        step_frame = ttk.Frame(main_frame)
        step_frame.pack(fill=tk.X, pady=15)
        ttk.Label(step_frame, text="⚙️ PIPELINE STEPS", style="Header.TLabel").pack(anchor="w", pady=(0, 5))

        ttk.Checkbutton(step_frame, text="Step 1: Combine (Groups by subfolder, max 20 mins per video)", variable=self.step_combine).pack(anchor="w")
        ttk.Checkbutton(step_frame, text="Step 2: Standardize to MKV (Standardize codec)", variable=self.step_convert).pack(anchor="w")
        ttk.Checkbutton(step_frame, text="Step 2.5: Auto-Flip (Fix upside-down metadata)", variable=self.step_flip).pack(anchor="w")
        ttk.Checkbutton(step_frame, text="Step 3: Visual Enhance (Deflicker, Brightness, Contrast)", variable=self.step_enhance).pack(anchor="w")
        ttk.Checkbutton(step_frame, text="Step 4: Append Images (Slideshow at end of folder's final video)", variable=self.step_images).pack(anchor="w")

        # --- Processing Mode ---
        mode_frame = ttk.Frame(main_frame)
        mode_frame.pack(fill=tk.X, pady=15)
        ttk.Label(mode_frame, text="🚀 PROCESSING ENGINE", style="Header.TLabel").pack(anchor="w", pady=(0, 5))

        ttk.Radiobutton(mode_frame, text="FAST MODE (Max Resources, 3 Concurrent Files)", variable=self.w_mode, value="FAST").pack(anchor="w")
        ttk.Radiobutton(mode_frame, text="PASSIVE MODE (Idle CPU Priority, 1 File at a time)", variable=self.w_mode, value="PASSIVE").pack(anchor="w")

        # Encoder Dropdown
        enc_frame = ttk.Frame(mode_frame)
        enc_frame.pack(fill=tk.X, pady=(10, 0))
        ttk.Label(enc_frame, text="Hardware Encoder:").pack(side=tk.LEFT, padx=(0, 10))
        encoders = ["Intel QSV (Hardware)", "CPU Only (libx264)", "NVIDIA NVENC (Hardware)", "AMD AMF (Hardware)"]
        enc_dropdown = ttk.Combobox(enc_frame, textvariable=self.w_encoder, values=encoders, state="readonly", width=30)
        enc_dropdown.pack(side=tk.LEFT)

        # --- Controls ---
        control_frame = ttk.Frame(main_frame)
        control_frame.pack(fill=tk.X, pady=15)

        self.btn_start = ttk.Button(control_frame, text="▶ START PIPELINE", command=self._start_pipeline)
        self.btn_start.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        self.btn_stop = ttk.Button(control_frame, text="🛑 STOP", command=self._stop_pipeline, state=tk.DISABLED)
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
        folder = filedialog.askdirectory()
        if folder: self.input_dir.set(folder)

    def _check_ffmpeg(self):
        try:
            subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(["ffprobe", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self._log("✅ FFmpeg and FFprobe detected on system.")
        except FileNotFoundError:
            self._log("❌ ERROR: FFmpeg/FFprobe not found in PATH. Please install them to continue.")
            self.btn_start.config(state=tk.DISABLED)

    def _get_duration(self, filepath):
        try:
            cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(filepath)]
            creation_flags = 0x08000000 if os.name == 'nt' else 0
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, creationflags=creation_flags)
            return float(result.stdout.strip())
        except Exception:
            return 0.0

    def _stop_pipeline(self):
        self.cancel_requested = True
        self._log("\n🛑 Cancel requested. Terminating active processes...")
        for p in self.active_processes:
            try: p.kill()
            except: pass
        self.btn_stop.config(state=tk.DISABLED)

    def _start_pipeline(self):
        in_path = self.input_dir.get()
        if not in_path:
            messagebox.showwarning("Missing Folder", "Please select an Input directory.")
            return

        self.btn_start.config(state=tk.DISABLED)
        self.btn_stop.config(state=tk.NORMAL)
        self.cancel_requested = False
        self.console.delete(1.0, tk.END)

        threading.Thread(target=self._run_pipeline_thread, args=(in_path,), daemon=True).start()

    def _run_pipeline_thread(self, input_dir):
        try:
            current_input = Path(input_dir)
            base_output = current_input / "Processed_Output"
            base_output.mkdir(parents=True, exist_ok=True)

            self._log(f"🚀 PIPELINE INITIATED USING: {self.w_encoder.get()}")
            self._log(f"📂 Output will be saved to: {base_output.name}")
            self._log("="*60)

            supported_exts = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'}

            # PERFORMANCE: Scan the directory ONCE and keep files in memory
            self._log("\n🔍 Indexing files...")
            all_files = list(current_input.rglob('*'))
            
            def get_valid_videos(file_list):
                vids = []
                ignore_dirs = {"processed_output", "01_combined", "02_final_processed"}
                for f in file_list:
                    if f.is_file() and f.suffix.lower() in supported_exts:
                        if not any(p.lower() in ignore_dirs for p in f.parts):
                            vids.append(f)
                return vids

            videos = get_valid_videos(all_files)
            
            # Identify image folders once
            self.folder_images_map = {}
            image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.heic'}
            for f in all_files:
                if f.is_file() and f.suffix.lower() in image_exts:
                    if not any(p.lower() in {"processed_output", "01_combined"} for p in f.parts):
                        parent_name = f.parent.name.replace(" ", "_")
                        if parent_name not in self.folder_images_map:
                            self.folder_images_map[parent_name] = []
                        self.folder_images_map[parent_name].append(f)

            # STEP 1: COMBINE
            if self.step_combine.get():
                if self.cancel_requested: return
                self._log("\n[STEP 1] Grouping and Combining Videos...")
                step1_out = base_output / "01_combined"
                step1_out.mkdir(exist_ok=True)

                videos = videos
                if not videos:
                    self._log("⚠️ No videos found to combine.")
                else:
                    folders_map = {}
                    for v in videos:
                        if v.parent not in folders_map: folders_map[v.parent] = []
                        folders_map[v.parent].append(v)

                    def sort_key(filepath):
                        meta_time = filepath.stat().st_mtime
                        bookend_key = [int(text) if text.isdigit() else text.lower() for text in re.split('([0-9]+)', filepath.name)]
                        return (meta_time, bookend_key)

                    for folder, folder_videos in folders_map.items():
                        ext_map = {}
                        for v in folder_videos:
                            ext = v.suffix.lower()
                            if ext not in ext_map: ext_map[ext] = []
                            ext_map[ext].append(v)

                        for ext, ext_videos in ext_map.items():
                            if self.cancel_requested: return
                            ext_name = ext.replace('.', '')
                            ext_videos.sort(key=sort_key)

                            chunks = []
                            current_chunk = []
                            current_duration = 0.0

                            for v in ext_videos:
                                dur = self._get_duration(v)
                                if current_duration + dur > 1200 and current_chunk:
                                    chunks.append(current_chunk)
                                    current_chunk = [v]
                                    current_duration = dur
                                else:
                                    current_chunk.append(v)
                                    current_duration += dur
                            if current_chunk: chunks.append(current_chunk)

                            folder_name = folder.name.replace(" ", "_")

                            for i, chunk in enumerate(chunks):
                                if self.cancel_requested: return
                                part_suffix = f"_pt{i+1}" if len(chunks) > 1 else ""
                                out_file = step1_out / f"{folder_name}_combined{part_suffix}{ext}"

                                # NEW LOGIC: Bypass concat if there is only 1 file
                                if len(chunk) == 1:
                                    self._log(f"   ⏩ Bypassing concat for '{folder.name}' {ext.upper()}{part_suffix} (Only 1 file).")
                                    shutil.copy2(chunk[0], out_file)
                                    continue

                                self._log(f"   ⏳ Fast Combining '{folder.name}' {ext.upper()} files{part_suffix} ({len(chunk)} clips)...")

                                concat_list_path = step1_out / f"concat_{folder_name}_{ext_name}{part_suffix}.txt"
                                with open(concat_list_path, "w", encoding="utf-8") as f:
                                    for v in chunk:
                                        # FFmpeg concat demuxer: use forward slashes and escape ' and \
                                        safe_path = v.as_posix().replace("'", "\\'").replace("\\", "\\\\")
                                        f.write(f"file '{safe_path}'\n")

                                cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list_path), "-c", "copy", str(out_file)]

                                if not self._run_ffmpeg(cmd, f"Combine {folder_name}{part_suffix}"):
                                    self._log(f"   ⚠️ Combine failed for {folder_name}{part_suffix}. Proceeding to next block.")

                    current_input = step1_out

            # STEP 2/2.5/3: BATCH PROCESSING
            if self.step_convert.get() or self.step_flip.get() or self.step_enhance.get():
                if self.cancel_requested: return
                self._log("\n[PROCESSING BATCH] Applying Convert/Flip/Enhance...")

                final_out = base_output / "02_final_processed"
                final_out.mkdir(exist_ok=True)

                # Identify videos for Batch Processing
                if self.step_combine.get():
                    # Combined videos are in the 01_combined folder
                    videos_to_process = [f for f in current_input.rglob('*') if f.suffix.lower() in supported_exts]
                else:
                    # Clean input: use already indexed videos
                    videos_to_process = videos

                workers = 3 if self.w_mode.get() == "FAST" else 1

                with ThreadPoolExecutor(max_workers=workers) as executor:
                    futures = []
                    videos_to_process.sort() 
                    
                    for i, video in enumerate(videos_to_process):
                        # Determine if this is the last part for this folder group
                        is_final = True
                        if i + 1 < len(videos_to_process):
                            next_vid = videos_to_process[i+1]
                            curr_stem = video.stem.replace("_combined", "").split("_pt")[0]
                            next_stem = next_vid.stem.replace("_combined", "").split("_pt")[0]
                            if curr_stem == next_stem:
                                is_final = False
                        
                        futures.append(executor.submit(self._process_single_video, video, final_out, is_final))

                    for future in as_completed(futures):
                        if self.cancel_requested: break

            self._log("\n" + "="*60)
            if self.cancel_requested:
                self._log("⚠️ PIPELINE ABORTED BY USER.")
            else:
                self._log(f"✅ PIPELINE COMPLETE. Files saved in: {base_output.resolve()}")

        except Exception as e:
            self._log(f"\n❌ CRITICAL ERROR: {str(e)}")
        finally:
            self.btn_start.config(state=tk.NORMAL)
            self.btn_stop.config(state=tk.DISABLED)

    def _process_single_video(self, input_path, output_dir, is_final=False):
        if self.cancel_requested: return False
        
        # Skip 0-byte files to prevent 'Invalid data' errors
        if input_path.stat().st_size == 0:
            self._log(f"   ⏩ Skipping 0-byte file: {input_path.name}")
            return False

        filename = input_path.name
        out_name = f"{input_path.stem}_processed.mkv"
        output_path = output_dir / out_name

        cmd = ["ffmpeg", "-y"]
        mode = self.w_mode.get()
        encoder = self.w_encoder.get()
        folder_key = input_path.stem.replace("_combined", "").split("_pt")[0]
        has_images = is_final and self.step_images.get() and self.folder_images_map.get(folder_key)

        # CLEVER OPTIMIZATION: If NO software filters (Enhance or Images) are needed,
        # we can use the PURE Hardware Pipeline (Dec -> VPP -> Enc).
        # This is massively faster than software decoding.
        pure_hw = False
        if mode == "FAST" and not self.step_enhance.get() and not has_images:
            if "Intel" in encoder:
                cmd.extend(["-hwaccel", "qsv", "-hwaccel_output_format", "qsv"])
                pure_hw = True
            elif "NVIDIA" in encoder:
                cmd.extend(["-hwaccel", "cuda", "-hwaccel_output_format", "cuda"])
                pure_hw = True

        cmd.extend(["-i", str(input_path)])
        cmd.extend(["-map", "0:v:0", "-map", "0:a:0?"])

        if self.step_convert.get() or self.step_enhance.get() or self.step_flip.get():
            if "Intel" in encoder:
                cmd.extend(["-c:v", "h264_qsv", "-extbrc", "1"])
                if mode == "FAST": cmd.extend(["-preset", "fast", "-look_ahead", "0", "-global_quality", "23"])
                else: cmd.extend(["-preset", "slow", "-look_ahead", "1", "-global_quality", "26", "-threads", "1"])

            elif "NVIDIA" in encoder:
                cmd.extend(["-c:v", "h264_nvenc"])
                if mode == "FAST": cmd.extend(["-preset", "p4", "-cq", "23"])
                else: cmd.extend(["-preset", "p7", "-cq", "26"])

            elif "AMD" in encoder:
                cmd.extend(["-c:v", "h264_amf"])
                if mode == "FAST": cmd.extend(["-quality", "speed", "-rc", "cqp", "-qp_i", "23", "-qp_p", "23"])
                else: cmd.extend(["-quality", "quality", "-rc", "cqp", "-qp_i", "26", "-qp_p", "26"])

            else:
                cmd.extend(["-c:v", "libx264"])
                if mode == "FAST": cmd.extend(["-preset", "superfast", "-crf", "23"])
                else: cmd.extend(["-preset", "slow", "-crf", "24", "-threads", "1"])
        else:
            cmd.extend(["-c:v", "copy"])

        # Forced stereo audio downmix for maximum compatibility
        cmd.extend(["-c:a", "aac", "-b:a", "128k", "-ac", "2"])

        # Filters: Intelligent selection between Hardware (VPP) and Software filters
        filters = []
        if self.step_flip.get():
            if pure_hw and "Intel" in encoder:
                filters.append("vpp_qsv=hflip=1:vflip=1")
            elif pure_hw and "NVIDIA" in encoder:
                filters.append("hflip_cuda,vflip_cuda")
            else:
                filters.append("vflip,hflip")

        if self.step_enhance.get():
            # These are software-only, so if they are used, pure_hw will be False already
            filters.append("deflicker,eq=brightness=0.04:contrast=1.05:gamma=1.1,unsharp=5:5:0.8:3:3:0.0")
        
        # --- IMAGE SLIDESHOW INJECTION ---
        if has_images:
            images = self.folder_images_map.get(folder_key, [])
            if images:
                self._log(f"   📸 Appending {len(images)} images to {filename}...")
                for img in images[:15]:
                    img_inputs.extend(["-loop", "1", "-t", "3", "-i", str(img)])
                
                filter_chain = "[0:v]format=nv12[v0];"
                concat_parts = "[v0]"
                for i in range(1, len(images[:15]) + 1):
                    # Software scaling for images (necessary for complex filters)
                    filter_chain += f"[{i}:v]scale=iw*min(1920/iw\,1080/ih):ih*min(1920/iw\,1080/ih),pad=1920:1080:(1920-iw)/2:(1080-ih)/2,format=nv12,setsar=1[v{i}];"
                    concat_parts += f"[v{i}]"
                
                filter_chain += f"{concat_parts}concat=n={len(images[:15])+1}:v=1:a=0[outv]"
                cmd.extend(img_inputs)
                cmd.extend(["-filter_complex", filter_chain, "-map", "[outv]", "-map", "0:a:0?"])
            else:
                if filters:
                    if not pure_hw and "Intel" in encoder: filters.append("format=nv12")
                    cmd.extend(["-vf", ",".join(filters)])
                elif not pure_hw and "Intel" in encoder:
                    cmd.extend(["-vf", "format=nv12"])
                cmd.extend(["-map", "0:v:0", "-map", "0:a:0?"])
        else:
            if filters:
                # If we are in Pure HW mode, filters are already hardware-based (vpp_qsv)
                if not pure_hw and "Intel" in encoder: filters.append("format=nv12")
                cmd.extend(["-vf", ",".join(filters)])
            elif not pure_hw and "Intel" in encoder:
                cmd.extend(["-vf", "format=nv12"])
            cmd.extend(["-map", "0:v:0", "-map", "0:a:0?"])

        cmd.append(str(output_path))

        self._log(f"   ⏳ Processing: {filename}...")
        success = self._run_ffmpeg(cmd, filename)
        if success: self._log(f"   ✅ Finished: {out_name}")
        return success

    def _run_ffmpeg(self, cmd, task_name):
        try:
            creation_flags = 0x08000000 if os.name == 'nt' else 0
            if os.name == 'nt' and self.w_mode.get() == "PASSIVE": creation_flags |= 0x00000040

            process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, creationflags=creation_flags)
            self.active_processes.append(process)

            _, stderr = process.communicate()

            if process in self.active_processes: self.active_processes.remove(process)

            if process.returncode != 0 and not self.cancel_requested:
                err = stderr.decode('utf-8', errors='ignore')[-500:].replace('\n', ' ')
                self._log(f"   ⚠️ ERROR on {task_name}: {err}")
                return False

            return not self.cancel_requested
        except Exception as e:
            self._log(f"   ⚠️ EXECUTION ERROR on {task_name}: {str(e)}")
            return False

if __name__ == "__main__":
    app = VideoPipelineGUI()
    app.mainloop()