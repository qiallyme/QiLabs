const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qiarchive-api-production.up.railway.app';

export const API_URLS = {
    SUMMARY: `${API_BASE_URL}/api/dashboard/summary`,
    RECENT_DOCS: `${API_BASE_URL}/api/documents/recent`,
    RECENT_EVENTS: `${API_BASE_URL}/api/events/recent`,
    ISSUES: `${API_BASE_URL}/api/issues`,
    AGENT_STATUS: `${API_BASE_URL}/api/agent/status`,
};

export default API_BASE_URL;
