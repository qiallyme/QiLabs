import subprocess
from pathlib import Path
import json

def get_video_info(video_path):
    """Get frame count and duration of a video using ffprobe"""
    try:
        cmd = [
            "ffprobe", "-v", "quiet", 
            "-select_streams", "v:0",
            "-show_entries", "stream=nb_frames:format=duration",
            "-of", "json", 
            str(video_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        
        frames = data.get('streams', [{}])[0].get('nb_frames')
        duration = data.get('format', {}).get('duration')
        
        return {
            'frames': int(frames) if frames else None,
            'duration': float(duration) if duration else None,
            'fps': int(frames) / float(duration) if frames and duration else None
        }
    except Exception as e:
        return {'error': str(e)}

def analyze_videos():
    convert_dir = Path("S:/0_Convert")
    video_extensions = {'.mkv', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.media'}
    
    all_videos = []
    
    for folder in convert_dir.iterdir():
        if folder.is_dir():
            folder_videos = []
            for video_file in folder.iterdir():
                if video_file.suffix.lower() in video_extensions and video_file.is_file():
                    info = get_video_info(video_file)
                    info['file'] = video_file.name
                    info['folder'] = folder.name
                    folder_videos.append(info)
                    all_videos.append(info)
            
            if folder_videos:
                print(f"\n📁 {folder.name}:")
                for video in folder_videos:
                    if 'error' not in video:
                        print(f"  📹 {video['file']}: {video['frames']} frames, {video['duration']:.1f}s, {video['fps']:.1f} fps")
                    else:
                        print(f"  ❌ {video['file']}: {video['error']}")
    
    # Calculate averages
    valid_videos = [v for v in all_videos if 'error' not in v and v['frames'] is not None]
    
    if valid_videos:
        avg_frames = sum(v['frames'] for v in valid_videos) / len(valid_videos)
        avg_duration = sum(v['duration'] for v in valid_videos) / len(valid_videos)
        avg_fps = sum(v['fps'] for v in valid_videos) / len(valid_videos)
        
        print(f"\n📊 SUMMARY:")
        print(f"  Total videos analyzed: {len(valid_videos)}")
        print(f"  Average frames per video: {avg_frames:.0f}")
        print(f"  Average duration: {avg_duration:.1f} seconds ({avg_duration/60:.1f} minutes)")
        print(f"  Average FPS: {avg_fps:.1f}")
        
        # Show distribution
        frame_ranges = {
            '0-1000': 0,
            '1000-5000': 0,
            '5000-10000': 0,
            '10000+': 0
        }
        
        for video in valid_videos:
            frames = video['frames']
            if frames <= 1000:
                frame_ranges['0-1000'] += 1
            elif frames <= 5000:
                frame_ranges['1000-5000'] += 1
            elif frames <= 10000:
                frame_ranges['5000-10000'] += 1
            else:
                frame_ranges['10000+'] += 1
        
        print(f"\n📈 Frame Distribution:")
        for range_name, count in frame_ranges.items():
            percentage = (count / len(valid_videos)) * 100
            print(f"  {range_name} frames: {count} videos ({percentage:.1f}%)")

if __name__ == "__main__":
    analyze_videos()
