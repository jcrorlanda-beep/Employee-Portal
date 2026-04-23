import type { Dispatch, SetStateAction } from 'react';
import { SectionCard, StatusPill } from '../components/shared-ui';

type Role = 'Employee' | 'Manager' | 'HR' | 'Payroll' | 'Admin';

type ActiveAccount = {
  id: string;
  name: string;
  role: Role;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

 type TrainingCatalogStatus = 'Draft' | 'Published';

 type TrainingStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Failed';

type TrainingQuestion = QuizQuestion;

type TrainingModule = {
  id: string;
  title: string;
  category: string;
  description: string;
  required: boolean;
  assignedRoles: Role[];
  quizRequired: boolean;
  passingScore: number;
  questions: QuizQuestion[];
  status: TrainingCatalogStatus;
  createdBy: string;
  createdAt: string;
  publishedAt: string | null;
  video: string;
  restriction: string;
};

type TrainingProgress = {
  moduleId: string;
  employeeId: string;
  employeeName: string;
  status: TrainingStatus;
  score: number | null;
  completionDate: string | null;
  answers: Record<string, string>;
};

type TrainingProps = {
  currentRole: Role;
  activeAccount: ActiveAccount;
  activeEmployeeRecords: Array<{ id: string; role: Role }>;
  visibleTraining: TrainingModule[];
  trainingProgress: TrainingProgress[];
  selectedTrainingTitle: string | null;
  selectedTrainingRecord: TrainingModule | null;
  selectedTrainingProgress: TrainingProgress | null;
  selectedQuestions: TrainingQuestion[];
  quizScore: { score: number; total: number };
  trainingQuizSubmitted: boolean;
  quizAnswers: Record<string, string>;
  employeeAssignedTrainingCount: number;
  newTrainingTitle: string;
  newTrainingCategory: string;
  newTrainingDescription: string;
  newTrainingRequired: boolean;
  newTrainingAssignedRoles: Role[];
  newTrainingQuizRequired: boolean;
  newTrainingPassingScore: number;
  availableRoles: Role[];
  openTraining: (title: string) => void;
  publishTraining: (moduleId: string) => void;
  markTrainingComplete: (module: TrainingModule) => void;
  submitTrainingQuiz: (module: TrainingModule) => void;
  createTraining: (publishNow: boolean) => void;
  setQuizAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  setNewTrainingTitle: Dispatch<SetStateAction<string>>;
  setNewTrainingCategory: Dispatch<SetStateAction<string>>;
  setNewTrainingDescription: Dispatch<SetStateAction<string>>;
  setNewTrainingRequired: Dispatch<SetStateAction<boolean>>;
  setNewTrainingAssignedRoles: Dispatch<SetStateAction<Role[]>>;
  setNewTrainingQuizRequired: Dispatch<SetStateAction<boolean>>;
  setNewTrainingPassingScore: Dispatch<SetStateAction<number>>;
};

export function Training({
  currentRole,
  activeAccount,
  activeEmployeeRecords,
  visibleTraining,
  trainingProgress,
  selectedTrainingTitle,
  selectedTrainingRecord,
  selectedTrainingProgress,
  selectedQuestions,
  quizScore,
  trainingQuizSubmitted,
  quizAnswers,
  employeeAssignedTrainingCount,
  newTrainingTitle,
  newTrainingCategory,
  newTrainingDescription,
  newTrainingRequired,
  newTrainingAssignedRoles,
  newTrainingQuizRequired,
  newTrainingPassingScore,
  availableRoles,
  openTraining,
  publishTraining,
  markTrainingComplete,
  submitTrainingQuiz,
  createTraining,
  setQuizAnswers,
  setNewTrainingTitle,
  setNewTrainingCategory,
  setNewTrainingDescription,
  setNewTrainingRequired,
  setNewTrainingAssignedRoles,
  setNewTrainingQuizRequired,
  setNewTrainingPassingScore,
}: TrainingProps) {
  const selected = selectedTrainingRecord;
  const hasTrainingSelection = Boolean(selectedTrainingTitle);
  const employeeStatus = selectedTrainingProgress?.status ?? (selected ? 'Assigned' : 'Assigned');
  const selectedEmployeeCompletion = selectedTrainingProgress?.completionDate ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard title={currentRole === 'Employee' ? 'Assigned Training' : 'Training Modules'} action={<StatusPill>{currentRole === 'Employee' ? `${employeeAssignedTrainingCount} assigned` : `${visibleTraining.length} total`}</StatusPill>}>
        <div className="space-y-3">
          {visibleTraining.length > 0 ? (
            visibleTraining.map((item) => {
              const progress = trainingProgress.find((entry) => entry.moduleId === item.id && entry.employeeId === activeAccount.id) ?? null;
              const listStatus = currentRole === 'Employee' ? (progress?.status ?? 'Assigned') : item.status;
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
                      <StatusPill>{item.required ? 'Required' : 'Optional'}</StatusPill>
                      <StatusPill>{item.quizRequired ? `Quiz ${item.passingScore}+` : 'No quiz'}</StatusPill>
                      {currentRole !== 'Employee' && <StatusPill>{assignedCount} assigned</StatusPill>}
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">{item.description}</div>
                  <div className="mt-3 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {currentRole === 'Employee'
                        ? progress
                          ? progress.status === 'Completed'
                            ? `Completed by ${progress.employeeName} on ${progress.completionDate ?? item.publishedAt ?? item.createdAt}`
                            : progress.status === 'Failed'
                              ? `Last attempt by ${progress.employeeName} on ${progress.completionDate ?? item.publishedAt ?? item.createdAt}`
                              : `In progress for ${progress.employeeName}`
                          : 'Waiting for your assignment'
                        : item.status === 'Published'
                          ? `Published ${item.publishedAt ?? item.createdAt}`
                          : `Draft created ${item.createdAt}`}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openTraining(item.title)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Open Training</button>
                      {currentRole === 'Admin' && item.status === 'Draft' && (
                        <button onClick={() => publishTraining(item.id)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Publish / Assign</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              {currentRole === 'Employee'
                ? 'No training modules are assigned to this account yet.'
                : 'No training modules are available yet. Create one below to start the workflow.'}
            </div>
          )}
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title={selected ? `Training Viewer • ${selected.title}` : 'Training Viewer'}>
          {selected && selectedTrainingTitle ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">{selected.category}</div>
                    <div className="text-lg font-bold">{selected.title}</div>
                    <div className="mt-1 text-xs text-slate-400">Created by {selected.createdBy} • {selected.createdAt}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{employeeStatus}</StatusPill>
                    <StatusPill>{selected.required ? 'Required' : 'Optional'}</StatusPill>
                    <StatusPill>{selected.quizRequired ? `Passing ${selected.passingScore}%` : 'No quiz'}</StatusPill>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{selected.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{selected.video}</div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{selected.restriction}</div>
                </div>
              </div>

              {selectedTrainingProgress?.status === 'Completed' && (
                <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  Completed on {selectedEmployeeCompletion ?? 'this session'} with score {selectedTrainingProgress.score ?? 0}/{selectedQuestions.length}.
                </div>
              )}
              {selectedTrainingProgress?.status === 'Failed' && (
                <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  Last attempt did not meet the passing score. Current score: {selectedTrainingProgress.score ?? 0}/{selectedQuestions.length}.
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                Embedded training video area
                <div className="mt-3 text-sm">First play: skipping disabled • AFK monitoring enabled • Quiz unlocks after watch compliance</div>
              </div>

              {selected.quizRequired ? (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-base font-semibold">Quiz</div>
                  <div className="mt-2 text-sm text-slate-500">Passing score: {selected.passingScore}%</div>
                  <div className="mt-4 space-y-4">
                    {selectedQuestions.map((question) => (
                      <div key={question.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="font-medium">{question.question}</div>
                        <div className="mt-3 grid gap-2">
                          {question.options.map((option) => (
                            <button key={option} onClick={() => setQuizAnswers((prev) => ({ ...prev, [question.id]: option }))} className={`rounded-xl border px-3 py-2 text-left text-sm ${quizAnswers[question.id] === option ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{option}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => submitTrainingQuiz(selected)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Submit quiz</button>
                  {trainingQuizSubmitted && (
                    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${quizScore.score >= Math.ceil((selected.passingScore / 100) * quizScore.total) ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      Quiz submitted. Score: {quizScore.score}/{quizScore.total}
                      {quizScore.score >= Math.ceil((selected.passingScore / 100) * quizScore.total) ? ' - Passed' : ' - Failed'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                  This module does not require a quiz. Mark it complete when you finish reviewing the content.
                  <button onClick={() => markTrainingComplete(selected)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Mark complete</button>
                </div>
              )}
            </div>
          ) : hasTrainingSelection ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              The selected training module no longer matches any available training details. Please reopen a module from the list to continue safely.
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Open a training module to preview the content and quiz experience.</div>
          )}
        </SectionCard>

        {currentRole === 'Admin' && (
          <SectionCard title="Create Training" action={<StatusPill>Admin only</StatusPill>}>
            <div className="space-y-3">
              <input value={newTrainingTitle} onChange={(e) => setNewTrainingTitle(e.target.value)} placeholder="Training title" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              <input value={newTrainingCategory} onChange={(e) => setNewTrainingCategory(e.target.value)} placeholder="Category" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
              <textarea value={newTrainingDescription} onChange={(e) => setNewTrainingDescription(e.target.value)} placeholder="Training description" className="min-h-[160px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Required</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setNewTrainingRequired(true)} className={`rounded-full px-3 py-2 text-xs font-semibold ${newTrainingRequired ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Yes</button>
                  <button onClick={() => setNewTrainingRequired(false)} className={`rounded-full px-3 py-2 text-xs font-semibold ${!newTrainingRequired ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>No</button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Assigned roles</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableRoles.map((role) => {
                    const isSelected = newTrainingAssignedRoles.includes(role);
                    return (
                      <button key={role} onClick={() => setNewTrainingAssignedRoles((prev) => prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role])} className={`rounded-full px-3 py-2 text-xs font-semibold ${isSelected ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Quiz required</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={() => setNewTrainingQuizRequired(true)} className={`rounded-full px-3 py-2 text-xs font-semibold ${newTrainingQuizRequired ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Yes</button>
                    <button onClick={() => setNewTrainingQuizRequired(false)} className={`rounded-full px-3 py-2 text-xs font-semibold ${!newTrainingQuizRequired ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>No</button>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Passing score</div>
                  <input type="number" min={0} max={100} value={newTrainingPassingScore} onChange={(e) => setNewTrainingPassingScore(Number(e.target.value) || 0)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => createTraining(false)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Save Draft</button>
                <button onClick={() => createTraining(true)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Publish / Assign</button>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}


