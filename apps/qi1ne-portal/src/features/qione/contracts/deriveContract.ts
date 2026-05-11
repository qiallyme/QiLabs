import { QiObject } from '../objects/types';

export function deriveContract(obj: QiObject) {
    const views = obj.views.map(view => {
        const columns = view.columns.join(', ');
        return `CREATE OR REPLACE VIEW qione.vw_${obj.table}_${view.key} AS SELECT ${columns} FROM qione.${obj.table};`;
    });

    const rpcs = obj.forms.map(form => {
        // Generate simplified RPC for form submission
        return `CREATE OR REPLACE FUNCTION qione.rpc_${obj.table}_submit_${form.key.replace('-', '_')}(p_data JSONB) RETURNS JSONB AS $$ BEGIN ... END; $$ LANGUAGE plpgsql;`;
    });

    return {
        views,
        rpcs,
        migrationSuggestion: [
            `-- Migration for ${obj.label}`,
            ...views,
            ...rpcs
        ].join('\n\n')
    };
}
