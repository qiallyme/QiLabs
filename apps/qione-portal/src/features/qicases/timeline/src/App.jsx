import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FileText, Video, Mic, Image as ImageIcon, Search, ArrowRight, Download } from 'lucide-react';

// Maps asset types to icons
const IconMap = {
  video: <Video size={18} />,
  audio: <Mic size={18} />,
  infographic: <ImageIcon size={18} />,
  document: <FileText size={18} />,
  article: <FileText size={18} />
};

// Category-based styling for Glassmorphism borders
const ColorMap = {
  finance: "border-emerald-500/40 shadow-emerald-500/5 hover:border-emerald-400",
  milestone: "border-amber-500/40 shadow-amber-500/5 hover:border-amber-400",
  dev: "border-blue-500/40 shadow-blue-500/5 hover:border-blue-400",
  default: "border-slate-700/40 shadow-slate-900/20 hover:border-slate-500"
};

export default function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const targetRef = useRef(null);

  // 1. Load Data
  useEffect(() => {
    fetch('/timeline.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        // "Jump to Latest" - Give the browser a moment to render, then scroll to the end
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 800);
      });
  }, []);

  // 2. Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
    );
  }, [data, searchTerm]);

  // 3. Scroll Animation Logic
  const { scrollYProgress } = useScroll({ target: targetRef });

  // Maps vertical scroll (0 to 1) to horizontal translation
  // We use -85% to ensure the last card is fully visible but not off-screen
  const xTranslate = useTransform(scrollYProgress, [0, 1], ["0%", `-${Math.max(0, (filteredData.length - 1) * 22)}%`]);
  const x = useSpring(xTranslate, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // 4. Download Bundle Function
  const downloadBundle = (item) => {
    const element = document.createElement("a");
    const fileContent = `TIMELINE ENTRY: ${item.title}\nDATE: ${item.date}\nCATEGORY: ${item.category}\n\nDESCRIPTION:\n${item.raw_md || "No description provided."}\n\nASSET PATH: ${window.location.origin}/${item.asset_path}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${item.date}_${item.title.replace(/\s+/g, '_')}_Archive.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <main className="bg-[#020617] text-slate-200 min-h-screen selection:bg-blue-500/30 font-sans">

      {/* HEADER: Search & Counter */}
      <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl pointer-events-auto flex items-center gap-3 w-80 shadow-2xl">
          <Search size={18} className="text-slate-500 ml-2" />
          <input
            type="text"
            placeholder="Search entries or dates..."
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-600 focus:ring-0"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 pointer-events-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Database Ledger</span>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            {filteredData.length} ACTIVE RECORDS
          </span>
        </div>
      </header>

      {/* TIMELINE SECTION */}
      <section ref={targetRef} className="relative h-[800vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">

          {/* BG Grid - Tweak: Darker and more subtle */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-10" />

          {/* Spine Line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent -z-10" />

          <motion.div style={{ x }} className="flex gap-20 px-[20vw] items-center">
            {filteredData.map((item, i) => (
              <div key={i} className="flex-shrink-0 group relative">

                {/* Node on the Spine */}
                <div className="absolute top-1/2 left-[-45px] w-3 h-3 rounded-full bg-slate-800 border border-slate-700 group-hover:scale-150 group-hover:bg-blue-500 transition-all duration-300" />

                {/* The Card */}
                <div className={`w-[420px] rounded-[2rem] border-t backdrop-blur-2xl bg-slate-900/40 p-8 shadow-2xl transition-all duration-500 hover:-translate-y-4 ${ColorMap[item.category || 'default']}`}>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Timestamp</span>
                      <span className="text-sm font-bold text-slate-200">{item.date}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 text-slate-400 group-hover:text-blue-400 transition-colors">
                      {IconMap[item.type || 'article']}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-100 transition-colors">
                    {item.title}
                  </h3>

                  <div
                    className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3 prose-invert opacity-80 group-hover:opacity-100 transition-opacity"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />

                  {/* Asset Display Area */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/60 aspect-video flex items-center justify-center border border-white/5 shadow-inner mb-6">
                    {item.type === 'video' && (
                      <video src={item.asset_path} controls className="w-full h-full object-cover" />
                    )}
                    {item.type === 'audio' && (
                      <div className="w-full p-6 text-center">
                        <div className="mb-4 inline-flex p-3 rounded-full bg-blue-500/10 text-blue-400">
                          <Mic size={24} />
                        </div>
                        <audio src={item.asset_path} controls className="w-full h-8" />
                      </div>
                    )}
                    {item.type === 'infographic' && (
                      <img src={item.asset_path} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                    )}
                    {(item.type === 'document' || !item.asset_path) && (
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={32} className="text-slate-600" />
                        <a href={item.asset_path} target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300">Open Full Record</a>
                      </div>
                    )}
                  </div>

                  {/* BUNDLE DOWNLOAD BUTTON */}
                  <button
                    onClick={() => downloadBundle(item)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all duration-300"
                  >
                    <Download size={14} /> Download Receipt Bundle
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOOTER: Scroll Indicator */}
      <footer className="h-screen flex flex-col items-center justify-center text-slate-700">
        <div className="w-[1px] h-32 bg-gradient-to-b from-slate-800 to-transparent" />
        <p className="mt-8 font-mono text-[9px] uppercase tracking-[1em] animate-pulse">End of Sequence</p>
      </footer>
      
      {/* Floating Date Indicator */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-2xl flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">
            Timeline Navigation Active
          </span>
          </div>
        </div>
    </main>
  );
}