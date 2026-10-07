/**
 * CampusFix - Navigation & Role-Based Sidebar Controller
 * Enforces role-specific navigation for STUDENT, TECHNICIAN, and ADMIN roles.
 */

(function () {
  'use strict';

  /**
   * Determine relative path prefix for pages and assets based on current URL location.
   */
  function getPathContext() {
    const pathname = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
    if (
      pathname.includes('/pages/admin/') ||
      pathname.includes('/pages/student/') ||
      pathname.includes('/pages/technician/')
    ) {
      return {
        pagesPrefix: '../',
        iconsPrefix: '../../assets/icons/'
      };
    } else if (pathname.includes('/pages/')) {
      return {
        pagesPrefix: '',
        iconsPrefix: '../assets/icons/'
      };
    } else {
      return {
        pagesPrefix: 'pages/',
        iconsPrefix: 'assets/icons/'
      };
    }
  }

  /**
   * Sync logged-in user name and role badge in navbar.
   */
  function syncNavUser() {
    const user = window.AUTH && typeof window.AUTH.getCurrentUser === 'function'
      ? window.AUTH.getCurrentUser()
      : null;
    const nameElem = document.getElementById('nav-user-name');
    const roleElem = document.getElementById('nav-user-role');

    if (user) {
      if (nameElem) nameElem.textContent = user.name || 'User';
      if (roleElem) {
        const rawRole = String(user.role || '');
        const displayRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
        roleElem.textContent = displayRole;
      }
    }
  }

  /**
   * Render role-appropriate navigation into an un-templated .admin-sidebar element.
   */
  function populateSidebarForRole(sidebar, role) {
    const ctx = getPathContext();
    if (role === 'STUDENT') {
      sidebar.innerHTML = `
        <div class="sidebar-role-group" data-role="STUDENT">
          <div class="admin-sidebar-section-title">Student Portal</div>
          <a href="${ctx.pagesPrefix}student/dashboard.html" class="admin-nav-item">
            <img src="${ctx.iconsPrefix}report-issue.svg" class="icon" alt="">
            <span>Report Issue</span>
          </a>
          <a href="${ctx.pagesPrefix}student/my-tickets.html" class="admin-nav-item">
            <img src="${ctx.iconsPrefix}tickets.svg" class="icon" alt="">
            <span>My Tickets</span>
          </a>
          <a href="${ctx.pagesPrefix}student/profile.html" class="admin-nav-item">
            <img src="${ctx.iconsPrefix}profile.svg" class="icon" alt="">
            <span>Profile</span>
          </a>
        </div>
      `;
    } else if (role === 'TECHNICIAN') {
      sidebar.innerHTML = `
        <div class="sidebar-role-group" data-role="TECHNICIAN">
          <div class="admin-sidebar-section-title">Technician Portal</div>
          <a href="${ctx.pagesPrefix}technician/dashboard.html" class="admin-nav-item">
            <img src="${ctx.iconsPrefix}dashboard.svg" class="icon" alt="">
            <span>Dashboard</span>
          </a>
          <a href="${ctx.pagesPrefix}technician/assigned-tickets.html" class="admin-nav-item">
            <img src="${ctx.iconsPrefix}tickets.svg" class="icon" alt="">
            <span>My Tasks</span>
          </a>
          <a href="${ctx.pagesPrefix}technician/profile.html" class="admin-nav-item">
            <img src="${ctx.iconsPrefix}profile.svg" class="icon" alt="">
            <span>Profile</span>
          </a>
        </div>
      `;
    }
    // If ADMIN, keep default admin items
  }

  /**
   * Apply role visibility rules across all navigation, sidebar, and subnav elements.
   * STUDENT sees only student navigation.
   * TECHNICIAN sees only technician navigation.
   * ADMIN sees only admin navigation.
   */
  function applyRoleNavigation(overrideRole) {
    const user = window.AUTH && typeof window.AUTH.getCurrentUser === 'function'
      ? window.AUTH.getCurrentUser()
      : null;
    const role = (overrideRole || (user && user.role ? String(user.role).toUpperCase() : '')).trim();

    // 1. Sync user badge
    syncNavUser();

    // 2. Filter elements with explicit data-role / data-roles
    const roleElements = document.querySelectorAll('[data-role], [data-roles]');
    roleElements.forEach(el => {
      const rawRoles = el.getAttribute('data-roles') || el.getAttribute('data-role') || '';
      const allowed = rawRoles.toUpperCase().split(',').map(r => r.trim()).filter(Boolean);
      if (!role || !allowed.includes(role)) {
        el.style.display = 'none';
      } else {
        el.style.removeProperty('display');
      }
    });

    // 3. Filter any links that target areas of another role
    if (role) {
      const navContainers = document.querySelectorAll('.navbar, .navbar-center, .admin-sidebar, #campusfix-sidebar, .subnav');
      navContainers.forEach(container => {
        const links = container.querySelectorAll('a[href]');
        links.forEach(link => {
          // If the link or its parent has an explicit data-role, it was already handled
          if (link.hasAttribute('data-role') || link.closest('[data-role], [data-roles]')) {
            return;
          }

          const href = (link.getAttribute('href') || '').toLowerCase();
          const isStudentTarget = href.includes('/student/') || href.includes('pages/student/');
          const isTechTarget = href.includes('/technician/') || href.includes('pages/technician/');
          const isAdminTarget = href.includes('/admin/') || href.includes('pages/admin/');

          if (isStudentTarget && role !== 'STUDENT') {
            link.style.display = 'none';
          } else if (isTechTarget && role !== 'TECHNICIAN') {
            link.style.display = 'none';
          } else if (isAdminTarget && role !== 'ADMIN') {
            link.style.display = 'none';
          }
        });
      });
    }

    // 4. Adapt un-templated .admin-sidebar elements if needed
    const sidebars = document.querySelectorAll('.admin-sidebar, #campusfix-sidebar');
    sidebars.forEach(sidebar => {
      const hasRoleGroups = sidebar.querySelector('[data-role], .sidebar-role-group');
      if (!hasRoleGroups && role && role !== 'ADMIN') {
        populateSidebarForRole(sidebar, role);
      }
    });

    // 5. Highlight active items
    highlightActiveNav();
  }

  /**
   * Highlight active sidebar or pill item based on URL.
   */
  function highlightActiveNav() {
    const currentPath = (window.location.pathname || '').toLowerCase();
    const currentPage = currentPath.split('/').pop().split('?')[0] || 'index.html';
    const navLinks = document.querySelectorAll('.nav-pill-btn, .admin-nav-item');

    navLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const hrefPage = href.split('/').pop().split('?')[0];
      if (hrefPage && hrefPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Setup UI listeners (signout, banner dismiss, mobile toggle).
   */
  function setupListeners() {
    // Sign out buttons
    const signoutBtns = document.querySelectorAll('.nav-signout-btn');
    signoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.AUTH && typeof window.AUTH.logout === 'function') {
          window.AUTH.logout();
        }
      });
    });

    // Alert banner close buttons
    const alertCloseBtns = document.querySelectorAll('.alert-banner .close-btn');
    alertCloseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const banner = e.target.closest('.alert-banner');
        if (banner) {
          banner.style.transition = 'opacity 0.25s ease, height 0.25s ease, margin 0.25s ease';
          banner.style.opacity = '0';
          banner.style.transform = 'translateY(-8px)';
          setTimeout(() => banner.remove(), 250);
        }
      });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.nav-menu-toggle');
    const navCenter = document.querySelector('.navbar-center');
    if (menuToggle && navCenter) {
      menuToggle.addEventListener('click', () => {
        navCenter.classList.toggle('open');
      });
    }
  }

  // Initialize on DOM ready
  function init() {
    setupListeners();
    applyRoleNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global controller
  window.NAVIGATION = {
    applyRoleNavigation,
    syncNavUser,
    highlightActiveNav,
    getPathContext
  };
})();
