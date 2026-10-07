/**
 * CampusFix - Admin Tickets Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('admin-tickets-full-tbody');
  const searchInput = document.getElementById('admin-search-input');
  const deptSelect = document.getElementById('filter-dept-select');
  const statusSelect = document.getElementById('filter-status-select');
  const exportBtn = document.getElementById('btn-export-csv');

  let allTickets = [];
  let searchQuery = '';
  let selectedDept = 'ALL';
  let selectedStatus = 'ALL';

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('status')) {
    selectedStatus = params.get('status');
    if (statusSelect) statusSelect.value = selectedStatus;
  }
  if (params.get('dept')) {
    selectedDept = params.get('dept');
    if (deptSelect) deptSelect.value = selectedDept;
  }

  async function loadData() {
    allTickets = await API.getTickets();
    render();
  }

  function render() {
    if (!tbody) return;

    const filtered = allTickets.filter(t => {
      const matchDept = selectedDept === 'ALL' || t.department === selectedDept;
      const matchStatus = selectedStatus === 'ALL' || t.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchQuery = !searchQuery ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedTech && t.assignedTech.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchDept && matchStatus && matchQuery;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 48px; color: var(--color-text-muted);">
            No campus tickets found matching current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const timeAgo = UTILS.formatTimeAgo(t.createdAt);
      const statusBadge = UTILS.getStatusBadgeHtml(t.status);
      const prioBadge = UTILS.getPriorityBadgeHtml(t.priority);

      return `
        <tr>
          <td><span class="ticket-id-pill">${t.id}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--color-text-heading);">${UTILS.escapeHtml(t.title)}</div>
            <div style="font-size: 11.5px; color: var(--color-text-subtle);">${timeAgo}</div>
          </td>
          <td><span class="badge badge-tag">${UTILS.escapeHtml(t.category)}</span></td>
          <td>
            <span class="table-location-cell">
              <img src="../../assets/icons/pin.svg" class="icon icon-sm" alt="">
              <span>${UTILS.escapeHtml(t.location)}</span>
            </span>
          </td>
          <td>${UTILS.escapeHtml(t.department)}</td>
          <td style="font-weight: 600;">${UTILS.escapeHtml(t.assignedTech || 'Unassigned')}</td>
          <td>${prioBadge}</td>
          <td>${statusBadge}</td>
          <td>
            <a href="ticket-details.html?id=${t.id}" class="table-action-btn">
              <span>Inspect</span> &rarr;
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Filter Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });
  }

  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      selectedDept = e.target.value;
      render();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      render();
    });
  }

  // CSV Export
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const headers = ['ID', 'Title', 'Category', 'Location', 'Department', 'AssignedTech', 'Priority', 'Status', 'CreatedAt'];
      const rows = allTickets.map(t => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.category,
        `"${t.location}"`,
        `"${t.department}"`,
        `"${t.assignedTech || ''}"`,
        t.priority,
        t.status,
        t.createdAt
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `CampusFix_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      UTILS.showToast('Tickets exported to CSV', 'success');
    });
  }

  await loadData();
});
