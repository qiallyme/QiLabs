const fs = require('fs');
const path = require('path');

// Target directory and output file
const migrationsDir = 'C:\\QiLabs\\_QiOne_MonoRepo_v2\\packages\\database\\migrations';
const outputFile = path.join(__dirname, 'database_inventory.md');

function parseSQLFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const tables = [];

    // Remove single-line and multi-line comments to avoid false positives
    const cleanContent = content
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

    // Regex to find CREATE TABLE statements and capture the body
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\);/gi;
    let match;

    while ((match = tableRegex.exec(cleanContent)) !== null) {
        const tableName = match[1];
        const body = match[2];

        // Split the body into lines/fields, clean up whitespace
        const fields = body.split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        tables.push({
            name: tableName,
            fields: fields
        });
    }

    return tables;
}

function generateInventory() {
    if (!fs.existsSync(migrationsDir)) {
        console.error(`Directory not found: ${migrationsDir}`);
        return;
    }

    const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));

    if (files.length === 0) {
        console.log('No .sql files found in the specified directory.');
        return;
    }

    let markdownOutput = `# Database Migration Inventory\n\n`;
    markdownOutput += `*Generated on: ${new Date().toLocaleString()}*\n`;
    markdownOutput += `*Source Directory: \`${migrationsDir}\`*\n\n---\n\n`;

    let totalTables = 0;

    files.forEach(file => {
        const filePath = path.join(migrationsDir, file);
        const tables = parseSQLFile(filePath);

        if (tables.length > 0) {
            markdownOutput += `## File: \`${file}\`\n\n`;

            tables.forEach(table => {
                totalTables++;
                markdownOutput += `### Table: **${table.name}**\n\n`;
                markdownOutput += `| Field / Constraint Definition |\n`;
                markdownOutput += `| :--- |\n`;

                table.fields.forEach(field => {
                    markdownOutput += `| \`${field}\` |\n`;
                });
                markdownOutput += `\n`;
            });
        }
    });

    markdownOutput += `---\n**Summary:** Found ${totalTables} tables across ${files.length} migration files.\n`;

    fs.writeFileSync(outputFile, markdownOutput);
    console.log(`Inventory successfully generated at: ${outputFile}`);
}

generateInventory();