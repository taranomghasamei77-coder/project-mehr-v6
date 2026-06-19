// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// api.js — توابع کمکی مشترک  v6.0

/* ===== HTML ESCAPING (XSS PROTECTION) ===== */
function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* ===== لاگ فعالیت ===== */
async function addLog(type, title, detail) {
  try {
    const userName = getCurrentUser()?.full_name || '—';
    await sbLog.add(type, title, detail, userName);
  } catch(e) {
    console.warn('addLog:', e.message);
  }
}

/* ===== Toast ===== */
function toastOk(msg) {
  _showToast(msg, 'success');
}
function toastErr(msg) {
  _showToast(msg, 'error');
}
function _showToast(msg, type) {
  let t = document.getElementById('toastMsg');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast-msg show ' + (type === 'error' ? 'toast-err' : 'toast-ok');
  setTimeout(() => t.classList.remove('show'), 3200);
}

/* ===== Confirm Dialog ===== */
function showConfirm(msg, title = 'تأیید', icon = '⚠️') {
  return new Promise(resolve => {
    if (confirm((title ? title + '\n' : '') + msg)) resolve(true);
    else resolve(false);
  });
}

/* ===== داشبورد ===== */
function updateDashboard() {
  const doneCount  = activities.filter(a => a.done).length;
  const totalCount = activities.length;
  const pct        = totalCount ? Math.round(doneCount / totalCount * 100) : 0;

  const elDone    = document.getElementById('dashActivitiesDone');
  const elTotal   = document.getElementById('dashActivitiesTotal');
  const elPct     = document.getElementById('dashPct');
  const elMembers = document.getElementById('dashMembers');
  const elSchools = document.getElementById('dashSchools');

  if (elDone)    elDone.textContent    = doneCount;
  if (elTotal)   elTotal.textContent   = totalCount;
  if (elPct)     elPct.textContent     = pct + '%';
  if (elMembers) elMembers.textContent = members.length;
  if (elSchools) elSchools.textContent = schools.length;

  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = pct + '%';
}
