// ==========================================
// @qione/database - Main Entry Point
// ==========================================

// 1. Core Platform & Tenancy (Maps to `qione` schema)
export * from './schemas/core';

// 2. Identity Spine & Storage (Maps to `qiarchive` schema)
export * from './schemas/archive';

// 3. System Ops & Master Index (Maps to `qisys` & `qigraph` schemas)
export * from './schemas/system';

// 4. AI Comms & Memory (Maps to `qially` schema)
export * from './schemas/comms';

// 5. Notes & CMS Publishing (Maps to `qiknowledge` & `qicms` schemas)
export * from './schemas/content';

// 6. CRM & Contacts (Maps to `qicrm` schema)
export * from './schemas/client';

// 7. Household Ledger & Chores (Maps to `qihome` schema)
export * from './schemas/home';

// 8. Tax Management (Maps to `qitax` schema)
export * from './schemas/tax';

// 9. Legal Case Management (Maps to `qicase` schema)
export * from './schemas/case';

// 10. Formal Documents (Maps to `qivault` schema)
export * from './schemas/vault';

// 11. Timeline & Events (Maps to `qichronicle` schema)
// Note: Uncomment this if you created a chronicle.ts for your events table!
// export * from './schemas/chronicle';