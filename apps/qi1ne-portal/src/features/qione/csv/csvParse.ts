import { QiObject } from '../objects/types';

export function generateCsvHeaders(obj: QiObject) {
    return obj.fields.map(f => f.label || f.key).join(',');
}

export function parseRows(csv: string) {
    // Simple CSV parser for demo
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim();
        });
        return obj;
    });
    return data;
}
