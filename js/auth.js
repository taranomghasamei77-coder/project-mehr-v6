// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// auth.js — احراز هویت Supabase Auth  v6.1

/* ===== وضعیت کاربر جاری ===== */
let _currentUser = null;

function getCurrentUser() { return _currentUser; }

/* ===== ورود با ایمیل و رمز ===== */
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('personnelCode').value.trim();

  if (!email || !password) { toastErr('ایمیل و رمز عبور را وارد کنید.'); return; }

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
          id:        authUser.id,
          full_name: authUser.email,
          role:      'teacher'
        })
      );
      profile = { id: authUser.id, full_name: authUser.email, role: 'teacher' };
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
    const msg = e.message === 'Invalid login credentials'
      ? 'ایمیل یا رمز عبور اشتباه است.'
      : 'خطا در ورود: ' + e.message;
    toastErr(msg);
  } finally {
    if (loginBtn) { loginBtn.disabled = false; loginBtn.innerText = 'ورود به سامانه ←'; }
  }
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
