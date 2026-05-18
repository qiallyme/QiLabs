import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

console.log('=== QiOS Supabase ERD Map Generator ===');

// 1. Resolve .env file path
const envPath = join(process.cwd(), '..', '.env');
let dbUrl = '';

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^SUPABASE_DB_URL=(.+)$/m);
  if (match && match[1]) {
    dbUrl = match[1].trim();
  }
} catch (error) {
  // Silent fallback
}

// Helper to split SQL table definition lines by comma, keeping commas inside parenthesis intact
function splitSqlLines(sql) {
  const parts = [];
  let current = '';
  let parenLevel = 0;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === '(') parenLevel++;
    else if (char === ')') parenLevel--;
    
    if (char === ',' && parenLevel === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

// Offline DDL parser
function generateMermaidFromLocalMigrations() {
  const migrationsDir = join(process.cwd(), '..', 'supabase', 'migrations');
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  
  const tables = {}; // tableName -> { columns: [ { name, type } ], relations: [ { toTable, label } ] }
  
  for (const file of files) {
    const content = readFileSync(join(migrationsDir, file), 'utf-8');
    
    // Remove sql comments
    const cleaned = content.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Match CREATE TABLE statements (IF NOT EXISTS is optional)
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[\w_]+\.)?([\w_]+)\s*\(([\s\S]*?)\);/gi;
    let match;
    while ((match = createTableRegex.exec(cleaned)) !== null) {
      const tableName = match[1].toLowerCase();
      const body = match[2];
      
      if (!tables[tableName]) {
        tables[tableName] = { columns: [], relations: [] };
      }
      
      const lines = splitSqlLines(body);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // Skip constraints like CHECK, UNIQUE, PRIMARY KEY, FOREIGN KEY table-level constraints
        if (trimmed.toUpperCase().startsWith('CONSTRAINT') || 
            trimmed.toUpperCase().startsWith('PRIMARY KEY') || 
            trimmed.toUpperCase().startsWith('CHECK') || 
            trimmed.toUpperCase().startsWith('UNIQUE') || 
            trimmed.toUpperCase().startsWith('FOREIGN KEY')) {
            
          // Match FOREIGN KEY table constraints
          const fkMatch = /FOREIGN\s+KEY\s*\(([\w_]+)\)\s*REFERENCES\s*(?:[\w_]+\.)?([\w_]+)\s*\(([\w_]+)\)/i.exec(trimmed);
          if (fkMatch) {
            const col = fkMatch[1].toLowerCase();
            const refTable = fkMatch[2].toLowerCase();
            tables[tableName].relations.push({ toTable: refTable, label: col });
          }
          continue;
        }
        
        // Column definition: col_name type [extras...]
        const colMatch = /^([\w_]+)\s+([\w_]+(?:\([\d,\s]+\))?(?:\[\])?)/i.exec(trimmed);
        if (colMatch) {
          const colName = colMatch[1].toLowerCase();
          let colType = colMatch[2].toLowerCase();
          
          // Map postgres data types to basic types for clean Mermaid rendering
          if (colType === 'character' || colType === 'text' || colType.startsWith('varchar')) colType = 'varchar';
          if (colType === 'integer') colType = 'int';
          if (colType.startsWith('timestamp')) colType = 'timestamp';
          
          tables[tableName].columns.push({ name: colName, type: colType });
          
          // Check for inline REFERENCES
          const refMatch = /REFERENCES\s*(?:[\w_]+\.)?([\w_]+)\s*\(([\w_]+)\)/i.exec(trimmed);
          if (refMatch) {
            const refTable = refMatch[1].toLowerCase();
            tables[tableName].relations.push({ toTable: refTable, label: colName });
          }
        }
      }
    }
    
    // Also parse ALTER TABLE ADD CONSTRAINT foreign keys
    const alterTableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:[\w_]+\.)?([\w_]+)\s+ADD\s+CONSTRAINT\s+[\w_]+\s+FOREIGN\s+KEY\s*\(([\w_]+)\)\s*REFERENCES\s*(?:[\w_]+\.)?([\w_]+)\s*\(([\w_]+)\)/gi;
    let alterMatch;
    while ((alterMatch = alterTableRegex.exec(cleaned)) !== null) {
      const tableName = alterMatch[1].toLowerCase();
      const colName = alterMatch[2].toLowerCase();
      const refTable = alterMatch[3].toLowerCase();
      
      if (tables[tableName]) {
        tables[tableName].relations.push({ toTable: refTable, label: colName });
      }
    }
  }
  
  // Build Mermaid code
  let code = 'erDiagram\n';
  
  // Render tables
  for (const [name, data] of Object.entries(tables)) {
    code += `    ${name} {\n`;
    for (const col of data.columns) {
      code += `        ${col.type} ${col.name}\n`;
    }
    code += '    }\n';
  }
  
  // Render relations
  const renderedRelations = new Set();
  for (const [name, data] of Object.entries(tables)) {
    for (const rel of data.relations) {
      // Ensure target table exists in diagram
      if (!tables[rel.toTable]) continue;
      
      const relationKey = `${name}-${rel.toTable}-${rel.label}`;
      if (!renderedRelations.has(relationKey)) {
        code += `    ${name} }o--|| ${rel.toTable} : "${rel.label}"\n`;
        renderedRelations.add(relationKey);
      }
    }
  }
  
  return code;
}

async function run() {
  let mermaidCode = '';
  let source = '';

  if (dbUrl) {
    try {
      console.log('🔌 Connecting to Supabase database for live schema extraction...');
      const client = new pg.Client({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
      await client.connect();
      console.log('✅ Connected successfully!');

      const sqlQuery = `
        WITH table_columns AS (
            SELECT 
                c.table_name,
                c.ordinal_position,
                format('    %s %s', 
                    CASE 
                        WHEN c.data_type = 'character varying' THEN 'varchar'
                        WHEN c.data_type = 'timestamp with time zone' THEN 'timestamptz'
                        WHEN c.data_type = 'timestamp without time zone' THEN 'timestamp'
                        WHEN c.data_type = 'user-defined' THEN c.udt_name
                        ELSE c.data_type
                    END,
                    c.column_name
                ) AS col_def
            FROM 
                information_schema.columns c
            JOIN 
                information_schema.tables t ON t.table_name = c.table_name AND t.table_schema = c.table_schema
            WHERE 
                t.table_schema = 'public' 
                AND t.table_type = 'BASE TABLE'
        ),
        table_definitions AS (
            SELECT 
                table_name,
                1 AS part,
                0 AS sub_part,
                format('%s {', table_name) AS line
            FROM 
                information_schema.tables
            WHERE 
                table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            
            UNION ALL
            
            SELECT 
                table_name,
                2 AS part,
                ordinal_position AS sub_part,
                col_def AS line
            FROM 
                table_columns
                
            UNION ALL
            
            SELECT 
                table_name,
                3 AS part,
                0 AS sub_part,
                '}' AS line
            FROM 
                information_schema.tables
            WHERE 
                table_schema = 'public' 
                AND table_type = 'BASE TABLE'
        ),
        relationships AS (
            SELECT DISTINCT
                tc.table_name AS source_table,
                ccu.table_name AS target_table,
                format('%I }o--|| %I : "%s"', 
                    tc.table_name, 
                    ccu.table_name,
                    kcu.column_name
                ) AS line
            FROM 
                information_schema.table_constraints tc
            JOIN 
                information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            JOIN 
                information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
            WHERE 
                tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = 'public'
        ),
        ordered_lines AS (
            SELECT 0 AS main_group, '' AS sub_group, 0 AS p, 0 AS sp, 'erDiagram' AS line
            
            UNION ALL
            
            SELECT 1 AS main_group, table_name AS sub_group, part AS p, sub_part AS sp, line
            FROM table_definitions
            
            UNION ALL
            
            SELECT 2 AS main_group, source_table AS sub_group, 0 AS p, 0 AS sp, line
            FROM relationships
        )
        SELECT line
        FROM ordered_lines
        ORDER BY main_group, sub_group, p, sp;
      `;

      const res = await client.query(sqlQuery);
      mermaidCode = res.rows.map(row => row.line).join('\n');
      source = 'Live Supabase Instance';
      await client.end();
    } catch (err) {
      console.log(`⚠️ Live database connection failed: ${err.message}`);
      console.log('🔄 Automatically falling back to local DDL migration parser (Offline Mode)...');
    }
  } else {
    console.log('ℹ️ No SUPABASE_DB_URL found in .env. Using offline migration parser...');
  }

  if (!mermaidCode) {
    try {
      mermaidCode = generateMermaidFromLocalMigrations();
      source = 'Local SQL Migrations';
    } catch (error) {
      console.error('❌ Failed to parse local migrations:', error.message);
      process.exit(1);
    }
  }

  // Create the markdown file wrapper
  const mdContent = `# Supabase Database Schema (ERD Map)

This diagram is automatically generated from the active Supabase database schema.

> **Source:** Generated via **${source}** on ${new Date().toLocaleDateString()}

\`\`\`mermaid
${mermaidCode}
\`\`\`
`;

  const outputPath = join(process.cwd(), 'docs', 'database_erd.md');
  writeFileSync(outputPath, mdContent, 'utf-8');
  console.log(`\n🎉 Success! ERD map successfully generated and saved to:`);
  console.log(`👉 ${outputPath}`);
}

run();
