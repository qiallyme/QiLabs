import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  RefreshCw,
  MessageSquare,
  Share2,
  Layers,
  FileText,
  ChevronRight,
  ChevronDown,
  Send,
  X,
  Activity,
  Folder,
  File,
  Edit3,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ForceGraph3D from "3d-force-graph";
import "./App.css";

const API_BASE = "";

function App() {
  const [vaultIndex, setVaultIndex] = useState(null);
  const [navTree, setNavTree] = useState([]);
  const [navMode, setNavMode] = useState("module"); // module | standard | source

  const [activeModule, setActiveModule] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [activeContent, setActiveContent] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [isGinaOpen, setIsGinaOpen] = useState(false);
  const [status, setStatus] = useState("Idle");

  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I am Gina. I can help you find information across your entire vault. What would you like to know?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const graphRef = useRef(null);
  const graphContainerRef = useRef(null);

  useEffect(() => {
    fetchVaultIndex();
    fetchNavTree();
  }, [navMode, fetchVaultIndex, fetchNavTree]);

  useEffect(() => {
    if (isGraphVisible && vaultIndex && graphContainerRef.current) {
      updateGraph();
    }
  }, [isGraphVisible, vaultIndex, navTree, navMode, updateGraph]);

  const fetchVaultIndex = useCallback(async () => {
    try {
      setStatus("Fetching Index...");
      const response = await fetch(`${API_BASE}/derived/vault_index.json`);
      const data = await response.json();
      setVaultIndex(data);
      setStatus("Ready");
    } catch (error) {
      console.error("Failed to load vault index", error);
      setStatus("API Error");
    }
  }, []);

  const fetchNavTree = useCallback(async () => {
    if (navMode === "module") {
      setNavTree([]); // Clear tree in module mode
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/tree?mode=${navMode}`);
      const data = await resp.json();
      setNavTree(data.tree);
    } catch (e) {
      console.error("Failed to load tree", e);
    }
  }, [navMode]);

  const loadModule = useCallback(async (mod) => {
    setActiveModule(mod);
    const entry = mod.entrypoints?.content || "README.md";
    const path = `/modules/${mod.folder}/${entry}`;
    setActiveFilePath(path);
    setIsGraphVisible(false);
    setIsEditing(false);
    try {
      setStatus(`Loading ${mod.title}...`);
      const response = await fetch(`${API_BASE}${path}`);
      const text = await response.text();
      setActiveContent(text);
      setStatus("Ready");
    } catch {
      setActiveContent("# Error Loading Content\nCould not fetch: " + path);
    }
  }, []);

  const loadFileByPath = useCallback(
    async (path) => {
      // path is like /modules/folder/sub/file.md
      setActiveFilePath(path);
      setIsEditing(false);
      try {
        const resp = await fetch(`${API_BASE}${path}`);
        const text = await resp.text();
        setActiveContent(text);

        // Try to link it to a module if possible
        const parts = path.split("/");
        if (parts[1] === "modules") {
          const folder = parts[2];
          const mod = vaultIndex?.modules.find((m) => m.folder === folder);
          if (mod) setActiveModule(mod);
        }
      } catch {
        setActiveContent("# Error Loading Content");
      }
    },
    [vaultIndex],
  );

  const updateGraph = useCallback(() => {
    const nodes = [];
    const links = [];

    if (navMode === "module" || navTree.length === 0) {
      // Module only mode
      if (!vaultIndex) return;
      vaultIndex.modules.forEach((m) => {
        nodes.push({
          id: m.module_id,
          name: m.title || m.folder,
          type: "module",
          group: 1,
        });
      });
      // Connect modules linearly for visualization stability
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({ source: nodes[i].id, target: nodes[i + 1].id });
      }
    } else {
      // Tree or Source mode
      const processNode = (item, parentId = null) => {
        const id = item.path;
        nodes.push({
          id: id,
          name: item.name,
          type: item.type,
          is_module: item.is_module,
          group: item.is_module ? 1 : item.type === "directory" ? 2 : 3,
        });

        if (parentId) {
          links.push({ source: parentId, target: id });
        }

        if (item.children) {
          item.children.forEach((child) => processNode(child, id));
        }
      };

      navTree.forEach((root) => processNode(root));
    }

    if (!graphRef.current && graphContainerRef.current) {
      const Graph = ForceGraph3D()(graphContainerRef.current)
        .nodeLabel("name")
        .nodeAutoColorBy("group")
        .backgroundColor("#05070a")
        .onNodeClick((node) => {
          if (node.type === "file") {
            loadFileByPath("/modules/" + node.id);
          } else if (node.is_module) {
            const mod = vaultIndex.modules.find((m) => m.folder === node.name);
            if (mod) loadModule(mod);
          }
        });
      graphRef.current = Graph;
    }

    if (graphRef.current) {
      graphRef.current.graphData({ nodes, links });
    }
  }, [navMode, navTree, vaultIndex, loadFileByPath, loadModule]);

  const startEditing = useCallback(() => {
    setEditContent(activeContent);
    setIsEditing(true);
  }, [activeContent]);

  const saveContent = useCallback(async () => {
    if (!activeFilePath) return;
    setStatus("Saving...");
    try {
      const resp = await fetch(`${API_BASE}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: activeFilePath, content: editContent }),
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setActiveContent(editContent);
        setIsEditing(false);
        setStatus("Saved");
        setTimeout(() => setStatus("Ready"), 2000);
      } else {
        throw new Error(data.error);
      }
    } catch {
      alert("Failed to save.");
      setStatus("Error");
    }
  }, [activeFilePath, editContent]);

  const deleteAsset = useCallback(
    async (path) => {
      if (!confirm("Are you sure you want to delete this asset?")) return;
      try {
        const resp = await fetch(`${API_BASE}/api/assets/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const data = await resp.json();
        if (data.status === "ok") {
          fetchNavTree();
          alert("Asset deleted.");
        }
      } catch {
        alert("Delete failed.");
      }
    },
    [fetchNavTree],
  );

  const uploadAsset = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file || !activeModule) return;

      setStatus("Uploading...");
      try {
        const resp = await fetch(
          `${API_BASE}/api/upload?folder=${activeModule.folder}&name=${file.name}`,
          {
            method: "POST",
            body: file, // Direct binary
          },
        );
        const data = await resp.json();
        if (data.status === "ok") {
          fetchNavTree();
          setStatus("Uploaded");
          setTimeout(() => setStatus("Ready"), 2000);
        }
      } catch {
        alert("Upload failed.");
        setStatus("Error");
      }
    },
    [activeModule, fetchNavTree],
  );

  const handleGinaSend = useCallback(async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg }),
      });
      const data = await response.json();

      let answer = data.answer || "I couldn't find anything relevant.";

      setChatMessages((prev) => [
        ...prev,
        { role: "bot", content: answer, context: data.context },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error connecting to the kernel.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [chatInput, isTyping]);

  return (
    <div className="standard-workspace">
      {/* HEADER */}
      <header className="header">
        <div
          className="brand"
          onClick={() => {
            setIsGraphVisible(false);
            setNavMode("module");
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon">
            <Layers size={18} color="white" />
          </div>
          <div className="brand-text">
            <h1>QiNoteOS</h1>
            <span>Intelligence Standard V1</span>
          </div>
        </div>

        <div className="topbar-actions" style={{ display: "flex", gap: "8px" }}>
          <button
            className="glass"
            onClick={fetchVaultIndex}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <div
            className="pill"
            style={{
              marginLeft: "12px",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            <Activity size={10} style={{ marginRight: "6px" }} />
            {status}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="sidebar glass">
        <div
          className="nav-mode-switcher"
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(0,0,0,0.2)",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <NavModeBtn
            label="Modules"
            active={navMode === "module"}
            onClick={() => setNavMode("module")}
          />
          <NavModeBtn
            label="Tree"
            active={navMode === "standard"}
            onClick={() => setNavMode("standard")}
          />
          <NavModeBtn
            label="Source"
            active={navMode === "source"}
            onClick={() => setNavMode("source")}
          />
        </div>

        <div
          className="nav-section premium-scroll"
          style={{ flex: 1, overflowY: "auto" }}
        >
          {navMode === "module" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {vaultIndex?.modules.map((mod) => (
                <SidebarItem
                  key={mod.module_id}
                  icon={<FileText size={16} />}
                  label={mod.title || mod.folder}
                  active={
                    activeModule?.module_id === mod.module_id && !isGraphVisible
                  }
                  onClick={() => loadModule(mod)}
                />
              ))}
            </div>
          ) : (
            <div className="tree-view">
              {navTree.map((item, i) => (
                <TreeItem
                  key={i}
                  item={item}
                  onSelectFile={loadFileByPath}
                  onDeleteAsset={deleteAsset}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="sidebar-footer"
          style={{
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "16px",
          }}
        >
          <SidebarItem
            icon={<Share2 size={16} />}
            label="Full Graph"
            active={isGraphVisible}
            onClick={() => setIsGraphVisible(true)}
          />
          <SidebarItem icon={<Search size={16} />} label="Search All" />
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="main-view">
        <AnimatePresence mode="wait">
          {isGraphVisible ? (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="graph-viewport"
              ref={graphContainerRef}
            />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="content-overlay premium-scroll"
            >
              <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "40px",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "42px",
                        marginBottom: "8px",
                      }}
                    >
                      {activeModule?.title || "Welcome"}
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {activeFilePath || "Select a document"}
                    </p>
                  </div>
                  {!isEditing ? (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <label
                        className="glass"
                        style={{
                          padding: "8px 20px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Plus size={16} /> Asset
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={uploadAsset}
                        />
                      </label>
                      <button
                        className="glass"
                        onClick={startEditing}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          borderColor: "var(--accent-blue)",
                          color: "var(--accent-blue)",
                        }}
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="glass"
                        onClick={() => setIsEditing(false)}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="glass"
                        onClick={saveContent}
                        style={{
                          padding: "8px 24px",
                          borderRadius: "12px",
                          background: "var(--accent-blue)",
                          color: "white",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className="glass card"
                  style={{
                    padding: isEditing ? "0" : "48px",
                    minHeight: "60vh",
                  }}
                >
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{
                        width: "100%",
                        height: "70vh",
                        background: "transparent",
                        border: "none",
                        color: "white",
                        padding: "40px",
                        outline: "none",
                        fontSize: "16px",
                        fontFamily: "var(--font-main)",
                        lineHeight: "1.6",
                        resize: "none",
                      }}
                    />
                  ) : (
                    <div
                      className="markdown-view"
                      style={{ fontSize: "16px", lineHeight: "1.7" }}
                    >
                      <ReactMarkdown>
                        {activeContent ||
                          "# Intelligence Hub\nSelect a module or file to start."}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GINA */}
        {!isGinaOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGinaOpen(true)}
            className="gina-trigger"
          >
            <MessageSquare size={20} /> Ask Gina
          </motion.button>
        )}

        <AnimatePresence>
          {isGinaOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="gina-container glass"
            >
              <div className="gina-header">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div className="gina-status-dot"></div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Gina Intelligence
                  </span>
                </div>
                <button
                  onClick={() => setIsGinaOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="gina-messages premium-scroll">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`msg-bubble msg-${msg.role}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.context && (
                      <div className="citations">
                        {msg.context.map((c, j) => (
                          <div
                            key={j}
                            className="cite-item"
                            onClick={() =>
                              loadFileByPath(`/modules/${c.module}/${c.source}`)
                            }
                          >
                            • {c.module} ({Math.round(c.score * 100)}%)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="msg-bubble msg-bot typing">...</div>
                )}
              </div>

              <div className="gina-input">
                <input
                  className="input-field"
                  placeholder="Search knowledge..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGinaSend()}
                />
                <button onClick={handleGinaSend} className="send-btn">
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TreeItem({ item, onSelectFile, onDeleteAsset }) {
  const [isOpen, setIsOpen] = useState(item.is_module);
  const isDir = item.type === "directory";
  const isAsset =
    item.path.includes("/assets/") || item.path.includes("/tables/");
  const isContent = item.name === "content" && isDir;

  return (
    <div className="tree-item-container">
      <div
        className={`tree-row ${item.is_module ? "module-node" : ""} ${isContent ? "content-node" : ""}`}
        onClick={() =>
          isDir ? setIsOpen(!isOpen) : onSelectFile("/modules/" + item.path)
        }
      >
        <div className="tree-icon-hit">
          {isDir ? (
            isOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <div style={{ width: 14 }} />
          )}
        </div>
        {isDir ? (
          isContent ? (
            <Activity size={14} color="var(--accent-blue)" />
          ) : (
            <Folder size={14} color="var(--accent-blue)" />
          )
        ) : (
          <File size={14} color="var(--text-muted)" />
        )}
        <span className="tree-label">{item.name}</span>
        {isAsset && !isDir && (
          <button
            className="tree-action"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAsset("/modules/" + item.path);
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      {isDir && isOpen && (
        <div className="tree-children">
          {item.children?.map((child, i) => (
            <TreeItem
              key={i}
              item={child}
              onSelectFile={onSelectFile}
              onDeleteAsset={onDeleteAsset}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavModeBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "6px 0",
        border: "none",
        background: active ? "var(--accent-blue)" : "transparent",
        color: active ? "white" : "var(--text-muted)",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: active ? 600 : 400,
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`sidebar-item ${active ? "active" : ""}`}>
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
      {active && (
        <motion.div layoutId="indicator" className="active-indicator">
          <ChevronRight size={14} />
        </motion.div>
      )}
    </div>
  );
}

export default App;
