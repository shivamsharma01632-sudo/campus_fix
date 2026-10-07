/**
 * CampusFix - Technician Assigned Tickets Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tech-assigned-list');
  const searchInput = document.getElementById('tech-search-input');
  const statusPills = document.querySelectorAll('#tech-status-pills .seg-btn');
  let currentFilter = 'ALL';
  let searchQuery = '';
  let tickets = [];

  async function loadData() {
    tickets = await API.getTickets();
    render();
  }

  function render() {
    if (!container) return;

    let filtered = tickets.filter(t => {
      let matchFilter = true;
      if (currentFilter === 'ALL') {
        matchFilter = t.status !== 'Resolved';
      } else {
        matchFilter = t.status.toLowerCase() === currentFilter.toLowerCase();
      }

      const matchQuery = !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 50px 20px; text-align: center; color: var(--color-text-muted);">
          <img src="../../assets/icons/inbox.svg" class="icon icon-xl" style="margin: 0 auto 12px auto; opacity: 0.4;" alt="">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--color-text-heading); margin-bottom: 6px;">No tasks found</h3>
          <p style="font-size: 13.5px;">No maintenance tickets match the selected status.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const prioBadge = UTILS.getPriorityBadgeHtml(t.priority);
      const statusBadge = UTILS.getStatusBadgeHtml(t.status);
      const timeAgo = UTILS.formatTimeAgo(t.createdAt);
      const overdueBadge = t.overdueTime ? `<span class="badge badge-overdue">OVERDUE ${t.overdueTime}</span>` : '';

      return `
        <div class="queue-item-card">
          <div class="queue-item-left" onclick="window.location.href='ticket-details.html?id=${t.id}'" style="cursor: pointer;">
            <div class="queue-item-meta">
              <span class="ticket-id-pill">${t.id}</span>
              ${prioBadge}
              ${statusBadge}
              <span>&bull; ${UTILS.escapeHtml(t.location)} &bull; ${timeAgo}</span>
            </div>
            <div class="queue-item-title">${UTILS.escapeHtml(t.title)}</div>
            <div class="queue-item-desc">${UTILS.escapeHtml(t.description)}</div>
          </div>

          <div class="queue-item-actions">
            ${overdueBadge}
            <a href="ticket-details.html?id=${t.id}" class="btn btn-secondary" style="font-size: 13px; padding: 6px 14px;">
              Manage &rarr;
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });
  }

  statusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      statusPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-status');
      render();
    });
  });

  await loadData();
});
