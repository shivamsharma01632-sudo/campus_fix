/**
 * CampusFix - Student Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('triage-report-form');
  const textarea = document.getElementById('report-input-text');
  const chips = document.querySelectorAll('.prompt-chip');
  const placeholderBox = document.getElementById('triage-placeholder');
  const resultBox = document.getElementById('triage-result');
  const statusBadge = document.getElementById('triage-status-badge');
  const recentTicketsGrid = document.getElementById('student-recent-tickets');
  const imageInput = document.getElementById('optional-image-upload');
  const imageLabelText = document.getElementById('image-label-text');
  let attachedImage = null;

  // Handle Image Upload Selection
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        attachedImage = file.name;
        imageLabelText.textContent = `Attached: ${file.name.slice(0, 16)}...`;
      }
    });
  }

  // Handle Quick Prompt Chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      textarea.value = prompt;
      textarea.focus();
    });
  });

  // Load and render recent tickets matching Screenshot 3
  async function loadRecentTickets() {
    if (!recentTicketsGrid) return;
    const tickets = await API.getTickets();
    const displayTickets = tickets.slice(0, 6);

    recentTicketsGrid.innerHTML = displayTickets.map(t => {
      // Category tag display
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

  // Handle Form Submission with simulated AI Analysis
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text) return;

      // Status indicator to 'Analyzing...'
      statusBadge.textContent = 'Analyzing...';
      statusBadge.className = 'badge badge-assigned';

      // Perform AI triage and create ticket
      const analysis = API.simulateAITriage(text);
      const newTicket = await API.createTicket({
        title: text.length > 55 ? text.slice(0, 52) + '...' : text,
        description: text,
        category: analysis.category,
        location: analysis.location,
        department: analysis.department,
        assignedTech: analysis.suggestedTech,
        priority: analysis.priority,
        slaHours: analysis.slaHours,
        imageUrl: attachedImage
      });

      // Populate results in UI
      document.getElementById('res-issue').textContent = analysis.issue;
      document.getElementById('res-category').textContent = analysis.category;
      document.getElementById('res-location').textContent = analysis.location;
      document.getElementById('res-department').textContent = analysis.department;
      
      const priorityElem = document.getElementById('res-priority');
      priorityElem.textContent = analysis.priority;
      priorityElem.className = analysis.priority === 'High' ? 'badge badge-high' : 'badge badge-medium';

      document.getElementById('res-sla').textContent = `${analysis.slaHours} Hours`;
      document.getElementById('res-tech').textContent = analysis.suggestedTech;

      const viewBtn = document.getElementById('view-created-ticket-btn');
      if (viewBtn) {
        viewBtn.href = `ticket-details.html?id=${newTicket.id}`;
      }

      // Show result
      placeholderBox.style.display = 'none';
      resultBox.classList.add('active');

      statusBadge.textContent = 'Auto-Routed';
      statusBadge.className = 'badge badge-resolved';

      UTILS.showToast(`AI routed to ${analysis.department} (${analysis.suggestedTech})`, 'success');
      
      // Reload recent tickets list to reflect the new ticket
      await loadRecentTickets();
    });
  }

  // Initial load
  await loadRecentTickets();
});
