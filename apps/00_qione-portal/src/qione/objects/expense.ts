import { QiObject } from './types';

export const expense: QiObject = {
    key: 'expense',
    plural: 'expenses',
    label: 'Expense',
    index: 'memo',
    table: 'qihome_expenses',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'amount_cents', label: 'Amount (Cents)', type: 'number', required: true },
        { key: 'memo', label: 'Description', type: 'text' },
        { key: 'paid_by', label: 'Paid By User', type: 'text' },
    ],
    forms: [
        { key: 'add-expense', title: 'New Ledger Entry', fields: ['date', 'amount_cents', 'memo'] },
        { key: 'edit-expense', title: 'Update Entry', fields: ['date', 'amount_cents', 'memo', 'paid_by'] },
    ],
    views: [
        { key: 'recent-ledger', title: 'Home Expense Ledger', columns: ['date', 'amount_cents', 'memo'] },
    ],
};
