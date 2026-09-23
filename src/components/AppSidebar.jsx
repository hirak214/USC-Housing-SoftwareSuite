import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  ClockIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  QrCodeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const GUEST = '/guest-card-inventory';

// Each app owns its own, self-scoped navigation. They are never combined.
export const AUDITOR_NAV = [
  {
    items: [
      { path: '/auditor', label: 'Auditor', icon: ArchiveBoxIcon },
      { path: '/auditor/history', label: 'History', icon: ClockIcon },
    ],
  },
];

export const GUEST_NAV = [
  {
    heading: 'Requests',
    items: [
      { path: GUEST, label: 'Request Card', icon: CreditCardIcon },
      { path: `${GUEST}/pending`, label: 'Pending Requests', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    heading: 'Cards',
    items: [
      { path: `${GUEST}/return`, label: 'Return Card', icon: ArrowUturnLeftIcon },
      { path: `${GUEST}/management`, label: 'Card Management', icon: Cog6ToothIcon },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { path: `${GUEST}/qr-code`, label: 'QR Code', icon: QrCodeIcon },
      { path: `${GUEST}/logs`, label: 'Logs', icon: DocumentTextIcon },
    ],
  },
];

function isActive(path, pathname) {
  if (path === '/auditor') return pathname === '/auditor';
  if (path === GUEST) {
    const rel = pathname.replace(GUEST, '');
    return rel === '' || rel === '/' || rel.startsWith('/assign');
  }
  return pathname === path || pathname.startsWith(path + '/');
}

const NavList = ({ sections, pathname, onNavigate }) => (
  <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
    {sections.map((section, i) => (
      <div key={section.heading || i}>
        {section.heading && (
          <p className="px-3 mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            {section.heading}
          </p>
        )}
        <div className="space-y-0.5">
          {section.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
);

const Brand = ({ title }) => (
  <div className="h-16 px-4 flex flex-col justify-center items-start gap-1 border-b border-slate-100 shrink-0">
    <img
      src="/usc-logo-wordmark.jpg"
      alt="University of Southern California"
      className="h-8 w-auto mix-blend-multiply"
    />
    <p className="text-sm font-semibold text-slate-900">{title}</p>
  </div>
);

const SidebarFooter = () => (
  <div className="shrink-0 border-t border-slate-100 p-3">
    <Link to="/" className="sidebar-link">
      <ArrowLeftIcon className="h-5 w-5 shrink-0" />
      <span>All apps</span>
    </Link>
  </div>
);

const AppSidebar = ({ sections, brandTitle }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 h-14 px-4 bg-white border-b border-slate-200 no-print">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-ghost h-9 w-9 px-0"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/usc-logo-wordmark.jpg"
            alt="University of Southern California"
            className="h-5 w-auto max-w-none shrink-0 mix-blend-multiply"
          />
          <span className="text-sm font-semibold text-slate-900 truncate">{brandTitle}</span>
        </div>
      </div>

      {/* Desktop static drawer */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white border-r border-slate-200 no-print">
        <Brand title={brandTitle} />
        <NavList sections={sections} pathname={location.pathname} />
        <SidebarFooter />
      </aside>

      {/* Mobile slide-in drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 no-print">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[80%] flex flex-col bg-white border-r border-slate-200 shadow-pop animate-fade-in">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
              <div className="flex flex-col items-start gap-1">
                <img
                  src="/usc-logo-wordmark.jpg"
                  alt="University of Southern California"
                  className="h-5 w-auto max-w-none mix-blend-multiply"
                />
                <span className="text-sm font-semibold text-slate-900">{brandTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost h-9 w-9 px-0"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <NavList sections={sections} pathname={location.pathname} onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
};

export default AppSidebar;
