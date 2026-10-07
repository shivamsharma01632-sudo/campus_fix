/**
 * CampusFix - Executive Facility Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('admin-incidents-tbody');

  async function loadDashboard() {
    const summary = await API.getAnalyticsSummary();
    const tickets = await API.getTickets();
    const technicians = await API.getTechnicians();

    // Populate Stat Numbers
    document.getElementById('admin-total-tickets').textContent = summary.total;
    document.getElementById('admin-open-queue').textContent = summary.openQueue;
    document.getElementById('admin-resolved-count').textContent = summary.resolved;
    document.getElementById('admin-overdue-count').textContent = summary.overdue;
    document.getElementById('admin-high-prio-count').textContent = summary.highPriority;

    // Populate Incidents Table matching Screenshot 5
    if (tbody) {
      tbody.innerHTML = tickets.map(t => {
        const timeAgo = UTILS.formatTimeAgo(t.createdAt);
        const statusBadge = UTILS.getStatusBadgeHtml(t.status);

        return `
          <tr>
            <td>
              <span class="ticket-id-pill">${t.id}</span>
            </td>
            <td>
              <div style="font-weight: 700; color: var(--color-text-heading);">${UTILS.escapeHtml(t.title)}</div>
              <div style="font-size: 11.5px; color: var(--color-text-subtle); margin-top: 2px;">${timeAgo}</div>
            </td>
            <td>
              <span class="badge badge-tag">${UTILS.escapeHtml(t.category)}</span>
            </td>
            <td>
              <span class="table-location-cell">
                <img src="../../assets/icons/pin.svg" class="icon icon-sm" alt="">
                <span>${UTILS.escapeHtml(t.location)}</span>
              </span>
            </td>
            <td>${UTILS.escapeHtml(t.department)}</td>
            <td style="font-weight: 600;">${UTILS.escapeHtml(t.assignedTech || 'Unassigned')}</td>
            <td>${statusBadge}</td>
            <td>
              <a href="ticket-details.html?id=${t.id}" class="table-action-btn">
                <span>Inspect</span>
                <span>&rarr;</span>
              </a>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Populate Workload Bars
    const workloadContainer = document.getElementById('tech-workload-bars');
    if (workloadContainer && technicians.length > 0) {
      workloadContainer.innerHTML = technicians.map((tech, idx) => {
        const pct = Math.round((tech.activeTasks / tech.maxTasks) * 100);
        const fillClass = pct > 75 ? 'danger' : (pct >= 50 ? 'amber' : '');
        const isLast = idx === technicians.length - 1;

        return `
          <div class="workload-item" style="${isLast ? 'margin-bottom: 0;' : ''}">
            <div class="workload-header">
              <span class="font-bold">${UTILS.escapeHtml(tech.name)} <span class="text-muted" style="font-weight: normal;">(${UTILS.escapeHtml(tech.department)})</span></span>
              <span>${tech.activeTasks} / ${tech.maxTasks} Active Tasks</span>
            </div>
            <div class="workload-bar-bg">
              <div class="workload-bar-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  await loadDashboard();
});
