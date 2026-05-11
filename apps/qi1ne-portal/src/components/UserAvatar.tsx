import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  url: string | null;
  name: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function UserAvatar({ url, name, size = 'md', className }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  useEffect(() => {
    if (url) {
      if (url.startsWith('http')) {
        setAvatarUrl(url);
      } else {
        downloadImage(url);
      }
    } else {
      setAvatarUrl(null);
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      const objectUrl = URL.createObjectURL(data);
      setAvatarUrl(objectUrl);
    } catch (error: any) {
      console.warn('Error downloading avatar:', error.message);
    }
  }

  return (
    <div className={cn(
      "rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-black overflow-hidden shadow-inner",
      sizeMap[size],
      className
    )}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name || 'User'} className="w-full h-full object-cover" />
      ) : (
        <span>{name?.[0]?.toUpperCase() || '?'}</span>
      )}
    </div>
  );
}
