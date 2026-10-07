/**
 * CampusFix - Utility Functions
 */

const UTILS = {
  // Compute relative path to root from current page
  getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/student/') || path.includes('/pages/technician/') || path.includes('/pages/admin/')) {
      return '../../';
    }
    if (path.includes('/pages/')) {
      return '../';
    }
    return './';
  },

  // Toast Notification
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    const basePath = this.getBasePath();
    const iconName = type === 'success' ? 'check' : (type === 'error' ? 'alert' : 'sparkles');
    
    toast.innerHTML = `
      <img src="${basePath}assets/icons/${iconName}.svg" class="icon icon-sm" alt="${type}">
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  },

  // Modal Handlers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Format date relative
  formatTimeAgo(dateString) {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  },

  // Render Status Badge
  getStatusBadgeHtml(status) {
    let cls = 'badge-open';
    if (status === 'Resolved') cls = 'badge-resolved';
    else if (status === 'In Progress') cls = 'badge-progress';
    else if (status === 'Assigned') cls = 'badge-assigned';
    return `<span class="badge ${cls}">${status}</span>`;
  },

  // Render Priority Badge
  getPriorityBadgeHtml(priority) {
    let cls = 'badge-low';
    if (priority === 'High' || priority === 'Critical') cls = 'badge-high';
    else if (priority === 'Medium') cls = 'badge-medium';
    return `<span class="badge ${cls}">${priority}</span>`;
  },

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
};

window.UTILS = UTILS;
