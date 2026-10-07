/**
 * CampusFix Helper Utilities
 */

/**
 * Format relative time (e.g., "10h ago", "2d ago", "Just now")
 * Identical contract to frontend UTILS.formatTimeAgo
 */
function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Compute SLA Remaining Time String (e.g., "3h 15m remaining" or "-25h 17m")
 */
function computeSlaRemaining(deadlineIso, isResolved = false) {
  if (isResolved) return 'Resolved within SLA';
  if (!deadlineIso) return '4 Hours';
  
  const now = Date.now();
  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - now;
  const isOverdue = diffMs < 0;
  const absMs = Math.abs(diffMs);
  
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

  if (isOverdue) {
    return `-${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m remaining`;
}

/**
 * Generate standard CampusFix ticket identifier
 */
function generateTicketCode(count = 1000) {
  return `CF-${count + 1}`;
}

/**
 * Sanitize strings against script tags
 */
function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '');
}

/**
 * Extract campus room or building block from text
 */
function extractLocationHint(text = '') {
  const match = text.match(/(room\s*\d+[a-zA-Z]?|block\s*[a-zA-Z]|lab\s*\d+|library(?:\s*wing\s*[a-zA-Z])?|auditorium(?:\s*\d+)?|hostel(?:\s*block\s*[a-zA-Z])?)/i);
  return match ? match[0] : null;
}

module.exports = {
  formatTimeAgo,
  computeSlaRemaining,
  generateTicketCode,
  sanitizeText,
  extractLocationHint
};
