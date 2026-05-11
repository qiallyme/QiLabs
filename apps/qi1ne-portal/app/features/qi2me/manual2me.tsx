import React, { useState, useEffect, useRef } from 'react';
// ------------------------------------------------------------------------
// NOTE: For the live preview environment, we mock the Supabase import
// to avoid bundle resolution errors for external packages.
//
// TO USE LOCALLY IN YOUR PROJECT:
// 1. Run: npm install @supabase/supabase-js
// 2. Uncomment the line below:
// import { createClient } from '@supabase/supabase-js';
// 3. Delete the mock 'createClient' function below.
// ------------------------------------------------------------------------
const createClient = (url: string, key: string) => {
  return {
    from: (table: string) => ({
      select: (query: string) => {
        const chain = {
          contains: async () => ({ data: null, error: new Error('Mock client') }),
          then: (resolve: any) => resolve({ data: null, error: new Error('Mock client') })
        };
        return chain;
      }
    })
  } as any;
};

import {
  Network,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  Circle,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Activity,
  Brain,
  Heart,
  User,
  Zap,
  Globe,
  Gauge,
  BatteryMedium,
  Flame,
  Radio,
  Fingerprint,
  Settings,
  Moon,
  Clock,
  Target,
  Users,
  BedDouble,
  Loader2
} from 'lucide-react';

// ==========================================
// 0. SUPABASE CONFIGURATION
// ==========================================
// Replace these with your actual Supabase project credentials.
// While these are placeholder strings, the app will safely fallback to Mock Data.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type NodeType = 'root' | 'domain' | 'dimension' | 'subject';
export type AppMode = 'core' | 'current';

export const UI_TYPE_LABELS: Record<NodeType, string> = {
  root: 'Core Hub',
  domain: 'System',
  dimension: 'Area',
  subject: 'Focus Node'
};

export interface NodeContent {
  thesis?: string;
  dayToDay?: string;
  needsAndSupports?: string;
  risksAndFriction?: string;
  strengths?: string;
  triggers?: string;
  history?: string;
  notes?: string;
  resources?: { label: string; url: string }[];
}

export interface GraphNode {
  id: string;
  parentId: string | null;
  type: NodeType;
  title: string;
  description: string;
  content?: NodeContent;
  isSuggested?: boolean;
  icon?: React.ElementType;
  colorTheme?: 'red' | 'orange' | 'amber' | 'emerald' | 'indigo' | 'purple' | 'slate';
  status?: 'optimal' | 'warning' | 'critical' | 'neutral';
}

// Icon dictionary for resolving string names from Supabase to React Components
const ICON_MAP: Record<string, React.ElementType> = {
  Network, BookOpen, ArrowLeft, CheckCircle, Circle, ChevronRight, Sparkles, ExternalLink,
  Activity, Brain, Heart, User, Zap, Globe, Gauge, BatteryMedium, Flame, Radio, Fingerprint,
  Settings, Moon, Clock, Target, Users, BedDouble
};

// ==========================================
// 2A. MOCK DATA: CORE MANUAL (Fallback)
// ==========================================
const CORE_MOCK_DATA: Record<string, GraphNode> = {
  'root': {
    id: 'root',
    parentId: null,
    type: 'root',
    title: 'Core Operating System',
    description: 'The foundational traits and mechanics of your personal architecture.',
    icon: Fingerprint,
    colorTheme: 'slate',
  },
  'physical': {
    id: 'physical',
    parentId: 'root',
    type: 'domain',
    title: 'Physical System',
    description: 'The vessel, energy systems, and biological realities.',
    icon: Activity,
    colorTheme: 'red',
  },
  'mental': {
    id: 'mental',
    parentId: 'root',
    type: 'domain',
    title: 'Mental System',
    description: 'Cognitive processing, focus, and intellectual models.',
    icon: Brain,
    colorTheme: 'orange',
  },
  'emotional': {
    id: 'emotional',
    parentId: 'root',
    type: 'domain',
    title: 'Emotional System',
    description: 'Regulation, baseline states, and internal responses.',
    icon: Heart,
    colorTheme: 'amber',
  },
  'relational': {
    id: 'relational',
    parentId: 'root',
    type: 'domain',
    title: 'Relational System',
    description: 'Connection, boundaries, and social energy dynamics.',
    icon: Users,
    colorTheme: 'emerald',
  },
  'functional': {
    id: 'functional',
    parentId: 'root',
    type: 'domain',
    title: 'Functional System',
    description: 'Execution, systems, routines, and daily operations.',
    icon: Settings,
    isSuggested: true,
    colorTheme: 'indigo',
  },
  'phys-sleep': {
    id: 'phys-sleep',
    parentId: 'physical',
    type: 'dimension',
    title: 'Sleep & Rest',
    description: 'Recovery mechanics and circadian rhythms.',
    icon: Moon,
    isSuggested: true,
  },
  'sleep-chronotype': {
    id: 'sleep-chronotype',
    parentId: 'phys-sleep',
    type: 'subject',
    title: 'Chronotype & Timing',
    description: 'Natural waking hours and peak energy windows.',
    icon: Clock,
    content: {
      thesis: "I am naturally a delayed-phase sleeper (Night Owl). Fighting this biological reality causes cascading friction in all other domains.",
      dayToDay: "Core waking hours: 9:30 AM - 1:00 AM. Peak creative energy occurs between 9:00 PM and midnight.",
      needsAndSupports: "Total blackout curtains. A strict 30-minute wind-down routine without screens.",
      risksAndFriction: "Early morning meetings (before 10 AM) severely degrade performance for the rest of the day.",
      triggers: "Sudden bright lights before 10 AM. Loud unexpected noises upon waking.",
      history: "Transitioned to this schedule fully in 2021 after tracking energy dips on traditional 9-5."
    }
  },
  'func-deepwork': {
    id: 'func-deepwork',
    parentId: 'functional',
    type: 'subject',
    title: 'Deep Work States',
    description: 'Entering and maintaining high-focus execution.',
    icon: Target,
    content: {
      thesis: "Deep work requires clear intention, isolation from dopamine-driven interruptions, and a physiological state of calm alertness.",
    }
  }
};

// ==========================================
// 2B. MOCK DATA: CURRENT STATE (Fallback)
// ==========================================
function RadarIcon(props: any) { return <Radio {...props} />; }

const CURRENT_MOCK_DATA: Record<string, GraphNode> = {
  'root': {
    id: 'root',
    parentId: null,
    type: 'root',
    title: 'Live Telemetry',
    description: 'Real-time diagnostic overlay of your current state.',
    icon: RadarIcon,
    status: 'neutral',
  },
  'phys-state': {
    id: 'phys-state',
    parentId: 'root',
    type: 'domain',
    title: 'Physical Battery',
    description: 'Current energy levels, fatigue, and physical strain.',
    icon: BatteryMedium,
    status: 'warning',
  },
  'ment-state': {
    id: 'ment-state',
    parentId: 'root',
    type: 'domain',
    title: 'Cognitive Load',
    description: 'Active bandwidth, focus fatigue, and stress levels.',
    icon: Gauge,
    status: 'optimal',
  },
  'burnout-risk': {
    id: 'burnout-risk',
    parentId: 'root',
    type: 'domain',
    title: 'Friction & Burnout',
    description: 'Immediate risks to operational capacity.',
    icon: Flame,
    status: 'critical',
    isSuggested: true,
  },
  'sleep-deficit': {
    id: 'sleep-deficit',
    parentId: 'phys-state',
    type: 'subject',
    title: 'Sleep Debt Accumulation',
    description: 'Fatigue levels requiring immediate intervention.',
    icon: BedDouble,
    status: 'warning',
    content: {
      thesis: "Currently running a ~6 hour sleep debt. Cognitive performance is likely reduced by 15-20%.",
      dayToDay: "Experiencing mid-afternoon crashes. Relying heavily on caffeine after 2 PM.",
      needsAndSupports: "Need to block out Saturday morning for zero-alarm recovery sleep. Cut caffeine at noon today.",
    }
  },
  'focus-bandwidth': {
    id: 'focus-bandwidth',
    parentId: 'ment-state',
    type: 'subject',
    title: 'Available Bandwidth',
    description: 'Available uninterrupted focus for today.',
    icon: Zap,
    status: 'optimal',
    content: {
      thesis: "High clarity today. Low contextual switching expected.",
      needsAndSupports: "Capitalize on this state by tackling the hardest architectural problem first.",
    }
  }
};

// ==========================================
// 3. HOOKS & STATE MANAGEMENT (Data & Progress)
// ==========================================

// --- Supabase Data Fetcher ---
function useGraphData(appMode: AppMode | null) {
  const [dataMap, setDataMap] = useState<Record<string, GraphNode>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!appMode) return;
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);

      // 1. Fallback Trigger: If keys aren't configured yet, load the hardcoded mocks
      if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        if (isMounted) {
          setDataMap(appMode === 'current' ? CURRENT_MOCK_DATA : CORE_MOCK_DATA);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Fetch graph architecture from manual_nodes
        const { data: nodes, error: nodesError } = await supabase
          .from('manual_nodes')
          .select('*')
          // Filter by active mode stored in metadata jsonb column
          .contains('metadata', { app_mode: appMode });

        // Fetch detailed content from manual_blocks
        const { data: blocks, error: blocksError } = await supabase
          .from('manual_blocks')
          .select('*');

        if (nodesError) throw nodesError;
        if (blocksError) throw blocksError;

        const newMap: Record<string, GraphNode> = {};

        // A. Map Supabase manual_nodes -> Frontend GraphNode
        nodes?.forEach((n: any) => {
          const iconName = n.metadata?.icon || 'Network';

          newMap[n.id] = {
            id: n.id,
            parentId: n.parent_id,
            type: n.parent_id === null ? 'root' : (n.node_kind as NodeType),
            title: n.title,
            description: n.summary || '',
            icon: ICON_MAP[iconName] || Network,
            colorTheme: n.metadata?.colorTheme,
            status: n.metadata?.status,
            isSuggested: n.metadata?.isSuggested,
            content: {} // Populated below
          };
        });

        // B. Map Supabase manual_blocks -> NodeContent fields
        blocks?.forEach((b: any) => {
          if (newMap[b.node_id]) {
            const kind = b.block_kind;
            const cObj = newMap[b.node_id].content || {};

            // Map the manual_block_kind enum to our frontend interface
            if (kind === 'thesis') cObj.thesis = b.content;
            if (kind === 'day_to_day') cObj.dayToDay = b.content;
            if (kind === 'needs_supports') cObj.needsAndSupports = b.content;
            if (kind === 'risks_friction') cObj.risksAndFriction = b.content;
            if (kind === 'strengths') cObj.strengths = b.content;
            if (kind === 'triggers') cObj.triggers = b.content;
            if (kind === 'history') cObj.history = b.content;
            if (kind === 'notes') cObj.notes = b.content;

            newMap[b.node_id].content = cObj;
          }
        });

        if (isMounted) setDataMap(newMap);

      } catch (error) {
        console.error("Supabase DB Error - Falling back to Mocks:", error);
        // Fallback robustly so the UI doesn't crash on connection failure
        if (isMounted) setDataMap(appMode === 'current' ? CURRENT_MOCK_DATA : CORE_MOCK_DATA);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [appMode]);

  return { dataMap, isLoading };
}

// --- Progress Tracking ---
function useProgress(mode: AppMode) {
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const storageKey = `manual-progress-${mode}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedNodes(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to load progress");
      }
    } else {
      setCompletedNodes(new Set()); // Reset when mode switches
    }
  }, [mode, storageKey]);

  const markComplete = (id: string) => {
    setCompletedNodes(prev => {
      const next = new Set(prev).add(id);
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isCompleted = (id: string) => completedNodes.has(id);

  const getCompletionPercentage = (dataMap: Record<string, GraphNode>) => {
    const totalSubjects = Object.values(dataMap).filter(n => n.type === 'subject').length;
    if (totalSubjects === 0) return 0;
    const completedSubjects = Array.from(completedNodes).filter(id => dataMap[id]?.type === 'subject').length;
    return Math.round((completedSubjects / totalSubjects) * 100);
  };

  return { completedNodes, markComplete, isCompleted, getCompletionPercentage };
}

// ==========================================
// 4. UI COMPONENTS (Isolated)
// ==========================================

// --- Layout & Navigation ---
const TopNav = ({
  currentView,
  appMode,
  setView
}: {
  currentView: string;
  appMode: AppMode | null;
  setView: (v: 'home' | 'mode-select' | 'explorer') => void;
}) => {
  const isDark = appMode === 'current';

  return (
    <header className={`flex-none h-14 md:h-16 border-b z-50 flex items-center justify-between px-4 md:px-6 shadow-sm transition-colors duration-500
      ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('mode-select')}
          className={`flex items-center gap-2 transition-colors group ${isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-800 hover:text-blue-600'}`}
        >
          <BookOpen size={18} className={`transition-colors ${isDark ? 'text-emerald-500 group-hover:text-emerald-400' : 'text-blue-500 group-hover:text-blue-600'}`} />
          <span className="font-semibold text-sm md:text-base tracking-wide">Manual to Me</span>
        </button>

        {appMode && currentView !== 'home' && currentView !== 'mode-select' && (
          <div className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border
            ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {appMode === 'core' ? 'Core Manual' : 'Current State'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        {currentView === 'home' && (
          <button
            onClick={() => setView('mode-select')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg"
          >
            Start
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

const BottomProgress = ({ completionPct, appMode }: { completionPct: number, appMode: AppMode | null }) => {
  if (!appMode) return null;
  const isDark = appMode === 'current';

  return (
    <div className={`flex-none h-12 border-t z-50 flex items-center px-4 md:px-8 transition-colors duration-500
      ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Exploration Progress
      </span>
      <div className={`flex-1 mx-4 md:mx-6 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor]
            ${isDark ? 'bg-emerald-500 text-emerald-500/80' : 'bg-blue-500 text-blue-500/80'}`}
          style={{ width: `${completionPct}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold w-8 text-right ${isDark ? 'text-emerald-400' : 'text-blue-600'}`}>
        {completionPct}%
      </span>
    </div>
  );
};

// --- Views ---
const HomeView = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-full pb-12 px-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 animate-in fade-in duration-700">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

    <div className="max-w-2xl w-full z-10 flex flex-col items-center text-center space-y-8">
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-blue-500/10">
        <BookOpen size={48} className="text-blue-500" />
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          The User Manual for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">You</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-xl mx-auto">
          Map your inner world to navigate the outer one. An interactive ontology of your architecture and live state.
        </p>
      </div>

      <div className="pt-8">
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-blue-500 rounded-full hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40"
        >
          <span className="mr-2">Initialize Explorer</span>
          <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
        </button>
      </div>
    </div>
  </div>
);

const ModeSelectView = ({ onSelect }: { onSelect: (mode: AppMode) => void }) => (
  <div className="min-h-full py-12 px-6 flex flex-col items-center justify-center relative bg-slate-50 animate-in fade-in zoom-in-95 duration-500">
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 tracking-tight">Select Overlay</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">

      {/* Core Manual Card */}
      <button
        onClick={() => onSelect('core')}
        className="group relative text-left bg-white p-8 md:p-10 rounded-3xl border-2 border-slate-200 hover:border-blue-500 transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Network size={120} className="text-blue-600" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
            <BookOpen size={28} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Core Manual</h3>
            <p className="mt-2 text-slate-600 leading-relaxed max-w-sm">
              Your stable identity architecture. Foundational traits, chronotype, values, and static operating mechanics.
            </p>
          </div>
          <div className="pt-4 flex items-center text-sm font-bold text-blue-600 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
            Enter Core <ArrowLeft className="ml-2 rotate-180" size={16} />
          </div>
        </div>
      </button>

      {/* Current State Card */}
      <button
        onClick={() => onSelect('current')}
        className="group relative text-left bg-slate-950 p-8 md:p-10 rounded-3xl border-2 border-slate-800 hover:border-emerald-500 transition-all duration-300 shadow-lg shadow-slate-900/50 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <RadarIcon size={120} className="text-emerald-500" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform group-hover:border-emerald-500/50">
            <Activity size={28} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Current State</h3>
            <p className="mt-2 text-slate-400 leading-relaxed max-w-sm">
              Live diagnostic overlay. Transient states, current energy levels, sleep debt, and active friction areas.
            </p>
          </div>
          <div className="pt-4 flex items-center text-sm font-bold text-emerald-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
            Run Diagnostics <ArrowLeft className="ml-2 rotate-180" size={16} />
          </div>
        </div>
      </button>

    </div>
  </div>
);

const DetailBlock = ({ title, content, isDark }: { title: string, content: string, isDark: boolean }) => (
  <div className={`space-y-3 pb-8 border-b last:border-0 last:pb-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
    <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</h3>
    <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{content}</p>
  </div>
);

const DetailView = ({
  node,
  onBack,
  isCompleted,
  markComplete,
  appMode
}: {
  node: GraphNode;
  onBack: () => void;
  isCompleted: boolean;
  markComplete: () => void;
  appMode: AppMode;
}) => {
  const content = node.content;
  const isDark = appMode === 'current';

  return (
    <div className={`min-h-full py-12 px-6 md:px-12 flex justify-center animate-in fade-in zoom-in-95 duration-500
      ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-3xl w-full space-y-12">

        {/* Header */}
        <div className="space-y-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-medium transition-colors
              ${isDark ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-500 hover:text-blue-600'}`}
          >
            <ArrowLeft size={16} /> Back to Map
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border
                ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                {UI_TYPE_LABELS[node.type]}
              </span>
              {node.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border flex items-center gap-1.5
                  ${node.status === 'optimal' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    node.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    node.status === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  <Activity size={12} /> {node.status}
                </span>
              )}
              {isCompleted && (
                <span className={`flex items-center gap-1.5 text-xs font-medium
                  ${isDark ? 'text-emerald-500' : 'text-blue-600'}`}>
                  <CheckCircle size={14} /> Reviewed
                </span>
              )}
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {node.title}
            </h1>
            <p className={`text-xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {node.description}
            </p>
          </div>
        </div>

        {/* Content Body */}
        {content ? (
          <div className={`border rounded-2xl p-8 md:p-10 space-y-8 shadow-xl
            ${isDark ? 'bg-slate-900/50 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
            {content.thesis && <DetailBlock isDark={isDark} title="Core Thesis" content={content.thesis} />}
            {content.dayToDay && <DetailBlock isDark={isDark} title="Day to Day Reality" content={content.dayToDay} />}
            {content.needsAndSupports && <DetailBlock isDark={isDark} title="Needs & Supports" content={content.needsAndSupports} />}
            {content.risksAndFriction && <DetailBlock isDark={isDark} title="Risks & Friction" content={content.risksAndFriction} />}
            {content.strengths && <DetailBlock isDark={isDark} title="Strengths & Leverage" content={content.strengths} />}
            {content.triggers && <DetailBlock isDark={isDark} title="Triggers" content={content.triggers} />}
            {content.history && <DetailBlock isDark={isDark} title="History / Context" content={content.history} />}
            {content.notes && <DetailBlock isDark={isDark} title="Raw Notes" content={content.notes} />}

            {content.resources && content.resources.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Resources & Media</h3>
                <ul className="space-y-3">
                  {content.resources.map((res, i) => (
                    <li key={i}>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2 transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-blue-600 hover:text-blue-500'}`}
                      >
                        <ExternalLink size={16} />
                        {res.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className={`py-12 text-center border-2 border-dashed rounded-2xl
            ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/50'}`}>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Content pending mapping...</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pb-12">
          <button
            onClick={markComplete}
            disabled={isCompleted}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all shadow-md ${
              isCompleted
                ? isDark
                    ? 'bg-slate-900 text-emerald-500 border border-slate-800 shadow-none cursor-default'
                    : 'bg-slate-100 text-blue-600 border border-slate-200 shadow-none cursor-default'
                : isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-slate-950 hover:shadow-emerald-500/20'
                    : 'bg-white text-slate-800 border border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-blue-500/20'
            }`}
          >
            {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
            {isCompleted ? 'Marked as Reviewed' : 'Mark as Reviewed'}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Explorer Graph View ---
const CORE_THEMES = {
  red: { border: 'border-red-400', text: 'text-red-500', shadow: 'shadow-red-500/20', stroke: 'rgba(239, 68, 68, 0.4)' },
  orange: { border: 'border-orange-400', text: 'text-orange-500', shadow: 'shadow-orange-500/20', stroke: 'rgba(249, 115, 22, 0.4)' },
  amber: { border: 'border-amber-400', text: 'text-amber-500', shadow: 'shadow-amber-500/20', stroke: 'rgba(245, 158, 11, 0.4)' },
  emerald: { border: 'border-emerald-400', text: 'text-emerald-500', shadow: 'shadow-emerald-500/20', stroke: 'rgba(16, 185, 129, 0.4)' },
  indigo: { border: 'border-indigo-400', text: 'text-indigo-500', shadow: 'shadow-indigo-500/20', stroke: 'rgba(99, 102, 241, 0.4)' },
  purple: { border: 'border-purple-400', text: 'text-purple-500', shadow: 'shadow-purple-500/20', stroke: 'rgba(168, 85, 247, 0.4)' },
  slate: { border: 'border-slate-300', text: 'text-slate-500', shadow: 'shadow-slate-500/10', stroke: 'rgba(148, 163, 184, 0.4)' },
};

const STATUS_THEMES = {
  optimal: { border: 'border-emerald-500', text: 'text-emerald-400', shadow: 'shadow-emerald-500/30', stroke: 'rgba(16, 185, 129, 0.6)' },
  warning: { border: 'border-amber-500', text: 'text-amber-400', shadow: 'shadow-amber-500/30', stroke: 'rgba(245, 158, 11, 0.6)' },
  critical: { border: 'border-red-500', text: 'text-red-400', shadow: 'shadow-red-500/30', stroke: 'rgba(239, 68, 68, 0.6)' },
  neutral: { border: 'border-slate-700', text: 'text-slate-400', shadow: 'shadow-slate-700/30', stroke: 'rgba(71, 85, 105, 0.6)' },
};

const getTheme = (node: GraphNode | undefined, mode: AppMode) => {
  if (mode === 'current') {
    return STATUS_THEMES[node?.status || 'neutral'];
  }
  return CORE_THEMES[(node?.colorTheme as keyof typeof CORE_THEMES) || 'slate'];
};

const getInheritedIcon = (nodeId: string, dataMap: Record<string, GraphNode>) => {
  let current: GraphNode | undefined = dataMap[nodeId];
  while (current) {
    if (current.icon) return current.icon;
    if (!current.parentId) break;
    current = dataMap[current.parentId];
  }
  return Network;
};

const ExplorerGraph = ({
  activeNodeId,
  appMode,
  dataMap,
  onNodeSelect,
  onNodeOpen,
  isCompleted
}: {
  activeNodeId: string;
  appMode: AppMode;
  dataMap: Record<string, GraphNode>;
  onNodeSelect: (id: string) => void;
  onNodeOpen: (node: GraphNode) => void;
  isCompleted: (id: string) => boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 1000, h: 800 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const isDark = appMode === 'current';

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Derive graph hierarchy safely
  const activeNode = dataMap[activeNodeId];

  // Early exit if dataMap is not fully populated yet
  if (!activeNode) return null;

  const parentNode = activeNode.parentId ? dataMap[activeNode.parentId] : null;
  const childNodes = Object.values(dataMap).filter(n => n.parentId === activeNodeId);

  // Layout Math Constants
  const cx = dimensions.w / 2;
  const cy = dimensions.h / 2;

  const maxRadiusX = (dimensions.w / 2) - 120;
  const maxRadiusY = (dimensions.h / 2) - 100;
  const radiusX = Math.max(120, Math.min(maxRadiusX, 400));
  const radiusY = Math.max(100, Math.min(maxRadiusY, 280));

  const getChildPos = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + radiusX * Math.cos(angle),
      y: cy + radiusY * Math.sin(angle)
    };
  };

  const handleNodeClick = (child: GraphNode) => {
    // Check if the clicked node has any children in the current dataset
    const hasChildren = Object.values(dataMap).some(n => n.parentId === child.id);

    // If it's explicitly a subject OR has no children to drill into, open it directly.
    if (child.type === 'subject' || !hasChildren) {
      onNodeOpen(child);
    } else {
      onNodeSelect(child.id);
    }
  };

  // Find root theme inheritance logic if needed, simplify for now by using active node theme
  const activeTheme = getTheme(activeNode, appMode);
  const ActiveIcon = getInheritedIcon(activeNodeId, dataMap);

  const displayNode = (hoveredNodeId && dataMap[hoveredNodeId]) ? dataMap[hoveredNodeId] : activeNode;
  const isHoveringChild = hoveredNodeId !== null;

  return (
    <div className={`absolute inset-0 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-700
      ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>

      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Background Gradients */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
          ${isDark ? 'from-slate-900 via-slate-950 to-slate-950' : 'from-white via-slate-50 to-slate-100'}`} />

        {/* Grid Overlay for Current State */}
        {isDark && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        )}

        {/* Dynamic SVG Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {childNodes.map((child, i) => {
            const pos = getChildPos(i, childNodes.length);
            const isDimmed = hoveredNodeId !== null && hoveredNodeId !== child.id;

            // Highlight stroke if hovered, otherwise use child theme stroke
            const childTheme = getTheme(child, appMode);
            const strokeColor = hoveredNodeId === child.id
              ? (isDark ? 'rgba(16, 185, 129, 0.8)' : 'rgba(59, 130, 246, 0.6)')
              : childTheme.stroke;

            return (
              <line
                key={`edge-child-${child.id}`}
                x1={cx}
                y1={cy}
                x2={pos.x}
                y2={pos.y}
                stroke={strokeColor}
                strokeWidth={isDark && child.status === 'critical' ? '3' : '2'}
                strokeDasharray={isDark && child.status === 'warning' ? '5,5' : 'none'}
                className={`transition-all duration-700 ease-in-out ${isDimmed ? 'opacity-10' : 'opacity-100'}`}
              />
            );
          })}
        </svg>

        {/* DOM Nodes Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">

          {/* Parent Breadcrumb */}
          {parentNode && (
            <div className={`absolute top-4 left-4 md:top-6 md:left-6 pointer-events-auto transition-all duration-500 ${hoveredNodeId ? 'opacity-30' : 'opacity-100'}`}>
              <button
                onClick={() => onNodeSelect(parentNode.id)}
                className={`group flex flex-col items-start gap-1.5 p-2 md:p-3 rounded-xl transition-colors
                  ${isDark ? 'hover:bg-slate-900' : 'hover:bg-white/60'}`}
              >
                <div className={`flex items-center gap-1.5 transition-colors
                  ${isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-500 group-hover:text-blue-600'}`}>
                  <ArrowLeft size={14} />
                  <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold">Zoom Out</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border shadow-sm flex items-center justify-center transition-colors
                    ${isDark ? 'bg-slate-900 border-slate-800 group-hover:border-emerald-500/50' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                    {parentNode.icon ?
                      <parentNode.icon size={16} className={isDark ? 'text-slate-400 group-hover:text-emerald-400' : 'text-slate-600 group-hover:text-blue-600'} /> :
                      <Network size={16} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                    }
                  </div>
                  <span className={`text-sm md:text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{parentNode.title}</span>
                </div>
              </button>
            </div>
          )}

          {/* Center Node (Active Topic Card) */}
          <div
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isHoveringChild ? 'scale-95' : 'scale-100'}`}
            style={{ left: cx, top: cy }}
          >
            <div className="flex flex-col items-center group pointer-events-auto relative">
              {/* Center Pill */}
              <div className={`relative flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full border-[3px] backdrop-blur-md z-20 transition-all duration-500
                ${isDark ? 'bg-slate-900/90' : 'bg-white/95'}
                ${activeTheme.border} ${isDark ? '' : 'shadow-[0_0_35px_rgba(255,255,255,0.8)]'}`}
                style={{ boxShadow: isDark ? `0 0 40px ${activeTheme.stroke}` : `0 0 35px ${activeTheme.stroke}` }}
              >
                <ActiveIcon size={24} className={activeTheme.text} />
                <h2 className={`text-lg md:text-xl font-bold tracking-tight transition-colors duration-300
                  ${isHoveringChild ? (isDark ? 'text-emerald-400' : 'text-blue-600') : (isDark ? 'text-white' : activeTheme.text)}`}>
                  {displayNode.title}
                </h2>
              </div>

              {/* Dynamic Description */}
              <div className="absolute top-full mt-4 w-64 md:w-80 text-center z-30 pointer-events-none">
                 <p className={`text-xs md:text-sm leading-relaxed line-clamp-3 transition-colors duration-300
                   ${isHoveringChild ? (isDark ? 'text-emerald-500' : 'text-blue-500') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                   {displayNode.description}
                 </p>
              </div>
            </div>
          </div>

          {/* Child Nodes */}
          {childNodes.map((child, i) => {
            const pos = getChildPos(i, childNodes.length);
            const completed = isCompleted(child.id);
            const childHasChildren = Object.values(dataMap).some(n => n.parentId === child.id);
            const isLeaf = child.type === 'subject' || !childHasChildren;

            const isDimmed = hoveredNodeId !== null && hoveredNodeId !== child.id;
            const theme = getTheme(child, appMode);
            const ChildIcon = getInheritedIcon(child.id, dataMap);

            return (
              <div
                key={`node-${child.id}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto z-30 ${isDimmed ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}
                style={{ left: pos.x, top: pos.y }}
                onMouseEnter={() => setHoveredNodeId(child.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <button
                  onClick={() => handleNodeClick(child)}
                  className="group flex flex-col items-center"
                >
                  {/* Node Pill */}
                  <div className={`relative flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border-2 backdrop-blur-sm transition-all duration-300
                    group-hover:scale-105 group-hover:z-30
                    ${isDark ? 'bg-slate-900/90 hover:bg-slate-800' : 'bg-white/95'}
                    ${isDark ? 'group-hover:border-emerald-400 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'group-hover:border-blue-400 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]'}
                    ${completed
                        ? (isDark ? 'border-slate-700 shadow-none' : 'border-slate-300 shadow-sm')
                        : `${theme.border} ${theme.shadow}`
                    }`}
                  >
                    <ChildIcon size={16} className={`transition-colors
                      ${completed ? 'text-slate-500' : theme.text}
                      ${isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-blue-500'}`}
                    />

                    <span className={`font-semibold text-xs md:text-sm whitespace-nowrap transition-colors
                      ${completed ? (isDark ? 'text-slate-500' : 'text-slate-500') : (isDark ? 'text-slate-200' : theme.text)}
                      ${isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-blue-600'}`}>
                      {child.title}
                    </span>

                    {isLeaf ? (
                      <BookOpen size={14} className={`ml-1 opacity-50 transition-colors ${completed ? 'text-slate-500' : theme.text} ${isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-blue-500'}`} />
                    ) : (
                      <ChevronRight size={14} className={`ml-1 opacity-50 transition-colors ${completed ? 'text-slate-500' : theme.text} ${isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-blue-500'}`} />
                    )}

                    {/* Status Indicator Overlays */}
                    {completed && (
                      <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border
                        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <CheckCircle size={12} className={isDark ? 'text-emerald-500' : 'text-slate-400'} />
                      </div>
                    )}
                    {child.isSuggested && !completed && (
                      <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border
                        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <Sparkles size={12} className={`${theme.text} animate-pulse`} />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP CONTROLLER
// ==========================================

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'mode-select' | 'explorer' | 'detail'>('home');
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string>('root');
  const [selectedTopic, setSelectedTopic] = useState<GraphNode | null>(null);

  // Safely default to 'core' if mode is null
  const activeMode = appMode || 'core';

  // Custom hooks
  const { isCompleted, markComplete, getCompletionPercentage } = useProgress(activeMode);

  // Connects to Supabase, queries `manual_nodes` & `manual_blocks`, maps to GraphNode format.
  // Defaults to the MOCK_DATA above if Supabase credentials are empty or fail.
  const { dataMap, isLoading } = useGraphData(appMode);

  const handleModeSelect = (mode: AppMode) => {
    setAppMode(mode);
    setActiveNodeId('root');
    setCurrentView('explorer');
  };

  const handleNodeSelect = (id: string) => {
    setActiveNodeId(id);
  };

  const handleNodeOpen = (node: GraphNode) => {
    setSelectedTopic(node);
    setCurrentView('detail');
  };

  const handleBackToGraph = () => {
    setSelectedTopic(null);
    setCurrentView('explorer');
  };

  const handleTopNavClick = (view: 'home' | 'mode-select' | 'explorer') => {
    if (view === 'mode-select') {
      setAppMode(null);
      setSelectedTopic(null);
    }
    setCurrentView(view);
  };

  // Safe render condition for ExplorerGraph to prevent accessing dataMap before it populates
  const isGraphReady = appMode && !isLoading && dataMap && dataMap[activeNodeId];

  return (
    <div className={`h-screen flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden transition-colors duration-500
      ${appMode === 'current' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      <TopNav
        currentView={currentView}
        appMode={appMode}
        setView={handleTopNavClick}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated Page Wrapper */}
        <div key={currentView} className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden">

          {/* Loading Overlay */}
          {isLoading && currentView === 'explorer' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-inherit animate-in fade-in duration-500">
               <Loader2 size={48} className={`animate-spin mb-4 ${appMode === 'current' ? 'text-emerald-500' : 'text-blue-500'}`} />
               <p className={`font-medium ${appMode === 'current' ? 'text-emerald-600' : 'text-slate-500'}`}>Syncing telemetry...</p>
            </div>
          )}

          {currentView === 'home' && (
            <HomeView onStart={() => setCurrentView('mode-select')} />
          )}

          {currentView === 'mode-select' && (
            <ModeSelectView onSelect={handleModeSelect} />
          )}

          {currentView === 'explorer' && isGraphReady && (
            <ExplorerGraph
              activeNodeId={activeNodeId}
              appMode={appMode}
              dataMap={dataMap}
              onNodeSelect={handleNodeSelect}
              onNodeOpen={handleNodeOpen}
              isCompleted={isCompleted}
            />
          )}

          {currentView === 'detail' && selectedTopic && appMode && (
            <DetailView
              node={selectedTopic}
              appMode={appMode}
              onBack={handleBackToGraph}
              isCompleted={isCompleted(selectedTopic.id)}
              markComplete={() => markComplete(selectedTopic.id)}
            />
          )}
        </div>
      </main>

      {/* Persistent global progress at bottom (hides on intro screens) */}
      {(currentView === 'explorer' || currentView === 'detail') && (
        <BottomProgress completionPct={getCompletionPercentage(dataMap)} appMode={appMode} />
      )}

    </div>
  );
}