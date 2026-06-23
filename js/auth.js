// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// auth.js — احراز هویت Supabase Auth  v6.4
// جریان: ثبت‌نام → ساخت کاربر در Auth با approved=false → تأیید ناظر → ورود

/* ===== وضعیت کاربر جاری ===== */
let _currentUser = null;

function getCurrentUser() { return _currentUser; }

/* ===== ساخت ایمیل داخلی از روی کد پرسنلی ===== */
// نکته: دامنه باید واقعی و دارای MX باشد وگرنه Supabase خطای
// «Email address is invalid» می‌دهد. gmail.com مطمئن‌ترین گزینه است.
// کاربر این ایمیل را نمی‌بیند و واقعی بودنش لازم نیست، چون «Confirm email» خاموش است.
function _codeToEmail(code) {
  const clean = String(code).trim()
    .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
    .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .replace(/\D/g, '');
  return `mehr.p${clean}@gmail.com`;
}

/* ===== ورود با کد پرسنلی و رمز ===== */
async function login() {
  const code     = document.getElementById('loginCode').value.trim();
  const password = document.getElementById('personnelCode').value.trim();

  if (!code || !password) { toastErr('کد پرسنلی و رمز عبور را وارد کنید.'); return; }

  const email = _codeToEmail(code);
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) { loginBtn.disabled = true; loginBtn.innerText = '⏳ در حال ورود...'; }

  try {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authUser = data.user;

    // دریافت پروفایل
    let profile = null;
    try {
      profile = await safeQuery(() =>
        _supabase.from('profiles').select('*').eq('id', authUser.id).single()
      );
    } catch(e) {
      // اگر پروفایل وجود نداشت (trigger هنوز اجرا نشده)، یک پروفایل پیش‌فرض می‌سازیم
      console.warn('Profile not found, creating default:', e.message);
      await safeQuery(() =>
        _supabase.from('profiles').insert({
          id:             authUser.id,
          full_name:      authUser.email,
          role:           'teacher',
          personnel_code: code,
          approved:       false
        })
      );
      profile = { id: authUser.id, full_name: authUser.email, role: 'teacher', approved: false };
    }

    // اگر کاربر هنوز توسط ناظر تأیید نشده، اجازه ورود نده
    if (profile && profile.approved !== true) {
      await _supabase.auth.signOut();
      toastErr('حساب شما هنوز توسط ناظر منطقه تأیید نشده است. لطفاً پس از تأیید دوباره تلاش کنید.');
      return;
    }

    _currentUser = {
      id:        authUser.id,
      email:     authUser.email,
      role:      profile?.role || 'teacher',
      full_name: profile?.full_name || authUser.email
    };

    // لاگ ورود
    try {
      await sbLoginLog.add(authUser.id, authUser.email, _currentUser.role);
      await addLog('login', 'ورود به سامانه', `${_currentUser.full_name} (${_currentUser.role})`);
    } catch(e) { console.warn('login log failed:', e.message); }

    await _loadAllDataAndShowDashboard();

  } catch(e) {
    alert(JSON.stringify(e, null, 2));
    const msg = e.message === 'Invalid login credentials'
      ? 'کد پرسنلی یا رمز عبور اشتباه است.'
      : 'خطا در ورود: ' + e.message;
    toastErr(msg);
  } finally {
    if (loginBtn) { loginBtn.disabled = false; loginBtn.innerText = 'ورود به سامانه ←'; }
  }
}

/* ===== نمایش/مخفی‌کردن فرم ثبت‌نام ===== */
function showRegisterForm() {
  const loginCard = document.querySelector('#loginPage .card');   // اولین کارت = ورود
  if (loginCard) loginCard.style.display = 'none';
  const reg = document.getElementById('registerForm');
  if (reg) reg.style.display = 'block';
}
function hideRegisterForm() {
  const reg = document.getElementById('registerForm');
  if (reg) reg.style.display = 'none';
  const loginCard = document.querySelector('#loginPage .card');
  if (loginCard) loginCard.style.display = 'block';
}

/* ===== ثبت‌نام با کد پرسنلی (در انتظار تأیید ناظر) ===== */
// کاربر در Supabase Auth ساخته می‌شود ولی با approved=false.
// رمز را خود Supabase امن نگه می‌دارد (دیگر SHA256 دستی لازم نیست).
async function registerRequest() {
  if (window._registerBusy) return;
  window._registerBusy = true;

  const name     = document.getElementById('regName').value.trim();
  const code     = document.getElementById('regCode').value.trim();
  const school   = document.getElementById('regSchool').value.trim();
  const role     = document.getElementById('regRole').value;
  const password = document.getElementById('regPassword').value.trim();

  if (!name || !code || !password) {
    window._registerBusy = false;
    toastErr('نام، کد پرسنلی و رمز عبور را کامل وارد کنید.');
    return;
  }
  if (password.length < 6) {
    window._registerBusy = false;
    toastErr('رمز عبور باید حداقل ۶ کاراکتر باشد.');
    return;
  }
  // کد پرسنلی باید حداقل ۴ رقم باشد
  const codeDigits = String(code).replace(/\D/g, '');
  if (codeDigits.length < 4) {
    window._registerBusy = false;
    toastErr('کد پرسنلی باید حداقل ۴ رقم باشد.');
    return;
  }

  const regBtn = document.getElementById('registerSubmitBtn');
  if (regBtn) { regBtn.disabled = true; regBtn.innerText = '⏳ در حال ارسال...'; }

  try {
    const email = _codeToEmail(code);

    // ساخت کاربر در Supabase Auth. trigger پروفایل را با approved=false می‌سازد.
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:      name,
          role:           role,
          personnel_code: code,
          school_name:    school || null
        }
      }
    });

    if (error) {
      // خطاهای رایج را به فارسی ترجمه کن
      let msg = error.message;
      if (/already registered|already been registered|User already/i.test(msg)) {
        msg = 'این کد پرسنلی قبلاً ثبت شده است.';
      } else if (/invalid/i.test(msg) && /email/i.test(msg)) {
        msg = 'کد پرسنلی پذیرفته نشد. لطفاً فقط رقم وارد کنید و دوباره تلاش کنید.';
      } else if (/rate limit/i.test(msg)) {
        msg = 'تعداد درخواست‌ها زیاد بوده است. چند دقیقه بعد دوباره تلاش کنید.';
      } else if (/at least/i.test(msg) && /character/i.test(msg)) {
        msg = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
      }
      throw new Error(msg);
    }

    // signUp ممکن است session بسازد؛ خارج می‌شویم تا کاربر تأییدنشده وارد نماند.
    try { await _supabase.auth.signOut(); } catch(e) {}

    toastOk('درخواست ثبت‌نام شما ارسال شد. پس از تأیید ناظر منطقه می‌توانید وارد شوید.');
    hideRegisterForm();
    document.getElementById('regName').value     = '';
    document.getElementById('regCode').value     = '';
    document.getElementById('regSchool').value   = '';
    document.getElementById('regPassword').value = '';

  } catch(e) {
    toastErr('خطا در ثبت‌نام: ' + e.message);
  } finally {
    window._registerBusy = false;
    if (regBtn) { regBtn.disabled = false; regBtn.innerText = 'ارسال درخواست'; }
  }
}

/* ===== تأیید کاربر توسط ناظر ===== */
async function approveUser(id) {
  if (!_currentUser || !['admin','inspector'].includes(_currentUser.role)) {
    toastErr('شما اجازه تأیید کاربران را ندارید.');
    return;
  }
  try {
    await sbUsers.update(id, { approved: true });
    const idx = users.findIndex(u => String(u.id) === String(id));
    if (idx !== -1) users[idx].approved = true;
    renderUsers();
    if (typeof renderPendingUsers === 'function') renderPendingUsers();
    toastOk('کاربر تأیید شد و اکنون می‌تواند وارد شود.');
    await addLog('edit', 'تأیید کاربر', `کاربر با شناسه ${id} تأیید شد`);
  } catch(e) {
    toastErr('خطا در تأیید کاربر: ' + e.message);
  }
}

/* ===== رد/حذف درخواست توسط ناظر ===== */
async function rejectUser(id) {
  if (!_currentUser || !['admin','inspector'].includes(_currentUser.role)) {
    toastErr('شما اجازه حذف کاربران را ندارید.');
    return;
  }
  const ok = await showConfirm('این درخواست حذف شود؟', 'حذف درخواست', '🗑️');
  if (!ok) return;
  try {
    await sbUsers.remove(id);   // فقط پروفایل حذف می‌شود
    users = users.filter(u => String(u.id) !== String(id));
    renderUsers();
    if (typeof renderPendingUsers === 'function') renderPendingUsers();
    toastOk('درخواست حذف شد.');
    await addLog('delete', 'حذف درخواست کاربر', `کاربر با شناسه ${id} حذف شد`);
  } catch(e) {
    toastErr('خطا در حذف: ' + e.message);
  }
}

/* ===== لیست کاربران در انتظار تأیید (برای پنل ناظر) ===== */
function renderPendingUsers() {
  const box = document.getElementById('pendingUsersList');
  if (!box) return;
  const pending = (users || []).filter(u => u.approved !== true);
  if (!pending.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-ico">✅</div><div class="empty-text">درخواست در انتظار تأییدی وجود ندارد.</div></div>';
    return;
  }
  box.innerHTML = pending.map(u => `
    <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div>
        <b>${escapeHtml(u.full_name || '—')}</b>
        <div style="font-size:12px;color:#666;">کد پرسنلی: ${escapeHtml(u.personnel_code || '—')} — سمت: ${escapeHtml(u.role || '—')}${u.school_name ? ' — مدرسه: ' + escapeHtml(u.school_name) : ''}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-success" style="padding:6px 12px;font-size:13px;" data-action="approveUser" data-id="${u.id}">✔ تأیید</button>
        <button class="btn btn-danger"  style="padding:6px 12px;font-size:13px;" data-action="rejectUser"  data-id="${u.id}">✖ رد</button>
      </div>
    </div>`).join('');
}

/* ===== خروج ===== */
async function logout() {
  try { await addLog('logout', 'خروج از سامانه', _currentUser?.full_name || '—'); } catch(e) {}
  await _supabase.auth.signOut();
  _currentUser = null;

  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('mainNav').style.display    = 'none';
  document.getElementById('tabBar').style.display     = 'none';
  document.getElementById('moreDrawer').style.display = 'none';
  document.getElementById('moreDrawer').classList.remove('open');
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('siteBanner').style.display = 'block';
  document.querySelectorAll('.module-section').forEach(s => s.style.display = 'none');
}

/* ===== بازیابی Session بعد از رفرش ===== */
async function restoreSession() {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return false;

    const profile = await safeQuery(() =>
      _supabase.from('profiles').select('*').eq('id', session.user.id).single()
    ).catch(() => null);

    _currentUser = {
      id:        session.user.id,
      email:     session.user.email,
      role:      profile?.role || 'teacher',
      full_name: profile?.full_name || session.user.email
    };

    await _loadAllDataAndShowDashboard();
    return true;
  } catch(e) {
    console.warn('restoreSession:', e);
    return false;
  }
}

/* ===== بارگذاری داده‌ها و نمایش داشبورد ===== */
async function _loadAllDataAndShowDashboard() {
  await Promise.all([
    loadUsers(), loadMembers(), loadActivities(),
    loadDocuments(), loadMeetings(), loadSchools(),
    loadObserverReports(), loadReports()
  ]);
  await loadGroupManagers();

  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('mainNav').style.display = 'flex';
  document.getElementById('siteBanner').style.display = 'none';
  if (window.innerWidth <= 768) {
    document.getElementById('tabBar').style.display     = 'flex';
    document.getElementById('moreDrawer').style.display = 'block';
    document.getElementById('moreDrawer').classList.remove('open');
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'صبح بخیر،';
    if (h < 17) return 'ظهر بخیر،';
    return 'عصر بخیر،';
  }

  const greetEl = document.getElementById('dashGreeting');
  const nameEl  = document.getElementById('dashUserName');
  const roleEl  = document.getElementById('dashUserRole');
  if (greetEl) greetEl.textContent = getGreeting();
  if (nameEl)  nameEl.textContent  = _currentUser.full_name;
  if (roleEl)  roleEl.textContent  = _currentUser.role;

  updateDashboard();
  renderUsers(); renderMembers(); renderActivities();
  renderDocuments(); loadActivitiesToDocuments();
  renderMeetings(); renderSchools(); renderObserverReports();
  populateObserverSchoolSelect();
  renderReportsList();
}

/* ===== INSPECTOR PANEL ===== */
function openInspectorPanel() {
  document.getElementById('navMenu').classList.remove('open');
  if (_currentUser && ['inspector','admin'].includes(_currentUser.role)) {
    showSection('inspectorSection');
    renderInspectorPanel();
    return;
  }
  const modal = document.getElementById('inspectorModal');
  document.getElementById('inspectorPassword').value = '';
  document.getElementById('inspectorPassError').style.display = 'none';
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('inspectorPassword').focus(), 50);
}

const INSPECTOR_PASSWORD_HASH = '28619d4f2134176fc6593336c550318ac470d081f064b77a5b44629bba4002e9';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function cancelInspectorPanel() {
  document.getElementById('inspectorModal').style.display = 'none';
}

async function checkInspectorPassword() {
  const val  = document.getElementById('inspectorPassword').value;
  const hash = await sha256Hex(val);
  if (hash === INSPECTOR_PASSWORD_HASH) {
    document.getElementById('inspectorModal').style.display = 'none';
    showSection('inspectorSection');
    await renderInspectorPanel();
  } else {
    document.getElementById('inspectorPassError').style.display = 'block';
  }
}

function closeInspectorPanel() {
  document.querySelectorAll('.module-section').forEach(s => s.style.display = 'none');
  goHome();
}

async function renderInspectorPanel() {
  renderPendingUsers();   // لیست کاربران در انتظار تأیید

  const doneActivities = activities.filter(a => a.done).length;
  document.getElementById('insActivityDone').innerText = doneActivities + ' / 84';
  document.getElementById('insSchoolCount').innerText  = schools.length;

  try {
    const formRows = await sbForms.getAll();
    const formData = {};
    formRows.forEach(r => { formData[r.form_num] = r.data; });
    const formsDone = [1,2,3,4,5].filter(n =>
      formData[n] && Object.values(formData[n]).some(v => (v||'').toString().trim() !== '')
    ).length;
    document.getElementById('insFormsDone').innerText = formsDone + ' / 5';

    const formLabels = {
      1:'فرم ۱ — ثبت‌نام دانش‌آموزان', 2:'فرم ۲ — نیروی انسانی',
      3:'فرم ۳ — آماده‌سازی کلاس‌ها',  4:'فرم ۴ — ارزیابی کیفی',
      5:'فرم ۵ — گزارش نهایی'
    };
    const formsListEl = document.getElementById('insFormsList');
    if (formsListEl) {
      formsListEl.innerHTML = [1,2,3,4,5].map(n => {
        const filled = formData[n] && Object.values(formData[n]).some(v => (v||'').toString().trim() !== '');
        const badge  = filled
          ? '<span class="badge badge-success">تکمیل‌شده</span>'
          : '<span class="badge badge-danger">تکمیل‌نشده</span>';
        return `<div class="info-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <span>${formLabels[n]}</span>${badge}</div>`;
      }).join('');
    }
  } catch(e) { document.getElementById('insFormsDone').innerText = '—'; }

  const schoolsTable = document.getElementById('insSchoolsTable');
  if (schoolsTable) {
    schoolsTable.innerHTML = !schools.length
      ? '<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">🏫</div><div class="empty-text">هنوز مدرسه‌ای ثبت نشده است.</div></div></td></tr>'
      : schools.map(s => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.code||'')}</td><td>${escapeHtml(s.manager||'—')}</td><td>${escapeHtml(s.level||'—')}</td><td>${escapeHtml(String(s.score||0))}</td></tr>`).join('');
  }

  try {
    const loginLog = await sbLoginLog.getAll();
    document.getElementById('insLoginCount').innerText = loginLog.length;
    const loginTable = document.getElementById('insLoginTable');
    if (loginTable) {
      loginTable.innerHTML = !loginLog.length
        ? '<tr><td colspan="4"><div class="empty-state"><div class="empty-ico">🕒</div><div class="empty-text">هنوز ورودی ثبت نشده است.</div></div></td></tr>'
        : loginLog.map(l => {
            const d    = l.login_time ? new Date(l.login_time) : null;
            const date = d ? d.toLocaleDateString('fa-IR') : '—';
            const time = d ? d.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit'}) : '—';
            return `<tr><td>${escapeHtml(l.email||'')}</td><td>${escapeHtml(l.role||'')}</td><td>${date}</td><td>${time}</td></tr>`;
          }).join('');
    }
  } catch(e) { document.getElementById('insLoginCount').innerText = '—'; }
}
