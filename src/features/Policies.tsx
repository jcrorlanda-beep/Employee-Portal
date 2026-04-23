import type { Dispatch, SetStateAction } from 'react';
import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = "Employee" | "Manager" | "HR" | "Payroll" | "Admin";
type PolicyMethod = "Registered Signature" | "Freeform Signature" | "Acknowledge Only";
type PolicyStatus = "Draft" | "Published";

type ActiveAccount = {
  id: string;
  name: string;
  role: Role;
};

type EmployeeRecord = {
  id: string;
  name: string;
  role: Role;
  isActive: boolean;
};

type PolicyRecord = {
  id: string;
  title: string;
  category: string;
  content: string;
  required: boolean;
  assignedRoles: Role[];
  status: PolicyStatus;
  createdBy: string;
  createdAt: string;
  publishedAt: string | null;
};

type PolicySignature = {
  policyId: string;
  employeeId: string;
  employeeName: string;
  signedAt: string;
  method: PolicyMethod;
};

type PoliciesProps = {
  currentRole: Role;
  activeAccount: ActiveAccount;
  activeEmployeeRecords: EmployeeRecord[];
  visiblePolicies: PolicyRecord[];
  selectedPolicyTitle: string | null;
  selectedPolicyRecord: PolicyRecord | null;
  selectedPolicySignature: PolicySignature | null;
  selectedPolicyMethod: PolicyMethod;
  newPolicyTitle: string;
  newPolicyCategory: string;
  newPolicyContent: string;
  newPolicyRequired: boolean;
  newPolicyAssignedRoles: Role[];
  availableRoles: Role[];
  employeeAssignedPolicyCount: number;
  selectedPolicyStatus: string;
  openPolicy: (title: string) => void;
  publishPolicy: (policyId: string) => void;
  signCurrentPolicy: (method: PolicyMethod) => void;
  createPolicy: (publishNow: boolean) => void;
  setSelectedPolicyMethod: (method: PolicyMethod) => void;
  setFreeformSigned: (value: boolean) => void;
  setRegisteredConfirmed: (value: boolean) => void;
  setPolicyAcknowledged: (value: boolean) => void;
  setNewPolicyTitle: (value: string) => void;
  setNewPolicyCategory: (value: string) => void;
  setNewPolicyContent: (value: string) => void;
  setNewPolicyRequired: (value: boolean) => void;
  setNewPolicyAssignedRoles: Dispatch<SetStateAction<Role[]>>;
};

export function Policies({
  currentRole,
  activeAccount,
  activeEmployeeRecords,
  visiblePolicies,
  selectedPolicyTitle,
  selectedPolicyRecord,
  selectedPolicySignature,
  selectedPolicyMethod,
  newPolicyTitle,
  newPolicyCategory,
  newPolicyContent,
  newPolicyRequired,
  newPolicyAssignedRoles,
  availableRoles,
  employeeAssignedPolicyCount,
  selectedPolicyStatus,
  openPolicy,
  publishPolicy,
  signCurrentPolicy,
  createPolicy,
  setSelectedPolicyMethod,
  setFreeformSigned,
  setRegisteredConfirmed,
  setPolicyAcknowledged,
  setNewPolicyTitle,
  setNewPolicyCategory,
  setNewPolicyContent,
  setNewPolicyRequired,
  setNewPolicyAssignedRoles,
}: PoliciesProps) {
  const hasPolicySelection = Boolean(selectedPolicyTitle);
  const selectedPolicyBody = selectedPolicyRecord ? selectedPolicyRecord.content.split("\n").map((line) => line.trim()).filter(Boolean) : [];
  const selectedPolicyAssignedCount = selectedPolicyRecord ? activeEmployeeRecords.filter((item) => selectedPolicyRecord.assignedRoles.includes(item.role)).length : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard
        title={currentRole === "Employee" ? "Assigned Policies" : "Company Policies"}
        action={<StatusPill>{currentRole === "Employee" ? `${employeeAssignedPolicyCount} assigned` : `${visiblePolicies.length} total`}</StatusPill>}
      >
        <div className="space-y-3">
          {visiblePolicies.length > 0 ? (
            visiblePolicies.map((item) => {
              const signature = selectedPolicySignature && selectedPolicyRecord?.id === item.id
                ? selectedPolicySignature
                : null;
              const listStatus = currentRole === "Employee" ? (signature ? "Signed" : "Pending") : item.status;
              const assignedCount = activeEmployeeRecords.filter((account) => item.assignedRoles.includes(account.role)).length;

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.category}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>{listStatus}</StatusPill>
                      <StatusPill>{item.required ? "Required" : "Optional"}</StatusPill>
                      {currentRole !== "Employee" && <StatusPill>{assignedCount} assigned</StatusPill>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {currentRole === "Employee"
                        ? signature
                          ? `Signed by ${signature.employeeName} on ${signature.signedAt}`
                          : "Waiting for your signature"
                        : item.status === "Published"
                          ? `Published ${item.publishedAt ?? item.createdAt}`
                          : `Draft created ${item.createdAt}`}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openPolicy(item.title)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Open Policy</button>
                      {currentRole === "Admin" && item.status === "Draft" && (
                        <button onClick={() => publishPolicy(item.id)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Publish</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              {currentRole === "Employee"
                ? "No policies are assigned to this account yet."
                : "No policies are available yet. Create one below to start the workflow."}
            </div>
          )}
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title={selectedPolicyRecord ? `Policy Viewer • ${selectedPolicyRecord.title}` : "Policy Viewer"}>
          {selectedPolicyRecord && selectedPolicyTitle ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">{selectedPolicyRecord.category}</div>
                    <div className="text-lg font-bold">{selectedPolicyRecord.title}</div>
                    <div className="mt-1 text-xs text-slate-400">Created by {selectedPolicyRecord.createdBy} • {selectedPolicyRecord.createdAt}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{selectedPolicyStatus}</StatusPill>
                    <StatusPill>{selectedPolicyRecord.required ? "Required" : "Optional"}</StatusPill>
                    <StatusPill>{selectedPolicyAssignedCount} role(s)</StatusPill>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{selectedPolicyBody[0] ?? "Policy details are available below."}</p>
                <div className="mt-4 space-y-3">{selectedPolicyBody.map((line) => <div key={line} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{line}</div>)}</div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="text-sm font-semibold">Signing method</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["Registered Signature", "Freeform Signature", "Acknowledge Only"] as PolicyMethod[]).map((item) => (
                      <button key={item} onClick={() => { setSelectedPolicyMethod(item); setFreeformSigned(false); setRegisteredConfirmed(false); setPolicyAcknowledged(false); }} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedPolicyMethod === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{item}</button>
                    ))}
                  </div>
                </div>

                {selectedPolicySignature && (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    Signed by {selectedPolicySignature.employeeName} on {selectedPolicySignature.signedAt}
                  </div>
                )}

                {selectedPolicyMethod === "Registered Signature" && (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="font-semibold text-slate-900">Identity confirmation</div>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">Last name: {activeAccount.name.split(" ").slice(-1)[0]}</div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">Date of birth verification prompt</div>
                    </div>
                    <button onClick={() => { setRegisteredConfirmed(true); signCurrentPolicy("Registered Signature"); }} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Confirm and apply registered signature</button>
                    {typeof setRegisteredConfirmed === "function" && null}
                  </div>
                )}
                {selectedPolicyMethod === "Freeform Signature" && (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="font-semibold text-slate-900">Freeform signature pad</div>
                    <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">Device signature area</div>
                    <button onClick={() => { setFreeformSigned(true); signCurrentPolicy("Freeform Signature"); }} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Save freeform signature</button>
                  </div>
                )}
                {selectedPolicyMethod === "Acknowledge Only" && (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="font-semibold text-slate-900">Acknowledge policy</div>
                    <p className="mt-2">Employee confirms that the policy has been read and understood.</p>
                    <button onClick={() => { setPolicyAcknowledged(true); signCurrentPolicy("Acknowledge Only"); }} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Acknowledge policy</button>
                  </div>
                )}
              </div>
            </div>
          ) : hasPolicySelection ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              The selected policy no longer matches any available policy details. Please reopen a policy from the list to continue safely.
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Open a policy from the list to preview the document and signing flow.</div>
          )}
        </SectionCard>

        {currentRole === "Admin" && (
          <SectionCard title="Create Policy" action={<StatusPill>Admin only</StatusPill>}>
            <div className="space-y-3">
              <input value={newPolicyTitle} onChange={(e) => setNewPolicyTitle(e.target.value)} placeholder="Policy title" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              <input value={newPolicyCategory} onChange={(e) => setNewPolicyCategory(e.target.value)} placeholder="Category" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              <textarea value={newPolicyContent} onChange={(e) => setNewPolicyContent(e.target.value)} placeholder="Policy content" className="min-h-[160px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Required</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setNewPolicyRequired(true)} className={`rounded-full px-3 py-2 text-xs font-semibold ${newPolicyRequired ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>Yes</button>
                  <button onClick={() => setNewPolicyRequired(false)} className={`rounded-full px-3 py-2 text-xs font-semibold ${!newPolicyRequired ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>No</button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Assigned roles</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableRoles.map((role) => {
                    const isSelected = newPolicyAssignedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => setNewPolicyAssignedRoles((prev) => prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role])}
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${isSelected ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => createPolicy(false)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Save Draft</button>
                <button onClick={() => createPolicy(true)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Publish Policy</button>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}



