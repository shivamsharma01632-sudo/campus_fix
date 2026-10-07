/**
 * CampusFix - Admin Analytics Chart Generator (Pure Vanilla JS + SVG)
 */

document.addEventListener('DOMContentLoaded', () => {
  const chartContainer = document.getElementById('volume-chart-container');
  if (!chartContainer) return;

  const data = [
    { day: 'Mon', reported: 6, resolved: 5 },
    { day: 'Tue', reported: 8, resolved: 7 },
    { day: 'Wed', reported: 12, resolved: 10 },
    { day: 'Thu', reported: 7, resolved: 6 },
    { day: 'Fri', reported: 9, resolved: 8 },
    { day: 'Sat', reported: 4, resolved: 4 },
    { day: 'Sun', reported: 3, resolved: 2 }
  ];

  const maxVal = 14;
  const svgHeight = 200;
  const svgWidth = 460;
  const barWidth = 18;
  const gap = 48;
  const startX = 35;

  let barsSvg = '';
  let labelsSvg = '';

  data.forEach((item, index) => {
    const x = startX + index * gap;
    const reportedH = (item.reported / maxVal) * 140;
    const resolvedH = (item.resolved / maxVal) * 140;

    const reportedY = 160 - reportedH;
    const resolvedY = 160 - resolvedH;

    barsSvg += `
      <!-- Reported Bar -->
      <rect x="${x}" y="${reportedY}" width="${barWidth}" height="${reportedH}" rx="4" fill="#df8e25">
        <title>${item.day} Reported: ${item.reported}</title>
      </rect>
      <!-- Resolved Bar -->
      <rect x="${x + barWidth + 4}" y="${resolvedY}" width="${barWidth}" height="${resolvedH}" rx="4" fill="#9d2b86">
        <title>${item.day} Resolved: ${item.resolved}</title>
      </rect>
    `;

    labelsSvg += `
      <text x="${x + barWidth}" y="180" font-size="11" fill="#71717a" text-anchor="middle" font-weight="600">${item.day}</text>
    `;
  });

  chartContainer.innerHTML = `
    <svg class="svg-chart" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <!-- Gridlines -->
      <line x1="20" y1="20" x2="440" y2="20" stroke="#f1f5f9" stroke-width="1" />
      <line x1="20" y1="90" x2="440" y2="90" stroke="#f1f5f9" stroke-width="1" />
      <line x1="20" y1="160" x2="440" y2="160" stroke="#e2e8f0" stroke-width="1.5" />

      <!-- Bars -->
      ${barsSvg}

      <!-- Labels -->
      ${labelsSvg}

      <!-- Legend -->
      <g transform="translate(280, 5)">
        <rect x="0" y="0" width="10" height="10" rx="2" fill="#df8e25" />
        <text x="14" y="9" font-size="11" fill="#71717a" font-weight="600">Reported</text>

        <rect x="80" y="0" width="10" height="10" rx="2" fill="#9d2b86" />
        <text x="94" y="9" font-size="11" fill="#71717a" font-weight="600">Resolved</text>
      </g>
    </svg>
  `;
});
