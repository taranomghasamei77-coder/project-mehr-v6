// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// app.js — ناوبری و UI عمومی  v6.0

/* ===== MOBILE MENU ===== */
function toggleMenu() {
  document.getElementById('navMenu').classList.toggle('open');
}
document.querySelectorAll('.nav-item').forEach(item => {
  const link = item.querySelector('.nav-link');
  if (link && item.querySelector('.dropdown')) {
    link.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        item.classList.toggle('open');
      }
    });
  }
});

/* ===== TAB BAR ===== */
function setActiveTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const t = document.getElementById(tabId);
  if (t) t.classList.add('active');
}
function tabGoHome() {
  closeDrawer();
  goHome();
  setActiveTab('tab-home');
}
function tabShow(sectionId, tabId) {
  closeDrawer();
  showSection(sectionId);
  setActiveTab(tabId);
}
function toggleDrawer() {
  const d = document.getElementById('moreDrawer');
  const isOpen = d.classList.contains('open');
  if (isOpen) { closeDrawer(); } else {
    d.classList.add('open');
    setActiveTab('tab-more');
    _showDrawerOverlay();
  }
}
function closeDrawer() {
  document.getElementById('moreDrawer').classList.remove('open');
  _hideDrawerOverlay();
}
function drawerShow(sectionId) {
  closeDrawer();
  showSection(sectionId);
  setActiveTab('tab-more');
}

// پس‌زمینه تار برای بستن منو با لمس بیرون از آن
function _showDrawerOverlay() {
  let ov = document.getElementById('drawerOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'drawerOverlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:998;';
    ov.addEventListener('click', closeDrawer);
    document.body.appendChild(ov);
  }
  ov.style.display = 'block';
}
function _hideDrawerOverlay() {
  const ov = document.getElementById('drawerOverlay');
  if (ov) ov.style.display = 'none';
}

document.addEventListener('click', function(e) {
  const drawer  = document.getElementById('moreDrawer');
  const moreBtn = document.getElementById('tab-more');
  if (drawer && drawer.classList.contains('open') &&
      !drawer.contains(e.target) && moreBtn && !moreBtn.contains(e.target)) {
    closeDrawer();
  }
});

// هندلر دکمه‌های data-action (تأیید/رد کاربر)
document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.getAttribute('data-action');
  const id     = el.getAttribute('data-id');
  const fnMap = {
    approveUser: (typeof approveUser === 'function') ? approveUser : null,
    rejectUser:  (typeof rejectUser  === 'function') ? rejectUser  : null
  };
  const fn = fnMap[action];
  if (typeof fn === 'function') { e.preventDefault(); fn(id); }
});

function goHome() {
  document.querySelectorAll('.module-section').forEach(s => s.style.display = 'none');
  document.getElementById('navMenu').classList.remove('open');
  setActiveTab('tab-home');
}

/* ===== SHOW SECTION ===== */
function showSection(id) {
  document.querySelectorAll('.module-section').forEach(s => s.style.display = 'none');
  const t = document.getElementById(id);
  if (t) t.style.display = 'block';
  document.getElementById('navMenu').classList.remove('open');
  if (id === 'chartSection')     renderCharts();
  if (id === 'backupSection')    renderActivityLog();
  if (id === 'observerSection')  populateObserverSchoolSelect();
  if (id === 'documentsSection') loadActivitiesToDocuments();
  if (id === 'formsSection')     loadForms();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// بازیابی session هنگام بارگذاری صفحه
window.addEventListener('load', async () => {
  await restoreSession();
});
