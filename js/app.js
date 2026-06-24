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
    d.style.display = 'block';    // باز کردن قطعی
    d.classList.add('open');
    setActiveTab('tab-more');
    _showDrawerOverlay();
  }
}
function closeDrawer() {
  const d = document.getElementById('moreDrawer');
  if (d) {
    d.classList.remove('open');
    d.style.display = 'none';     // بستن قطعی
  }
  _hideDrawerOverlay();
  // دکمه بستن را هم پاک کن تا دفعه بعد تازه ساخته شود
  const x = document.getElementById('drawerCloseBtn');
  if (x) x.remove();
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
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1095;';
    ov.addEventListener('click', closeDrawer);
    ov.addEventListener('touchstart', function(e){ e.preventDefault(); closeDrawer(); });
    document.body.appendChild(ov);
  }
  ov.style.display = 'block';

  // افزودن دکمه بستن واضح به بالای خود منو (اگر نبود)
  const drawer = document.getElementById('moreDrawer');
  if (drawer && !document.getElementById('drawerCloseBtn')) {
    const x = document.createElement('button');
    x.id = 'drawerCloseBtn';
    x.innerHTML = '✕ بستن';
    x.style.cssText = 'display:block;width:calc(100% - 16px);margin:8px;padding:12px;background:#1565C0;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;';
    x.addEventListener('click', closeDrawer);
    drawer.insertBefore(x, drawer.firstChild);
  }
}
function _hideDrawerOverlay() {
  const ov = document.getElementById('drawerOverlay');
  if (ov) ov.style.display = 'none';
}

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

/* ===== تضمین بستن drawer با گزینه‌ها و overlay ===== */
document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.getElementById('moreDrawer');
  if (drawer) {
    drawer.querySelectorAll('.drawer-item').forEach(function (b) {
      b.addEventListener('click', function () { setTimeout(closeDrawer, 10); });
    });
  }
});
