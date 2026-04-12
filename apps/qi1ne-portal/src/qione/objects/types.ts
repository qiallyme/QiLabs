export interface QiField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required?: boolean;
}

export interface QiForm {
    key: string;
    title: string;
    fields: string[]; // Field keys
}

export interface QiView {
    key: string;
    title: string;
    columns: string[]; // Field keys
}

export interface QiObject {
    key: string;
    plural: string;
    label: string;
    icon?: string;
    index: string; // Key of the field to use as primary label/index
    table: string; // Supabase table name
    fields: QiField[];
    forms: QiForm[];
    views: QiView[];
}
