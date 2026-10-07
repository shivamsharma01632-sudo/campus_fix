/**
 * CampusFix - Student My Tickets Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('my-tickets-container');
  const searchInput = document.getElementById('ticket-search-input');
  const statusPills = document.querySelectorAll('#status-filter-pills .seg-btn');
  let currentFilter = 'ALL';
  let searchQuery = '';
  let allTickets = [];

  async function fetchAndRender() {
    allTickets = await API.getTickets();
    render();
  }

  function render() {
    if (!container) return;

    let filtered = allTickets.filter(t => {
      const matchFilter = currentFilter === 'ALL' || t.status.toLowerCase() === currentFilter.toLowerCase();
      const matchQuery = !searchQuery || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: var(--color-text-muted);">
          <img src="../../assets/icons/inbox.svg" class="icon icon-xl" style="margin: 0 auto 12px auto; opacity: 0.4;" alt="">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--color-text-heading); margin-bottom: 6px;">No tickets found</h3>
          <p style="font-size: 13.5px;">No maintenance requests match your current filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const catShort = t.category.split('/')[0].trim();
      const statusBadge = UTILS.getStatusBadgeHtml(t.status);
      const timeAgo = UTILS.formatTimeAgo(t.createdAt);

      return `
        <div class="ticket-card" onclick="window.location.href='ticket-details.html?id=${t.id}'">
          <div class="ticket-card-header">
            <span class="badge badge-tag">${catShort}</span>
            ${statusBadge}
          </div>
          <div class="ticket-card-title">${UTILS.escapeHtml(t.title)}</div>
          <div class="ticket-card-meta">
            <span>${UTILS.escapeHtml(t.location)}</span>
            <span>&bull;</span>
            <span>${timeAgo}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });
  }

  // Status pills
  statusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      statusPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-status');
      render();
    });
  });

  await fetchAndRender();
});
