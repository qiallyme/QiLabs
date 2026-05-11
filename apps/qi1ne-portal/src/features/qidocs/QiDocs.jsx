import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Calendar, 
  Tag, 
  Briefcase,
  PenTool,
  Download,
  Copy,
  Scissors
} from 'lucide-react';

const DEFAULT_MARKDOWN = `---
title: Urgent Project Alignment – MyPunchPro (KB Page)
category: client_alignment
date: 2025-11-25
keywords: [mypunchpro, alignment, kb]
project_context: MyPunchPro
subtitle: Required Decision Before Work Continues
author: Cody Rice-Velasquez
status: Action Required
tags: [mypunchpro, scope, pricing, compliance, ai, deliverables]
---

# **🚨 MyPunchPro: Urgent Project Alignment**
Before I continue building your marketing foundation, I need us to pause, reset, and confirm your direction.  
This is not frustration. This is clarity, safety, and protecting your investment.

You have something special with MyPunchPro. I genuinely believe in what you’re building, and I’ve already put in significant work — prototypes, contact scrubbing, CRM prep, workflow architecture, compliance planning, and brand support. I’ve moved fast because I care about your success.

But we are now at a point where I need a *formal decision* from you before we proceed.

---

# **1. Your Decision Is Required Now**
Please choose ONE of the following paths:

## **🅐 Minimum Launch ($950)**
You want something small, safe, and fast.
- Simple landing page  
- 1 email broadcast  
- Basic domain protection + warmup  
- No automation  
- No routing  
- No long-term system  
**Timeline: 10–14 days (includes 7-day warmup)** **Deposit: $300 ($100 received, $200 remaining)**

## **🅑 Full Launch & Lead Capture ($2,400)**
You want the foundation your business actually needs:
- Conditional logic lead forms  
- Segmentation (homeowner/agent/contractor)  
- Lead routing  
- Compliance logic  
- Email enrichment (up to 12k contacts)  
- 3-touch micro-cadence  
**Timeline: 14–20 days total** **Payment: $700 → $850 → $850**

## **🅒 Pause or Part Ways**
No hard feelings.  
We reset cleanly and respectfully.

>>>

# **2. Why This Is Necessary**
The tools you’ve looked at — Lovable, Brevo, $25 “instant website” platforms — look easy because they hide the backend requirements.

**Here’s what they don’t show you:**
- SPF, DKIM, DMARC authentication  
- Domain warmup (7–10 days)  
- Email reputation risk  
- SMS legal compliance  
- Privacy and opt-out logic  
- Routing logic for leads  
- CRM automations  
- Workflow debugging  
- API permissions  
- Integration failures  

Skipping these steps can result in:
- blacklisted domain  
- blocked numbers  
- failed campaigns  
- fines ($10,000 per SMS violation)  
- burned reputation

This is why I need clarity now.

>>>

# **3. How AI Fits Into This**
AI saves you money by speeding up:
- content  
- data cleaning  
- pattern inference  
- structure  
- templating  

But AI **cannot replace**:
- engineering  
- integrations  
- legal compliance  
- workflow logic  
- debugging  
- DNS configuration  
- identity verification  
- API setup  

AI is a worker.  
I am the engineer.

---

# **4. NotebookLM Supporting Material**
If you want deeper context or validation in plain language, review these briefings:

- **Maximizing Proposal Value & Minimizing Risk** {{LINK_TO_NOTEBOOK_LM_FILE_1}}

- **Technical Necessity vs Client Budget Reality** {{LINK_TO_NOTEBOOK_LM_FILE_2}}

- **Why AI Project Tracking Lies (Explained Simply)** {{LINK_TO_NOTEBOOK_LM_FILE_3}}

These explain why shortcuts cause long-term damage and why compliance matters.

---

# **5. P.S. – About the Refund & 2025 Work**
I want to be transparent and fair.

The previous refund was not something I agreed to, and the project was already ~90% completed. But I accept responsibility for my part.

To close the gap and show good faith, I will complete your **2025 personal + business accounting and taxes for free**.

This resets the balance so we can move forward cleanly.

>>>

# **6. Your Confirmation**
Please choose one:

- [ ] **Package A – Minimum Launch ($950)** - [ ] **Package B – Full Launch & Lead Capture ($2,400)** - [ ] **Package C – Pause / Part Ways**

**Signature:** _________________________  
**Date:** ______________________________

---

# **QiAlly Systems Engineering** Building safe, compliant, scalable systems for growth.`;

// --- Utility Functions ---

const parseFrontMatter = (text) => {
  const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;
  const match = text.match(frontMatterRegex);
  
  const metadata = {};
  let body = text;

  if (match) {
    const rawYaml = match[1];
    body = text.replace(frontMatterRegex, '').trim();

    rawYaml.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        
        // Basic array parsing for tags/keywords
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(s => s.trim());
        }
        metadata[key] = value;
      }
    });
  }

  return { metadata, body };
};

const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const s = status.toLowerCase();
  if (s.includes('urgent') || s.includes('action') || s.includes('alert')) return 'bg-rose-100 text-rose-800 border-rose-200';
  if (s.includes('pending') || s.includes('draft')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s.includes('approved') || s.includes('success')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-slate-100 text-slate-800 border-slate-200';
};

// --- Components ---

const MarkdownRenderer = ({ content }) => {
  const lines = content.split('\n');
  const elements = [];
  let listBuffer = [];
  let inList = false;

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 mb-4 space-y-1 text-slate-700 break-inside-avoid">
          {listBuffer.map((item, i) => <li key={i} dangerouslySetInnerHTML={{__html: parseInline(item)}} />)}
        </ul>
      );
      listBuffer = [];
      inList = false;
    }
  };

  const parseInline = (text) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/{{(.*?)}}/g, '<span class="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-mono border border-blue-100">$1</span>')
      .replace(/\[\s?x\s?\]/gi, '<span class="inline-flex items-center justify-center w-5 h-5 mr-2 text-blue-600 border-2 border-slate-300 rounded bg-blue-50">✓</span>')
      .replace(/\[\s? \s?\]/g, '<span class="inline-block w-5 h-5 mr-2 border-2 border-slate-300 rounded bg-white align-middle shadow-sm"></span>');
    return html;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Forced Page Break
    if (trimmed === '>>>') {
        flushList(index);
        elements.push(
            <div key={`break-${index}`} className="w-full my-8 flex items-center gap-4 group print:hidden">
                <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-300"></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Scissors className="w-3 h-3" /> Page Break
                </div>
                <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-300"></div>
            </div>
        );
        // This is the invisible element that actually forces the print break
        elements.push(<div key={`print-break-${index}`} className="break-before-page h-0 w-full" />);
        return;
    }

    // Horizontal Rule
    if (trimmed === '---') {
      flushList(index);
      elements.push(<hr key={index} className="my-8 border-slate-200" />);
      return;
    }

    // Headers (With break avoidance)
    if (trimmed.startsWith('# ')) {
      flushList(index);
      elements.push(<h1 key={index} className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight leading-tight break-inside-avoid break-after-avoid" dangerouslySetInnerHTML={{__html: parseInline(trimmed.slice(2))}} />);
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(index);
      elements.push(<h2 key={index} className="text-lg font-semibold text-slate-800 mt-6 mb-3 flex items-center break-inside-avoid break-after-avoid" dangerouslySetInnerHTML={{__html: parseInline(trimmed.slice(3))}} />);
      return;
    }

    // Lists
    if (trimmed.startsWith('- ')) {
      inList = true;
      listBuffer.push(trimmed.slice(2));
      return;
    } else {
      flushList(index);
    }

    // Empty lines
    if (trimmed === '') {
      return;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
       elements.push(<blockquote key={index} className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4 break-inside-avoid">{parseInline(trimmed.slice(1))}</blockquote>);
       return;
    }

    // Signature Line
    if (trimmed.startsWith('**Signature:**')) {
         elements.push(
            <div key={index} className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg break-inside-avoid">
                <div className="flex flex-col sm:flex-row gap-8">
                    <div className="flex-1">
                        <div className="text-xs uppercase font-bold text-slate-400 mb-8">Authorizing Signature</div>
                        <div className="border-b-2 border-slate-300 mb-2"></div>
                        <div className="text-sm font-medium text-slate-900">Client Signature</div>
                    </div>
                    <div className="w-full sm:w-48">
                         <div className="text-xs uppercase font-bold text-slate-400 mb-8">Date</div>
                        <div className="border-b-2 border-slate-300 mb-2"></div>
                        <div className="text-sm font-medium text-slate-900">Date Signed</div>
                    </div>
                </div>
            </div>
         )
         return;
    }

    // Standard Paragraph
    elements.push(<p key={index} className="mb-4 text-slate-700 leading-relaxed break-inside-avoid" dangerouslySetInnerHTML={{__html: parseInline(trimmed)}} />);
  });

  flushList('final');
  return <div className="markdown-content">{elements}</div>;
};

// --- Main App Component ---

const App = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [parsed, setParsed] = useState({ metadata: {}, body: '' });
  const [viewMode, setViewMode] = useState('split');

  useEffect(() => {
    setParsed(parseFrontMatter(markdown));
  }, [markdown]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col h-screen overflow-hidden">
      
      {/* Top Bar (No Print) */}
      <div className="bg-slate-900 text-white p-3 shadow-md flex items-center justify-between z-10 print:hidden shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h1 className="font-bold text-lg tracking-wide">QiAlly<span className="font-light text-slate-400">DocuForge</span></h1>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Editor
          </button>
          <button 
            onClick={() => setViewMode('split')}
            className={`hidden md:block px-3 py-1 text-sm rounded-md transition ${viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Split
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-sm rounded-md transition ${viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center space-x-2">
           <button onClick={handlePrint} className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition shadow-sm">
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Editor Pane */}
        <div className={`${viewMode === 'preview' ? 'hidden' : 'flex'} ${viewMode === 'split' ? 'w-1/2 border-r border-slate-300' : 'w-full'} flex-col bg-slate-50 print:hidden`}>
          <div className="p-2 bg-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300 flex justify-between">
            <span>Source Markdown</span>
            <span className="text-slate-400">Use "{'>>>'}" for Page Breaks</span>
          </div>
          <textarea 
            className="flex-1 w-full p-6 bg-slate-50 text-slate-800 font-mono text-sm focus:outline-none resize-none leading-relaxed"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Preview Pane */}
        <div className={`${viewMode === 'edit' ? 'hidden' : 'flex'} ${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex-col bg-slate-300 overflow-y-auto relative`}>
            
          {/* Document Container */}
          <div className="mx-auto my-8 w-full max-w-[210mm] bg-white shadow-xl min-h-[297mm] flex flex-col print:m-0 print:shadow-none print:w-full print:max-w-none print:block">
            
            {/* --- Document Header --- */}
            <header className="p-10 pb-6 border-b-2 border-slate-100 relative overflow-hidden break-inside-avoid">
               {/* Decorative Top Accent */}
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-800 to-blue-900 print:hidden"></div>

               <div className="flex justify-between items-start mb-6">
                 <div>
                    {parsed.metadata.category && (
                      <span className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-1 block">
                        {parsed.metadata.category.replace('_', ' ')}
                      </span>
                    )}
                    <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                      {parsed.metadata.title || 'Untitled Document'}
                    </h1>
                    {parsed.metadata.subtitle && (
                      <p className="text-lg text-slate-500 font-medium mt-1">
                        {parsed.metadata.subtitle}
                      </p>
                    )}
                 </div>
                 
                 {/* Status Badge */}
                 {parsed.metadata.status && (
                   <div className={`print:border print:border-slate-800 print:bg-white print:text-slate-900 flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide whitespace-nowrap ${getStatusColor(parsed.metadata.status)}`}>
                     <AlertTriangle className="w-3 h-3" />
                     <span>{parsed.metadata.status}</span>
                   </div>
                 )}
               </div>

               {/* Meta Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-slate-100">
                  {parsed.metadata.author && (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1"><User className="w-3 h-3"/> Author</span>
                      <span className="font-medium text-slate-700">{parsed.metadata.author}</span>
                    </div>
                  )}
                  {parsed.metadata.date && (
                    <div className="flex flex-col">
                       <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</span>
                       <span className="font-medium text-slate-700">{parsed.metadata.date}</span>
                    </div>
                  )}
                  {parsed.metadata.project_context && (
                    <div className="flex flex-col">
                       <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1"><Briefcase className="w-3 h-3"/> Project</span>
                       <span className="font-medium text-slate-700">{parsed.metadata.project_context}</span>
                    </div>
                  )}
               </div>

               {/* Tags */}
               {parsed.metadata.tags && Array.isArray(parsed.metadata.tags) && (
                 <div className="flex flex-wrap gap-2 mt-4 print:hidden">
                   {parsed.metadata.tags.map((tag, i) => (
                     <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded border border-slate-200">
                       #{tag}
                     </span>
                   ))}
                 </div>
               )}
            </header>

            {/* --- Document Body --- */}
            <main className="p-10 pt-8 flex-1">
              <MarkdownRenderer content={parsed.body} />
            </main>

            {/* --- Footer --- */}
            <footer className="p-10 bg-slate-50 border-t border-slate-200 text-center print:break-inside-avoid print:bg-white print:border-t-2 print:border-slate-800">
               <div className="flex flex-col items-center justify-center opacity-70">
                 <div className="flex items-center space-x-2 text-slate-800 font-bold mb-2">
                    <PenTool className="w-4 h-4" />
                    <span>QiAlly Systems Engineering</span>
                 </div>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Building safe, compliant, scalable systems for growth.</p>
                 <p className="text-[10px] text-slate-400 mt-4 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
               </div>
            </footer>

          </div>
          
          <div className="h-20 print:hidden"></div> {/* Spacer for scroll */}
        </div>
      </div>

    </div>
  );
};