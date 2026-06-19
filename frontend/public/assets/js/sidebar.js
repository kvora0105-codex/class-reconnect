/**
 * Shared Sidebar Component — matches the reference design screenshot exactly.
 * Usage: import { initSidebar } from './assets/js/sidebar.js';
 *        initSidebar('groups');
 *
 * Active page keys:
 *   'dashboard' | 'library' | 'ai' | 'courses' |
 *   'groups' | 'discussion-groups' | 'quizzes' | 'contribute'
 */
import { authAPI } from './api.js';

export function initSidebar(activeKey = '') {
    const user = authAPI.getCurrentUser();
    const isTeacher = user && user.role === 'teacher';

    // ── Styles ─────────────────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #cr-sidebar {
            font-family: 'Inter', sans-serif;
            background: #0f172a;
            color: #e2e8f0;
        }
        #cr-sidebar::-webkit-scrollbar { width: 4px; }
        #cr-sidebar::-webkit-scrollbar-track { background: transparent; }
        #cr-sidebar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

        .cr-nav-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 11px 16px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 500;
            color: #94a3b8;
            text-decoration: none;
            transition: background 0.15s, color 0.15s;
            margin-bottom: 2px;
        }
        .cr-nav-link:hover {
            background: #1e293b;
            color: #e2e8f0;
        }
        .cr-nav-link.active {
            background: #1e293b;
            color: #93c5fd;
        }
        .cr-nav-link svg {
            flex-shrink: 0;
            opacity: 0.85;
        }
        .cr-nav-link.active svg { opacity: 1; }

        @media (min-width: 1024px) {
            #cr-sidebar { transform: translateX(0) !important; }
            #cr-sidebar-toggle { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    // ── Profile info ───────────────────────────────────────────────────────────
    const firstName = user?.firstName || '';
    const lastName  = user?.lastName  || '';
    const fullName  = `${firstName} ${lastName}`.trim() || 'User';
    const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'U';

    // Build details line  e.g.  "COMPS • Semester 5"
    let detailParts = [];
    if (isTeacher) {
        if (user?.department)  detailParts.push(user.department);
        if (user?.experience)  detailParts.push(user.experience);
        if (user?.subjects?.length) detailParts.push(user.subjects[0]);
    } else {
        if (user?.branch)    detailParts.push(user.branch);
        if (user?.semester)  detailParts.push(user.semester);
    }
    const detailLine = detailParts.join(' • ') || (isTeacher ? 'Teacher' : 'Student');

    // ── Nav link builder ───────────────────────────────────────────────────────
    function link(href, label, svgPath, key) {
        const isActive = key === activeKey;
        return `
        <a href="${href}" data-nav="${key}" class="cr-nav-link ${isActive ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                ${svgPath}
            </svg>
            <span>${label}</span>
        </a>`;
    }

    // ── Icons ──────────────────────────────────────────────────────────────────
    const ICONS = {
        dashboard:   '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
        library:     '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
        ai:          '<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z"/>',
        courses:     '<path d="M12 2v20"/><path d="M2 12h20"/>',
        groups:      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        discussion:  '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        quizzes:     '<path d="M12 2l-8 10h16l-8-10z"/><path d="M12 12v8"/>',
        contribute:  '<path d="M12 5v14"/><path d="M5 12h14"/>',
        bell:        '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    };

    // Dashboard link goes to index.html on sub-pages, or #dashboard on the dashboard itself
    const dashHref = activeKey === 'dashboard' ? '#dashboard' : 'index.html';

    const navHTML = [
        link(dashHref, 'Dashboard', ICONS.dashboard, 'dashboard'),
        link('index.html#library', 'Library', ICONS.library, 'library'),
        link('qa.html', 'AI Assistant', ICONS.ai, 'ai'),
        link('index.html#courses', 'Courses', ICONS.courses, 'courses'),
        !isTeacher ? link('groups.html',            'Study Groups',      ICONS.groups,    'groups')           : '',
        isTeacher  ? link('discussion-groups.html', 'Discussion Groups', ICONS.discussion, 'discussion-groups') : '',
        isTeacher  ? link('index.html#quizzes',     'Quizzes',           ICONS.quizzes,   'quizzes')          : '',
        !isTeacher ? link('index.html#student-quizzes', 'Quizzes',       ICONS.quizzes,   'student-quizzes')  : '',
        isTeacher  ? link('index.html#contribute',  'Contribute Notes',  ICONS.contribute, 'contribute')       : '',
    ].join('');

    // ── Sidebar HTML ───────────────────────────────────────────────────────────
    const html = `
    <aside id="cr-sidebar"
           style="position:fixed;top:0;left:0;width:256px;height:100vh;z-index:40;
                  display:flex;flex-direction:column;overflow:hidden;
                  transform:translateX(-100%);transition:transform 0.3s ease;
                  box-shadow:4px 0 24px rgba(0,0,0,0.4);">

        <!-- Logo -->
        <div style="display:flex;align-items:center;gap:10px;padding:22px 20px 18px;flex-shrink:0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                 fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2"/>
                <path d="M10 18a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/>
                <path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/>
            </svg>
            <span style="font-size:19px;font-weight:700;color:#f1f5f9;letter-spacing:-0.3px;">ClassReconnect</span>
            <button id="cr-sidebar-close"
                    style="margin-left:auto;background:none;border:none;color:#64748b;cursor:pointer;padding:4px;display:none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <!-- Nav section — flex:1 + min-height:0 ensures it scrolls internally and never pushes footer -->
        <div style="flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 12px 12px;">
            <p style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;
                      letter-spacing:0.1em;padding:0 8px;margin-bottom:8px;">Navigation</p>
            ${navHTML}
        </div>

        <!-- Profile footer — flex-shrink:0 + flex-grow:0 pins it permanently at the bottom -->
        <div style="flex-shrink:0;flex-grow:0;padding:16px;border-top:1px solid #1e293b;background:#0f172a;">
            <!-- Clickable profile row -->
            <a id="cr-profile-btn" href="index.html#profile"
               style="display:flex;align-items:center;gap:12px;margin-bottom:12px;
                      text-decoration:none;padding:6px 8px;border-radius:10px;
                      transition:background 0.15s;"
               onmouseover="this.style.background='#1e293b';"
               onmouseout="this.style.background='transparent';">
                <!-- Avatar: rounded square, purple -->
                <div style="width:40px;height:40px;border-radius:10px;background:#7c3aed;
                            display:flex;align-items:center;justify-content:center;
                            font-weight:700;font-size:14px;color:#fff;flex-shrink:0;">
                    ${initials}
                </div>
                <div style="min-width:0;flex:1;">
                    <p style="font-size:14px;font-weight:600;color:#f1f5f9;margin:0;
                               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${fullName}
                    </p>
                    <p style="font-size:11px;color:#64748b;margin:2px 0 0;
                               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${detailLine}
                    </p>
                </div>
                <!-- Bell icon -->
                <span style="color:#475569;flex-shrink:0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.8">
                        ${ICONS.bell}
                    </svg>
                </span>
            </a>

            <!-- Logout button -->
            <button id="cr-logout-btn"
                    style="width:100%;padding:10px;background:#1e293b;border:none;
                           color:#cbd5e1;border-radius:10px;font-size:14px;font-weight:500;
                           cursor:pointer;transition:background 0.15s,color 0.15s;"
                    onmouseover="this.style.background='#7f1d1d';this.style.color='#fca5a5';"
                    onmouseout="this.style.background='#1e293b';this.style.color='#cbd5e1';">
                Logout
            </button>
        </div>
    </aside>

    <!-- Mobile hamburger -->
    <button id="cr-sidebar-toggle"
            style="position:fixed;top:14px;left:14px;z-index:50;
                   background:#0f172a;color:#e2e8f0;border:none;
                   padding:8px 10px;border-radius:10px;cursor:pointer;
                   box-shadow:0 2px 12px rgba(0,0,0,0.5);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    </button>`;

    document.body.insertAdjacentHTML('afterbegin', html);

    const sidebar  = document.getElementById('cr-sidebar');
    const toggle   = document.getElementById('cr-sidebar-toggle');
    const closeBtn = document.getElementById('cr-sidebar-close');

    function applyLayout() {
        const desktop = window.innerWidth >= 1024;
        sidebar.style.transform = (desktop || sidebar.dataset.open === '1')
            ? 'translateX(0)'
            : 'translateX(-100%)';
        if (toggle)   toggle.style.display   = desktop ? 'none' : 'block';
        if (closeBtn) closeBtn.style.display = desktop ? 'none' : 'block';
    }
    applyLayout();
    window.addEventListener('resize', applyLayout);

    toggle?.addEventListener('click', () => {
        sidebar.dataset.open = sidebar.dataset.open === '1' ? '' : '1';
        applyLayout();
    });
    closeBtn?.addEventListener('click', () => {
        sidebar.dataset.open = '';
        applyLayout();
    });

    document.getElementById('cr-logout-btn')?.addEventListener('click', () => {
        authAPI.logout();
        window.location.href = isTeacher ? 'teacher-login.html' : 'student-login.html';
    });

}

export function updateSidebarActive(activeKey) {
    const sidebar = document.getElementById('cr-sidebar');
    if (!sidebar) return;
    const links = sidebar.querySelectorAll('.cr-nav-link[data-nav]');
    links.forEach(link => {
        if (link.getAttribute('data-nav') === activeKey) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
