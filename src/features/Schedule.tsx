import type { Dispatch, SetStateAction } from 'react';
import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type ActiveAccount = {
  id: string;
  name: string;
  role: Role;
};

type ScheduleStatus = 'Workday' | 'Rest Day' | 'Leave' | 'Holiday' | 'Training';

type ScheduleEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  dateISO: string;
  displayDate: string;
  status: ScheduleStatus;
  shift: string;
  notes: string;
  createdBy: string;
  updatedAt: string;
  source: 'Manual' | 'Leave';
};

type LeaveStatus = 'Draft' | 'Submitted' | 'Manager Approved' | 'Manager Rejected' | 'HR Approved' | 'HR Rejected' | 'Cancelled';

type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  range: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  approverName?: string;
  decisionDate?: string;
  reviewNote?: string;
};

type ScheduleProps = {
  currentRole: Role;
  activeAccount: ActiveAccount;
  activeEmployeeRecords: Array<{ id: string; name: string }>;
  scheduleEntries: ScheduleEntry[];
  leaveRequests: LeaveRequest[];
  scheduleForm: ScheduleEntry;
  editingScheduleId: string | null;
  todayISO: string;
  formatScheduleDate: (dateISO: string) => string;
  setScheduleForm: Dispatch<SetStateAction<ScheduleEntry>>;
  beginScheduleEdit: (entry: ScheduleEntry) => void;
  resetScheduleBuilder: () => void;
  saveScheduleEntry: () => void;
};

export function Schedule({
  currentRole,
  activeAccount,
  activeEmployeeRecords,
  scheduleEntries,
  leaveRequests,
  scheduleForm,
  editingScheduleId,
  todayISO,
  formatScheduleDate,
  setScheduleForm,
  beginScheduleEdit,
  resetScheduleBuilder,
  saveScheduleEntry,
}: ScheduleProps) {
  const sortKey = (dateISO: string) => {
    const parsed = Date.parse(dateISO);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const derivedLeaveEntries: ScheduleEntry[] = leaveRequests
    .filter((item) => item.status === 'HR Approved')
    .map((item) => {
      const parsedDecision = item.decisionDate ? Date.parse(item.decisionDate) : Number.NaN;
      const dateISO = Number.isNaN(parsedDecision)
        ? todayISO
        : `${new Date(parsedDecision).getFullYear()}-${String(new Date(parsedDecision).getMonth() + 1).padStart(2, '0')}-${String(new Date(parsedDecision).getDate()).padStart(2, '0')}`;
      return {
        id: `LEAVE-${item.id}`,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        title: `${item.type} leave`,
        dateISO,
        displayDate: item.range || item.decisionDate || formatScheduleDate(dateISO),
        status: 'Leave',
        shift: 'Approved leave',
        notes: item.reviewNote ?? 'Approved leave request',
        createdBy: item.approverName ?? 'HR',
        updatedAt: item.decisionDate ?? item.requestedAt,
        source: 'Leave',
      };
    });

  const mergedEntries = [...scheduleEntries, ...derivedLeaveEntries];
  const visibleEntries = currentRole === 'Employee' ? mergedEntries.filter((entry) => entry.employeeId === activeAccount.id) : mergedEntries;
  const sortedEntries = [...visibleEntries].sort((a, b) => sortKey(a.dateISO) - sortKey(b.dateISO));
  const todayEntries = sortedEntries.filter((entry) => entry.dateISO === todayISO);
  const upcomingEntries = sortedEntries.filter((entry) => sortKey(entry.dateISO) > sortKey(todayISO)).slice(0, 6);
  const currentSummary = todayEntries[0] ?? upcomingEntries[0] ?? sortedEntries[0] ?? null;
  const canEditSchedule = currentRole === 'Manager' || currentRole === 'Admin';
  const statusCounts = sortedEntries.reduce(
    (acc, entry) => {
      acc[entry.status] = (acc[entry.status] ?? 0) + 1;
      return acc;
    },
    { Workday: 0, 'Rest Day': 0, Leave: 0, Holiday: 0, Training: 0 } as Record<ScheduleStatus, number>,
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Schedule / Calendar</div>
              <h3 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Employee schedule and shift planning</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                View current and upcoming entries, show approved leave automatically, and keep schedule editing lightweight for managers and admins.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>{visibleEntries.length} entries</StatusPill>
              <StatusPill>{todayEntries.length} today</StatusPill>
              <StatusPill>{currentRole}</StatusPill>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Today', value: currentSummary ? currentSummary.status : 'No entry', note: currentSummary ? currentSummary.title : 'Nothing scheduled' },
              { label: 'Upcoming', value: String(upcomingEntries.length), note: 'Future entries' },
              { label: 'Workday', value: String(statusCounts.Workday), note: 'Scheduled shifts' },
              { label: 'Leave', value: String(statusCounts.Leave), note: 'Approved leave blocks' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                <div className="mt-2 text-2xl font-bold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-slate-300">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <SectionCard title={currentRole === 'Employee' ? 'My Schedule' : 'Schedule List'} action={<StatusPill>{visibleEntries.length} visible</StatusPill>}>
          <div className="space-y-4">
            {currentSummary && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">Today&apos;s schedule</div>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{currentSummary.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{currentSummary.employeeName} • {currentSummary.displayDate}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{currentSummary.shift}</div>
                    {currentSummary.notes && <div className="mt-1 text-sm leading-6 text-slate-500">{currentSummary.notes}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{currentSummary.status}</StatusPill>
                    <StatusPill>{currentSummary.source}</StatusPill>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Upcoming entries</div>
              {sortedEntries.length > 0 ? (
                sortedEntries.map((entry) => {
                  const isToday = entry.dateISO === todayISO;
                  return (
                    <div key={entry.id} className={`rounded-3xl border p-4 shadow-sm ring-1 ${isToday ? 'border-slate-950 bg-slate-50 ring-slate-950/10' : 'border-slate-200 bg-white ring-slate-200'}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{entry.title}</div>
                          <div className="mt-1 text-sm text-slate-500">{entry.employeeName} • {entry.displayDate}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">{entry.shift}</div>
                          {entry.notes && <div className="mt-1 text-sm leading-6 text-slate-500">{entry.notes}</div>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusPill>{entry.status}</StatusPill>
                          <StatusPill>{entry.source}</StatusPill>
                          {canEditSchedule && entry.source === 'Manual' && (
                            <button onClick={() => beginScheduleEdit(entry)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  {currentRole === 'Employee'
                    ? 'No schedule entries are assigned to this account yet.'
                    : 'No schedule entries are available yet. Create one on the right.'}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {canEditSchedule ? (
          <SectionCard title={editingScheduleId ? 'Edit Schedule Entry' : 'Create Schedule Entry'} action={<StatusPill>Manager / Admin</StatusPill>}>
            <div className="space-y-3">
              <select
                value={scheduleForm.employeeId}
                onChange={(e) => {
                  const employee = activeEmployeeRecords.find((item) => item.id === e.target.value) ?? activeEmployeeRecords[0];
                  if (!employee) return;
                  setScheduleForm((prev) => ({ ...prev, employeeId: employee.id, employeeName: employee.name }));
                }}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              >
                {activeEmployeeRecords.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} • {item.id}</option>
                ))}
              </select>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={scheduleForm.dateISO}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, dateISO: e.target.value, displayDate: formatScheduleDate(e.target.value) }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
                <select
                  value={scheduleForm.status}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, status: e.target.value as ScheduleStatus }))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                >
                  {(['Workday', 'Rest Day', 'Leave', 'Holiday', 'Training'] as ScheduleStatus[]).map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              <input
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Schedule title"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />

              <input
                value={scheduleForm.shift}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, shift: e.target.value }))}
                placeholder="Shift or time block"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />

              <textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes"
                className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />

              <div className="flex flex-wrap gap-3">
                <button onClick={saveScheduleEntry} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  {editingScheduleId ? 'Update Schedule' : 'Add Schedule'}
                </button>
                <button onClick={resetScheduleBuilder} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                  New Entry
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Approved leave automatically appears in the employee schedule from the leave workflow. Manual entries are used for workdays, rest days, holidays, and training blocks.
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Schedule Summary" action={<StatusPill>View only</StatusPill>}>
            <div className="space-y-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Today&apos;s shift</div>
                <div className="mt-2 text-lg font-bold text-slate-900">{currentSummary ? currentSummary.title : 'No schedule yet'}</div>
                <div className="mt-1 text-sm text-slate-500">{currentSummary ? `${currentSummary.displayDate} • ${currentSummary.shift}` : 'Once assigned, the shift summary will appear here.'}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-400">Status breakdown</div>
                <div className="mt-3 space-y-2">
                  {(['Workday', 'Rest Day', 'Leave', 'Holiday', 'Training'] as ScheduleStatus[]).map((status) => (
                    <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-medium text-slate-700">{status}</span>
                      <StatusPill>{statusCounts[status]}</StatusPill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
