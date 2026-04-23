import type { Dispatch, SetStateAction } from 'react';
import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type ActiveAccount = {
  id: string;
  name: string;
  role: Role;
};

type LeaveStatus = 'Draft' | 'Submitted' | 'Manager Approved' | 'Manager Rejected' | 'HR Approved' | 'HR Rejected' | 'Cancelled';

type LeaveTrailEntry = {
  status: LeaveStatus;
  actorName: string;
  date: string;
  note?: string;
};

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
  trail: LeaveTrailEntry[];
};

type LeaveProps = {
  currentRole: Role;
  activeAccount: ActiveAccount;
  activePage: string;
  leaveRequests: LeaveRequest[];
  filteredLeaveRequests: LeaveRequest[];
  leaveReviewNotes: Record<string, string>;
  newLeaveType: string;
  newLeaveRange: string;
  newLeaveReason: string;
  setLeaveReviewNotes: Dispatch<SetStateAction<Record<string, string>>>;
  setNewLeaveType: Dispatch<SetStateAction<string>>;
  setNewLeaveRange: Dispatch<SetStateAction<string>>;
  setNewLeaveReason: Dispatch<SetStateAction<string>>;
  submitLeave: () => void;
  cancelLeaveRequest: (id: string) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, note?: string) => void;
};

export function Leave({
  currentRole,
  activeAccount,
  activePage,
  leaveRequests,
  filteredLeaveRequests,
  leaveReviewNotes,
  newLeaveType,
  newLeaveRange,
  newLeaveReason,
  setLeaveReviewNotes,
  setNewLeaveType,
  setNewLeaveRange,
  setNewLeaveReason,
  submitLeave,
  cancelLeaveRequest,
  updateLeaveStatus,
}: LeaveProps) {
  const leaveAllowance = {
    'Vacation Leave': 10,
    'Sick Leave': 5,
    'Emergency Leave': 3,
    'Maternity Leave': 60,
    'Paternity Leave': 14,
    'Bereavement Leave': 3,
  } as const;

  const leaveTypes = Object.keys(leaveAllowance) as (keyof typeof leaveAllowance)[];
  const visibleLeaveRequests =
    currentRole === 'Manager'
      ? leaveRequests.filter((item) => item.status === 'Submitted')
      : currentRole === 'HR'
        ? leaveRequests.filter((item) => item.status === 'Manager Approved')
        : currentRole === 'Employee'
          ? filteredLeaveRequests
          : leaveRequests;
  const requestCount = visibleLeaveRequests.length;
  const pendingCount = leaveRequests.filter((item) => item.status === 'Submitted' || item.status === 'Manager Approved').length;
  const approvedCount = leaveRequests.filter((item) => item.status === 'HR Approved').length;
  const queueLabel =
    currentRole === 'Manager'
      ? 'Manager review queue'
      : currentRole === 'HR'
        ? 'HR review queue'
        : currentRole === 'Employee'
          ? 'My time off'
          : 'All leave requests';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Time Off</div>
              <h3 className="mt-2 text-3xl font-bold leading-tight">Balances and requests</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review your available leave, check recent requests, and submit new time off from a cleaner mobile-first layout.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">
              {queueLabel}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Requests shown', value: String(requestCount), note: 'In this view' },
              { label: 'Pending review', value: String(pendingCount), note: 'Needs action' },
              { label: 'Final approved', value: String(approvedCount), note: 'HR completed' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                <div className="mt-2 text-2xl font-bold">{item.value}</div>
                <div className="mt-1 text-sm text-slate-300">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {leaveTypes.map((type) => {
          const used = filteredLeaveRequests.filter((item) => item.type === type && item.status !== 'Cancelled' && item.status !== 'Manager Rejected' && item.status !== 'HR Rejected').length;
          const allowed = leaveAllowance[type];
          const balance = Math.max(allowed - used, 0);
          return (
            <div key={type} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">{type}</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Allowed</div>
                  <div className="mt-2 text-xl font-bold text-slate-900">{allowed}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Used</div>
                  <div className="mt-2 text-xl font-bold text-slate-900">{used}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Balance</div>
                  <div className="mt-2 text-xl font-bold text-slate-900">{balance}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title={queueLabel} action={<StatusPill>Approval trail enabled</StatusPill>}>
          <div className="space-y-3">
            {visibleLeaveRequests.length > 0 ? (
              visibleLeaveRequests.map((row) => {
                const isEmployeeOwner = row.employeeId === activeAccount.id;
                const canCancel = currentRole === 'Employee' && isEmployeeOwner && row.status === 'Submitted';
                const isManagerQueue = currentRole === 'Manager' && row.status === 'Submitted';
                const isHrQueue = currentRole === 'HR' && row.status === 'Manager Approved';
                const reviewNote = leaveReviewNotes[row.id] ?? row.reviewNote ?? '';

                return (
                  <div key={row.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{row.type}</div>
                        <div className="mt-1 text-sm text-slate-500">{row.employeeName} - {row.range}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-500">{row.reason}</div>
                        <div className="mt-2 text-xs text-slate-400">Requested: {row.requestedAt}</div>
                        {row.approverName && row.decisionDate && (
                          <div className="mt-1 text-xs text-slate-400">Last decision: {row.approverName} on {row.decisionDate}</div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill>{row.status}</StatusPill>
                        {row.status === 'Cancelled' && <StatusPill>Locked</StatusPill>}
                        {canCancel && <button onClick={() => cancelLeaveRequest(row.id)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button>}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Approval trail</div>
                      <div className="mt-3 space-y-2">
                        {row.trail.map((step) => (
                          <div key={`${row.id}-${step.status}-${step.date}-${step.actorName}`} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-semibold text-slate-900">{step.status}</div>
                              <div className="text-xs text-slate-400">{step.date}</div>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{step.actorName}</div>
                            {step.note && <div className="mt-1 text-sm leading-6 text-slate-500">{step.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {(isManagerQueue || isHrQueue) && (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">{currentRole === 'Manager' ? 'Manager review note' : 'HR review note'}</div>
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setLeaveReviewNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          placeholder="Short review note"
                          className="min-h-[90px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateLeaveStatus(row.id, currentRole === 'Manager' ? 'Manager Approved' : 'HR Approved', reviewNote)}
                            className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(row.id, currentRole === 'Manager' ? 'Manager Rejected' : 'HR Rejected', reviewNote)}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                {currentRole === 'Employee'
                  ? 'No leave requests have been filed yet. Submit your first request on the right.'
                  : currentRole === 'Manager'
                    ? 'No leave requests are waiting for manager review right now.'
                    : currentRole === 'HR'
                      ? 'No leave requests are waiting for HR review right now.'
                      : 'No leave requests are available in this view.'}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title={activePage === 'Leave Approvals' ? 'Approval Flow' : 'Request New Leave'} action={<StatusPill>Quick submit</StatusPill>}>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Flow</div>
              <p className="mt-2 leading-6">Employee files request - Manager reviews - HR final approval.</p>
            </div>
            {currentRole === 'Employee' && (
              <div className="space-y-3">
                <select value={newLeaveType} onChange={(e) => setNewLeaveType(e.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm">
                  {leaveTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <input value={newLeaveRange} onChange={(e) => setNewLeaveRange(e.target.value)} placeholder="Example: May 10-11" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
                <textarea value={newLeaveReason} onChange={(e) => setNewLeaveReason(e.target.value)} placeholder="Reason" className="min-h-[120px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" />
                <button onClick={submitLeave} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Submit Leave Request</button>
              </div>
            )}
            {currentRole !== 'Employee' && <div className="rounded-3xl bg-slate-50 p-4 leading-6">Use the request list to approve or reject submitted requests.</div>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
