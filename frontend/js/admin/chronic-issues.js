/**
 * CampusFix - Admin Chronic Issues Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('chronic-issues-list');
  const items = await API.getChronicIssues();

  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="chronic-alert-card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div class="chronic-alert-title" style="font-size: 19px;">${item.assetName}</div>
          <div class="chronic-alert-subtitle" style="font-size: 14px; margin-top: 4px;">
            ${item.failuresCount} failures in the last ${item.periodDays} days <span style="font-weight: normal; color: #881337;">(${item.location}).</span>
          </div>
        </div>
        <span class="badge badge-overdue" style="font-size: 12px;">${item.status}</span>
      </div>

      <div class="chronic-alert-box" style="margin: 12px 0;">
        <strong>Recommendation:</strong> ${item.recommendation}
      </div>

      <div class="chronic-alert-footer">
        <span class="chronic-alert-meta">Next preventive audit: ${item.nextAudit} &bull; Dept: ${item.department} &bull; Tech: ${item.assignedTech}</span>
        <div style="display: flex; gap: 8px;">
          <a href="tickets.html?tech=${encodeURIComponent(item.assignedTech)}" class="btn btn-secondary" style="font-size: 12.5px; padding: 6px 14px;">
            View Incident History
          </a>
          <button class="btn btn-purple" style="font-size: 12.5px; padding: 6px 16px;" onclick="UTILS.showToast('Preventive decommission workflow initiated for ${item.assetName}', 'success')">
            Order Replacement
          </button>
        </div>
      </div>
    </div>
  `).join('');
});
