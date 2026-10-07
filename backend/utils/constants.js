/**
 * CampusFix System Constants
 * Normalized across Frontend and Backend
 */

const ROLES = {
  STUDENT: 'STUDENT',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN'
};

const STATUSES = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

const CATEGORIES = [
  'AV / Electrical',
  'Plumbing & Water',
  'HVAC / Cooling',
  'Network & WiFi',
  'Furniture & Carpentry',
  'General Infrastructure'
];

const DEPARTMENTS = [
  'Electrical Maintenance',
  'Civil & Plumbing',
  'HVAC Operations',
  'Campus IT & Networks',
  'Campus Facilities'
];

const SLA_HOURS = {
  CRITICAL: 1,
  HIGH: 4,
  MEDIUM: 12,
  LOW: 24
};

const RECURRENCE_THRESHOLD = {
  DAYS_WINDOW: 30,
  MIN_FAILURES: 3
};

module.exports = {
  ROLES,
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  DEPARTMENTS,
  SLA_HOURS,
  RECURRENCE_THRESHOLD
};
