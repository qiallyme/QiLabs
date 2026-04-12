/* ─── Safety Engine — Evaluates medication rules against recent events ─── */
import type { CareEvent, SafetyWarning, SafetyRule, Patient } from '../types';
import { MEDICATIONS } from '../data/medications';
import { DEFAULT_SAFETY_RULES } from '../data/rules';

let ruleSet = [...DEFAULT_SAFETY_RULES];

export function setRules(rules: SafetyRule[]) {
  ruleSet = rules;
}

export function evaluateSafety(
  newEvent: CareEvent,
  recentEvents: CareEvent[],
  patient: Patient,
  existingWarnings: SafetyWarning[]
): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  const enabledRules = ruleSet.filter((r) => r.enabled);

  for (const rule of enabledRules) {
    // Check cooldown — don't repeat the same rule warning too often
    const lastWarning = existingWarnings.find(
      (w) => w.rule_id === rule.id && !w.dismissed
    );
    if (lastWarning && rule.cooldown_minutes) {
      const elapsed = (Date.now() - new Date(lastWarning.created_at).getTime()) / 60000;
      if (elapsed < rule.cooldown_minutes) continue;
    }

    const triggered = checkCondition(rule, newEvent, recentEvents, patient);
    if (triggered) {
      warnings.push({
        id: `warn_${Date.now()}_${rule.id}`,
        patient_id: patient.id,
        level: rule.warning_level,
        title: rule.name,
        message: rule.warning_message,
        related_event_ids: [newEvent.id],
        rule_id: rule.id,
        dismissed: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  return warnings;
}

function checkCondition(
  rule: SafetyRule,
  newEvent: CareEvent,
  recentEvents: CareEvent[],
  patient: Patient
): boolean {
  const { condition } = rule;
  const params = condition.params;

  switch (condition.type) {
    case 'duplicate_ingredient': {
      const ingredient = params.ingredient as string;
      const windowMs = (params.window_minutes as number) * 60000;
      const newMedKey = (newEvent.details?.medication_key as string) || '';
      const newMed = MEDICATIONS[newMedKey];
      if (!newMed || !newMed.contains_ingredients.includes(ingredient)) return false;

      return recentEvents.some((evt) => {
        if (evt.type !== 'medication') return false;
        if (evt.id === newEvent.id) return false;
        const elapsed = new Date(newEvent.created_at).getTime() - new Date(evt.created_at).getTime();
        if (elapsed < 0 || elapsed > windowMs) return false;
        const evtMed = MEDICATIONS[(evt.details?.medication_key as string) || ''];
        return evtMed?.contains_ingredients.includes(ingredient) ?? false;
      });
    }

    case 'sedation_stack': {
      const tags = params.tags as string[];
      const windowMs = (params.window_minutes as number) * 60000;
      const minCount = (params.min_count as number) || 2;
      const newMedKey = (newEvent.details?.medication_key as string) || '';
      const newMed = MEDICATIONS[newMedKey];
      if (!newMed || !newMed.caution_tags.some((t) => tags.includes(t))) return false;

      let count = 1; // the new event itself
      for (const evt of recentEvents) {
        if (evt.type !== 'medication' || evt.id === newEvent.id) continue;
        const elapsed = new Date(newEvent.created_at).getTime() - new Date(evt.created_at).getTime();
        if (elapsed < 0 || elapsed > windowMs) continue;
        const evtMed = MEDICATIONS[(evt.details?.medication_key as string) || ''];
        if (evtMed?.caution_tags.some((t) => tags.includes(t))) count++;
      }
      return count >= minCount;
    }

    case 'copd_caution': {
      const conditions = params.patient_conditions as string[];
      const triggerTags = params.trigger_tags as string[];
      if (!patient.conditions.some((c) => conditions.includes(c))) return false;
      const newMedKey = (newEvent.details?.medication_key as string) || '';
      const newMed = MEDICATIONS[newMedKey];
      return newMed?.caution_tags.some((t) => triggerTags.includes(t)) ?? false;
    }

    case 'timing_conflict': {
      const tags = params.tags as string[];
      const minMs = (params.min_interval_minutes as number) * 60000;
      const newMedKey = (newEvent.details?.medication_key as string) || '';
      const newMed = MEDICATIONS[newMedKey];
      if (!newMed || !newMed.caution_tags.some((t) => tags.includes(t))) return false;

      return recentEvents.some((evt) => {
        if (evt.type !== 'medication' || evt.id === newEvent.id) return false;
        const elapsed = new Date(newEvent.created_at).getTime() - new Date(evt.created_at).getTime();
        if (elapsed < 0 || elapsed > minMs) return false;
        const evtMed = MEDICATIONS[(evt.details?.medication_key as string) || ''];
        return evtMed?.caution_tags.some((t) => tags.includes(t)) ?? false;
      });
    }

    case 'combination_risk': {
      const pair = params.pair as string[][];
      const windowMs = (params.window_minutes as number) * 60000;
      const newMedKey = (newEvent.details?.medication_key as string) || '';
      const newMed = MEDICATIONS[newMedKey];
      if (!newMed) return false;

      const newTags = newMed.caution_tags;
      const matchesFirst = newTags.some((t) => pair[0].includes(t));
      const matchesSecond = newTags.some((t) => pair[1].includes(t));

      for (const evt of recentEvents) {
        if (evt.type !== 'medication' || evt.id === newEvent.id) continue;
        const elapsed = new Date(newEvent.created_at).getTime() - new Date(evt.created_at).getTime();
        if (elapsed < 0 || elapsed > windowMs) continue;
        const evtMed = MEDICATIONS[(evt.details?.medication_key as string) || ''];
        if (!evtMed) continue;
        const evtTags = evtMed.caution_tags;
        const evtFirst = evtTags.some((t) => pair[0].includes(t));
        const evtSecond = evtTags.some((t) => pair[1].includes(t));

        if ((matchesFirst && evtSecond) || (matchesSecond && evtFirst)) return true;
      }
      return false;
    }

    default:
      return false;
  }
}
