import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type DashboardStatCard = {
  title: string;
  value: string;
  sub: string;
};

type DashboardActionItem = {
  key: string;
  title: string;
  description: string;
  status: string;
  buttonLabel: string;
  onAction: () => void;
};

type DashboardActivityItem = {
  title: string;
  description: string;
  timestamp: string;
};

type DashboardMetric = {
  label: string;
  value: string;
  note: string;
};

type AnnouncementItem = {
  title: string;
  date: string;
  body: string;
};

type DashboardHomeProps = {
  currentRole: Role;
  activeAccount: {
    name: string;
    role: Role;
    department: string;
    id: string;
  };
  menu: string[];
  roleBadge: string;
  stats: DashboardStatCard[];
  unreadNotificationCount: number;
  dashboardActionItems: DashboardActionItem[];
  dashboardActionCount: number;
  recentActivityItems: DashboardActivityItem[];
  adminMetrics: DashboardMetric[];
  announcements: AnnouncementItem[];
  setActivePage: (page: string) => void;
};

export function DashboardHome({
  currentRole,
  activeAccount,
  menu,
  roleBadge,
  stats,
  unreadNotificationCount,
  dashboardActionItems,
  dashboardActionCount,
  recentActivityItems,
  adminMetrics,
  announcements,
  setActivePage,
}: DashboardHomeProps) {
  return (
    <div className="space-y-6 pb-2">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(148,163,184,0.12),_transparent_30%)]" />
          <div className="relative p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span>Home</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] tracking-[0.18em] text-white/80">{roleBadge}</span>
            </div>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h3 className="text-3xl font-bold leading-tight sm:text-4xl">Welcome back, {activeAccount.name}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Your day starts here: quick access to leave, payroll, policies, training, and team updates, all in one employee self-service home.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill>{activeAccount.role}</StatusPill>
                <StatusPill>{activeAccount.department}</StatusPill>
                <StatusPill>{activeAccount.id}</StatusPill>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {stats.slice(0, 3).map((card) => (
                <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{card.title}</div>
                  <div className="mt-2 text-2xl font-bold text-white">{card.value}</div>
                  <div className="mt-1 text-sm text-slate-300">{card.sub}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { label: 'Leave Request', page: 'Leave' },
                { label: 'Payslips', page: 'Payslips' },
                { label: 'Policies', page: 'Policies' },
                { label: 'Training', page: 'Training' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActivePage(item.page)}
                  className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <div key={card.title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-sm text-slate-500">{card.title}</div>
            <div className="mt-2 text-3xl font-bold">{card.value}</div>
            <div className="mt-1 text-sm text-slate-500">{card.sub}</div>
          </div>
        ))}
      </section>

      {currentRole === 'Admin' && (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard title="Admin Control Center" action={<StatusPill>Live summary</StatusPill>}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {adminMetrics.map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{item.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.note}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Activity" action={<StatusPill>Latest 6</StatusPill>}>
            <div className="space-y-3">
              {recentActivityItems.length > 0 ? (
                recentActivityItems.map((item) => (
                  <div key={`${item.title}-${item.timestamp}-${item.description}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                      </div>
                      <div className="text-xs text-slate-400">{item.timestamp}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No recent activity is available yet.
                </div>
              )}
            </div>
          </SectionCard>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionCard title="Quick Access" action={<StatusPill>Tap to open</StatusPill>}>
          <div className="grid gap-3 sm:grid-cols-2">
            {menu.map((item) => (
              <button
                key={item}
                onClick={() => setActivePage(item)}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <span>{item}</span>
                      {item === 'Notifications' && unreadNotificationCount > 0 && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{unreadNotificationCount}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Open the {item} module.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white transition group-hover:bg-slate-800">Open</div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Action Center" action={<StatusPill>{dashboardActionCount} pending</StatusPill>}>
            <div className="space-y-3">
              {dashboardActionItems.length > 0 ? (
                dashboardActionItems.map((item) => (
                  <div key={item.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill>{item.status}</StatusPill>
                        <button onClick={item.onAction} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                          {item.buttonLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  {currentRole === 'Employee'
                    ? 'No pending policy signatures, training modules, or writeups right now.'
                    : currentRole === 'Manager'
                      ? 'No leave requests are waiting for manager review right now.'
                      : currentRole === 'HR'
                        ? 'No leave requests are waiting for final HR review right now.'
                        : 'No pending actions for this role right now.'}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Announcements">
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.date}</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
