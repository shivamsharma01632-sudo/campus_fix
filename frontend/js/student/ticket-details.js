/**
 * CampusFix - Ticket Details Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id') || 'CF-1002';

  const ticket = await API.getTicketById(ticketId);
  if (!ticket) {
    UTILS.showToast('Ticket not found', 'error');
    return;
  }

  // Populate Header
  document.getElementById('detail-ticket-id').textContent = ticket.id;
  document.getElementById('detail-title').textContent = ticket.title;
  document.getElementById('detail-reported-meta').textContent = `Reported ${UTILS.formatTimeAgo(ticket.createdAt)} by ${ticket.studentName || 'Student'}`;

  // Badges
  document.getElementById('detail-status-badge').innerHTML = UTILS.getStatusBadgeHtml(ticket.status);
  document.getElementById('detail-priority-badge').innerHTML = UTILS.getPriorityBadgeHtml(ticket.priority);

  // SLA
  const slaTimer = document.getElementById('detail-sla-timer');
  if (ticket.status === 'Resolved') {
    slaTimer.textContent = 'Resolved';
    slaTimer.style.color = '#10b981';
  } else if (ticket.overdueTime) {
    slaTimer.textContent = `OVERDUE ${ticket.overdueTime}`;
    slaTimer.style.color = '#ef4444';
  } else {
    slaTimer.textContent = `${ticket.slaHours} Hours`;
  }

  // Description & Image
  document.getElementById('detail-description').textContent = ticket.description;
  if (ticket.imageUrl) {
    document.getElementById('detail-image-box').style.display = 'block';
    document.getElementById('detail-image-name').textContent = ticket.imageUrl;
  }

  // Metadata
  document.getElementById('meta-location').textContent = ticket.location;
  document.getElementById('meta-department').textContent = ticket.department;
  document.getElementById('meta-tech').textContent = ticket.assignedTech || 'Awaiting Assignment';
  document.getElementById('meta-asset').textContent = ticket.assetTag || 'General Campus Asset';

  // Chronic Risk Box
  if (ticket.isChronic) {
    document.getElementById('detail-chronic-card').style.display = 'flex';
  }

  // Progression Timeline
  updateTimelineUI(ticket.status);

  // Render Activity Stream
  renderActivity(ticket.timeline || []);

  // Comment submission
  const commentForm = document.getElementById('add-comment-form');
  const commentInput = document.getElementById('comment-input');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const user = AUTH.getCurrentUser();
      const newEntry = {
        status: ticket.status,
        timestamp: 'Just now',
        note: `${user ? user.name : 'Student'}: ${text}`
      };

      if (!ticket.timeline) ticket.timeline = [];
      ticket.timeline.unshift(newEntry);
      await API.updateTicket(ticket.id, { timeline: ticket.timeline });

      renderActivity(ticket.timeline);
      commentInput.value = '';
      UTILS.showToast('Note added to ticket history', 'success');
    });
  }

  function updateTimelineUI(status) {
    const steps = ['Open', 'Assigned', 'In Progress', 'Resolved'];
    const currentIdx = steps.indexOf(status);

    const stepElements = [
      document.getElementById('step-open'),
      document.getElementById('step-assigned'),
      document.getElementById('step-progress'),
      document.getElementById('step-resolved')
    ];

    stepElements.forEach((el, index) => {
      if (!el) return;
      el.className = 'timeline-step';
      const circle = el.querySelector('.timeline-circle');
      if (index < currentIdx) {
        el.classList.add('completed');
        circle.innerHTML = '&check;';
      } else if (index === currentIdx) {
        el.classList.add('active');
        circle.textContent = index + 1;
      } else {
        circle.textContent = index + 1;
      }
    });
  }

  function renderActivity(timeline) {
    const stream = document.getElementById('activity-stream');
    if (!stream) return;

    if (timeline.length === 0) {
      stream.innerHTML = '<p style="color: var(--color-text-muted); font-size: 13.5px;">No activity yet.</p>';
      return;
    }

    stream.innerHTML = timeline.map(item => `
      <div class="activity-item">
        <div class="activity-avatar">
          <img src="../../assets/icons/sparkles.svg" class="icon icon-sm" alt="">
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
