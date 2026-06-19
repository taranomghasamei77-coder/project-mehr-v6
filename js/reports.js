// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// reports.js — گزارش نهایی و کارگروه‌ها  v5.9.0

const groupNames = [
  'ساماندهی نیروی انسانی','ثبت‌نام دانش‌آموزان','کیفیت‌بخشی آموزشی','تعمیر و تجهیز',
  'فناوری و آموزش مجازی','سلامت و بهداشت','مشارکت مردمی','اطلاع‌رسانی و رسانه',
  'فرهنگی و تربیتی','ایثار و مقاومت'
];

/* ===== حافظه محلی برای گزارش‌های ارسال‌شده ===== */
let reports = [];

async function loadReports() {
  try { reports = await sbReports.getAll(); }
  catch(e) { console.error('loadReports:', e); reports = []; }
}

/* ===== گزارش کارگروهی (render فقط) ===== */
function generateFinalReport() {
  const done     = activities.filter(a => a.done).length;
  const progress = Math.round((done / 84) * 100);
  const s = (id, v) => { const e = document.getElementById(id); if (e) e.innerText = v; };
  s('reportProgress', progress + '%');
  s('reportScore', progress);
  s('reportDocuments', documents.length);
  s('reportMeetings',  meetings.length);
  generateGroupReport();
  const statusText = progress >= 80 ? 'آماده بازگشایی' : progress >= 40 ? 'در حال آماده‌سازی' : 'نیازمند پیگیری';
  const el = document.getElementById('finalReport');
  if (el) el.value =
`گزارش نهایی پروژه مهر — ناحیه ۴ شیراز
====================================================
فعالیت انجام‌شده: ${done} از 84
درصد پیشرفت: ${progress}%
امتیاز نهایی: ${progress} از 100
مستندات: ${documents.length}   |   جلسات: ${meetings.length}
مدارس ثبت‌شده: ${schools.length}   |   اعضای کارگروه: ${members.length}
وضعیت: ${statusText}
====================================================`;
}

function generateGroupReport() {
  const t = document.getElementById('groupReportTable'); if (!t) return;
  t.innerHTML = '';
  groupNames.forEach(g => {
    const count = members.filter(m => (m.group || m.group_name) === g).length;
    t.innerHTML += `<tr><td>${escapeHtml(g)}</td><td>${count} نفر</td></tr>`;
  });
}

/* ===== لیست گزارش‌های ارسال‌شده ===== */
async function renderReportsList() {
  const t = document.getElementById('reportsListTable'); if (!t) return;
  t.innerHTML = '';
  if (!reports.length) {
    t.innerHTML = '<tr><td colspan="6" style="padding:0;border:none;"><div class="empty-state"><div class="empty-ico">📤</div><div class="empty-text">هنوز گزارشی ارسال نشده است.</div></div></td></tr>';
    return;
  }
  reports.forEach((r, i) => {
    t.innerHTML += `<tr>
      <td>${i+1}</td>
      <td>${escapeHtml(r.group_name || r.group || '')}</td>
      <td>${escapeHtml(r.name || '')}</td>
      <td>${escapeHtml(r.period || '')}</td>
      <td>${escapeHtml(r.date || '')}</td>
      <td><button class="btn btn-danger" style="padding:4px 8px;font-size:11px;" data-action="deleteReport" data-id="${r.id}">🗑️</button></td>
    </tr>`;
  });
}

async function deleteReport(id) {
  try {
    await sbReports.remove(id);
    reports = reports.filter(r => String(r.id) !== String(id));
    renderReportsList();
  } catch(e) {
    toastErr('خطا در حذف گزارش: ' + e.message);
  }
}
