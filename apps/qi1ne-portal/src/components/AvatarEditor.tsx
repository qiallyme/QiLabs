import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarProps {
  url: string | null;
  size?: number;
  onUpload?: (filePath: string) => void;
}

export default function Avatar({ url, size = 120, onUpload }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      const objectUrl = URL.createObjectURL(data);
      setAvatarUrl(objectUrl);
    } catch (error: any) {
      console.log('Error downloading image: ', error.message);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      onUpload?.(filePath);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="relative rounded-full border border-white/10 shadow-2xl object-cover ring-4 ring-white/10 group-hover:ring-purple-500/30 transition-all"
            style={{ height: size, width: size }}
          />
        ) : (
          <div 
            className="relative rounded-full border border-white/10 shadow-2xl bg-white/5 flex items-center justify-center text-gray-500 text-2xl font-bold ring-4 ring-white/10" 
            style={{ height: size, width: size }}
          >
            ?
          </div>
        )}
      </div>
      
      {onUpload && (
        <div style={{ width: size }}>
          <label 
            className="w-full text-center cursor-pointer block px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2" 
            htmlFor="avatar-upload"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {uploading ? 'Uploading...' : 'Change Avatar'}
          </label>
          <input
            style={{ visibility: 'hidden', position: 'absolute' }}
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}
