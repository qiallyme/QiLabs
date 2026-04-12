/* ─── SettingsPage — App configuration ─── */
import React from 'react';
import { useCareStore } from '../store/careStore';
import { useNotifications } from '../hooks/useNotifications';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const { settings, updateSettings } = useCareStore();
  const { permission, requestPermission } = useNotifications();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <button
          onClick={onClose}
          className="pill-btn pill-btn-ghost"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          Done
        </button>
      </div>

      {/* Appearance */}
      <div className="card">
        <div className="card-title">Appearance</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dark Mode</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Easier on the eyes at night</div>
          </div>
          <button
            onClick={() => updateSettings({ dark_mode: !settings.dark_mode })}
            className={`pill-btn ${settings.dark_mode ? 'pill-btn-primary' : 'pill-btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            {settings.dark_mode ? 'On' : 'Off'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Large Text</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Bigger fonts and buttons</div>
          </div>
          <button
            onClick={() => updateSettings({ large_text: !settings.large_text })}
            className={`pill-btn ${settings.large_text ? 'pill-btn-primary' : 'pill-btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            {settings.large_text ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Voice */}
      <div className="card">
        <div className="card-title">Voice</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Voice Commands</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Use microphone for quick logging</div>
          </div>
          <button
            onClick={() => updateSettings({ voice_enabled: !settings.voice_enabled })}
            className={`pill-btn ${settings.voice_enabled ? 'pill-btn-primary' : 'pill-btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            {settings.voice_enabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Access Review */}
      <div className="card" style={{ border: settings.admin_mode ? '1px solid var(--color-accent)' : 'none' }}>
        <div className="card-title">Access Control</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Admin Mode</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Enable management and deletion tools</div>
          </div>
          <button
            onClick={() => updateSettings({ admin_mode: !settings.admin_mode })}
            className={`pill-btn ${settings.admin_mode ? 'pill-btn-primary' : 'pill-btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            {settings.admin_mode ? 'Active' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-title">Notifications</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Timer Notifications</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
              {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked by browser' : 'Not yet requested'}
            </div>
          </div>
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="pill-btn pill-btn-teal"
              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
            >
              Enable
            </button>
          )}
          {permission === 'granted' && (
            <span style={{ fontSize: '1.2rem' }}>✅</span>
          )}
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="card-title">Data</div>
        <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(71,85,105,0.2)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Offline Storage</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
            All data is stored locally on this device. Events sync when online.
          </div>
        </div>
        <div style={{ padding: '10px 0' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reset Demo Data</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: 8 }}>
            Clear all events and reload the demo patient data
          </div>
          <button
            onClick={() => {
              if (confirm('This will clear all care events. Are you sure?')) {
                localStorage.removeItem('momcare-store');
                localStorage.removeItem('momcare-timers');
                window.location.reload();
              }
            }}
            className="pill-btn pill-btn-red"
            style={{ fontSize: '0.75rem' }}
          >
            Reset Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="card-title">About</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          <strong>Mom Care v1.0.0</strong>
          <br />
          Built for real-world caregiving. This app helps track medications, timers, and safety decisions
          for family care situations.
          <br /><br />
          <div style={{
            padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem', color: 'var(--color-text-dim)', lineHeight: 1.5,
          }}>
            ⚕️ <strong>Medical Disclaimer:</strong> Mom Care supports caregiving decisions but does not replace
            professional medical advice. Always consult a healthcare provider for medical concerns.
            Drug interaction warnings are informational only and may not cover all situations.
          </div>
        </div>
      </div>

      {/* iPhone PWA Limitations */}
      <div className="card" style={{ opacity: 0.7 }}>
        <div className="card-title">iPhone/Safari Notes</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
          • Push notifications are limited in iOS PWAs — timers use local alerts when possible
          <br />
          • For best experience, add to Home Screen via Safari's Share menu
          <br />
          • Background timers may pause when the app is minimized
          <br />
          • Voice commands use the device microphone — allow access when prompted
        </div>
      </div>
    </div>
  );
};
