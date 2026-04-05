import React, { useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Play, Mic, FileText, Image as ImageIcon } from 'lucide-react';
import { TimelineItem, AssetType } from './types';

const IconMap: Record<AssetType, React.ReactNode> = {
  video: <Play className="fill-current" size={20} />,
  audio: <Mic size={20} />,
  infographic: <ImageIcon size={20} />,
  document: <FileText size={20} />,
  article: <FileText size={20} />,
};

interface TimelineNodeProps {
  item: TimelineItem;
  index: number;
  scrollYProgress: MotionValue<number>;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ item, index, scrollYProgress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isUp = index % 2 === 0;

  // Professional Focal Mapping (Calibrated for ~1000vh scroll)
  const nodeFocus = index * 0.12;
  const scale = useTransform(
    scrollYProgress,
    [nodeFocus - 0.15, nodeFocus, nodeFocus + 0.15],
    [0.6, 1.2, 0.6]
  );
  const opacity = useTransform(
    scrollYProgress,
    [nodeFocus - 0.15, nodeFocus, nodeFocus + 0.15],
    [0.2, 1, 0.2]
  );

  return (
    <motion.div 
      style={{ scale, opacity }}
      className="relative flex flex-col items-center justify-center min-w-[300px]"
    >
      {/* Label Indicator */}
      <motion.div 
        className={`absolute whitespace-nowrap text-[10px] font-mono tracking-widest uppercase text-blue-400/60 ${isUp ? 'bottom-28' : 'top-28'}`}
      >
        {item.date}
      </motion.div>

      {/* The Connecting Stem */}
      <div className={`absolute w-[1px] bg-gradient-to-t from-blue-500/30 to-transparent ${isUp ? 'bottom-1/2 h-20' : 'top-1/2 h-20'}`} />

      {/* Interactive Node Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
        className={`z-20 w-14 h-14 rounded-full border flex items-center justify-center backdrop-blur-xl bg-slate-900/80 transition-shadow 
          ${isUp ? '-translate-y-20' : 'translate-y-20'} 
          ${item.category === 'finance' ? 'border-emerald-500/50 text-emerald-400' : 'border-blue-500/50 text-blue-400'}`}
      >
        {IconMap[item.type] || <FileText size={20} />}
      </motion.button>

      {/* Detail Expansion Panel */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: isUp ? -30 : 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`absolute z-50 w-80 p-6 rounded-3xl bg-slate-900/95 backdrop-blur-3xl border border-white/10 shadow-2xl ${isUp ? '-translate-y-64' : 'translate-y-64'}`}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-white text-md leading-tight">{item.title}</h4>
            <span className="text-[10px] font-mono text-blue-400">{item.date}</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed line-clamp-3 prose-invert" dangerouslySetInnerHTML={{ __html: item.description }} />
          
          <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-4 aspect-video flex items-center justify-center">
             {item.type === 'video' && <video src={item.asset_path} controls className="w-full h-full object-cover" />}
             {item.type === 'infographic' && <img src={item.asset_path} className="w-full h-full object-cover" />}
             {item.type === 'audio' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-3">
                  <Mic size={24} className="text-blue-500 mb-2" />
                  <audio src={item.asset_path} controls className="w-full h-8" />
                </div>
             )}
             {(item.type === 'document' || !item.asset_path) && (
                <FileText size={28} className="text-slate-700" />
             )}
          </div>

          <button 
            onClick={() => setIsOpen(false)} 
            className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white transition-all"
          >
            Close Detail
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
