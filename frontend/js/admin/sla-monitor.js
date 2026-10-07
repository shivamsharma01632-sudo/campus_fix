/**
 * CampusFix - Admin SLA Monitor Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('sla-tbody');
  const tickets = await API.getTickets();

  // Find overdue or critical SLA tickets
  const slaTickets = tickets.filter(t => t.status !== 'Resolved');

  if (!tbody) return;

  tbody.innerHTML = slaTickets.map(t => {
    const overdueDisplay = t.overdueTime 
      ? `<span class="badge badge-overdue">OVERDUE ${t.overdueTime}</span>`
      : `<span class="badge badge-tag" style="color: var(--color-primary); font-weight: 700;">Within ${t.slaHours}h SLA</span>`;

    return `
      <tr>
        <td><span class="ticket-id-pill">${t.id}</span></td>
        <td>
          <div style="font-weight: 700; color: var(--color-text-heading);">${UTILS.escapeHtml(t.title)}</div>
          <div style="font-size: 11.5px; color: var(--color-text-subtle);">${UTILS.formatTimeAgo(t.createdAt)}</div>
        </td>
        <td>
          <span class="table-location-cell">
            <img src="../../assets/icons/pin.svg" class="icon icon-sm" alt="">
            <span>${UTILS.escapeHtml(t.location)}</span>
          </span>
        </td>
        <td>${UTILS.escapeHtml(t.department)}</td>
        <td style="font-weight: 600;">${UTILS.escapeHtml(t.assignedTech || 'Awaiting assignment')}</td>
        <td>${overdueDisplay}</td>
        <td>
          <button class="btn btn-outline" style="font-size: 12px; padding: 5px 14px;" onclick="escalateSLA('${t.id}', '${t.assignedTech || 'Department Lead'}')">
            Paging Alert &rarr;
          </button>
        </td>
      </tr>
    `;
  }).join('');

  window.escalateSLA = (id, tech) => {
    UTILS.showToast(`Emergency SLA Pager dispatched to ${tech} for ${id}!`, 'error');
  };
});
