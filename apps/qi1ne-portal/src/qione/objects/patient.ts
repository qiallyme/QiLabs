import { QiObject } from './types';

export const patient: QiObject = {
    key: 'patient',
    plural: 'patients',
    label: 'Care Patient',
    index: 'first_name',
    table: 'care_patients',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'first_name', label: 'First Name', type: 'text', required: true },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
        { key: 'blood_type', label: 'Blood Type', type: 'select' },
        { key: 'baseline_o2', label: 'Baseline O2 (%)', type: 'number' },
        { key: 'dnr_status', label: 'DNR Status', type: 'boolean' },
        { key: 'emergency_instructions', label: 'Emergency Instructions', type: 'text' },
    ],
    forms: [
        { key: 'update-patient', title: 'Update Patient Profile', fields: ['first_name', 'last_name', 'dob', 'blood_type', 'baseline_o2', 'dnr_status'] },
        { key: 'emergency-edit', title: 'Edit Emergency Instructions', fields: ['emergency_instructions'] },
    ],
    views: [
        { key: 'active-patients', title: 'Patients Registry', columns: ['first_name', 'last_name', 'blood_type', 'dnr_status'] },
    ],
};
