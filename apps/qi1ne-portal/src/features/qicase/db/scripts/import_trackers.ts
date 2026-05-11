
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRACKERS_DIR = path.resolve(__dirname, '../../context/00_CASE_MANAGEMENT/20_Trackers');

// --- CONFIG ---
// Manual .env parsing
try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split(/\r?\n/).forEach(line => {
            const [key, ...val] = line.split('=');
            if (key && val) {
                 process.env[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env file", e);
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- UTILS ---
function parseCSV(filePath: string): any[] {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        if (row.length === 0) continue; 
        
        const obj: any = {};
        headers.forEach((h, index) => {
            let val = row[index] ? row[index].trim().replace(/^"|"$/g, '') : null;
            if (val === '') val = null;
            obj[h] = val;
        });
        data.push(obj);
    }
    return data;
}

// --- IMPORTERS ---
async function importPhases() {
    console.log("Importing Phases...");
    const rows = parseCSV(path.join(TRACKERS_DIR, 'FCFCU_CASE_Phases.csv'));
    
    for (const r of rows) {
        if (!r.Phase_ID) continue;
        const payload = {
            phase_id: r.Phase_ID,
            phase_name: r.Phase_Name || 'Untitled Phase',
            status: (r.Status || 'PENDING').toUpperCase(),
            purpose: r.Primary_Objective || r.Core_Theory || 'No purpose defined',
            notes: r.Notes,
            order: parseInt(r.Phase_ID.replace('C-', '')) || 0
        };
        const { error } = await supabase.from('case_phases').upsert(payload);
        if (error) console.error(`Failed to import Phase ${r.Phase_ID}:`, error.message);
    }
}

async function importIssues() {
    console.log("Importing Issues...");
    const rows = parseCSV(path.join(TRACKERS_DIR, 'FCFCU_CASE_Issues.csv'));

    for (const r of rows) {
        if (!r.Issue_ID) continue;
        if (!r.Issue_ID.startsWith('V-')) continue; 

        const payload = {
            issue_id: r.Issue_ID,
            phase_id: 'C-01', 
            issue_title: r.Issue_Title || 'Untitled Issue',
            issue_statement: r.Issue_Statement || 'No statement',
            elements_to_prove: r.Elements_To_Prove ? [r.Elements_To_Prove] : [],
            strength: parseInt(r.Strength_1_5) || 1,
            status: r.Status || 'Open'
        };

        const { error } = await supabase.from('issues').upsert(payload);
        if (error) console.error(`Failed to import Issue ${r.Issue_ID}:`, error.message);
    }
}

async function importEvents() {
    console.log("Importing Events...");
    const rows = parseCSV(path.join(TRACKERS_DIR, 'FCFCU_CASE_Events.csv'));

    for (const r of rows) {
        if (!r.Event_ID) continue;
        
        let date = new Date();
        if (r.Event_Date_Time) {
            const parsed = new Date(r.Event_Date_Time);
            if (!isNaN(parsed.getTime())) date = parsed;
        }

        const payload = {
            event_id: r.Event_ID,
            phase_id: 'C-01', 
            date: date.toISOString(),
            event_type: r.Event_Type || 'General',
            description: r.Event_Narrative || r.Event_Title || 'No description'
        };

        const { error } = await supabase.from('events').upsert(payload);
        if (error) console.error(`Failed to import Event ${r.Event_ID}:`, error.message);
    }
}

async function importDocs() {
    console.log("Importing Documents...");
    const rows = parseCSV(path.join(TRACKERS_DIR, 'FCFCU_CASE_Docs.csv'));

    for (const r of rows) {
        if (!r.Doc_ID) continue;

        const payload = {
            doc_id: r.Doc_ID,
            doc_code: r.Doc_ID, 
            phase_id: 'C-01', 
            doc_type: r.Doc_Type || 'General',
            original_filename: r.Doc_Title,
            drive_path: r.Storage_Path || 'pending_upload',
            proof_type: 'Direct' 
        };
        
        const { error } = await supabase.from('documents').upsert(payload);
        if (error) {
            console.error(`Failed to import Doc ${r.Doc_ID}:`, error.message);
            continue;
        }

        if (r.Doc_Issues) {
            const issueIds = r.Doc_Issues.split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            for (const iid of issueIds) {
                 const { error: jError } = await supabase.from('document_issues').upsert(
                    { doc_code: r.Doc_ID, issue_id: iid }, 
                    { onConflict: 'doc_code,issue_id' }
                );
                if (jError) console.error(`  Failed to link Doc ${r.Doc_ID} to Issue ${iid}:`, jError.message);
            }
        }
    }
}

async function run() {
    await importPhases();
    await importIssues(); 
    await importEvents(); 
    await importDocs();
    console.log("Import Complete.");
}

run().catch(e => console.error(e));
