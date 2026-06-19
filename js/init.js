// Event bindings + initialization
// PWA Install prompt
var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  var bar = document.getElementById('pwaInstallBar');
  if (bar) bar.style.display = 'flex';
});
document.addEventListener('DOMContentLoaded', function() {

  /* ===== PWA INSTALL ===== */
  var pwaBtn = document.getElementById('pwaInstallBtn');
  if (pwaBtn) {
    pwaBtn.addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(r) {
          deferredPrompt = null;
          document.getElementById('pwaInstallBar').style.display = 'none';
        });
      }
    });
  }
  var pwaDismiss = document.getElementById('pwaInstallDismissBtn');
  if (pwaDismiss) pwaDismiss.addEventListener('click', function() {
    document.getElementById('pwaInstallBar').style.display = 'none';
  });

  /* ===== NAVBAR ===== */
  var hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleMenu);

  var navHome = document.getElementById('navBtnHome');
  if (navHome) navHome.addEventListener('click', goHome);

  var navInspector = document.getElementById('navBtnInspector');
  if (navInspector) navInspector.addEventListener('click', openInspectorPanel);

  var navLogout = document.getElementById('navBtnLogout');
  if (navLogout) navLogout.addEventListener('click', logout);

  /* ===== DROPDOWN LINKS (data-section) ===== */
  document.querySelectorAll('a[data-section]').forEach(function(el) {
    el.addEventListener('click', function() { showSection(this.dataset.section); });
  });

  /* ===== TAB BAR ===== */
  var tabHome = document.getElementById('tab-home');
  if (tabHome) tabHome.addEventListener('click', tabGoHome);

  var tabActivities = document.getElementById('tab-activities');
  if (tabActivities) tabActivities.addEventListener('click', function() { tabShow('activitiesSection', 'tab-activities'); });

  var tabReport = document.getElementById('tab-report');
  if (tabReport) tabReport.addEventListener('click', function() { tabShow('reportSection', 'tab-report'); });

  var tabSchools = document.getElementById('tab-schools');
  if (tabSchools) tabSchools.addEventListener('click', function() { tabShow('schoolsSection', 'tab-schools'); });

  var tabMore = document.getElementById('tab-more');
  if (tabMore) tabMore.addEventListener('click', toggleDrawer);

  /* ===== DRAWER ===== */
  var drawerMap = {
    'drawer-users':     function() { drawerShow('usersSection'); },
    'drawer-members':   function() { drawerShow('membersSection'); },
    'drawer-groups':    function() { drawerShow('groupsSection'); },
    'drawer-documents': function() { drawerShow('documentsSection'); },
    'drawer-meetings':  function() { drawerShow('meetingsSection'); },
    'drawer-reports':   function() { drawerShow('reportsSection'); },
    'drawer-forms':     function() { drawerShow('formsSection'); },
    'drawer-chart':     function() { drawerShow('chartSection'); },
    'drawer-ranking':   function() { drawerShow('rankingSection'); },
    'drawer-observer':  function() { drawerShow('observerSection'); },
    'drawer-backup':    function() { drawerShow('backupSection'); },
    'drawer-inspector': openInspectorPanel,
    'drawer-logout':    logout
  };
  Object.keys(drawerMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', drawerMap[id]);
  });

  /* ===== QUICK ACCESS BUTTONS (data-section) ===== */
  document.querySelectorAll('button[data-section]').forEach(function(el) {
    el.addEventListener('click', function() { showSection(this.dataset.section); });
    // restore hover effects via mouseover/mouseout
    el.addEventListener('mouseover', function() { this.style.background = '#DCEEFB'; });
    el.addEventListener('mouseout',  function() { this.style.background = 'var(--primary-pale)'; });
  });

  /* ===== LOGIN ===== */
  var loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', login);

  // Enter key on login inputs
  var fullnameInput = document.getElementById("loginCode");
  if (fullnameInput) fullnameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('personnelCode').focus();
  });
  var personnelCodeInput = document.getElementById('personnelCode');
  if (personnelCodeInput) personnelCodeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') login();
  });

  /* ===== REPORT SECTION ===== */
  var previewReportBtn = document.getElementById('previewReportBtn');
  if (previewReportBtn) previewReportBtn.addEventListener('click', previewReport);

  var sendReportWaBtn = document.getElementById('sendReportWaBtn');
  if (sendReportWaBtn) sendReportWaBtn.addEventListener('click', sendReportWhatsapp);

  var printReportBtn = document.getElementById('printReportBtn');
  if (printReportBtn) printReportBtn.addEventListener('click', printReport);

  var sendReportWaBtn2 = document.getElementById('sendReportWaBtn2');
  if (sendReportWaBtn2) sendReportWaBtn2.addEventListener('click', sendReportWhatsapp);

  var printReportBtn2 = document.getElementById('printReportBtn2');
  if (printReportBtn2) printReportBtn2.addEventListener('click', printReport);

  /* ===== USERS ===== */
  var addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) addUserBtn.addEventListener('click', addUser);

  /* ===== MEMBERS ===== */
  var addMemberBtn = document.getElementById('addMemberBtn');
  if (addMemberBtn) addMemberBtn.addEventListener('click', addMember);

  /* ===== DOCUMENTS ===== */
  var saveDocumentBtn = document.getElementById('saveDocumentBtn');
  if (saveDocumentBtn) saveDocumentBtn.addEventListener('click', saveDocument);

  /* ===== MEETINGS ===== */
  var saveMeetingBtn = document.getElementById('saveMeetingBtn');
  if (saveMeetingBtn) saveMeetingBtn.addEventListener('click', saveMeeting);

  var printMeetingsBtn = document.getElementById('printMeetingsBtn');
  if (printMeetingsBtn) printMeetingsBtn.addEventListener('click', function() { window.print(); });

  /* ===== FINAL REPORT ===== */
  var generateFinalReportBtn = document.getElementById('generateFinalReportBtn');
  if (generateFinalReportBtn) generateFinalReportBtn.addEventListener('click', generateFinalReport);

  var printFinalReportBtn = document.getElementById('printFinalReportBtn');
  if (printFinalReportBtn) printFinalReportBtn.addEventListener('click', function() { window.print(); });

  /* ===== SCHOOLS ===== */
  var addSchoolBtn = document.getElementById('addSchoolBtn');
  if (addSchoolBtn) addSchoolBtn.addEventListener('click', addSchool);

  /* ===== OBSERVER ===== */
  var saveObserverReportBtn = document.getElementById('saveObserverReportBtn');
  if (saveObserverReportBtn) saveObserverReportBtn.addEventListener('click', saveObserverReport);

  /* ===== FORMS ===== */
  [1,2,3,4,5].forEach(function(n) {
    var btn = document.getElementById('saveForm' + n + 'Btn');
    if (btn) btn.addEventListener('click', function() { saveForm(n); });
  });

  /* ===== CHARTS ===== */
  var refreshChartsBtn = document.getElementById('refreshChartsBtn');
  if (refreshChartsBtn) refreshChartsBtn.addEventListener('click', renderCharts);

  /* ===== BACKUP ===== */
  var backupDataBtn = document.getElementById('backupDataBtn');
  if (backupDataBtn) backupDataBtn.addEventListener('click', backupData);

  var exportExcelBtn = document.getElementById('exportExcelBtn');
  if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportExcel);

  var restoreDataBtn = document.getElementById('restoreDataBtn');
  if (restoreDataBtn) restoreDataBtn.addEventListener('click', restoreData);

  /* ===== LOGS ===== */
  var exportLogBtn = document.getElementById('exportLogBtn');
  if (exportLogBtn) exportLogBtn.addEventListener('click', exportLog);

  var clearLogBtn = document.getElementById('clearLogBtn');
  if (clearLogBtn) clearLogBtn.addEventListener('click', clearLog);

  /* ===== INSPECTOR PANEL ===== */
  var closeInspectorBtn = document.getElementById('closeInspectorBtn');
  if (closeInspectorBtn) closeInspectorBtn.addEventListener('click', closeInspectorPanel);

  var inspectorLoginBtn = document.getElementById('inspectorLoginBtn');
  if (inspectorLoginBtn) inspectorLoginBtn.addEventListener('click', checkInspectorPassword);

  var inspectorCancelBtn = document.getElementById('inspectorCancelBtn');
  if (inspectorCancelBtn) inspectorCancelBtn.addEventListener('click', cancelInspectorPanel);

  var inspectorPasswordInput = document.getElementById('inspectorPassword');
  if (inspectorPasswordInput) inspectorPasswordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') checkInspectorPassword();
  });

  /* ===== GROUP MANAGERS (data-gm inputs) ===== */
  document.querySelectorAll('input[data-gm]').forEach(function(el) {
    el.addEventListener('change', saveGroupManagers);
  });

  /* ===== EVENT DELEGATION — dynamic innerHTML buttons ===== */
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) {
      // dashboard action buttons (data-action-fn)
      var fnBtn = e.target.closest('[data-action-fn]');
      if (fnBtn) {
        var fn = fnBtn.dataset.actionFn;
        // fn is a string like "showSection('activitiesSection')"
        // safely parse and call
        var match = fn.match(/^(\w+)\('([^']+)'\)$/);
        if (match) {
          var funcName = match[1];
          var arg = match[2];
          if (typeof window[funcName] === 'function') window[funcName](arg);
        }
      }
      return;
    }

    var action = btn.dataset.action;
    var rawId = btn.dataset.id;
    var id = parseInt(rawId);
    if (isNaN(id)) id = rawId; // UUID-based ids (profiles) stay as string

    switch (action) {
      case 'editUser':        editUser(id); break;
      case 'deleteUser':      deleteUser(id); break;
      case 'approveUser':     approveUser(id); break;
      case 'editMember':      editMember(id); break;
      case 'deleteMember':    deleteMember(id); break;
      case 'toggleActivity':  toggleActivity(id); break;
      case 'deleteDocument':  deleteDocument(id); break;
      case 'deleteMeeting':   deleteMeeting(id); break;
      case 'deleteSchool':    deleteSchool(id); break;
      case 'resendWhatsapp':  resendWhatsapp(id); break;
      case 'deleteReport':    deleteReport(id); break;
    }
  });

  /* ===== checkboxes for activities use data-action via delegation above ===== */

});
window.addEventListener('appinstalled', function() {
  var bar = document.getElementById('pwaInstallBar');
  if (bar) bar.style.display = 'none';
  deferredPrompt = null;
});

/* ===== GROUP MANAGERS — Supabase ===== */
async function saveGroupManagers() {
  for (let i = 1; i <= 10; i++) {
    const el = document.getElementById('gm' + i);
    if (el && el.value.trim()) {
      try { await sbGroupManagers.save(i, el.value.trim()); } catch(e) {}
    }
  }
}
async function loadGroupManagers() {
  try {
    const rows = await sbGroupManagers.getAll();
    rows.forEach(r => {
      const el = document.getElementById('gm' + r.group_num);
      if (el) el.value = r.name || '';
    });
  } catch(e) { console.error('loadGroupManagers:', e); }
}

/* ===== REPORTS — آرایه در حافظه (بارگذاری در login) ===== */

function buildReportText() {
  const group   = document.getElementById('rptGroup').value;
  const name    = document.getElementById('rptName').value.trim();
  const period  = document.getElementById('rptPeriod').value;
  const done    = document.getElementById('rptDone').value.trim();
  const issues  = document.getElementById('rptIssues').value.trim();
  const progress= document.getElementById('rptProgress').value;
  const now     = new Date().toLocaleDateString('fa-IR');
  if (!group) { toastErr('کارگروه را انتخاب کنید'); return null; }
  if (!name)  { toastErr('نام مسئول را وارد کنید'); return null; }
  if (!done)  { toastErr('فعالیت‌های انجام‌شده را بنویسید'); return null; }
  return { group, name, period, done, issues, progress, date: now };
}

function previewReport() {
  const r = buildReportText(); if (!r) return;
  const box = document.getElementById('rptPreviewBox');
  const content = document.getElementById('rptPreviewContent');
  content.innerHTML = buildReportHTML(r);
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth' });
}

function buildReportHTML(r) {
  const lines = r.done.split('\n').filter(l => l.trim()).map((l,i) => `<li style="margin-bottom:4px;">${escapeHtml(l.trim())}</li>`).join('');
  const issuesLine = r.issues ? `<p style="margin:6px 0;"><strong>⚠️ موانع:</strong> ${escapeHtml(r.issues)}</p>` : '';
  return `
    <div style="font-family:inherit;direction:rtl;text-align:right;">
      <h3 style="color:var(--primary);margin:0 0 10px;">🏛 گزارش پروژه مهر — ناحیه ۴ شیراز</h3>
      <p style="color:#888;font-size:12px;margin:0 0 12px;">📅 تاریخ ارسال: ${escapeHtml(r.date)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;">
        <tr style="background:var(--primary-pale);">
          <td style="padding:6px 10px;border:1px solid var(--gray-line);font-weight:bold;width:35%;">کارگروه</td>
          <td style="padding:6px 10px;border:1px solid var(--gray-line);">${escapeHtml(r.group)}</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid var(--gray-line);font-weight:bold;">مسئول گزارش</td>
          <td style="padding:6px 10px;border:1px solid var(--gray-line);">${escapeHtml(r.name)}</td>
        </tr>
        <tr style="background:var(--primary-pale);">
          <td style="padding:6px 10px;border:1px solid var(--gray-line);font-weight:bold;">دوره گزارش</td>
          <td style="padding:6px 10px;border:1px solid var(--gray-line);">${escapeHtml(r.period)}</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;border:1px solid var(--gray-line);font-weight:bold;">درصد پیشرفت</td>
          <td style="padding:6px 10px;border:1px solid var(--gray-line);">${escapeHtml(r.progress)}</td>
        </tr>
      </table>
      <p style="font-weight:bold;margin:10px 0 4px;">✅ فعالیت‌های انجام‌شده:</p>
      <ul style="margin:0 0 10px 20px;padding:0;font-size:13px;">${lines}</ul>
      ${issuesLine}
      <p style="font-size:11px;color:#aaa;margin-top:12px;border-top:1px solid #eee;padding-top:8px;">سامانه جامع پروژه مهر — ناحیه ۴ شیراز</p>
    </div>`;
}

function buildReportPlainText(r) {
  const lines = r.done.split('\n').filter(l => l.trim()).map((l,i) => `• ${l.trim()}`).join('\n');
  const issuesLine = r.issues ? `\n⚠️ موانع: ${r.issues}` : '';
  return `🏛 گزارش پروژه مهر — ناحیه ۴ شیراز
📅 تاریخ: ${r.date}
━━━━━━━━━━━━━━━━
📋 کارگروه: ${r.group}
👤 مسئول: ${r.name}
🗓 دوره: ${r.period}
📊 پیشرفت: ${r.progress}
━━━━━━━━━━━━━━━━
✅ فعالیت‌های انجام‌شده:
${lines}${issuesLine}
━━━━━━━━━━━━━━━━
سامانه جامع پروژه مهر`;
}

async function sendReportWhatsapp() {
  const r = buildReportText(); if (!r) return;
  try {
    const [created] = await sbReports.add(r);
    reports.push(created);
  } catch(e) { reports.push({ ...r, id: Date.now() }); }
  renderReportsList();
  const text = encodeURIComponent(buildReportPlainText(r));
  window.open('https://wa.me/?text=' + text, '_blank');
}

async function printReport() {
  const r = buildReportText(); if (!r) return;
  try {
    const [created] = await sbReports.add(r);
    reports.push(created);
  } catch(e) { reports.push({ ...r, id: Date.now() }); }
  renderReportsList();
  const html = `<!DOCTYPE html><html dir="rtl" lang="fa">
<head><meta charset="UTF-8"><title>گزارش پروژه مهر</title>
<style>
  body { font-family: Tahoma, Arial, sans-serif; direction: rtl; text-align: right; padding: 30px; color: #222; }
  h3 { color: #1565C0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  td { padding: 7px 12px; border: 1px solid #bbb; font-size: 13px; }
  tr:nth-child(odd) { background: #E3F2FD; }
  ul { font-size: 13px; margin: 4px 0 10px 20px; }
  @media print { body { padding: 10px; } }
</style></head>
<body>${buildReportHTML(r)}</body></html>`;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

function renderReportsList() {
  const container = document.getElementById('reportsList'); if (!container) return;
  if (!reports.length) { container.innerHTML = '<div class="empty-state"><div class="empty-ico">📭</div><div class="empty-text">هنوز گزارشی ثبت نشده است.</div></div>'; return; }
  container.innerHTML = [...reports].reverse().map(r => `
    <div class="info-card" style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
        <strong>📋 ${escapeHtml(r.group || r.group_name || '')}</strong>
        <span style="font-size:12px;color:#888;">📅 ${escapeHtml(r.date || '')}</span>
      </div>
      <p style="font-size:13px;margin:4px 0;">👤 ${escapeHtml(r.name || '')} &nbsp;|&nbsp; 🗓 ${escapeHtml(r.period || '')} &nbsp;|&nbsp; 📊 ${escapeHtml(r.progress || '')}</p>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
        <button class="btn btn-white" style="font-size:12px;padding:5px 10px;" data-action="resendWhatsapp" data-id="${r.id}">💬 ارسال مجدد</button>
        <button class="btn btn-danger" style="font-size:12px;padding:5px 10px;" data-action="deleteReport" data-id="${r.id}">🗑️ حذف</button>
      </div>
    </div>`).join('');
}

function resendWhatsapp(id) {
  const r = reports.find(x => x.id === id); if (!r) return;
  window.open('https://wa.me/?text=' + encodeURIComponent(buildReportPlainText(r)), '_blank');
}
async function deleteReport(id) {
  const ok = await showConfirm('این گزارش حذف شود؟', 'حذف گزارش', '🗑️');
  if (!ok) return;
  try {
    await sbReports.remove(id);
    reports = reports.filter(r => String(r.id) !== String(id));
    renderReportsList();
    toastOk('گزارش حذف شد');
  } catch(e) {
    toastErr('خطا در حذف گزارش: ' + e.message);
  }
}
