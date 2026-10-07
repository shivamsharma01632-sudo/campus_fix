/**
 * CampusFix - Student Detailed Report Issue Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('detailed-report-form');
  const descInput = document.getElementById('issue-desc');
  const locationInput = document.getElementById('issue-location');
  const categorySelect = document.getElementById('issue-category');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileNamePreview = document.getElementById('file-name-preview');

  const slaPreview = document.getElementById('ai-sla-preview');
  const priorityPreview = document.getElementById('ai-priority-preview');
  const deptPreview = document.getElementById('ai-dept-preview');

  let attachedFileName = null;

  // File Upload Handlers
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      attachedFileName = e.target.files[0].name;
      fileNamePreview.textContent = `Attached: ${attachedFileName}`;
    }
  });

  // Debounced AI Preview on typing
  let timeout = null;
  descInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const text = descInput.value.trim();
      if (text.length > 4) {
        const triage = API.simulateAITriage(text);
        if (!locationInput.value) locationInput.value = triage.location;
        if (slaPreview) slaPreview.textContent = `${triage.slaHours} Hours`;
        if (deptPreview) deptPreview.textContent = triage.department;
        if (priorityPreview) {
          priorityPreview.textContent = triage.priority;
          priorityPreview.className = triage.priority === 'High' ? 'badge badge-high' : 'badge badge-medium';
        }
      }
    }, 300);
  });

  // Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const desc = descInput.value.trim();
    const location = locationInput.value.trim();
    const category = categorySelect.value;

    const user = AUTH.getCurrentUser();
    const newTicket = await API.createTicket({
      title: desc.length > 50 ? desc.slice(0, 48) + '...' : desc,
      description: desc,
      location: location,
      category: category,
      reportedBy: user ? user.email : 'student@campus.edu',
      studentName: user ? user.name : 'Student',
      imageUrl: attachedFileName
    });

    UTILS.showToast(`Ticket ${newTicket.id} created successfully!`, 'success');
    setTimeout(() => {
      window.location.href = `ticket-details.html?id=${newTicket.id}`;
    }, 600);
  });
});
