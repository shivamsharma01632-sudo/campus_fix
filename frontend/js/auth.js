/**
 * CampusFix - Authentication & Session Service
 * Provides session management, role-based page guards, and navigation redirects
 */

const AUTH = {
  /**
   * Retrieve currently authenticated user from localStorage.
   * Returns null if no active session exists.
   */
  getCurrentUser() {
    try {
      const storageKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.AUTH_USER)
        ? CONFIG.STORAGE_KEYS.AUTH_USER
        : 'campusfix_auth_user';
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (!user || !user.role) return null;
      return user;
    } catch (e) {
      return null;
    }
  },

  /**
   * Persist user session to localStorage
   */
  setCurrentUser(user) {
    const storageKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.AUTH_USER)
      ? CONFIG.STORAGE_KEYS.AUTH_USER
      : 'campusfix_auth_user';
    localStorage.setItem(storageKey, JSON.stringify(user));
  },

  /**
   * Login user and create session
   */
  login(email, password, role = 'student') {
    let name = 'User';
    const normRole = String(role || 'student').toLowerCase();
    if (normRole === 'student') {
      name = email.split('@')[0] || 'Test12345';
      if (email.toLowerCase().includes('tester')) name = 'Test12345';
    } else if (normRole === 'technician') {
      name = 'Marcus Vance';
    } else if (normRole === 'admin') {
      name = 'Director Facilities';
    }

    const user = {
      email,
      name,
      role: normRole,
      token: 'jwt-session-token-' + Date.now()
    };

    this.setCurrentUser(user);
    return user;
  },

  /**
   * Register new user account
   */
  register(name, email, password, role = 'student') {
    const user = {
      name,
      email,
      role: String(role || 'student').toLowerCase(),
      token: 'jwt-session-token-' + Date.now()
    };
    this.setCurrentUser(user);
    return user;
  },

  /**
   * Retrieve active session JWT token (from existing user session)
   */
  getToken() {
    const user = this.getCurrentUser();
    return (user && user.token) ? user.token : null;
  },

  /**
   * Sign out: remove stored JWT and user/session information, then redirect to login.
   */
  logout() {
    const storageKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.AUTH_USER)
      ? CONFIG.STORAGE_KEYS.AUTH_USER
      : 'campusfix_auth_user';

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(storageKey);
        localStorage.removeItem('campusfix_token');
        localStorage.removeItem('campusfix_jwt');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem('campusfix_token');
      }
    } catch (e) {
      console.warn('[CampusFix AUTH] Storage clearance error:', e);
    }

    const loginUrl = this.getLoginUrl();
    if (typeof window !== 'undefined' && window.location) {
      if (typeof window.location.replace === 'function') {
        window.location.replace(loginUrl);
      } else {
        window.location.href = loginUrl;
      }
    }
  },

  /**
   * Compute relative path prefix to the /pages/ directory
   */
  getRelativeBase() {
    const path = (typeof window !== 'undefined' && window.location && window.location.pathname)
      ? window.location.pathname.replace(/\\/g, '/')
      : '';
    if (path.includes('/pages/student/') || path.includes('/pages/technician/') || path.includes('/pages/admin/')) {
      return '../';
    }
    if (path.includes('/pages/')) {
      return './';
    }
    return 'pages/';
  },

  /**
   * Return target URL for login page
   */
  getLoginUrl() {
    return this.getRelativeBase() + 'login.html';
  },

  /**
   * Return target dashboard URL for a given role
   */
  getDashboardUrl(role) {
    const norm = String(role || '').trim().toUpperCase();
    const base = this.getRelativeBase();
    if (norm === 'STUDENT') {
      return base + 'student/dashboard.html';
    }
    if (norm === 'TECHNICIAN') {
      return base + 'technician/dashboard.html';
    }
    if (norm === 'ADMIN') {
      return base + 'admin/dashboard.html';
    }
    return this.getLoginUrl();
  },

  /**
   * Require a specific role to access the current page.
   * - If not logged in -> redirect to login.html
   * - If logged in with wrong role -> redirect to their own dashboard
   * - If authorized -> returns the user object
   */
  requireRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) {
      const loginUrl = this.getLoginUrl();
      console.warn(`[CampusFix Guard] Unauthenticated access attempt. Redirecting to: ${loginUrl}`);
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.style.display = 'none';
      }
      if (typeof window !== 'undefined' && window.location) {
        if (typeof window.location.replace === 'function') {
          window.location.replace(loginUrl);
        } else {
          window.location.href = loginUrl;
        }
      }
      return null;
    }

    const userRole = String(user.role || '').trim().toUpperCase();
    const targetRoles = (Array.isArray(requiredRole) ? requiredRole : [requiredRole])
      .map(r => String(r || '').trim().toUpperCase());

    if (!targetRoles.includes(userRole)) {
      const ownDashboard = this.getDashboardUrl(userRole);
      console.warn(`[CampusFix Guard] Access denied for role "${userRole}". Required: ${targetRoles.join('/')}. Redirecting to: ${ownDashboard}`);
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.style.display = 'none';
      }
      if (typeof window !== 'undefined' && window.location) {
        if (typeof window.location.replace === 'function') {
          window.location.replace(ownDashboard);
        } else {
          window.location.href = ownDashboard;
        }
      }
      return null;
    }

    return user;
  },

  /**
   * General authentication guard (optionally with role)
   */
  requireAuth(allowedRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      const loginUrl = this.getLoginUrl();
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = loginUrl;
      }
      return null;
    }
    if (allowedRole && allowedRole !== 'any') {
      return this.requireRole(allowedRole);
    }
    return user;
  },

  /**
   * Automatic page guard: Inspects the current window URL path and applies role requirements:
   * - /pages/student/...    -> requires STUDENT
   * - /pages/technician/... -> requires TECHNICIAN
   * - /pages/admin/...      -> requires ADMIN
   */
  initPageGuard() {
    if (typeof window === 'undefined' || !window.location || !window.location.pathname) return null;
    const path = window.location.pathname.replace(/\\/g, '/');

    if (path.includes('/pages/student/')) {
      return this.requireRole('STUDENT');
    }
    if (path.includes('/pages/technician/')) {
      return this.requireRole('TECHNICIAN');
    }
    if (path.includes('/pages/admin/')) {
      return this.requireRole('ADMIN');
    }
    return null;
  }
};

// Auto-run page guard if running in a browser environment
if (typeof window !== 'undefined' && window.location) {
  window.AUTH = AUTH;
  if (!window.__CAMPUSFIX_DISABLE_AUTO_GUARD) {
    AUTH.initPageGuard();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AUTH;
}
