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
  }
}
function closeDrawer() {
  document.getElementById('moreDrawer').classList.remove('open');
}
function drawerShow(sectionId) {
  closeDrawer();
  showSection(sectionId);
  setActiveTab('tab-more');
}
document.addEventListener('click', function(e) {
  const drawer  = document.getElementById('moreDrawer');
  const moreBtn = document.getElementById('tab-more');
  if (drawer && !drawer.contains(e.target) && moreBtn && !moreBtn.contains(e.target)) {
    closeDrawer();
  }
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
