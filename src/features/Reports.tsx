import type { Dispatch, SetStateAction } from 'react';
import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type ReportFilters = {
  employeeId: string;
  role: Role | 'All';
  department: string;
  status: string;
};

type ReportEmployee = {
  id: string;
  name: string;
  role: Role;
  department: string;
  position: string;
  email: string;
  mobile: string;
  employmentType: string;
  isActive: boolean;
};

type ReportSnapshot = {
  generatedAt: string;
  filters: ReportFilters;
  employees: {
    total: number;
    active: number;
    inactive: number;
    list: ReportEmployee[];
  };
  leaveRequests: {
    total: number;
    submitted: number;
    managerApproved: number;
    hrApproved: number;
    cancelled: number;
    list: Array<{
      id: string;
      employeeId: string;
      employeeName: string;
      type: string;
      range: string;
      reason: string;
      status: string;
      requestedAt: string;
    }>;
  };
  training: {
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    failed: number;
    list: Array<{
      module: { id: string; title: string; category: string; description: string; required: boolean; assignedRoles: Role[]; quizRequired: boolean; passingScore: number; status: 'Draft' | 'Published'; createdBy: string; createdAt: string; publishedAt: string | null; video: string; restriction: string; };
      assignedEmployees: ReportEmployee[];
      progressRecords: Array<{ employeeId: string; employeeName: string; status: string; score: number | null; completionDate: string | null }>;
      completedCount: number;
      failedCount: number;
      inProgressCount: number;
      assignedCount: number;
      moduleStatus: string;
    }>;
  };
  payroll: {
    totalEmployees: number;
    releasedPeriods: number;
    latestPayslip: { period: string; status: string } | null;
    latestPayslipDetail: { gross: string; deductions: string; net: string } | null;
    rows: Array<{
      employeeId: string;
      employeeName: string;
      role: Role;
      department: string;
      employmentType: string;
      status: string;
      period: string;
      payslipStatus: string;
      gross: string;
      deductions: string;
      net: string;
    }>;
  };
  attendance: {
    total: number;
    present: number;
    late: number;
    device: number;
    manual: number;
    rows: Array<{ date: string; timeIn: string; timeOut: string; status: string; source: string }>;
  };
  policies: {
    total: number;
    pending: number;
    signed: number;
    list: Array<{
      policy: { id: string; title: string; category: string; content: string; required: boolean; assignedRoles: Role[]; status: 'Draft' | 'Published'; createdBy: string; createdAt: string; publishedAt: string | null };
      assignedEmployees: ReportEmployee[];
      signatures: Array<{ employeeId: string; employeeName: string; signedAt: string; method: string }>;
      policyStatus: string;
    }>;
  };
  writeups: {
    total: number;
    pendingReview: number;
    pendingAcknowledgment: number;
    pendingSignature: number;
    closed: number;
    list: Array<{
      id: string;
      employeeId: string;
      employee: string;
      category: string;
      title: string;
      status: string;
      severity: string;
      acknowledgmentRequired: boolean;
      signatureRequired: boolean;
      date: string;
    }>;
  };
};
type ReportsProps = {
  snapshot: ReportSnapshot;
  reportFilters: ReportFilters;
  setReportFilters: Dispatch<SetStateAction<ReportFilters>>;
  employeeRecords: ReportEmployee[];
  availableRoles: Role[];
  exportDateISO: string;
  handlePrintSummary: () => void;
};

export function Reports({
  snapshot,
  reportFilters,
  setReportFilters,
  employeeRecords,
  availableRoles,
  exportDateISO,
  handlePrintSummary,
}: ReportsProps) {
  const reportStatusOptions = [
    'All',
    'Active',
    'Inactive',
    'Draft',
    'Published',
    'Pending',
    'Signed',
    'Assigned',
    'In Progress',
    'Completed',
    'Failed',
    'Submitted',
    'Manager Approved',
    'Manager Rejected',
    'HR Approved',
    'HR Rejected',
    'Cancelled',
    'Pending Review',
    'Pending Acknowledgment',
    'Pending Signature',
    'Acknowledged',
    'Closed',
  ];
  const departmentOptions = ['All', ...Array.from(new Set(employeeRecords.map((employee) => employee.department))).sort((a, b) => a.localeCompare(b))];
  const selectedEmployeeLabel =
    reportFilters.employeeId === 'All'
      ? 'All employees'
      : employeeRecords.find((employee) => employee.id === reportFilters.employeeId)?.name ?? reportFilters.employeeId;
  const escapeCsv = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const payrollCsv = [
    ['employeeId', 'employeeName', 'role', 'department', 'employmentType', 'status', 'period', 'payslipStatus', 'gross', 'deductions', 'net'].join(','),
    ...snapshot.payroll.rows.map((row) =>
      [
        escapeCsv(row.employeeId),
        escapeCsv(row.employeeName),
        escapeCsv(row.role),
        escapeCsv(row.department),
        escapeCsv(row.employmentType),
        escapeCsv(row.status),
        escapeCsv(row.period),
        escapeCsv(row.payslipStatus),
        escapeCsv(row.gross),
        escapeCsv(row.deductions),
        escapeCsv(row.net),
      ].join(','),
    ),
  ].join('\n');
  const exportPayload = {
    generatedAt: snapshot.generatedAt,
    filters: snapshot.filters,
    payroll: snapshot.payroll,
    attendance: snapshot.attendance,
    leaveRequests: snapshot.leaveRequests,
    employees: snapshot.employees,
    training: snapshot.training,
    policies: snapshot.policies,
    writeups: snapshot.writeups,
  };
  const copyExportData = async () => {
    const text = JSON.stringify(exportPayload, null, 2);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fall back to a temporary textarea below.
    }

    const fallbackArea = document.createElement('textarea');
    fallbackArea.value = text;
    fallbackArea.setAttribute('readonly', 'true');
    fallbackArea.style.position = 'fixed';
    fallbackArea.style.opacity = '0';
    document.body.appendChild(fallbackArea);
    fallbackArea.select();
    document.execCommand('copy');
    fallbackArea.remove();
  };
  const exportPayrollCsv = () => {
    const blob = new Blob([payrollCsv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee-portal-payroll-export-${exportDateISO}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Reports & Export Center</div>
              <h3 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Live operational summary for HR and Admin</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                These reports are built from current in-app state, including employees, payroll, attendance, leave, training, policies, writeups, and schedule-linked records. Use the filters to narrow the data, print a summary, export payroll CSV, or copy a shareable snapshot.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>{snapshot.employees.total} employees</StatusPill>
              <StatusPill>{snapshot.leaveRequests.total} leave items</StatusPill>
              <StatusPill>{snapshot.payroll.totalEmployees} payroll rows</StatusPill>
              <StatusPill>{snapshot.attendance.total} attendance entries</StatusPill>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 print:hidden">
            <button onClick={handlePrintSummary} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
              Print Summary
            </button>
            <button onClick={exportPayrollCsv} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
              Export CSV
            </button>
            <button onClick={copyExportData} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
              Copy Data
            </button>
          </div>
        </div>
      </section>

      <SectionCard title="Report Filters" action={<StatusPill>Live filters</StatusPill>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Employee</span>
            <select value={reportFilters.employeeId} onChange={(event) => setReportFilters((prev) => ({ ...prev, employeeId: event.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal">
              <option value="All">All</option>
              {employeeRecords.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.id} • {employee.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Role</span>
            <select value={reportFilters.role} onChange={(event) => setReportFilters((prev) => ({ ...prev, role: event.target.value as Role | 'All' }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal">
              <option>All</option>
              {availableRoles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Department</span>
            <select value={reportFilters.department} onChange={(event) => setReportFilters((prev) => ({ ...prev, department: event.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal">
              {departmentOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Status</span>
            <select value={reportFilters.status} onChange={(event) => setReportFilters((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal">
              {reportStatusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill>{selectedEmployeeLabel}</StatusPill>
          <StatusPill>{reportFilters.role}</StatusPill>
          <StatusPill>{reportFilters.department}</StatusPill>
          <StatusPill>{reportFilters.status}</StatusPill>
          <button onClick={() => setReportFilters({ employeeId: 'All', role: 'All', department: 'All', status: 'All' })} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            Reset Filters
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-500">Employees</div>
          <div className="mt-2 text-3xl font-bold">{snapshot.employees.total}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <StatusPill>{snapshot.employees.active} active</StatusPill>
            <StatusPill>{snapshot.employees.inactive} inactive</StatusPill>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-500">Leave</div>
          <div className="mt-2 text-3xl font-bold">{snapshot.leaveRequests.total}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <StatusPill>{snapshot.leaveRequests.submitted} submitted</StatusPill>
            <StatusPill>{snapshot.leaveRequests.hrApproved} final approved</StatusPill>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-500">Training</div>
          <div className="mt-2 text-3xl font-bold">{snapshot.training.total}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <StatusPill>{snapshot.training.completed} completed</StatusPill>
            <StatusPill>{snapshot.training.inProgress} in progress</StatusPill>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-500">Payroll</div>
          <div className="mt-2 text-3xl font-bold">{snapshot.payroll.totalEmployees}</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <StatusPill>{snapshot.payroll.releasedPeriods} released</StatusPill>
            <StatusPill>{snapshot.payroll.latestPayslip?.period ?? 'No period'}</StatusPill>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Payroll Summary" action={<StatusPill>{snapshot.payroll.rows.length} employee row(s)</StatusPill>}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Latest Period</div>
              <div className="mt-2 font-semibold text-slate-900">{snapshot.payroll.latestPayslip?.period ?? 'No payroll period'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Gross</div>
              <div className="mt-2 font-semibold text-slate-900">{snapshot.payroll.latestPayslipDetail?.gross ?? 'N/A'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Net</div>
              <div className="mt-2 font-semibold text-slate-900">{snapshot.payroll.latestPayslipDetail?.net ?? 'N/A'}</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {snapshot.payroll.rows.length > 0 ? (
              snapshot.payroll.rows.map((row) => (
                <div key={row.employeeId} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{row.employeeName}</div>
                      <div className="text-sm text-slate-500">{row.employeeId} • {row.department} • {row.role}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Period: {row.period} • {row.payslipStatus}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                      <StatusPill>{row.gross}</StatusPill>
                      <StatusPill>{row.deductions}</StatusPill>
                      <StatusPill>{row.net}</StatusPill>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No payroll data matches the current filters.</div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Attendance / Timecard Summary" action={<StatusPill>{snapshot.attendance.total} entries</StatusPill>}>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Present</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.attendance.present}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Late</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.attendance.late}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Device</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.attendance.device}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Manual</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.attendance.manual}</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {snapshot.attendance.rows.map((row) => (
              <div key={row.date} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{row.date}</div>
                    <div className="text-sm text-slate-500">{row.timeIn} to {row.timeOut}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{row.status}</StatusPill>
                    <StatusPill>{row.source}</StatusPill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Leave Summary" action={<StatusPill>{snapshot.leaveRequests.total} visible</StatusPill>}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Submitted</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.leaveRequests.submitted}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Manager Approved</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.leaveRequests.managerApproved}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">HR Approved</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.leaveRequests.hrApproved}</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {snapshot.leaveRequests.list.length > 0 ? (
              snapshot.leaveRequests.list.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.employeeName}</div>
                      <div className="text-sm text-slate-500">{item.type} • {item.range}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.reason}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>{item.status}</StatusPill>
                      <StatusPill>{item.requestedAt}</StatusPill>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No leave requests match the current filters.</div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Employee Masterlist Export" action={<StatusPill>{snapshot.employees.list.length} visible</StatusPill>}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Active</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.employees.active}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Inactive</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.employees.inactive}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Filtered total</div>
              <div className="mt-2 text-2xl font-bold">{snapshot.employees.total}</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {snapshot.employees.list.length > 0 ? (
              snapshot.employees.list.map((employee) => (
                <div key={employee.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{employee.name}</div>
                      <div className="text-sm text-slate-500">{employee.id} • {employee.department} • {employee.position}</div>
                      <div className="mt-1 text-sm text-slate-500">{employee.email} • {employee.mobile}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>{employee.role}</StatusPill>
                      <StatusPill>{employee.employmentType}</StatusPill>
                      <StatusPill>{employee.isActive ? 'Active' : 'Inactive'}</StatusPill>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No employee records match the current filters.</div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Preview & Notes" action={<StatusPill>Export ready</StatusPill>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Generated</div>
            <div className="mt-2 font-semibold text-slate-900">{snapshot.generatedAt}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Payroll CSV</div>
            <div className="mt-2 font-semibold text-slate-900">{snapshot.payroll.rows.length} rows</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Attendance</div>
            <div className="mt-2 font-semibold text-slate-900">{snapshot.attendance.total} entries</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Shared Snapshot</div>
            <div className="mt-2 font-semibold text-slate-900">Copy or print from live state</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Payroll CSV is grouped by employee. Copy Data exports the current filtered snapshot for sharing, while Print Summary keeps the same live values on paper or PDF.
        </div>
      </SectionCard>
    </div>
  );
}



