/**
 * CampusFix - Technician Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const queueContainer = document.getElementById('tech-queue-list');
  const filterPills = document.querySelectorAll('#queue-filter-group .queue-pill');
  let currentDept = 'ALL';
  let queueTickets = [];

  async function loadData() {
    queueTickets = await API.getTickets();
    updateStats();
    renderQueue();
  }

  function updateStats() {
    const openCount = queueTickets.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Assigned').length;
    const resolvedToday = queueTickets.filter(t => t.status === 'Resolved' && t.resolvedAt && new Date(t.resolvedAt).toDateString() === new Date().toDateString()).length;
    
    const statOpen = document.getElementById('tech-stat-open');
    if (statOpen) statOpen.textContent = openCount;

    const statResolved = document.getElementById('tech-stat-resolved');
    if (statResolved) statResolved.textContent = resolvedToday;
  }

  function renderQueue() {
    if (!queueContainer) return;

    // Filter by department and exclude resolved from the active live dispatch queue
    const filtered = queueTickets.filter(t => {
      const isNotResolved = t.status !== 'Resolved';
      if (!isNotResolved) return false;

      if (currentDept === 'ALL') return true;
      if (currentDept === 'Plumbing') return t.category.includes('Plumbing') || t.department.includes('Plumbing');
      if (currentDept === 'HVAC') return t.category.includes('HVAC') || t.department.includes('HVAC');
      if (currentDept === 'IT & AV') return t.category.includes('AV') || t.category.includes('Network') || t.department.includes('IT');
      return true;
    });

    if (filtered.length === 0) {
      queueContainer.innerHTML = `
        <div style="background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 40px; text-align: center; color: var(--color-text-muted);">
          <img src="../../assets/icons/check.svg" class="icon icon-lg" style="margin: 0 auto 8px auto; opacity: 0.5;" alt="">
          <p style="font-weight: 600;">All clear in this queue!</p>
          <span style="font-size: 13px;">No pending maintenance dispatches matching current department.</span>
        </div>
      `;
      return;
    }

    queueContainer.innerHTML = filtered.map(t => {
      const prioBadge = UTILS.getPriorityBadgeHtml(t.priority);
      const timeAgo = UTILS.formatTimeAgo(t.createdAt);
      const overdueBadge = t.overdueTime ? `<span class="badge badge-overdue">OVERDUE ${t.overdueTime}</span>` : '';
      
      const isInProgress = t.status === 'In Progress';
      const startOrProgressBtn = isInProgress 
        ? `<span class="badge badge-progress" style="padding: 6px 14px; font-size: 13px;">In Progress</span>`
        : `<button class="btn btn-outline" style="padding: 6px 16px; font-size: 13px;" onclick="startTicket('${t.id}')">Start</button>`;

      return `
        <div class="queue-item-card" id="card-${t.id}">
          <div class="queue-item-left" onclick="window.location.href='ticket-details.html?id=${t.id}'" style="cursor: pointer;">
            <div class="queue-item-meta">
              ${prioBadge}
              <span>${UTILS.escapeHtml(t.category)} &bull; ${UTILS.escapeHtml(t.location)} &bull; ${timeAgo}</span>
            </div>
            <div class="queue-item-title">${UTILS.escapeHtml(t.title)}</div>
            <div class="queue-item-desc">"${UTILS.escapeHtml(t.description)}"</div>
          </div>

          <div class="queue-item-actions">
            ${overdueBadge}
            ${startOrProgressBtn}
            <button class="btn btn-success" style="padding: 6px 16px; font-size: 13px;" onclick="resolveTicket('${t.id}')">
              &check; Done
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Action handlers
  window.startTicket = async (id) => {
    await API.updateTicket(id, { status: 'In Progress', statusNote: 'Technician started active repair' });
    UTILS.showToast(`Ticket ${id} marked In Progress`, 'info');
    await loadData();
  };

  window.resolveTicket = async (id) => {
    await API.updateTicket(id, { status: 'Resolved', statusNote: 'Maintenance completed and verified' });
    UTILS.showToast(`Ticket ${id} marked Resolved &check;`, 'success');
    await loadData();
  };

  // Filter Pill buttons
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDept = pill.getAttribute('data-dept');
      renderQueue();
    });
  });

  await loadData();
});
