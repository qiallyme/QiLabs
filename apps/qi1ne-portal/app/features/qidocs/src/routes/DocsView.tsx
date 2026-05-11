import { useParams } from "react-router-dom";
import { useQiStore } from "../core/state/useQiStore";
import { useState, useEffect } from "react";
import { HtmlDocViewer, TemplateType } from "../qidocs/components/HtmlDocViewer";
import GlassCard from "../components/common/GlassCard";

interface DocData {
  template: TemplateType;
  data: unknown;
}

export default function DocsView() {
  const { qid } = useParams<{ qid: string }>();
  const node = useQiStore((s) => (qid ? s.getNode(qid) : undefined));
  const [docData, setDocData] = useState<DocData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load node if not in store
  useEffect(() => {
    if (qid && !node) {
      import("../core/data/qiNodeRepository").then(({ fetchQiNodeByQid }) => {
        fetchQiNodeByQid(qid).then((fetchedNode) => {
          if (fetchedNode) {
            useQiStore.getState().addNode(fetchedNode);
          }
        });
      });
    }
  }, [qid, node]);

  // Parse document data from node body
  useEffect(() => {
    if (node?.body) {
      try {
        const parsed = JSON.parse(node.body) as DocData;
        if (parsed.template && parsed.data) {
          setDocData(parsed);
          setError(null);
        } else {
          setError("Invalid document format: missing template or data");
        }
      } catch (e) {
        setError(`Failed to parse document data: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    } else if (node) {
      setError("No document data found in QiNode body");
    }
  }, [node]);

  if (!qid) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">
            No QiD Provided
          </h2>
          <p className="text-sm text-slate-500">
            Please provide a valid QiDecimal ID.
          </p>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">
            QiNode Not Found
          </h2>
          <p className="text-sm text-slate-500">
            QiNode <span className="font-mono text-sky-400">{qid}</span> does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
        <GlassCard className="p-6">
          <div className="text-red-400">
            <h3 className="font-semibold mb-2">Error Loading Document</h3>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-slate-500 mt-4">
              Expected format: {"{"}"template": "invoice", "data": {"{"}...{"}"}{"}"}
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">
            Loading Document...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full max-w-6xl mx-auto">
      <header className="border-b border-slate-800/50 pb-4">
        <div className="text-xs text-slate-500 mb-2 font-mono">{node.qid}</div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          {node.title}
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Template: {docData.template}</span>
          <span>•</span>
          <span>{node.realm}</span>
          <span>•</span>
          <span>{node.orbit}</span>
        </div>
      </header>

      <GlassCard className="flex-1 p-6 overflow-auto bg-white">
        <HtmlDocViewer template={docData.template} data={docData.data} />
      </GlassCard>
    </div>
  );
}

