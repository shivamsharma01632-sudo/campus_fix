/**
 * CampusFix - Technician Ticket Details & Update Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id') || 'CF-1006';

  let ticket = await API.getTicketById(ticketId);
  if (!ticket) {
    UTILS.showToast('Ticket not found', 'error');
    return;
  }

  // Header
  document.getElementById('tech-ticket-id').textContent = ticket.id;
  document.getElementById('tech-title').textContent = ticket.title;
  document.getElementById('tech-reported-meta').textContent = `Reported ${UTILS.formatTimeAgo(ticket.createdAt)} by ${ticket.studentName || 'Staff'}`;
  document.getElementById('tech-description').textContent = ticket.description;

  // Badges
  document.getElementById('tech-status-badge').innerHTML = UTILS.getStatusBadgeHtml(ticket.status);
  document.getElementById('tech-priority-badge').innerHTML = UTILS.getPriorityBadgeHtml(ticket.priority);

  // SLA
  const slaText = document.getElementById('tech-sla-text');
  if (ticket.overdueTime) {
    slaText.textContent = `OVERDUE ${ticket.overdueTime}`;
    slaText.style.color = '#ef4444';
  } else if (ticket.status === 'Resolved') {
    slaText.textContent = 'Completed';
    slaText.style.color = '#10b981';
  } else {
    slaText.textContent = `${ticket.slaHours} Hours`;
    slaText.style.color = 'var(--color-primary)';
  }

  // Metadata
  document.getElementById('tech-meta-location').textContent = ticket.location;
  document.getElementById('tech-meta-dept').textContent = ticket.department;
  document.getElementById('tech-meta-asset').textContent = ticket.assetTag || 'General Asset';
  document.getElementById('tech-meta-assignee').textContent = ticket.assignedTech || 'Unassigned';

  if (ticket.isChronic) {
    document.getElementById('tech-chronic-box').style.display = 'block';
  }

  // Populate Select with current status
  const statusSelect = document.getElementById('update-status-select');
  statusSelect.value = ticket.status;

  renderHistory(ticket.timeline || []);

  // Update Form
  const form = document.getElementById('tech-status-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newStatus = statusSelect.value;
    const note = document.getElementById('update-notes-input').value.trim();
    const part = document.getElementById('update-part-input').value.trim();

    let fullNote = note;
    if (part) fullNote += ` [Part used: ${part}]`;

    const updated = await API.updateTicket(ticket.id, {
      status: newStatus,
      statusNote: `Tech (Demo Staff): ${fullNote}`
    });

    ticket = updated;
    document.getElementById('tech-status-badge').innerHTML = UTILS.getStatusBadgeHtml(ticket.status);
    renderHistory(ticket.timeline || []);
    document.getElementById('update-notes-input').value = '';
    UTILS.showToast(`Ticket status updated to ${newStatus}`, 'success');
  });

  function renderHistory(timeline) {
    const container = document.getElementById('tech-history-stream');
    if (!container) return;

    container.innerHTML = timeline.map(item => `
      <div class="activity-item">
        <div class="activity-avatar" style="background-color: var(--color-primary-light); color: var(--color-primary);">
          <img src="../../assets/icons/check.svg" class="icon icon-sm" alt="">
        </div>
        <div class="activity-content">
          <div>
            <span class="activity-author">${item.status}</span>
            <span class="activity-time">&bull; ${item.timestamp}</span>
          </div>
          <div class="activity-text">${UTILS.escapeHtml(item.note)}</div>
        </div>
      </div>
    `).join('');
  }
});
