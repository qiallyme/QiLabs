import React, { useState } from 'react';
import {
  FileText,
  Settings,
  Upload,
  RefreshCw,
  RotateCcw,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
  History,
  Lightbulb
} from 'lucide-react';

const API_KEY = "AIzaSyC6dnYo1Ev4RyrpN3QrwYEPhQlmQB_XXW8"; // Provided by environment
const MODEL = "gemini-2.5-flash-preview-09-2025";

const App = () => {
  const [files, setFiles] = useState([]);
  const [convention, setConvention] = useState("{YYYY}-{MM}-{DD}_{Organization}_{Subject}");
  const [hints, setHints] = useState(""); // New state for user context hints
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  // --- Helpers ---

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- AI Renaming Logic ---

  const getAiSuggestedName = async (file, currentConvention, userHints) => {
    try {
      const extension = file.name.split('.').pop();
      const basePrompt = `
        TASK: Generate a new filename based on the provided file content.
        CONVENTION: ${currentConvention}
        USER CONTEXT/HINTS: ${userHints || "None provided"}

        INSTRUCTIONS:
        1. Analyze the file (Image, PDF, or Text). Look for logos, headers, dates, and recurring names.
        2. If a placeholder like {Organization} isn't explicitly labeled, infer it from the sender, letterhead, or email domain mentioned.
        3. For {Subject}, provide a concise 2-3 word summary of the document's purpose.
        4. If a piece of information is missing, DO NOT just say "Unknown" if you can reasonably infer it. Only use "Unknown" as a last resort.
        5. Use today's year (${new Date().getFullYear()}) if no year is found but a month/day is present.
        6. Clean the filename: remove special characters (except - and _), use Title Case or as requested.
        7. OUTPUT ONLY THE FILENAME (including the extension: .${extension}). No explanations.
      `;

      let payload;
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const base64Data = await fileToBase64(file);
        payload = {
          contents: [{
            parts: [
              { text: basePrompt },
              { inlineData: { mimeType: file.type, data: base64Data } }
            ]
          }]
        };
      } else {
        const textSnippet = (await file.text()).substring(0, 10000);
        payload = {
          contents: [{
            parts: [{ text: `${basePrompt}\n\nCONTENT SNIPPET:\n${textSnippet}` }]
          }]
        };
      }

      // Implement exponential backoff for API calls
      const callWithRetry = async (retries = 0) => {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error('API Error');
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        } catch (err) {
          if (retries < 3) {
            const delay = Math.pow(2, retries) * 1000;
            await new Promise(res => setTimeout(res, delay));
            return callWithRetry(retries + 1);
          }
          throw err;
        }
      };

      const result = await callWithRetry();
      // Clean result in case AI adds markdown or quotes
      return result?.replace(/[`"']/g, '') || `renamed_${file.name}`;
    } catch (error) {
      console.error("AI Error:", error);
      return `error_${file.name}`;
    }
  };

  // --- Actions ---

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      file: f,
      originalName: f.name,
      suggestedName: '',
      status: 'pending',
      error: null
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const processFiles = async () => {
    setProcessing(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'pending') {
        updatedFiles[i].status = 'processing';
        setFiles([...updatedFiles]);

        const newName = await getAiSuggestedName(updatedFiles[i].file, convention, hints);
        updatedFiles[i].suggestedName = newName;
        updatedFiles[i].status = 'ready';
        setFiles([...updatedFiles]);
      }
    }
    setProcessing(false);
  };

  const downloadFile = (fileObj) => {
    const url = URL.createObjectURL(fileObj.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.suggestedName || fileObj.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setHistory(prev => [{
      id: crypto.randomUUID(),
      originalName: fileObj.originalName,
      renamedTo: fileObj.suggestedName,
      timestamp: new Date().toLocaleTimeString(),
      fileRef: fileObj.file
    }, ...prev]);

    setFiles(prev => prev.filter(f => f.id !== fileObj.id));
  };

  const undoRename = (logItem) => {
    const restoredFile = {
      id: crypto.randomUUID(),
      file: logItem.fileRef,
      originalName: logItem.originalName,
      suggestedName: '',
      status: 'pending',
      error: null
    };
    setFiles(prev => [restoredFile, ...prev]);
    setHistory(prev => prev.filter(h => h.id !== logItem.id));
    setActiveTab('upload');
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <RefreshCw className="text-blue-600" />
              SmartRename AI
            </h1>
            <p className="text-slate-500 text-sm">Automated file organization using vision and language models</p>
          </div>

          <div className="flex bg-white rounded-xl shadow-sm p-1 border border-slate-200 self-start">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Rename Files
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <History size={16} />
              Undo Log {history.length > 0 && <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 rounded-full">{history.length}</span>}
            </button>
          </div>
        </header>

        {activeTab === 'upload' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Sidebar Settings */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings size={18} className="text-slate-400" />
                  Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Filename Template</label>
                    <input
                      type="text"
                      value={convention}
                      onChange={(e) => setConvention(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <Lightbulb size={12} className="text-amber-500" />
                      Context Hints (Helps avoid "Unknown")
                    </label>
                    <textarea
                      value={hints}
                      onChange={(e) => setHints(e.target.value)}
                      placeholder="e.g. These are utility bills from 2023. Subject should be the type of utility."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm h-24 resize-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 italic">Providing context helps the AI infer fields like Organization or Subject.</p>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
                  <Upload size={18} className="text-slate-400" />
                  Source Files
                </h2>
                <label className="group cursor-pointer block p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center">
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 block">Click to upload files</span>
                  <span className="text-[10px] text-slate-400 mt-1 block uppercase">PDF • JPG • PNG • TXT</span>
                </label>
              </section>
            </div>

            {/* Main Processing Area */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase">
                    Queue: {files.length}
                  </div>
                </div>
                {files.length > 0 && (
                  <button
                    onClick={processFiles}
                    disabled={processing || files.every(f => f.status === 'ready')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all"
                  >
                    {processing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    {processing ? 'Processing...' : 'Start AI Renaming'}
                  </button>
                )}
              </div>

              {files.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center shadow-sm">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-slate-800 font-semibold">No files in queue</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">Upload documents or images on the left to begin intelligent renaming.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((f) => (
                    <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className={`p-3 rounded-xl ${f.status === 'ready' ? 'bg-green-100 text-green-600' :
                        f.status === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                        <FileText size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-1">{f.originalName}</p>
                        <div className="flex items-center gap-2">
                          {f.status === 'ready' ? (
                            <p className="text-sm font-bold text-slate-800 break-all">{f.suggestedName}</p>
                          ) : f.status === 'processing' ? (
                            <div className="flex flex-col gap-1 w-full max-w-[200px]">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 animate-pulse w-2/3"></div>
                              </div>
                              <span className="text-[10px] text-blue-500 font-medium">Analyzing content...</span>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 italic">Pending analysis...</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {f.status === 'ready' && (
                          <button
                            onClick={() => downloadFile(f)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl shadow-md shadow-green-100 transition-all"
                            title="Download with new name"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(f.id)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* History/Log Tab */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Renaming History</h2>
                <p className="text-sm text-slate-500">A session log of all files you've "renamed" (downloaded).</p>
              </div>
              <button
                onClick={() => setHistory([])}
                className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Log
              </button>
            </div>

            {history.length === 0 ? (
              <div className="p-20 text-center">
                <RotateCcw size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400">No renaming activity in this session.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Original Filename</th>
                      <th className="px-6 py-4">New Filename</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">{item.timestamp}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono truncate max-w-[200px]">{item.originalName}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <span className="text-sm font-bold text-slate-700 font-mono">{item.renamedTo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => undoRename(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-[10px] font-bold text-slate-600 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <RotateCcw size={12} />
                            RESTORE / UNDO
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-4 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <p>© 2024 AI SMARTRENAME SYSTEM</p>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <p className="flex items-center gap-1"><AlertCircle size={14} /> Local browser processing • API via Gemini 2.5 Flash</p>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-500">PRO TIP: Use "Hints" for niche documents</span>
        </div>
      </footer>
    </div>
  );
};

export default App;