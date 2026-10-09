// MetaCraft Web Studio Client Engine

let currentMeta = {};
let currentFormats = {};
let currentAudit = {};
let activeCodeLang = 'html';

const DEFAULT_PRESET = {
  title: 'PulseStack — Real-Time Cloud Infrastructure & Observability',
  description: 'Monitor latency, distributed microservices, and server metrics with zero-overhead tracing and real-time incident alerting for modern DevOps teams.',
  keywords: 'devops, cloud, observability, monitoring, latency, microservices',
  author: 'PulseStack Team',
  canonical: 'https://pulsestack.io',
  favicon: 'https://pulsestack.io/favicon.ico',
  themeColor: '#6366f1',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0',
  ogTitle: 'PulseStack — Real-Time Cloud Infrastructure & Observability',
  ogDescription: 'Instant observability, automated distributed traces, and team alerts. Try the free developer tier today.',
  ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  ogImageAlt: 'PulseStack Cloud Observability Dashboard Preview',
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogUrl: 'https://pulsestack.io',
  ogType: 'website',
  ogSiteName: 'PulseStack',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
  twitterSite: '@pulsestack_io',
  twitterCreator: '@pulsestack_io',
  twitterTitle: 'PulseStack — Real-Time Cloud Infrastructure & Observability',
  twitterDescription: 'Monitor latency, microservices, and server metrics with zero overhead.',
  twitterImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  twitterImageAlt: 'PulseStack Preview Banner'
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Load initial preset
  loadMeta(DEFAULT_PRESET);

  // Setup event listeners
  setupFormListeners();
  setupTabListeners();
  setupPlatformListeners();
  setupCodeTabs();
  setupModalListeners();
  setupActionButtons();
});

function loadMeta(data) {
  currentMeta = { ...data };

  // Set form values
  setVal('inputTitle', currentMeta.title);
  setVal('inputDescription', currentMeta.description);
  setVal('inputCanonical', currentMeta.canonical);
  setVal('inputSiteName', currentMeta.ogSiteName);
  setVal('inputThemeColor', currentMeta.themeColor || '#0ea5e9');
  setVal('inputThemeColorText', currentMeta.themeColor || '#0ea5e9');
  setVal('inputOgImage', currentMeta.ogImage);
  setVal('inputOgType', currentMeta.ogType || 'website');
  setVal('inputOgLocale', currentMeta.ogLocale || 'en_US');
  setVal('inputOgImageAlt', currentMeta.ogImageAlt);
  setVal('inputTwitterCard', currentMeta.twitterCard || 'summary_large_image');
  setVal('inputTwitterSite', currentMeta.twitterSite);
  setVal('inputTwitterCreator', currentMeta.twitterCreator);
  setVal('inputAuthor', currentMeta.author);
  setVal('inputKeywords', currentMeta.keywords);
  setVal('inputRobots', currentMeta.robots || 'index, follow');

  updateAll();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setupFormListeners() {
  const form = document.getElementById('metaForm');
  if (!form) return;

  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      collectFormData();
      updateAll();
    });
  });

  // Sync theme color text and picker
  const colorPicker = document.getElementById('inputThemeColor');
  const colorText = document.getElementById('inputThemeColorText');
  if (colorPicker && colorText) {
    colorPicker.addEventListener('input', (e) => {
      colorText.value = e.target.value;
      collectFormData();
      updateAll();
    });
    colorText.addEventListener('input', (e) => {
      if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
        colorPicker.value = e.target.value;
      }
      collectFormData();
      updateAll();
    });
  }

  // Presets selector
  const presetSelect = document.getElementById('presetSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', async (e) => {
      const presetId = e.target.value;
      try {
        const res = await fetch(`/api/presets/${presetId}`);
        const data = await res.json();
        if (data.preset) {
          loadMeta(data.preset);
          showToast(`Loaded preset: ${data.preset.name}`);
        }
      } catch (err) {
        console.error('Failed to load preset:', err);
      }
    });
  }
}

function collectFormData() {
  currentMeta.title = getVal('inputTitle');
  currentMeta.description = getVal('inputDescription');
  currentMeta.canonical = getVal('inputCanonical');
  currentMeta.ogSiteName = getVal('inputSiteName');
  currentMeta.themeColor = getVal('inputThemeColorText') || '#0ea5e9';
  currentMeta.ogImage = getVal('inputOgImage');
  currentMeta.ogType = getVal('inputOgType');
  currentMeta.ogLocale = getVal('inputOgLocale');
  currentMeta.ogImageAlt = getVal('inputOgImageAlt');
  currentMeta.twitterCard = getVal('inputTwitterCard');
  currentMeta.twitterSite = getVal('inputTwitterSite');
  currentMeta.twitterCreator = getVal('inputTwitterCreator');
  currentMeta.author = getVal('inputAuthor');
  currentMeta.keywords = getVal('inputKeywords');
  currentMeta.robots = getVal('inputRobots');

  // Sync social mirrors
  currentMeta.ogTitle = currentMeta.title;
  currentMeta.ogDescription = currentMeta.description;
  currentMeta.ogUrl = currentMeta.canonical;
  currentMeta.twitterTitle = currentMeta.title;
  currentMeta.twitterDescription = currentMeta.description;
  currentMeta.twitterImage = currentMeta.ogImage;
}

function updateAll() {
  updateCounters();
  updateSimulators();
  requestAuditAndGenerate();
}

function updateCounters() {
  const title = currentMeta.title || '';
  const desc = currentMeta.description || '';

  const titleCounter = document.getElementById('titleCounter');
  if (titleCounter) {
    titleCounter.textContent = `${title.length} / 60`;
    if (title.length >= 30 && title.length <= 60) {
      titleCounter.className = 'text-[11px] text-emerald-400 font-mono font-semibold';
    } else if (title.length > 60) {
      titleCounter.className = 'text-[11px] text-amber-400 font-mono font-semibold';
    } else {
      titleCounter.className = 'text-[11px] text-slate-400 font-mono';
    }
  }

  const descCounter = document.getElementById('descCounter');
  if (descCounter) {
    descCounter.textContent = `${desc.length} / 160`;
    if (desc.length >= 70 && desc.length <= 160) {
      descCounter.className = 'text-[11px] text-emerald-400 font-mono font-semibold';
    } else if (desc.length > 160) {
      descCounter.className = 'text-[11px] text-amber-400 font-mono font-semibold';
    } else {
      descCounter.className = 'text-[11px] text-slate-400 font-mono';
    }
  }
}

function updateSimulators() {
  const title = currentMeta.title || 'Enter a page title';
  const desc = currentMeta.description || 'Enter a meta description to see how it appears on social feeds.';
  const image = currentMeta.ogImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
  const canonical = currentMeta.canonical || 'https://example.com';
  let domain = 'example.com';
  try {
    domain = new URL(canonical).hostname;
  } catch {
    domain = 'example.com';
  }

  // 1. Twitter / X
  const simTwitterTitle = document.getElementById('simTwitterTitle');
  const simTwitterDesc = document.getElementById('simTwitterDesc');
  const simTwitterImg = document.getElementById('simTwitterImg');
  const simTwitterDomain = document.getElementById('simTwitterDomain');
  const simTwitterHandle = document.getElementById('simTwitterHandle');

  if (simTwitterTitle) simTwitterTitle.textContent = title;
  if (simTwitterDesc) simTwitterDesc.textContent = desc;
  if (simTwitterImg) simTwitterImg.src = image;
  if (simTwitterDomain) simTwitterDomain.textContent = domain;
  if (simTwitterHandle) simTwitterHandle.textContent = currentMeta.twitterSite || '@yourhandle';

  // 2. Facebook
  const simFbTitle = document.getElementById('simFbTitle');
  const simFbDesc = document.getElementById('simFbDesc');
  const simFbImg = document.getElementById('simFbImg');
  const simFbDomain = document.getElementById('simFbDomain');
  const simFbAuthor = document.getElementById('simFbAuthor');

  if (simFbTitle) simFbTitle.textContent = title;
  if (simFbDesc) simFbDesc.textContent = desc;
  if (simFbImg) simFbImg.src = image;
  if (simFbDomain) simFbDomain.textContent = domain.toUpperCase();
  if (simFbAuthor) simFbAuthor.textContent = currentMeta.ogSiteName || 'Official Page';

  // 3. LinkedIn
  const simLiTitle = document.getElementById('simLiTitle');
  const simLiImg = document.getElementById('simLiImg');
  const simLiDomain = document.getElementById('simLiDomain');

  if (simLiTitle) simLiTitle.textContent = title;
  if (simLiImg) simLiImg.src = image;
  if (simLiDomain) simLiDomain.textContent = domain;

  // 4. Google SERP
  const simGoogleTitle = document.getElementById('simGoogleTitle');
  const simGoogleDesc = document.getElementById('simGoogleDesc');
  const simGoogleSite = document.getElementById('simGoogleSite');
  const simGoogleBreadcrumb = document.getElementById('simGoogleBreadcrumb');

  if (simGoogleTitle) simGoogleTitle.textContent = title;
  if (simGoogleDesc) simGoogleDesc.textContent = desc;
  if (simGoogleSite) simGoogleSite.textContent = currentMeta.ogSiteName || domain;
  if (simGoogleBreadcrumb) simGoogleBreadcrumb.textContent = canonical;

  // 5. Discord
  const simDiscordTitle = document.getElementById('simDiscordTitle');
  const simDiscordDesc = document.getElementById('simDiscordDesc');
  const simDiscordImg = document.getElementById('simDiscordImg');
  const simDiscordSite = document.getElementById('simDiscordSite');

  if (simDiscordTitle) simDiscordTitle.textContent = title;
  if (simDiscordDesc) simDiscordDesc.textContent = desc;
  if (simDiscordImg) simDiscordImg.src = image;
  if (simDiscordSite) simDiscordSite.textContent = currentMeta.ogSiteName || domain;
}

let auditDebounce = null;
function requestAuditAndGenerate() {
  clearTimeout(auditDebounce);
  auditDebounce = setTimeout(async () => {
    try {
      // Generate formats
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: currentMeta })
      });
      const genData = await genRes.json();
      if (genData.formats) {
        currentFormats = genData.formats;
        renderCodeOutput();
      }

      // Run audit
      const auditRes = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: currentMeta })
      });
      const auditData = await auditRes.json();
      if (auditData.audit) {
        currentAudit = auditData.audit;
        renderAuditWidget(auditData.audit);
      }
    } catch (err) {
      console.error('Audit/generate error:', err);
    }
  }, 100);
}

function renderAuditWidget(audit) {
  const scoreText = document.getElementById('scoreText');
  const scoreProgress = document.getElementById('scoreProgress');
  const gradeBadge = document.getElementById('gradeBadge');
  const summaryText = document.getElementById('scoreSummaryText');
  const detailsList = document.getElementById('auditDetailsList');

  if (!scoreText || !scoreProgress) return;

  scoreText.textContent = audit.score;
  const circumference = 2 * Math.PI * 20; // 125.66
  const offset = circumference - (audit.score / 100) * circumference;
  scoreProgress.style.strokeDashoffset = offset;

  // Color classes
  if (audit.score >= 80) {
    scoreProgress.setAttribute('class', 'text-emerald-500 transition-all duration-500');
    gradeBadge.className = 'text-xs px-2 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  } else if (audit.score >= 60) {
    scoreProgress.setAttribute('class', 'text-amber-500 transition-all duration-500');
    gradeBadge.className = 'text-xs px-2 py-0.5 rounded font-black bg-amber-500/20 text-amber-400 border border-amber-500/30';
  } else {
    scoreProgress.setAttribute('class', 'text-rose-500 transition-all duration-500');
    gradeBadge.className = 'text-xs px-2 py-0.5 rounded font-black bg-rose-500/20 text-rose-400 border border-rose-500/30';
  }
  gradeBadge.textContent = audit.grade;
  summaryText.textContent = `${audit.passedCount} passed · ${audit.warningCount} warnings · ${audit.errorCount} errors`;

  // Render checklist items
  if (detailsList && audit.checks) {
    detailsList.innerHTML = audit.checks.map(c => {
      let iconColor = 'text-emerald-400';
      let iconName = 'check-circle';
      if (c.status === 'warning') {
        iconColor = 'text-amber-400';
        iconName = 'alert-triangle';
      } else if (c.status === 'error') {
        iconColor = 'text-rose-400';
        iconName = 'x-circle';
      }
      return `
        <div class="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start space-x-2">
          <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} shrink-0 mt-0.5"></i>
          <div class="flex-1 leading-snug">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-200">${c.label}</span>
              <span class="text-[10px] text-slate-400 font-mono">${c.points}/${c.maxPoints} pts</span>
            </div>
            <p class="text-slate-400 text-[11px] mt-0.5">${c.message}</p>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons({ root: detailsList });
    }
  }
}

function renderCodeOutput() {
  const codeEl = document.getElementById('codeOutput');
  if (!codeEl) return;
  codeEl.textContent = currentFormats[activeCodeLang] || '// Generating code...';
}

function setupTabListeners() {
  const tabs = document.querySelectorAll('.editor-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active', 'border-sky-400', 'text-sky-400', 'bg-slate-800/50');
        t.classList.add('text-slate-400', 'border-transparent');
      });
      tab.classList.add('active', 'border-sky-400', 'text-sky-400', 'bg-slate-800/50');
      tab.classList.remove('text-slate-400', 'border-transparent');

      const target = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      const activeContent = document.getElementById(`tab-${target}`);
      if (activeContent) activeContent.classList.remove('hidden');
    });
  });

  // Toggle audit details
  const toggleBtn = document.getElementById('toggleAuditDetails');
  const detailsList = document.getElementById('auditDetailsList');
  if (toggleBtn && detailsList) {
    toggleBtn.addEventListener('click', () => {
      detailsList.classList.toggle('hidden');
    });
  }
}

function setupPlatformListeners() {
  const platformTabs = document.querySelectorAll('.platform-tab');
  platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      platformTabs.forEach(t => {
        t.classList.remove('active', 'bg-sky-500', 'text-white', 'shadow-sm', 'shadow-sky-500/20');
        t.classList.add('text-slate-300');
      });
      tab.classList.add('active', 'bg-sky-500', 'text-white', 'shadow-sm', 'shadow-sky-500/20');
      tab.classList.remove('text-slate-300');

      const platform = tab.dataset.platform;
      document.querySelectorAll('.sim-view').forEach(v => v.classList.add('hidden'));
      const targetSim = document.getElementById(`sim-${platform}`);
      if (targetSim) targetSim.classList.remove('hidden');
    });
  });
}

function setupCodeTabs() {
  const codeTabs = document.querySelectorAll('.code-tab');
  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => {
        t.classList.remove('active', 'bg-sky-500', 'text-white');
        t.classList.add('text-slate-400');
      });
      tab.classList.add('active', 'bg-sky-500', 'text-white');
      tab.classList.remove('text-slate-400');

      activeCodeLang = tab.dataset.lang;
      renderCodeOutput();
    });
  });
}

function setupModalListeners() {
  const modal = document.getElementById('urlModal');
  const openBtn = document.getElementById('inspectUrlModalBtn');
  const closeBtn = document.getElementById('closeUrlModal');
  const cancelBtn = document.getElementById('cancelScrapeBtn');
  const form = document.getElementById('urlScrapeForm');
  const errorEl = document.getElementById('scrapeError');
  const submitBtn = document.getElementById('submitScrapeBtn');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      errorEl.classList.add('hidden');
      document.getElementById('scrapeUrlInput').focus();
    });
  }

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetUrl = document.getElementById('scrapeUrlInput').value.trim();
      if (!targetUrl) return;

      errorEl.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Fetching...</span>`;

      try {
        const res = await fetch('/api/inspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });
        const data = await res.json();

        if (data.success && data.metadata) {
          loadMeta(data.metadata);
          closeModal();
          showToast(`Successfully extracted metadata from ${targetUrl}`);
        } else {
          errorEl.textContent = data.error || 'Failed to extract metadata.';
          errorEl.classList.remove('hidden');
        }
      } catch (err) {
        errorEl.textContent = 'Network error fetching URL.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Fetch & Extract</span>`;
      }
    });
  }
}

function setupActionButtons() {
  const copyBtn = document.getElementById('copyCodeBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = currentFormats[activeCodeLang] || '';
      navigator.clipboard.writeText(code).then(() => {
        showToast('Code snippet copied to clipboard! ✨');
      });
    });
  }

  const downloadBtn = document.getElementById('downloadHtmlBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const htmlCode = currentFormats.html || '';
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${htmlCode.split('\n').map(l => '  ' + l).join('\n')}
</head>
<body>
  <h1>${currentMeta.title || 'Hello World'}</h1>
  <p>${currentMeta.description || ''}</p>
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meta-tags.html';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded meta-tags.html! 💾');
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2800);
}
