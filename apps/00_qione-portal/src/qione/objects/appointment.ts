import { QiObject } from './types';

export const appointment: QiObject = {
    key: 'appointment',
    plural: 'appointments',
    label: 'Appointment',
    index: 'title',
    table: 'care_appointments',
    fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'provider_name', label: 'Healthcare Provider', type: 'text' },
        { key: 'appointment_at', label: 'Appointment Date/Time', type: 'date', required: true },
        { key: 'location', label: 'Location/Address', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'text' },
    ],
    forms: [
        { key: 'schedule-appt', title: 'Schedule Healthcare Appointment', fields: ['title', 'provider_name', 'appointment_at', 'location'] },
        { key: 'edit-appt', title: 'Update Appointment', fields: ['title', 'provider_name', 'appointment_at', 'location', 'notes'] },
    ],
    views: [
        { key: 'upcoming-appts', title: 'Upcoming Healthcare Visits', columns: ['title', 'provider_name', 'appointment_at'] },
    ],
};
