/**
 * CampusFix - Global Configuration
 */
const CONFIG = {
  APP_NAME: 'CampusFix',
  API_BASE_URL: 'http://localhost:5000/api', // Prepared for Node.js + Express backend
  STORAGE_KEYS: {
    AUTH_USER: 'campusfix_auth_user',
    TICKETS: 'campusfix_tickets',
    TECHNICIANS: 'campusfix_technicians',
    DEPARTMENTS: 'campusfix_departments',
    ASSETS: 'campusfix_assets',
    NOTIFICATIONS: 'campusfix_notifications'
  },
  ROLES: {
    STUDENT: 'student',
    TECHNICIAN: 'technician',
    ADMIN: 'admin'
  },
  STATUSES: {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved'
  },
  PRIORITIES: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical'
  },
  DEPARTMENTS: [
    'Electrical Maintenance',
    'Civil & Plumbing',
    'HVAC Operations',
    'Campus IT & Networks'
  ]
};

// Export to window
window.CONFIG = CONFIG;
