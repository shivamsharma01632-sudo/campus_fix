/**
 * CampusFix - Admin Assets Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('assets-tbody');
  const form = document.getElementById('add-asset-form');
  let assets = [];

  async function loadData() {
    assets = await API.getAssets();
    render();
  }

  function render() {
    if (!tbody) return;

    tbody.innerHTML = assets.map(a => {
      let statusBadge = `<span class="badge badge-resolved">${a.status}</span>`;
      if (a.status === 'Chronic Risk') {
        statusBadge = `<span class="badge badge-overdue">${a.status}</span>`;
      } else if (a.status === 'Maintenance Due') {
        statusBadge = `<span class="badge badge-medium">${a.status}</span>`;
      }

      const failureStyle = a.failures30d >= 4 
        ? 'color: #b91c1c; font-weight: 800;' 
        : 'color: var(--color-text-main); font-weight: 600;';

      return `
        <tr>
          <td><span class="ticket-id-pill">${a.id}</span></td>
          <td style="font-weight: 700; color: var(--color-text-heading);">${UTILS.escapeHtml(a.name)}</td>
          <td><span class="badge badge-tag">${UTILS.escapeHtml(a.category)}</span></td>
          <td>
            <span class="table-location-cell">
              <img src="../../assets/icons/pin.svg" class="icon icon-sm" alt="">
              <span>${UTILS.escapeHtml(a.location)}</span>
            </span>
          </td>
          <td style="${failureStyle}">${a.failures30d} Failures</td>
          <td style="color: var(--color-text-muted);">${a.lastServiced}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="table-action-btn" onclick="UTILS.showToast('Asset telemetry inspection opened for ${a.name}', 'info')">
              <span>Telemetry</span> &rarr;
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('asset-name-input').value.trim();
      const location = document.getElementById('asset-loc-input').value.trim();
      const category = document.getElementById('asset-cat-input').value;

      const newAsset = {
        id: `AST-${100 + assets.length + 1}`,
        name,
        location,
        category,
        status: 'Operational',
        failures30d: 0,
        lastServiced: new Date().toISOString().slice(0, 10)
      };

      assets.push(newAsset);
      localStorage.setItem(CONFIG.STORAGE_KEYS.ASSETS, JSON.stringify(assets));

      UTILS.closeModal('add-asset-modal');
      form.reset();
      UTILS.showToast(`${name} registered in physical plant registry`, 'success');
      render();
    });
  }

  await loadData();
});
