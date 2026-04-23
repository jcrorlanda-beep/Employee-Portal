import type { Dispatch, SetStateAction } from 'react';
import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type EmployeeRecord = {
  id: string;
  name: string;
  role: Role;
  department: string;
  position: string;
  email: string;
  mobile: string;
  emergencyContact: string;
  employmentType: string;
  pin: string;
  isActive: boolean;
};

type EmployeeForm = EmployeeRecord;

type AdminProps = {
  currentRole: Role;
  employeeRecords: EmployeeRecord[];
  activeEmployeeRecords: EmployeeRecord[];
  availableRoles: Role[];
  adminItems: string[];
  editingEmployeeId: string | null;
  employeeForm: EmployeeForm;
  setEmployeeForm: Dispatch<SetStateAction<EmployeeForm>>;
  beginEmployeeEdit: (employee: EmployeeRecord) => void;
  toggleEmployeeActive: (employeeId: string) => void;
  saveEmployeeRecord: () => void;
  resetEmployeeForm: () => void;
  setActivePage: (page: string) => void;
};

type EmployeeMasterlistProps = Omit<AdminProps, 'adminItems' | 'setActivePage'>;

export function EmployeeMasterlist({
  currentRole,
  employeeRecords,
  activeEmployeeRecords,
  availableRoles,
  editingEmployeeId,
  employeeForm,
  setEmployeeForm,
  beginEmployeeEdit,
  toggleEmployeeActive,
  saveEmployeeRecord,
  resetEmployeeForm,
}: EmployeeMasterlistProps) {
  const totalEmployees = employeeRecords.length;
  const activeCount = activeEmployeeRecords.length;
  const inactiveCount = totalEmployees - activeCount;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Employee Masterlist</div>
              <h3 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Employee management and directory</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage employee records without changing the current test-account login flow. Add or update employees here, and the directory will stay available across the app.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>{totalEmployees} total</StatusPill>
              <StatusPill>{activeCount} active</StatusPill>
              <StatusPill>{inactiveCount} inactive</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Employee Directory" action={<StatusPill>{totalEmployees} record(s)</StatusPill>}>
          <div className="space-y-3">
            {employeeRecords.length > 0 ? (
              employeeRecords.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.id} • {item.department}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.position}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>{item.role}</StatusPill>
                      <StatusPill>{item.employmentType}</StatusPill>
                      <StatusPill>{item.isActive ? 'Active' : 'Inactive'}</StatusPill>
                      {currentRole === 'Admin' && (
                        <>
                          <button onClick={() => beginEmployeeEdit(item)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Edit</button>
                          <button onClick={() => toggleEmployeeActive(item.id)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                            {item.isActive ? 'Set Inactive' : 'Set Active'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Email: {item.email}</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Mobile: {item.mobile}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No employee records are available yet.</div>
            )}
          </div>
        </SectionCard>

        {currentRole === 'Admin' ? (
          <SectionCard title={editingEmployeeId ? 'Edit Employee' : 'Add Employee'} action={<StatusPill>Admin only</StatusPill>}>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={employeeForm.name} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
                <input value={employeeForm.id} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, id: e.target.value }))} placeholder="Employee ID" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <select value={employeeForm.role} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, role: e.target.value as Role }))} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
                  {availableRoles.map((role) => <option key={role}>{role}</option>)}
                </select>
                <input value={employeeForm.department} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, department: e.target.value }))} placeholder="Department" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input value={employeeForm.position} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, position: e.target.value }))} placeholder="Position" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
                <input value={employeeForm.employmentType} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, employmentType: e.target.value }))} placeholder="Employment type" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input value={employeeForm.email} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
                <input value={employeeForm.mobile} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, mobile: e.target.value }))} placeholder="Mobile" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="password"
                  inputMode="numeric"
                  value={employeeForm.pin}
                  onChange={(e) => setEmployeeForm((prev) => ({ ...prev, pin: e.target.value }))}
                  placeholder="Simple PIN"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm tracking-[0.35em]"
                />
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  PIN is used for quick account unlock and can stay simple for MVP testing.
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Status</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setEmployeeForm((prev) => ({ ...prev, isActive: true }))} className={`rounded-full px-3 py-2 text-xs font-semibold ${employeeForm.isActive ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Active</button>
                  <button onClick={() => setEmployeeForm((prev) => ({ ...prev, isActive: false }))} className={`rounded-full px-3 py-2 text-xs font-semibold ${!employeeForm.isActive ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Inactive</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={saveEmployeeRecord} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Save Employee</button>
                <button onClick={resetEmployeeForm} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">New Employee</button>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Updated employee records appear in the directory and in app selectors that rely on the employee list. Test-account persona shortcuts remain unchanged.
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Employee Management" action={<StatusPill>View only</StatusPill>}>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              This view stays read-only outside Admin. The directory is shared across the app, while the quick test-account login flow stays intact.
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export function AdminDashboard({ setActivePage, adminItems }: Pick<AdminProps, 'setActivePage' | 'adminItems'>) {
  return (
    <SectionCard title="Admin Controls">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <button onClick={() => setActivePage('Employee Masterlist')} className="rounded-2xl border border-slate-200 p-4 text-left font-semibold transition hover:border-slate-300 hover:bg-slate-50">
          <div>Employee Management</div>
          <div className="mt-1 text-sm font-normal text-slate-500">Open the masterlist to add or update employees.</div>
        </button>
        {adminItems.map((item) => <div key={item} className="rounded-2xl border border-slate-200 p-4 font-semibold">{item}</div>)}
      </div>
    </SectionCard>
  );
}


