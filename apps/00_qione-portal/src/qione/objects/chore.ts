import { QiObject } from './types';

export const chore: QiObject = {
    key: 'chore',
    plural: 'chores',
    label: 'Chore',
    index: 'title',
    table: 'qihome_chores',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'frequency', label: 'Frequency', type: 'select', required: true },
        { key: 'points', label: 'Points', type: 'number' },
        { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
    forms: [
        { key: 'create-chore', title: 'New Household Chore', fields: ['title', 'frequency', 'points'] },
        { key: 'edit-chore', title: 'Edit Chore Details', fields: ['title', 'frequency', 'points', 'is_active'] },
    ],
    views: [
        { key: 'active-chores', title: 'Active Household Chores', columns: ['title', 'frequency', 'points'] },
    ],
};
