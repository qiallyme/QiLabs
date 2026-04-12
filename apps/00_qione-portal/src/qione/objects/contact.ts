import { QiObject } from './types';

export const contact: QiObject = {
    key: 'contact',
    plural: 'contacts',
    label: 'Contact',
    index: 'name',
    table: 'contacts',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'phone', label: 'Phone Number', type: 'text' },
        { key: 'status', label: 'Status', type: 'select' },
    ],
    forms: [
        { key: 'create-contact', title: 'New Contact', fields: ['name', 'email', 'phone'] },
        { key: 'edit-contact', title: 'Edit Contact', fields: ['name', 'email', 'phone', 'status'] },
    ],
    views: [
        { key: 'all-contacts', title: 'Active Contacts', columns: ['name', 'email', 'status'] },
    ],
};
