import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Search, History, Database } from 'lucide-react';
import { TimelineItem } from './types';
import { TimelineNode } from './TimelineNode';

export const TimelineModule: React.FC = () => {
  const [data, setData] = useState<TimelineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Data Ingestion (Static /api/timeline.json for now, matching blueprint mock strategy)
  useEffect(() => {
    fetch('/timeline.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        // smooth landing: scroll indicator for user interaction
      });
  }, []);

  // 2. Search & Filtering
  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
    );
  }, [data, searchTerm]);

  // 3. Scroll Orchestration
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Mapping vertical scroll (1000vh) to horizontal travel
  // Start with padding to allow header/content intro
  const xTranslate = useTransform(scrollYProgress, [0, 1], ["20%", "-100%"]);
  const x = useSpring(xTranslate, { stiffness: 40, damping: 25 });

  return (
    <div ref={containerRef} className="relative h-[1200vh] bg-[#020617] text-slate-200">
      
      {/* HUD Header (Dynamic) */}
      <header className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[80%] max-w-5xl pointer-events-none">
        <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-4 rounded-3xl pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                QiTimeline <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">CEREBRO CORE</span>
              </h2>
              <p className="text-[9px] font-mono text-slate-500 tracking-[0.2em] uppercase">Temporal Case Ledger v2.1</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-slate-950/50 border border-white/5 rounded-2xl px-3 py-1.5 flex items-center gap-3 w-64 shadow-inner">
              <Search size={14} className="text-slate-600" />
              <input
                type="text"
                placeholder="Search timestamps or events..."
                className="bg-transparent border-none outline-none text-[11px] w-full text-slate-300 placeholder:text-slate-700 focus:ring-0"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="hidden lg:flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Active Records</span>
              <div className="flex items-center gap-2">
                <Database size={10} className="text-blue-500" />
                <span className="text-xs font-bold text-white tracking-widest leading-none bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                  {filteredData.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Timeline Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_80%)] opacity-30 pointer-events-none" />
        
        {/* BG Grid (Subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:10rem_10rem] opacity-5 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

        {/* THE CENTRAL SPINE */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-full h-[8px] bg-blue-500/10 blur-2xl pointer-events-none" />

        {/* Dynamic Items Row */}
        <motion.div style={{ x }} className="flex items-center px-[30vw]">
          {filteredData.map((item, i) => (
            <TimelineNode key={item.id || i} item={item} index={i} scrollYProgress={scrollYProgress} />
          ))}
          
          {/* END OF SEQUENCE MARKER */}
          <div className="flex flex-col items-center ml-48 opacity-20 group">
             <div className="w-1 h-32 bg-gradient-to-b from-blue-500 to-transparent mb-4" />
             <p className="font-mono text-[9px] uppercase tracking-[1em] whitespace-nowrap">End of Ledger</p>
          </div>
        </motion.div>

        {/* Navigation Prompt */}
        <div className="fixed bottom-12 right-12 flex flex-col items-end gap-2 opacity-30 group hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Temporal Shift Protocol</span>
           <div className="flex items-center gap-3">
              <div className="h-[1px] w-20 bg-slate-800" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           </div>
        </div>
      </div>
      
      {/* Intro Anchor */}
      <div className="absolute top-0 w-full h-32 flex flex-col items-center justify-center pointer-events-none opacity-20">
         <div className="w-[1px] h-20 bg-gradient-to-t from-slate-700 to-transparent" />
         <span className="text-[10px] uppercase tracking-[0.5em] font-mono mt-4">Scroll to Initiate Shift</span>
      </div>

    </div>
  );
};
