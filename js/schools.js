// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// schools.js — مدارس، مستندات، صورتجلسات، ناظر  v6.0

/* ===== حافظه محلی ===== */
let documents       = [];
let meetings        = [];
let schools         = [];
let observerReports = [];

/* ===== بارگذاری از Supabase ===== */
async function loadDocuments() {
  try { documents = await sbDocuments.getAll(); }
  catch(e) { console.error('loadDocuments:', e); documents = []; }
}
async function loadMeetings() {
  try { meetings = await sbMeetings.getAll(); }
  catch(e) { console.error('loadMeetings:', e); meetings = []; }
}
async function loadSchools() {
  try { schools = await sbSchools.getAll(); }
  catch(e) { console.error('loadSchools:', e); schools = []; }
}
async function loadObserverReports() {
  try { observerReports = await sbObserver.getAll(); }
  catch(e) { console.error('loadObserverReports:', e); observerReports = []; }
}

/* ===== DOCUMENTS — آپلود در Storage ===== */

function loadActivitiesToDocuments() {
  const sel = document.getElementById('documentActivity'); if (!sel) return;
  sel.innerHTML = '';
  activities.forEach(a => { sel.innerHTML += `<option value="${a.id}">${a.id} - ${escapeHtml(a.title)}</option>`; });
}

async function saveDocument() {
  const title    = document.getElementById('documentTitle').value.trim();
  const activity = document.getElementById('documentActivity').value;
  const type     = document.getElementById('documentType').value;
  const fi       = document.getElementById('documentFile');
  const file     = fi.files[0];
  if (!title) { toastErr('عنوان مستند را وارد کنید'); return; }
  if (!file)  { toastErr('فایل انتخاب نشده است'); return; }

  const MAX_SIZE = 50 * 1024 * 1024; // ۵۰MB — Storage محدودیت base64 ندارد
  if (file.size > MAX_SIZE) {
    toastErr('حجم فایل بیش از ۵۰ مگابایت است.');
    fi.value = '';
    return;
  }

  try {
    toastOk('در حال آپلود...');

    // آپلود در Supabase Storage
    const { publicUrl } = await uploadFile('school-files', file);

    // ذخیره فقط لینک در دیتابیس (نه base64)
    const docData = {
      title,
      activity_id: activity,
      type,
      file_name: file.name,
      file_url:  publicUrl
    };
    const result = await sbDocuments.add(docData);
    const created = Array.isArray(result) ? result[0] : result;
    documents.push(created);
    renderDocuments();

    document.getElementById('documentTitle').value = '';
    fi.value = '';
    const msg = document.getElementById('docSavedMsg');
    if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 3000); }
    toastOk('مستند با موفقیت آپلود شد');
  } catch(err) {
    toastErr('خطا در آپلود مستند: ' + err.message);
  }
}

async function deleteDocument(id) {
  try {
    await sbDocuments.remove(id);
    documents = documents.filter(d => String(d.id) !== String(id));
    renderDocuments();
  } catch(e) {
    toastErr('خطا در حذف مستند: ' + e.message);
  }
}

function renderDocuments() {
  const list = document.getElementById('documentsList'); if (!list) return;
  list.innerHTML = '';
  if (!documents.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-ico">📎</div><div class="empty-text">هنوز مستندی ثبت نشده است.</div></div>';
    return;
  }
  documents.forEach(doc => {
    const fileName = doc.file_name || '';
    const fileUrl  = doc.file_url  || '';
    const isImage  = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    const preview  = isImage
      ? `<div style="margin:10px 0;"><img src="${escapeHtml(fileUrl)}" alt="${escapeHtml(fileName)}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid #ddd;"></div>`
      : `<div style="font-size:28px;margin:6px 0;">${doc.type === 'PDF' ? '📕' : doc.type === 'Word' ? '📘' : doc.type === 'اکسل' ? '📗' : '📄'}</div>`;
    list.innerHTML += `<div class="info-card">
      <h4>📎 ${escapeHtml(doc.title)}</h4>
      <p>فعالیت: ${escapeHtml(String(doc.activity_id||''))} &nbsp;|&nbsp; نوع: ${escapeHtml(doc.type||'')} &nbsp;|&nbsp; فایل: ${escapeHtml(fileName)}</p>
      ${preview}
      ${fileUrl ? `<a href="${escapeHtml(fileUrl)}" target="_blank" download="${escapeHtml(fileName)}" class="btn btn-white" style="padding:6px 12px;font-size:12px;text-decoration:none;">⬇️ دانلود</a>` : ''}
      <button class="btn btn-danger" style="padding:6px 12px;font-size:12px;" data-action="deleteDocument" data-id="${doc.id}">🗑️ حذف</button>
    </div>`;
  });
}

/* ===== MEETINGS ===== */

async function saveMeeting() {
  const m = {
    number:      document.getElementById('meetingNumber').value,
    date:        document.getElementById('meetingDate').value,
    title:       document.getElementById('meetingTitle').value,
    members:     document.getElementById('meetingMembers').value,
    resolutions: document.getElementById('meetingResolutions').value,
    followup:    document.getElementById('meetingFollowup').value
  };
  if (!m.title) { toastErr('عنوان جلسه وارد نشده است'); return; }
  try {
    const result  = await sbMeetings.add(m);
    const created = Array.isArray(result) ? result[0] : result;
    meetings.push(created);
    renderMeetings();
    ['meetingNumber','meetingDate','meetingTitle','meetingMembers','meetingResolutions','meetingFollowup']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch(e) {
    toastErr('خطا در ذخیره صورتجلسه: ' + e.message);
  }
}

async function deleteMeeting(id) {
  try {
    await sbMeetings.remove(id);
    meetings = meetings.filter(m => String(m.id) !== String(id));
    renderMeetings();
  } catch(e) {
    toastErr('خطا در حذف صورتجلسه: ' + e.message);
  }
}

function renderMeetings() {
  const list = document.getElementById('meetingsList'); if (!list) return;
  list.innerHTML = '';
  if (!meetings.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-ico">📝</div><div class="empty-text">هنوز صورتجلسه‌ای ثبت نشده است.</div></div>';
    return;
  }
  meetings.forEach(m => {
    list.innerHTML += `<div class="info-card">
      <h4>📝 جلسه شماره ${escapeHtml(m.number || '')} — ${escapeHtml(m.title)}</h4>
      <p>📅 تاریخ: ${escapeHtml(m.date || '')}</p>
      <p>👥 اعضای حاضر: ${escapeHtml(m.members || '')}</p>
      <p>✅ مصوبات: ${escapeHtml(m.resolutions || '')}</p>
      <p>👤 مسئول پیگیری: ${escapeHtml(m.followup || '')}</p>
      <button class="btn btn-danger" style="padding:5px 10px;font-size:12px;margin-top:8px;" data-action="deleteMeeting" data-id="${m.id}">🗑️ حذف</button>
    </div>`;
  });
}

/* ===== SCHOOLS ===== */

async function addSchool() {
  const name    = document.getElementById('schoolName').value.trim();
  const code    = document.getElementById('schoolCode').value.trim();
  const manager = document.getElementById('schoolManager').value.trim();
  const level   = document.getElementById('schoolLevel').value;
  if (!name || !code) { toastErr('نام و کد مدرسه الزامی است'); return; }
  if (schools.find(s => s.code === code)) {
    toastErr('مدرسه‌ای با کد «' + code + '» قبلاً ثبت شده است');
    return;
  }
  try {
    const result  = await sbSchools.add({ name, code, manager, level, score: 0 });
    const created = Array.isArray(result) ? result[0] : result;
    schools.push(created);
    renderSchools();
    await addLog('add', 'افزودن مدرسه', `${name} (کد: ${code}) اضافه شد`);
    toastOk('مدرسه «' + name + '» ثبت شد');
    document.getElementById('schoolName').value    = '';
    document.getElementById('schoolCode').value    = '';
    document.getElementById('schoolManager').value = '';
  } catch(e) {
    toastErr('خطا در ثبت مدرسه: ' + e.message);
  }
}

async function deleteSchool(id) {
  const s = schools.find(x => String(x.id) === String(id));
  try {
    await sbSchools.remove(id);
    schools = schools.filter(x => String(x.id) !== String(id));
    renderSchools();
    if (s) {
      await addLog('delete', 'حذف مدرسه', `${s.name} (کد: ${s.code||''}) حذف شد`);
      toastOk('مدرسه حذف شد');
    }
  } catch(e) {
    toastErr('خطا در حذف مدرسه: ' + e.message);
  }
}

function renderSchools() {
  const t = document.getElementById('schoolsTable'); if (!t) return;
  t.innerHTML = '';
  schools.forEach((s, i) => {
    t.innerHTML += `<tr><td>${i+1}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.code||'')}</td><td>${escapeHtml(s.manager||'')}</td><td>${escapeHtml(s.level||'')}</td>
    <td><button class="btn btn-danger" style="padding:5px 10px;font-size:12px;" data-action="deleteSchool" data-id="${s.id}">🗑️</button></td></tr>`;
  });
  generateRanking();
}

function generateRanking() {
  const ranking = [...schools].sort((a, b) => (b.score || 0) - (a.score || 0));
  const t = document.getElementById('rankingTable'); if (!t) return;
  t.innerHTML = '';
  if (!ranking.length) {
    t.innerHTML = '<tr><td colspan="5" style="padding:0;border:none;"><div class="empty-state"><div class="empty-ico">🏆</div><div class="empty-text">هنوز مدرسه‌ای ثبت نشده است.</div></div></td></tr>';
    return;
  }
  const medals = ['🥇','🥈','🥉'];
  ranking.forEach((s, i) => {
    t.innerHTML += `<tr><td>${medals[i] || (i+1)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.level||'')}</td><td>${escapeHtml(s.manager||'')}</td><td><strong>${escapeHtml(String(s.score||0))}</strong></td></tr>`;
  });
}

/* ===== OBSERVER ===== */

function populateObserverSchoolSelect() {
  const sel = document.getElementById('observerSchoolSelect'); if (!sel) return;
  sel.innerHTML = '';
  if (!schools.length) { sel.innerHTML = '<option>ابتدا مدرسه ثبت کنید</option>'; return; }
  schools.forEach(s => { sel.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)}</option>`; });
}

async function saveObserverReport() {
  const schoolId = document.getElementById('observerSchoolSelect').value;
  const report   = document.getElementById('observerReport').value.trim();
  const score    = parseInt(document.getElementById('observerScore').value) || 0;
  if (!report) { toastErr('گزارش بازدید وارد نشده است'); return; }
  const school = schools.find(s => String(s.id) === String(schoolId));
  try {
    if (school) {
      await sbSchools.update(school.id, { score });
      school.score = score;
    }
    const result  = await sbObserver.add({
      school_id:   schoolId,
      school_name: school ? school.name : 'نامشخص',
      report, score,
      date: new Date().toLocaleDateString('fa-IR')
    });
    const created = Array.isArray(result) ? result[0] : result;
    observerReports.push(created);
    toastOk('گزارش بازدید ثبت شد');
    renderObserverReports();
    renderSchools();
    document.getElementById('observerReport').value = '';
    document.getElementById('observerScore').value  = '';
  } catch(e) {
    toastErr('خطا در ثبت گزارش: ' + e.message);
  }
}

function renderObserverReports() {
  const div = document.getElementById('observerList'); if (!div) return;
  div.innerHTML = '';
  if (!observerReports.length) {
    div.innerHTML = '<div class="empty-state"><div class="empty-ico">🔍</div><div class="empty-text">هنوز ارزیابی‌ای ثبت نشده است.</div></div>';
    return;
  }
  observerReports.forEach(r => {
    const sName = r.school_name || 'نامشخص';
    div.innerHTML += `<div class="info-card">
      <h4>🏫 ${escapeHtml(sName)}</h4>
      <p>${escapeHtml(r.report)}</p>
      <p>⭐ امتیاز: <strong style="color:var(--gold);font-size:18px;">${escapeHtml(String(r.score||0))}</strong> از ۱۰۰</p>
      <p style="color:#aaa;font-size:12px;">📅 ${escapeHtml(r.date||'')}</p>
    </div>`;
  });
}
