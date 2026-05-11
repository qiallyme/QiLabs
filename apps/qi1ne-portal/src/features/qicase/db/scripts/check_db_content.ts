
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log("Starting diagnostic...");
    let url = "";
    let key = "";

    try {
        const envPath = path.resolve(__dirname, '../../.env');
        console.log(`Reading .env from ${envPath}`);
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split(/\r?\n/).forEach(line => {
                const [k, ...v] = line.split('=');
                if (k && v) {
                    const cleanK = k.trim();
                    const cleanV = v.join('=').trim().replace(/^"|"$/g, '');
                    if (cleanK === 'VITE_SUPABASE_URL') url = cleanV;
                    if (cleanK === 'VITE_SUPABASE_SERVICE_KEY') key = cleanV;
                    if (!url && cleanK === 'SUPABASE_URL') url = cleanV;
                    if (!key && cleanK === 'SUPABASE_SERVICE_ROLE_KEY') key = cleanV;
                    if (!key && cleanK === 'SUPABASE_SECRET_KEY') key = cleanV;
                }
            });
        }
    } catch (e) { console.error("Env read error", e); }

    console.log(`URL: ${url}`);
    console.log(`Key Found: ${!!key}`);

    if (!url || !key) {
        console.error("Missing URL or Key in .env");
        process.exit(1);
    }

    const supabase = createClient(url, key);

    try {
        const { data: phases, error: pError } = await supabase.from('case_phases').select('*');
        if (pError) throw pError;
        
        console.log(`SUCCESS! Found ${phases?.length || 0} phases.`);
        if (phases && phases.length > 0) {
            console.log("First 3 phases:");
            console.log(JSON.stringify(phases.slice(0, 3), null, 2));
        }

        const { data: issues, error: iError } = await supabase.from('issues').select('*', { count: 'exact' });
        if (iError) console.error("Issues error:", iError.message);
        console.log(`Issues Count: ${issues?.length || 0}`);

    } catch (err: any) {
        console.error("Query failed!");
        console.error(err.message || err);
        process.exit(1);
    }
}

run();
