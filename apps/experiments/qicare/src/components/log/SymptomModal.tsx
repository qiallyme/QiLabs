/* ─── SymptomModal — Detailed symptom logging ─── */
import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { PillButton } from '../shared/PillButton';
import type { SymptomCheck } from '../../types';

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (check: SymptomCheck) => void;
}

export const SymptomModal: React.FC<SymptomModalProps> = ({ isOpen, onClose, onSave }) => {
  const [painLevel, setPainLevel] = useState<number>(5);
  const [breathing, setBreathing] = useState<SymptomCheck['breathing_status']>('comfortable');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      pain_level: painLevel,
      breathing_status: breathing,
      notes,
    });
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Symptom Check">
      <div className="space-y-6">
        {/* Pain Level */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-3">
            Pain Level ({painLevel}/10)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={painLevel}
            onChange={(e) => setPainLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-glass rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between mt-2 text-[10px] text-dim">
            <span>None</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Breathing */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-3">
            Breathing Status
          </label>
          <div className="flex flex-wrap gap-2">
            {(['comfortable', 'labored', 'struggling', 'distressed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setBreathing(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  breathing === status
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-glass border-glass-border text-dim hover:border-dim/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-3">
            Quick Note
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Coughing more frequently..."
            className="w-full bg-glass border border-glass-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent min-h-[80px]"
          />
        </div>

        <div className="pt-4">
          <PillButton label="Save Entry" onClick={handleSave} fullWidth />
        </div>
      </div>
    </Modal>
  );
};
