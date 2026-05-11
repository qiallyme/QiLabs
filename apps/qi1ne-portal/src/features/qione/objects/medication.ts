import { QiObject } from './types';

export const medication: QiObject = {
    key: 'medication',
    plural: 'medications',
    label: 'Medication',
    index: 'name',
    table: 'care_medications',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Medication Name', type: 'text', required: true },
        { key: 'dosage', label: 'Dosage', type: 'text', required: true },
        { key: 'time', label: 'Schedule Time', type: 'text' },
        { key: 'stock', label: 'Current Stock', type: 'number' },
        { key: 'threshold', label: 'Stock Threshold', type: 'number' },
        { key: 'category', label: 'Category', type: 'select' },
    ],
    forms: [
        { key: 'add-med', title: 'New Medication', fields: ['name', 'dosage', 'stock', 'threshold', 'category'] },
        { key: 'edit-med', title: 'Update Medication', fields: ['name', 'dosage', 'time', 'stock', 'threshold'] },
    ],
    views: [
        { key: 'active-meds', title: 'Current Medications', columns: ['name', 'dosage', 'stock', 'time'] },
    ],
};
