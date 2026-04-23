import { SectionCard, StatusPill } from "../components/shared-ui";

type Role = "Employee" | "Manager" | "HR" | "Payroll" | "Admin";
type WriteupStatus = "Pending Review" | "Pending Acknowledgment" | "Pending Signature" | "Acknowledged" | "Signed" | "Closed";
type WriteupSignatureMethod = "Registered Signature" | "Freeform Signature";

type WriteupTrailEntry = {
  action: string;
  actorName: string;
  dateTime: string;
  note?: string;
  signatureMethod?: WriteupSignatureMethod;
};

type WriteupRecord = {
  id: string;
  employeeId: string;
  employee: string;
  category: string;
  title: string;
  createdAt: string;
  status: WriteupStatus;
  severity: string;
  acknowledgmentRequired: boolean;
  signatureRequired: boolean;
  releasedAt: string | null;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  signedBy: string | null;
  signedAt: string | null;
  signatureMethod: WriteupSignatureMethod | null;
  trail: WriteupTrailEntry[];
};

type EmployeeRecord = {
  id: string;
  name: string;
  isActive: boolean;
};

type ActiveAccount = {
  id: string;
  name: string;
  role: Role;
};

type WriteupsProps = {
  currentRole: Role;
  activeAccount: ActiveAccount;
  activeEmployeeRecords: EmployeeRecord[];
  filteredWriteups: WriteupRecord[];
  selectedWriteupId: string | null;
  selectedWriteupRecord: WriteupRecord | null;
  selectedWriteupSignatureMethod: WriteupSignatureMethod;
  newWriteupEmployeeId: string;
  newWriteupCategory: string;
  newWriteupSeverity: string;
  newWriteupAcknowledgmentRequired: boolean;
  newWriteupSignatureRequired: boolean;
  newWriteupTitle: string;
  openWriteup: (id: string) => void;
  releaseWriteup: (id: string) => void;
  acknowledgeWriteup: (id: string) => void;
  signWriteup: (id: string, method: WriteupSignatureMethod) => void;
  closeWriteup: (id: string) => void;
  addWriteup: () => void;
  setSelectedWriteupSignatureMethod: (method: WriteupSignatureMethod) => void;
  setNewWriteupEmployeeId: (value: string) => void;
  setNewWriteupCategory: (value: string) => void;
  setNewWriteupSeverity: (value: string) => void;
  setNewWriteupAcknowledgmentRequired: (value: boolean) => void;
  setNewWriteupSignatureRequired: (value: boolean) => void;
  setNewWriteupTitle: (value: string) => void;
};

export function Writeups({
  currentRole,
  activeAccount,
  activeEmployeeRecords,
  filteredWriteups,
  selectedWriteupId,
  selectedWriteupRecord,
  selectedWriteupSignatureMethod,
  newWriteupEmployeeId,
  newWriteupCategory,
  newWriteupSeverity,
  newWriteupAcknowledgmentRequired,
  newWriteupSignatureRequired,
  newWriteupTitle,
  openWriteup,
  releaseWriteup,
  acknowledgeWriteup,
  signWriteup,
  closeWriteup,
  addWriteup,
  setSelectedWriteupSignatureMethod,
  setNewWriteupEmployeeId,
  setNewWriteupCategory,
  setNewWriteupSeverity,
  setNewWriteupAcknowledgmentRequired,
  setNewWriteupSignatureRequired,
  setNewWriteupTitle,
}: WriteupsProps) {
  const selected = selectedWriteupRecord;
  const canManageWriteups = currentRole === "Manager" || currentRole === "HR" || currentRole === "Admin";
  const canEmployeeAct = currentRole === "Employee" && selected?.employeeId === activeAccount.id;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title={currentRole === "Employee" ? "My Writeups" : "Writeup Records"} action={<StatusPill>{filteredWriteups.length} record(s)</StatusPill>}>
        <div className="space-y-3">
          {filteredWriteups.length > 0 ? (
            filteredWriteups.map((item) => {
              const isSelected = item.id === selectedWriteupId;

              return (
                <div key={item.id} className={`rounded-2xl border p-4 ${isSelected ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-base font-semibold">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.employee}</div>
                      <div className="mt-1 text-xs text-slate-400">Issued: {item.createdAt}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill>{item.category}</StatusPill>
                      <StatusPill>{item.status}</StatusPill>
                      <StatusPill>{item.severity}</StatusPill>
                      <StatusPill>{item.acknowledgmentRequired ? "Ack required" : "Ack optional"}</StatusPill>
                      <StatusPill>{item.signatureRequired ? "Signature required" : "No signature"}</StatusPill>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{item.status === "Pending Review" ? "Receipt / review only, not agreement." : "Open to view the receipt and review trail."}</span>
                    <button onClick={() => openWriteup(item.id)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Open Writeup</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              {currentRole === "Employee"
                ? "No writeup records are available for this account yet. Employee writeups assigned to you will appear here."
                : "No writeup records are available yet. Create one from the panel on the right or wait for records to sync in."}
            </div>
          )}
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title={selected ? `Writeup Viewer • ${selected.title}` : "Writeup Viewer"}>
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">{selected.category}</div>
                    <div className="text-lg font-bold">{selected.title}</div>
                    <div className="mt-1 text-xs text-slate-400">For {selected.employee} • {selected.createdAt}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{selected.status}</StatusPill>
                    <StatusPill>{selected.acknowledgmentRequired ? "Ack required" : "Ack optional"}</StatusPill>
                    <StatusPill>{selected.signatureRequired ? "Signature required" : "No signature"}</StatusPill>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">Acknowledgment and signature only confirm receipt and review of this writeup. They do not automatically mean agreement.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Requested by: {selected.employee}</div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Released: {selected.releasedAt ?? "Not released yet"}</div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Acknowledged: {selected.acknowledgedBy ? `${selected.acknowledgedBy} • ${selected.acknowledgedAt}` : "Not yet"}</div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Signed: {selected.signedBy ? `${selected.signedBy} • ${selected.signedAt}` : "Not yet"}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Receipt and review trail</div>
                <div className="mt-4 space-y-3">
                  {selected.trail.map((entry) => (
                    <div key={`${selected.id}-${entry.action}-${entry.dateTime}`} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">{entry.action}</div>
                        <div className="text-xs text-slate-400">{entry.dateTime}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{entry.actorName}</div>
                      {entry.signatureMethod && <div className="mt-1 text-xs text-slate-500">Method: {entry.signatureMethod}</div>}
                      {entry.note && <div className="mt-1 leading-6 text-slate-500">{entry.note}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {selected.status === "Pending Review" && canManageWriteups && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">Release writeup</div>
                  <p className="mt-2 leading-6">Move this writeup into the employee review flow. Acknowledgment and signature remain separate from agreement.</p>
                  <button onClick={() => releaseWriteup(selected.id)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Release Writeup</button>
                </div>
              )}

              {canEmployeeAct && selected.status === "Pending Acknowledgment" && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">Acknowledge receipt</div>
                  <p className="mt-2 leading-6">Acknowledgment confirms receipt and review, not agreement with the writeup.</p>
                  <button onClick={() => acknowledgeWriteup(selected.id)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Acknowledge Receipt</button>
                </div>
              )}

              {canEmployeeAct && selected.status === "Pending Signature" && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">Signature required</div>
                  <p className="mt-2 leading-6">Signature confirms receipt and review, not automatic agreement.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["Registered Signature", "Freeform Signature"] as WriteupSignatureMethod[]).map((method) => (
                      <button key={method} onClick={() => setSelectedWriteupSignatureMethod(method)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedWriteupSignatureMethod === method ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{method}</button>
                    ))}
                  </div>
                  <button onClick={() => signWriteup(selected.id, selectedWriteupSignatureMethod)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Apply signature</button>
                </div>
              )}

              {(selected.status === "Acknowledged" || selected.status === "Signed") && canManageWriteups && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">Close writeup</div>
                  <p className="mt-2 leading-6">Mark the writeup closed once review is complete.</p>
                  <button onClick={() => closeWriteup(selected.id)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Close Writeup</button>
                </div>
              )}

              {selected.status === "Closed" && (
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Writeup is closed.</div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Open a writeup to review receipt, acknowledgment, and signature details.</div>
          )}
        </SectionCard>

        {canManageWriteups ? (
          <SectionCard title="Create Writeup">
            <div className="space-y-3">
              <select value={newWriteupEmployeeId} onChange={(e) => setNewWriteupEmployeeId(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
                {activeEmployeeRecords.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <select value={newWriteupCategory} onChange={(e) => setNewWriteupCategory(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
                {["Attendance", "Incident Report", "Performance", "Commendation", "Coaching"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={newWriteupSeverity} onChange={(e) => setNewWriteupSeverity(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
                {["Minor", "Moderate", "Major", "Positive"].map((item) => <option key={item}>{item}</option>)}
              </select>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Acknowledgment required</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setNewWriteupAcknowledgmentRequired(true)} className={`rounded-full px-3 py-2 text-xs font-semibold ${newWriteupAcknowledgmentRequired ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>Yes</button>
                  <button onClick={() => setNewWriteupAcknowledgmentRequired(false)} className={`rounded-full px-3 py-2 text-xs font-semibold ${!newWriteupAcknowledgmentRequired ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>No</button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Signature required</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setNewWriteupSignatureRequired(true)} className={`rounded-full px-3 py-2 text-xs font-semibold ${newWriteupSignatureRequired ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>Yes</button>
                  <button onClick={() => setNewWriteupSignatureRequired(false)} className={`rounded-full px-3 py-2 text-xs font-semibold ${!newWriteupSignatureRequired ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>No</button>
                </div>
              </div>

              <input value={newWriteupTitle} onChange={(e) => setNewWriteupTitle(e.target.value)} placeholder="Writeup title" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              <button onClick={addWriteup} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Add Writeup</button>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Create Writeup">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Employees can open writeups here and complete acknowledgment or signature when required.</div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
