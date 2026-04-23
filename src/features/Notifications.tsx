import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
  actionLabel: string;
  canOpen: boolean;
  unread: boolean;
  onOpen?: () => void;
};

type NotificationsProps = {
  notifications: NotificationItem[];
  currentRole: Role;
  markNotificationAsRead: (id: string) => void;
};

export function Notifications({ notifications, currentRole, markNotificationAsRead }: NotificationsProps) {
  const unreadItems = notifications.filter((item) => item.unread);
  const readItems = notifications.filter((item) => !item.unread);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Notifications / Inbox</div>
              <h3 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Your current inbox</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Notifications are generated from current policies, training, leave, writeups, and schedule data. Open an item to jump to the related module when available.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>{unreadItems.length} unread</StatusPill>
              <StatusPill>{notifications.length} total</StatusPill>
              <StatusPill>{currentRole}</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Unread" action={<StatusPill>{unreadItems.length} unread</StatusPill>}>
          <div className="space-y-3">
            {unreadItems.length > 0 ? (
              unreadItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                      <div className="mt-2 text-xs text-slate-400">{item.type} • {item.timestamp}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>Unread</StatusPill>
                      <button
                        onClick={() => {
                          if (item.onOpen) item.onOpen();
                          markNotificationAsRead(item.id);
                        }}
                        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        {item.actionLabel}
                      </button>
                      <button
                        onClick={() => markNotificationAsRead(item.id)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                No unread notifications right now.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Read" action={<StatusPill>{readItems.length} read</StatusPill>}>
          <div className="space-y-3">
            {readItems.length > 0 ? (
              readItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                      <div className="mt-2 text-xs text-slate-400">{item.type} • {item.timestamp}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>Read</StatusPill>
                      {item.canOpen && item.onOpen && (
                        <button
                          onClick={() => {
                            item.onOpen?.();
                            markNotificationAsRead(item.id);
                          }}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Read notifications will appear here after you open or mark items as read.
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
