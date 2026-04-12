/* ─── Voice Command Parser ─── */
import type { ParsedVoiceAction, VoiceActionType } from '../types/voice';

interface PatternMatch {
  type: VoiceActionType;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => Partial<ParsedVoiceAction>;
}

const MEDICATION_ALIASES: Record<string, string> = {
  tylenol: 'tylenol',
  acetaminophen: 'tylenol',
  ibuprofen: 'ibuprofen',
  advil: 'ibuprofen',
  motrin: 'ibuprofen',
  gabapentin: 'gabapentin',
  neurontin: 'gabapentin',
  lortab: 'lortab',
  hydrocodone: 'lortab',
  'hydrocodone acetaminophen': 'lortab',
  prednisone: 'prednisone',
  albuterol: 'albuterol',
  ipratropium: 'ipratropium',
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function parseNumber(str: string): number {
  const lower = str.toLowerCase().trim();
  return (NUMBER_WORDS[lower] ?? parseInt(lower, 10)) || 1;
}

const PATTERNS: PatternMatch[] = [
  // Log medication
  {
    type: 'log_medication',
    pattern: /log\s+(\w[\w\s]*?)\s*(?:(\w+|\d+)\s*(?:tablet|capsule|pill|mg|dose)s?)?$/i,
    extract: (m) => {
      const rawMed = m[1].trim().toLowerCase();
      const medication = MEDICATION_ALIASES[rawMed] || rawMed;
      const quantity = m[2] ? parseNumber(m[2]) : 1;
      return { medication, quantity };
    },
  },
  // Log treatment start
  {
    type: 'log_treatment_start',
    pattern: /log\s+(?:albuterol\s+)?(?:breathing\s+)?treatment\s+start/i,
    extract: () => ({}),
  },
  // Log treatment end
  {
    type: 'log_treatment_end',
    pattern: /log\s+(?:breathing\s+)?treatment\s+(?:finished|done|completed|end)/i,
    extract: () => ({}),
  },
  // Start timer
  {
    type: 'start_timer',
    pattern: /start\s+(ice|pain|breathing|medication)\s*(?:timer|reassessment)?(?:\s+(?:in\s+)?(\w+|\d+)\s*(?:minute|min)s?)?/i,
    extract: (m) => ({
      timer_type: m[1].toLowerCase(),
      timer_minutes: m[2] ? parseNumber(m[2]) : undefined,
    }),
  },
  // Log pain level
  {
    type: 'log_symptom',
    pattern: /log\s+pain\s+(?:level\s+)?(\w+|\d+)/i,
    extract: (m) => ({
      symptom_type: 'pain',
      symptom_value: parseNumber(m[1]),
    }),
  },
  // Query next
  {
    type: 'query_next',
    pattern: /what(?:'s|\s+is)\s+(?:due\s+)?next|what\s+(?:should|do)\s+(?:I|we)\s+do/i,
    extract: () => ({ query: 'next_due' }),
  },
  // Query history
  {
    type: 'query_history',
    pattern: /what\s+(?:meds?|medications?)\s+(?:has|have|did)\s+(?:she|he|they|mom)\s+(?:taken|had)\s+today/i,
    extract: () => ({ query: 'today_meds' }),
  },
  // Query status
  {
    type: 'query_status',
    pattern: /(?:what\s+(?:should\s+)?(?:I|we)\s+monitor|show\s+(?:what\s+)?(?:not\s+to\s+mix|warnings|cautions)|did\s+(?:she|he|mom)\s+already\s+take\s+(\w+))/i,
    extract: (m) => ({
      query: m[1] ? `check_${m[1].toLowerCase()}` : 'current_status',
    }),
  },
];

export async function processSmartVoiceCommand(text: string): Promise<ParsedVoiceAction | null> {
  // Try local regex first for instant feedback on simple commands
  const localMatch = parseVoiceCommand(text);
  if (localMatch) return localMatch;

  try {
    const response = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error('Failed to reach smart voice parser');
    
    const action = await response.json();
    return action as ParsedVoiceAction;
  } catch (error) {
    console.error('Smart voice error:', error);
    return null;
  }
}

export function parseVoiceCommand(text: string): ParsedVoiceAction | null {
  const cleaned = text.trim().replace(/[.,!?]+$/, '');

  for (const pattern of PATTERNS) {
    const match = cleaned.match(pattern.pattern);
    if (match) {
      return {
        type: pattern.type,
        ...pattern.extract(match),
      } as ParsedVoiceAction;
    }
  }

  return null;
}

export function getCommandDescription(action: ParsedVoiceAction): string {
  switch (action.type) {
    case 'log_medication':
      return `Log ${action.medication}${action.quantity && action.quantity > 1 ? ` × ${action.quantity}` : ''}`;
    case 'log_treatment_start':
      return 'Start breathing treatment';
    case 'log_treatment_end':
      return 'Complete breathing treatment';
    case 'start_timer':
      return `Start ${action.timer_type} timer${action.timer_minutes ? ` (${action.timer_minutes} min)` : ''}`;
    case 'log_symptom':
      return `Log ${action.symptom_type}: ${action.symptom_value}`;
    case 'query_next':
      return 'Checking what is due next…';
    case 'query_history':
      return 'Reviewing today\'s medications…';
    case 'query_status':
      return 'Checking current status…';
    default:
      return 'Command not recognized';
  }
}
