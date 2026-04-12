import { QiObject } from './types';

export const caseObject: QiObject = {
    key: 'case',
    plural: 'cases',
    label: 'Case',
    index: 'title',
    table: 'cases',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Case Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'select' },
    ],
    forms: [
        { key: 'create-case', title: 'New Case', fields: ['title', 'description', 'priority'] },
        { key: 'edit-case', title: 'Update Case', fields: ['title', 'description', 'priority'] },
    ],
    views: [
        { key: 'my-cases', title: 'Recent Cases', columns: ['title', 'priority'] },
    ],
};
