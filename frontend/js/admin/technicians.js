/**
 * CampusFix - Admin Technicians Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('technicians-grid');
  const addForm = document.getElementById('add-tech-form');
  let techs = [];

  async function loadData() {
    techs = await API.getTechnicians();
    render();
  }

  function render() {
    if (!container) return;

    container.innerHTML = techs.map(t => {
      const pct = Math.round((t.activeTasks / t.maxTasks) * 100);
      const isHigh = pct >= 80;
      const isMedium = pct >= 50 && pct < 80;
      const barClass = isHigh ? 'danger' : (isMedium ? 'amber' : '');

      return `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <h3 style="font-size: 17px; font-weight: 800; color: var(--color-text-heading);">${UTILS.escapeHtml(t.name)}</h3>
                <span class="badge badge-tag" style="margin-top: 4px;">${UTILS.escapeHtml(t.department)}</span>
              </div>
              <span class="badge badge-resolved" style="font-size: 11.5px;">${t.status || 'Active'}</span>
            </div>

            <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 16px;">
              <div>Email: <strong>${UTILS.escapeHtml(t.email)}</strong></div>
              <div>Quality Score: <strong>${t.rating || '4.8'} / 5.0</strong></div>
            </div>

            <!-- Workload bar -->
            <div style="margin-top: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
                <span>Utilization</span>
                <span>${t.activeTasks} / ${t.maxTasks} Active (${pct}%)</span>
              </div>
              <div class="workload-bar-bg" style="height: 10px;">
                <div class="workload-bar-fill ${barClass}" style="width: ${pct}%;"></div>
              </div>
            </div>
          </div>

          <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
            <a href="tickets.html?tech=${encodeURIComponent(t.name)}" class="btn btn-secondary" style="font-size: 12.5px; padding: 6px 14px;">
              View Assigned (${t.activeTasks})
            </a>
            <button class="btn btn-outline" style="font-size: 12.5px; padding: 6px 14px;" onclick="UTILS.showToast('Rebalance triggered for ${t.name}', 'info')">
              Rebalance
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-tech-name').value.trim();
      const email = document.getElementById('new-tech-email').value.trim();
      const department = document.getElementById('new-tech-dept').value;
      const maxTasks = parseInt(document.getElementById('new-tech-limit').value) || 5;

      const newTech = {
        id: `TECH-${techs.length + 1}`,
        name,
        email,
        department,
        activeTasks: 0,
        maxTasks,
        rating: 5.0,
        status: 'Active'
      };

      techs.push(newTech);
      localStorage.setItem(CONFIG.STORAGE_KEYS.TECHNICIANS, JSON.stringify(techs));
      
      UTILS.closeModal('add-tech-modal');
      addForm.reset();
      UTILS.showToast(`${name} added to technician roster`, 'success');
      render();
    });
  }

  await loadData();
});
