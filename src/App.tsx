import { useEffect, useMemo, useState } from 'react';
import { SectionCard, StatusPill } from './components/shared-ui';
import { Policies as PolicyManagement } from './features/Policies';
import { Training as TrainingManagement } from './features/Training';
import { Leave as LeaveManagement } from './features/Leave';
import { Schedule as ScheduleManagement } from './features/Schedule';
import { Notifications as NotificationsManagement } from './features/Notifications';
import { Reports as ReportsManagement } from './features/Reports';
import { Writeups as WriteupManagement } from './features/Writeups';
import { AdminDashboard, EmployeeMasterlist } from './features/Admin';
import { DashboardHome } from './features/Dashboard';

type Role = "Employee" | "Manager" | "HR" | "Payroll" | "Admin";
type PolicyMethod = "Registered Signature" | "Freeform Signature" | "Acknowledge Only";

type TestAccount = {
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
};

type EmployeeRecord = TestAccount & {
  isActive: boolean;
};

type AuthSession = {
  accountId: string;
  role: Role;
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

type LeaveStatus = "Draft" | "Submitted" | "Manager Approved" | "Manager Rejected" | "HR Approved" | "HR Rejected" | "Cancelled";

type LeaveTrailEntry = {
  status: LeaveStatus;
  actorName: string;
  date: string;
  note?: string;
};

type Writeup = {
  id: string;
  employeeId: string;
  employee: string;
  category: string;
  title: string;
  date: string;
  status: WriteupStatus;
  severity: string;
  acknowledgmentRequired: boolean;
  signatureRequired: boolean;
  createdAt: string;
  releasedAt: string | null;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  signedBy: string | null;
  signedAt: string | null;
  signatureMethod: WriteupSignatureMethod | null;
  trail: WriteupTrailEntry[];
};

type WriteupStatus = "Pending Review" | "Pending Acknowledgment" | "Pending Signature" | "Acknowledged" | "Signed" | "Closed";

type WriteupSignatureMethod = "Registered Signature" | "Freeform Signature";

type WriteupTrailEntry = {
  action: string;
  actorName: string;
  dateTime: string;
  note?: string;
  signatureMethod?: WriteupSignatureMethod;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

type TrainingCatalogStatus = "Draft" | "Published";

type TrainingStatus = "Assigned" | "In Progress" | "Completed" | "Failed";

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

type ScheduleStatus = "Workday" | "Rest Day" | "Leave" | "Holiday" | "Training";

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
  source: "Manual" | "Leave";
};

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

type PolicyStatus = "Draft" | "Published";

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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const testAccounts: TestAccount[] = [
  {
    id: "EMP-001",
    name: "Jomar Carlo",
    role: "Employee",
    department: "Operations",
    position: "Service Staff",
    email: "jomar@example.com",
    mobile: "+63 917 000 0000",
    emergencyContact: "Maria Carlo",
    employmentType: "Regular",
    pin: "1111",
  },
  {
    id: "MGR-014",
    name: "Ana Reyes",
    role: "Manager",
    department: "Operations",
    position: "Operations Manager",
    email: "ana.reyes@example.com",
    mobile: "+63 917 222 1000",
    emergencyContact: "Luis Reyes",
    employmentType: "Regular",
    pin: "2222",
  },
  {
    id: "HR-007",
    name: "Mika Santos",
    role: "HR",
    department: "Human Resources",
    position: "HR Officer",
    email: "mika.santos@example.com",
    mobile: "+63 917 333 2000",
    emergencyContact: "Nina Santos",
    employmentType: "Regular",
    pin: "3333",
  },
  {
    id: "PAY-003",
    name: "Paolo Lim",
    role: "Payroll",
    department: "Finance",
    position: "Payroll Staff",
    email: "paolo.lim@example.com",
    mobile: "+63 917 444 3000",
    emergencyContact: "Mira Lim",
    employmentType: "Regular",
    pin: "4444",
  },
  {
    id: "ADM-001",
    name: "Pat Garcia",
    role: "Admin",
    department: "System Administration",
    position: "Super Admin",
    email: "pat.garcia@example.com",
    mobile: "+63 917 555 4000",
    emergencyContact: "Alex Garcia",
    employmentType: "Regular",
    pin: "5555",
  },
];

const initialEmployeeRecords: EmployeeRecord[] = testAccounts.map((account) => ({
  ...account,
  isActive: true,
}));

const roleMenus: Record<Role, string[]> = {
  Employee: [
    "Dashboard",
    "Notifications",
    "My Profile",
    "Attendance",
    "Schedule",
    "Leave",
    "Payslips",
    "Benefits",
    "Writeups",
    "Policies",
    "Training",
    "Announcements",
    "Documents",
    "Support",
  ],
  Manager: [
    "Dashboard",
    "Notifications",
    "Team Attendance",
    "Schedule",
    "Leave Approvals",
    "Writeups",
    "Policies",
    "Training",
    "Announcements",
    "Documents",
    "Support",
  ],
  HR: [
    "Dashboard",
    "Notifications",
    "Employee Masterlist",
    "Attendance Review",
    "Schedule",
    "Leave Approvals",
    "Writeups",
    "Benefits",
    "Policies",
    "Training",
    "Announcements",
    "Documents",
    "Reports",
    "Admin",
  ],
  Payroll: ["Dashboard", "Notifications", "Schedule", "Payslips", "Benefits", "Announcements", "Documents", "Reports"],
  Admin: [
    "Dashboard",
    "Notifications",
    "Employee Masterlist",
    "Attendance Review",
    "Schedule",
    "Leave Approvals",
    "Payslips",
    "Benefits",
    "Writeups",
    "Policies",
    "Training",
    "Announcements",
    "Documents",
    "Reports",
    "Admin",
  ],
};

const roleBadges: Record<Role, string> = {
  Employee: "Self-Service",
  Manager: "Approvals",
  HR: "HR Operations",
  Payroll: "Payroll",
  Admin: "System Access",
};

const availableRoles: Role[] = ["Employee", "Manager", "HR", "Payroll", "Admin"];

const dashboardStatsByRole: Record<Role, { title: string; value: string; sub: string }[]> = {
  Employee: [
    { title: "Attendance Today", value: "Present", sub: "Clock in: 8:04 AM" },
    { title: "Leave Balance", value: "8 Days", sub: "Vacation + sick leave" },
    { title: "Latest Payslip", value: "Available", sub: "Current cutoff posted" },
    { title: "Policy Signatures", value: "2 Pending", sub: "Due this week" },
  ],
  Manager: [
    { title: "Team Present", value: "18 / 21", sub: "3 still incomplete" },
    { title: "Leave Requests", value: "4", sub: "Need manager review" },
    { title: "Pending Writeups", value: "2", sub: "Awaiting HR review" },
    { title: "Training Overdue", value: "3", sub: "Service modules" },
  ],
  HR: [
    { title: "Active Employees", value: "126", sub: "Across all departments" },
    { title: "Pending HR Approvals", value: "9", sub: "Leave + writeups" },
    { title: "Unsigned Policies", value: "17", sub: "Need follow-up" },
    { title: "Training Compliance", value: "91%", sub: "This month" },
  ],
  Payroll: [
    { title: "Payroll Cycle", value: "Open", sub: "April 16–30" },
    { title: "Payslips Published", value: "102", sub: "24 pending release" },
    { title: "Benefit Deductions", value: "Synced", sub: "Latest batch complete" },
    { title: "Correction Requests", value: "3", sub: "Requires review" },
  ],
  Admin: [
    { title: "Users", value: "144", sub: "5 roles configured" },
    { title: "Open Actions", value: "31", sub: "Across all modules" },
    { title: "Audit Events", value: "284", sub: "Last 7 days" },
    { title: "System Status", value: "Stable", sub: "Release mode" },
  ],
};

const announcements = [
  {
    title: "Holiday Schedule Update",
    date: "Apr 20",
    body: "Revised holiday and skeleton staffing schedule is now available for all departments.",
  },
  {
    title: "Payroll Release Reminder",
    date: "Apr 18",
    body: "Payslips for the current cycle are now visible in the Payroll section.",
  },
  {
    title: "Mandatory Safety Training",
    date: "Apr 15",
    body: "All employees are required to complete the quarterly training module before Friday.",
  },
];

const attendanceRows = [
  { date: "2026-04-20", timeIn: "08:04 AM", timeOut: "05:12 PM", source: "Device", status: "Present" },
  { date: "2026-04-19", timeIn: "08:09 AM", timeOut: "05:06 PM", source: "Manual Approved", status: "Late" },
  { date: "2026-04-18", timeIn: "07:58 AM", timeOut: "05:03 PM", source: "Device", status: "Present" },
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "LV-001",
    employeeId: "EMP-001",
    employeeName: "Jomar Carlo",
    type: "Vacation Leave",
    range: "May 02–03",
    reason: "Family trip",
    status: "Submitted",
    requestedAt: "Apr 20, 2026",
    trail: [
      { status: "Draft", actorName: "Jomar Carlo", date: "Apr 20, 2026", note: "Draft created" },
      { status: "Submitted", actorName: "Jomar Carlo", date: "Apr 20, 2026", note: "Submitted for review" },
    ],
  },
  {
    id: "LV-002",
    employeeId: "EMP-001",
    employeeName: "Jomar Carlo",
    type: "Sick Leave",
    range: "Apr 11",
    reason: "Fever",
    status: "HR Approved",
    requestedAt: "Apr 11, 2026",
    approverName: "Mika Santos",
    decisionDate: "Apr 11, 2026",
    reviewNote: "Approved after manager review",
    trail: [
      { status: "Draft", actorName: "Jomar Carlo", date: "Apr 10, 2026", note: "Draft created" },
      { status: "Submitted", actorName: "Jomar Carlo", date: "Apr 10, 2026", note: "Submitted for review" },
      { status: "Manager Approved", actorName: "Ana Reyes", date: "Apr 10, 2026", note: "Reason verified" },
      { status: "HR Approved", actorName: "Mika Santos", date: "Apr 11, 2026", note: "Final approval" },
    ],
  },
  {
    id: "LV-003",
    employeeId: "MGR-014",
    employeeName: "Ana Reyes",
    type: "Emergency Leave",
    range: "Mar 21",
    reason: "Personal matter",
    status: "HR Approved",
    requestedAt: "Mar 20, 2026",
    approverName: "Mika Santos",
    decisionDate: "Mar 20, 2026",
    reviewNote: "Closed in the previous flow",
    trail: [
      { status: "Draft", actorName: "Ana Reyes", date: "Mar 20, 2026", note: "Draft created" },
      { status: "Submitted", actorName: "Ana Reyes", date: "Mar 20, 2026", note: "Submitted for review" },
      { status: "Manager Approved", actorName: "Ana Reyes", date: "Mar 20, 2026", note: "Manager approval recorded" },
      { status: "HR Approved", actorName: "Mika Santos", date: "Mar 20, 2026", note: "Final approval recorded" },
    ],
  },
];

const payslips = [
  { period: "Apr 01–15, 2026", status: "Released", type: "Uploaded PDF + Summary" },
  { period: "Mar 16–31, 2026", status: "Released", type: "Uploaded PDF + Summary" },
  { period: "Mar 01–15, 2026", status: "Released", type: "Uploaded PDF" },
];

const initialWriteups: Writeup[] = [
  {
    id: "WR-001",
    employeeId: "EMP-001",
    employee: "Jomar Carlo",
    category: "Attendance",
    title: "Late Attendance Warning",
    date: "Apr 17",
    status: "Pending Acknowledgment",
    severity: "Minor",
    acknowledgmentRequired: true,
    signatureRequired: false,
    createdAt: "Apr 17, 2026",
    releasedAt: "Apr 17, 2026",
    acknowledgedBy: null,
    acknowledgedAt: null,
    signedBy: null,
    signedAt: null,
    signatureMethod: null,
    trail: [
      { action: "Created", actorName: "Ana Reyes", dateTime: "Apr 17, 2026", note: "Writeup created" },
      { action: "Released", actorName: "Ana Reyes", dateTime: "Apr 17, 2026", note: "Released for acknowledgment" },
    ],
  },
  {
    id: "WR-002",
    employeeId: "MGR-014",
    employee: "Ana Reyes",
    category: "Incident Report",
    title: "Workplace Safety Observation",
    date: "Apr 14",
    status: "Signed",
    severity: "Moderate",
    acknowledgmentRequired: true,
    signatureRequired: true,
    createdAt: "Apr 14, 2026",
    releasedAt: "Apr 14, 2026",
    acknowledgedBy: "Ana Reyes",
    acknowledgedAt: "Apr 14, 2026",
    signedBy: "Ana Reyes",
    signedAt: "Apr 14, 2026",
    signatureMethod: "Registered Signature",
    trail: [
      { action: "Created", actorName: "Mika Santos", dateTime: "Apr 14, 2026", note: "Writeup created" },
      { action: "Released", actorName: "Mika Santos", dateTime: "Apr 14, 2026", note: "Released for acknowledgment" },
      { action: "Acknowledged", actorName: "Ana Reyes", dateTime: "Apr 14, 2026", note: "Receipt confirmed" },
      { action: "Signed", actorName: "Ana Reyes", dateTime: "Apr 14, 2026", note: "Signed using registered signature", signatureMethod: "Registered Signature" },
    ],
  },
  {
    id: "WR-003",
    employeeId: "EMP-001",
    employee: "Jomar Carlo",
    category: "Commendation",
    title: "Excellent Customer Support",
    date: "Apr 10",
    status: "Closed",
    severity: "Positive",
    acknowledgmentRequired: false,
    signatureRequired: false,
    createdAt: "Apr 10, 2026",
    releasedAt: "Apr 10, 2026",
    acknowledgedBy: null,
    acknowledgedAt: null,
    signedBy: null,
    signedAt: null,
    signatureMethod: null,
    trail: [
      { action: "Created", actorName: "Ana Reyes", dateTime: "Apr 10, 2026", note: "Writeup created" },
      { action: "Released", actorName: "Ana Reyes", dateTime: "Apr 10, 2026", note: "Closed after review" },
    ],
  },
];

const governmentBenefits = [
  { name: "SSS", status: "Active", note: "Updated contribution records" },
  { name: "PhilHealth", status: "Active", note: "Member data matched" },
  { name: "Pag-IBIG", status: "Active", note: "Savings active" },
  { name: "13th Month Pay", status: "Eligible", note: "Policy based on tenure" },
  { name: "Service Incentive Leave", status: "Available", note: "5 days yearly" },
];

const companyBenefits = [
  { name: "HMO / Medical Assistance", status: "Pending Enrollment", note: "Need dependent documents" },
  { name: "Rice Allowance", status: "Active", note: "Monthly release" },
  { name: "Transportation Allowance", status: "Active", note: "Payroll linked" },
  { name: "Uniform Support", status: "Available", note: "Annual issuance" },
  { name: "Performance Bonus", status: "Policy Based", note: "Manager recommendation" },
];

const documents = [
  { title: "Employee Handbook 2026", category: "Company Policies", status: "Published" },
  { title: "Leave Request Form", category: "HR Forms", status: "Available" },
  { title: "Payroll Correction Form", category: "Payroll Forms", status: "Available" },
];

const supportTickets = [
  { subject: "Biometric correction request", team: "HR", status: "Open" },
  { subject: "Payslip copy request", team: "Payroll", status: "In Progress" },
];

const adminItems = ["User Management", "Role Permissions", "Writeup Categories", "Benefit Setup", "Policy Versioning", "Training Library", "Audit Logs"];

const initialPolicyCatalog: PolicyRecord[] = [
  {
    id: "POL-001",
    title: "Attendance Policy v2",
    category: "Attendance Policies",
    content: [
      "Defines attendance rules, manual log exceptions, approved attendance correction flow, and disciplinary implications for repeated missed logs.",
      "Employees are expected to complete attendance logging through the assigned attendance method for their role.",
      "Manual attendance entry is only available to approved roles or approved exception cases.",
      "Repeated missed logs without approved correction may lead to attendance-related writeups.",
    ].join("\n"),
    required: true,
    assignedRoles: ["Employee", "Manager", "HR", "Admin"],
    status: "Published",
    createdBy: "System",
    createdAt: "Apr 01, 2026",
    publishedAt: "Apr 01, 2026",
  },
  {
    id: "POL-002",
    title: "Code of Conduct",
    category: "HR Policies",
    content: [
      "Sets expected standards for behavior, communication, professionalism, and respect in the workplace.",
      "Employees must uphold respectful workplace behavior at all times.",
      "Harassment, intimidation, and abusive conduct are not tolerated.",
      "Employees are expected to protect company property, records, and confidential information.",
    ].join("\n"),
    required: true,
    assignedRoles: ["Employee", "Manager", "HR", "Payroll", "Admin"],
    status: "Published",
    createdBy: "System",
    createdAt: "Apr 01, 2026",
    publishedAt: "Apr 01, 2026",
  },
  {
    id: "POL-003",
    title: "Workshop Safety Rules",
    category: "Safety Policies",
    content: [
      "Covers PPE, tool handling, workshop movement, and reporting unsafe conditions for service staff.",
      "Required protective equipment must be worn in designated work areas.",
      "Unsafe conditions must be reported immediately to supervisors.",
      "Only trained personnel may operate designated service equipment.",
    ].join("\n"),
    required: false,
    assignedRoles: ["Employee", "Manager", "HR", "Admin"],
    status: "Published",
    createdBy: "System",
    createdAt: "Apr 01, 2026",
    publishedAt: "Apr 01, 2026",
  },
];

const initialTrainingCatalog: TrainingModule[] = [
  {
    id: "TRN-001",
    title: "Office Orientation: Employee Conduct",
    category: "Office Related Modules",
    description: "Orientation on conduct, professionalism, policy compliance, and internal communication standards.",
    required: true,
    assignedRoles: ["Employee", "Manager", "HR", "Admin"],
    quizRequired: true,
    passingScore: 80,
    questions: [
      { id: "q1", question: "What is the expected standard for workplace communication?", options: ["Aggressive", "Respectful", "Optional", "Unmonitored"], answer: "Respectful" },
      { id: "q2", question: "Can mandatory policies be ignored if already explained verbally?", options: ["Yes", "Only sometimes", "No", "Only by managers"], answer: "No" },
    ],
    status: "Published",
    createdBy: "System",
    createdAt: "Apr 01, 2026",
    publishedAt: "Apr 01, 2026",
    video: "YouTube Unlisted Embed",
    restriction: "No skipping on first play",
  },
  {
    id: "TRN-002",
    title: "Service Safety: PPE and Equipment Handling",
    category: "Service Related Modules",
    description: "Mandatory service module covering PPE, safe equipment handling, workshop movement, and safety awareness.",
    required: true,
    assignedRoles: ["Employee", "Manager", "HR", "Admin"],
    quizRequired: true,
    passingScore: 80,
    questions: [
      { id: "q1", question: "What should be worn in required service areas?", options: ["Casual wear", "PPE", "Anything comfortable", "No requirement"], answer: "PPE" },
      { id: "q2", question: "What happens if AFK is detected during first play?", options: ["Module auto-completes", "Tracking pauses", "Quiz unlocks", "Video closes permanently"], answer: "Tracking pauses" },
    ],
    status: "Published",
    createdBy: "System",
    createdAt: "Apr 01, 2026",
    publishedAt: "Apr 01, 2026",
    video: "YouTube Unlisted Embed",
    restriction: "AFK monitoring enabled",
  },
  {
    id: "TRN-003",
    title: "Customer Data Privacy Basics",
    category: "Office Related Modules",
    description: "Office-related privacy module focused on protecting employee and customer information.",
    required: true,
    assignedRoles: ["Employee", "Manager", "HR", "Payroll", "Admin"],
    quizRequired: true,
    passingScore: 80,
    questions: [
      { id: "q1", question: "Customer personal data should be shared with:", options: ["Anyone asking", "Authorized personnel only", "Friends", "Public channels"], answer: "Authorized personnel only" },
      { id: "q2", question: "Data privacy violations should be:", options: ["Ignored", "Reported", "Posted online", "Deleted without reporting"], answer: "Reported" },
    ],
    status: "Published",
    createdBy: "System",
    createdAt: "Apr 01, 2026",
    publishedAt: "Apr 01, 2026",
    video: "YouTube Unlisted Embed",
    restriction: "Forward disabled on first play",
  },
];

const initialScheduleEntries: ScheduleEntry[] = [
  {
    id: "SCH-001",
    employeeId: "EMP-001",
    employeeName: "Jomar Carlo",
    title: "Frontline service shift",
    dateISO: "2026-04-22",
    displayDate: "Apr 22, 2026",
    status: "Workday",
    shift: "8:00 AM - 5:00 PM",
    notes: "Morning floor coverage",
    createdBy: "System",
    updatedAt: "Apr 22, 2026",
    source: "Manual",
  },
  {
    id: "SCH-002",
    employeeId: "EMP-001",
    employeeName: "Jomar Carlo",
    title: "Training block",
    dateISO: "2026-04-23",
    displayDate: "Apr 23, 2026",
    status: "Training",
    shift: "1:00 PM - 3:00 PM",
    notes: "Policy and conduct refresher",
    createdBy: "System",
    updatedAt: "Apr 22, 2026",
    source: "Manual",
  },
  {
    id: "SCH-003",
    employeeId: "MGR-014",
    employeeName: "Ana Reyes",
    title: "Management coverage",
    dateISO: "2026-04-22",
    displayDate: "Apr 22, 2026",
    status: "Workday",
    shift: "9:00 AM - 6:00 PM",
    notes: "Team lead coverage",
    createdBy: "System",
    updatedAt: "Apr 22, 2026",
    source: "Manual",
  },
  {
    id: "SCH-004",
    employeeId: "HR-021",
    employeeName: "Patricia Gomez",
    title: "Weekday rest day",
    dateISO: "2026-04-24",
    displayDate: "Apr 24, 2026",
    status: "Rest Day",
    shift: "Rest day",
    notes: "Weekly rest schedule",
    createdBy: "System",
    updatedAt: "Apr 22, 2026",
    source: "Manual",
  },
];

const payslipDetailMap: Record<string, { gross: string; deductions: string; net: string; notes: string[] }> = {
  "Apr 01–15, 2026": { gross: "₱18,500.00", deductions: "₱3,250.00", net: "₱15,250.00", notes: ["Includes transportation allowance", "Government mandatory deductions reflected", "Payslip released via hybrid payroll mode"] },
  "Mar 16–31, 2026": { gross: "₱18,100.00", deductions: "₱3,090.00", net: "₱15,010.00", notes: ["Rice allowance included", "No attendance deduction applied", "Uploaded PDF + summary available"] },
  "Mar 01–15, 2026": { gross: "₱17,900.00", deductions: "₱2,980.00", net: "₱14,920.00", notes: ["Uploaded PDF only in sample archive", "Standard government deductions reflected", "No correction request filed"] },
};

const storageKeys = {
  selectedAccountId: "employee-portal:selectedAccountId",
  currentRole: "employee-portal:currentRole",
  authSession: "employee-portal:authSession",
  storageVersion: "employee-portal:storageVersion",
  employeeRecords: "employee-portal:employeeRecords",
  scheduleEntries: "employee-portal:scheduleEntries",
  notificationReadIds: "employee-portal:notificationReadIds",
  leaveRequests: "employee-portal:leaveRequests",
  writeupRecords: "employee-portal:writeupRecords",
  policyCatalog: "employee-portal:policyCatalog",
  policySignatures: "employee-portal:policySignatures",
  trainingCatalog: "employee-portal:trainingCatalog",
  trainingProgress: "employee-portal:trainingProgress",
} as const;

const storageVersion = "1";

function safeParseStoredValue(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function isCompatibleStorageVersion() {
  try {
    if (typeof window === "undefined") return true;
    const storedVersion = window.localStorage.getItem(storageKeys.storageVersion);
    return !storedVersion || storedVersion === storageVersion;
  } catch {
    return true;
  }
}

function readStoredValue<T>(key: string, fallback: T, validate?: (value: unknown) => value is T) {
  try {
    if (typeof window === "undefined") return fallback;
    if (!isCompatibleStorageVersion()) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = safeParseStoredValue(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key: string, value: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
    window.localStorage.setItem(storageKeys.storageVersion, storageVersion);
  } catch {
    // Ignore storage failures and keep the MVP working in-memory.
  }
}

function removeStoredValue(key: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures and keep the MVP working in-memory.
  }
}

function readStoredAccountId() {
  const storedId = readStoredValue<string>(storageKeys.selectedAccountId, testAccounts[0].id, (value): value is string => typeof value === "string");
  return testAccounts.some((account) => account.id === storedId) ? storedId : testAccounts[0].id;
}

function readStoredAuthSession() {
  const session = readStoredValue<Partial<AuthSession> | null>(
    storageKeys.authSession,
    null,
    (value): value is Partial<AuthSession> | null => {
      if (value === null) return true;
      if (typeof value !== "object" || value === null) return false;
      const candidate = value as Partial<AuthSession>;
      return typeof candidate.accountId === "string" && typeof candidate.role === "string";
    },
  );
  if (!session || !session.accountId || !session.role) return null;
  const account = testAccounts.find((item) => item.id === session.accountId);
  if (!account) return null;
  if (!(Object.keys(roleMenus) as Role[]).includes(session.role as Role)) return null;
  return { accountId: account.id, role: session.role as Role };
}

function readStoredRole(fallback: Role) {
  const storedRole = readStoredValue<string>(storageKeys.currentRole, fallback, (value): value is string => typeof value === "string");
  return (Object.keys(roleMenus) as Role[]).includes(storedRole as Role) && storedRole === fallback ? (storedRole as Role) : fallback;
}

function readStoredArray<T>(key: string, fallback: T[]) {
  const stored = readStoredValue<unknown>(key, fallback);
  return Array.isArray(stored) ? (stored as T[]) : fallback;
}

function formatLocalDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeLeaveStatus(status: string): LeaveStatus {
  if (status === "Draft" || status === "Submitted" || status === "Manager Approved" || status === "Manager Rejected" || status === "HR Approved" || status === "HR Rejected" || status === "Cancelled") {
    return status;
  }
  if (status === "Closed" || status === "Approved") return "HR Approved";
  return "Submitted";
}

function normalizeLeaveRequest(item: Partial<LeaveRequest> & { status: string }): LeaveRequest {
  const status = normalizeLeaveStatus(item.status);
  const requestedAt = item.requestedAt ?? "Apr 20, 2026";
  const trail = Array.isArray(item.trail) && item.trail.length > 0
    ? item.trail.map((entry): LeaveTrailEntry => ({
        status: normalizeLeaveStatus(entry.status),
        actorName: entry.actorName ?? item.employeeName ?? "System",
        date: entry.date ?? requestedAt,
        note: entry.note,
      }))
    : (() => {
        const requester = item.employeeName ?? "System";
        const approver = item.approverName ?? requester;
        const decisionDate = item.decisionDate ?? requestedAt;
        const base: LeaveTrailEntry[] = [{ status: "Draft", actorName: requester, date: requestedAt, note: "Draft created" }];

        if (status === "Draft") return base as LeaveTrailEntry[];
        if (status === "Submitted") return [...base, { status: "Submitted", actorName: requester, date: requestedAt, note: "Submitted for review" }] as LeaveTrailEntry[];
        if (status === "Manager Approved" || status === "Manager Rejected") {
          return [...base, { status: "Submitted", actorName: requester, date: requestedAt, note: "Submitted for review" }, { status, actorName: approver, date: decisionDate, note: item.reviewNote }] as LeaveTrailEntry[];
        }
        if (status === "HR Approved" || status === "HR Rejected") {
          return [
            ...base,
            { status: "Submitted", actorName: requester, date: requestedAt, note: "Submitted for review" },
            { status: "Manager Approved", actorName: approver, date: decisionDate, note: "Manager review completed" },
            { status, actorName: approver, date: decisionDate, note: item.reviewNote },
          ] as LeaveTrailEntry[];
        }
        if (status === "Cancelled") {
          return [...base, { status: "Submitted", actorName: requester, date: requestedAt, note: "Submitted for review" }, { status: "Cancelled", actorName: requester, date: decisionDate, note: item.reviewNote ?? "Cancelled by employee" }] as LeaveTrailEntry[];
        }
        return [...base, { status, actorName: approver, date: decisionDate, note: item.reviewNote }] as LeaveTrailEntry[];
      })();

  return {
    id: item.id ?? `LV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    employeeId: item.employeeId ?? "EMP-001",
    employeeName: item.employeeName ?? "Employee",
    type: item.type ?? "Vacation Leave",
    range: item.range ?? "",
    reason: item.reason ?? "",
    status,
    requestedAt,
    approverName: item.approverName,
    decisionDate: item.decisionDate,
    reviewNote: item.reviewNote,
    trail,
  };
}

function normalizeLeaveRequests(items: Partial<LeaveRequest>[] | LeaveRequest[]) {
  return items.map((item) => normalizeLeaveRequest(item as Partial<LeaveRequest> & { status: string }));
}

function normalizeWriteupStatus(status: string): WriteupStatus {
  if (status === "Pending Review" || status === "Pending Acknowledgment" || status === "Pending Signature" || status === "Acknowledged" || status === "Signed" || status === "Closed") {
    return status;
  }
  if (status === "Draft" || status === "Active" || status === "For Review") return "Pending Review";
  return "Pending Review";
}

function normalizeWriteup(item: Partial<Writeup> & { status?: string }): Writeup {
  const status = normalizeWriteupStatus(item.status ?? "Pending Review");
  const createdAt = item.createdAt ?? item.date ?? formatLocalDateTime(new Date());
  const trail = Array.isArray(item.trail) && item.trail.length > 0
    ? item.trail.map((entry) => ({
        action: entry.action ?? "Update",
        actorName: entry.actorName ?? item.employee ?? "System",
        dateTime: entry.dateTime ?? createdAt,
        note: entry.note,
        signatureMethod: entry.signatureMethod as WriteupSignatureMethod | undefined,
      }))
    : [
        { action: "Created", actorName: item.employee ?? "System", dateTime: createdAt, note: "Writeup created" },
      ];

  return {
    id: item.id ?? `WR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    employeeId: item.employeeId ?? "EMP-001",
    employee: item.employee ?? "Employee",
    category: item.category ?? "Attendance",
    title: item.title ?? "Writeup",
    date: item.date ?? createdAt,
    status,
    severity: item.severity ?? "Minor",
    acknowledgmentRequired: item.acknowledgmentRequired ?? true,
    signatureRequired: item.signatureRequired ?? false,
    createdAt,
    releasedAt: item.releasedAt ?? null,
    acknowledgedBy: item.acknowledgedBy ?? null,
    acknowledgedAt: item.acknowledgedAt ?? null,
    signedBy: item.signedBy ?? null,
    signedAt: item.signedAt ?? null,
    signatureMethod: (item.signatureMethod as WriteupSignatureMethod | null) ?? null,
    trail,
  };
}

function normalizeWriteups(items: Partial<Writeup>[] | Writeup[]) {
  return items.map((item) => normalizeWriteup(item as Partial<Writeup> & { status?: string }));
}

function normalizeEmployeeRecord(item: Partial<EmployeeRecord>): EmployeeRecord {
  const fallbackPin = testAccounts.find((account) => account.id === item.id)?.pin ?? "1234";
  return {
    id: item.id?.trim() || "",
    name: item.name?.trim() || "Unnamed Employee",
    role: item.role ?? "Employee",
    department: item.department?.trim() || "Unassigned",
    position: item.position?.trim() || "Unassigned",
    email: item.email?.trim() || "not-set@example.com",
    mobile: item.mobile?.trim() || "Not set",
    emergencyContact: item.emergencyContact?.trim() || "Not set",
    employmentType: item.employmentType?.trim() || "Regular",
    pin: item.pin?.trim() || fallbackPin,
    isActive: item.isActive ?? true,
  };
}

function normalizeEmployeeRecords(items: Partial<EmployeeRecord>[] | EmployeeRecord[]) {
  return items.map((item) => normalizeEmployeeRecord(item));
}

function normalizeScheduleEntry(item: Partial<ScheduleEntry>): ScheduleEntry {
  const dateISO = item.dateISO?.trim() || "2026-04-22";
  return {
    id: item.id?.trim() || `SCH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    employeeId: item.employeeId?.trim() || "EMP-001",
    employeeName: item.employeeName?.trim() || "Employee",
    title: item.title?.trim() || "Schedule entry",
    dateISO,
    displayDate: item.displayDate?.trim() || formatScheduleDate(dateISO),
    status: item.status ?? "Workday",
    shift: item.shift?.trim() || "Unassigned",
    notes: item.notes?.trim() || "",
    createdBy: item.createdBy?.trim() || "System",
    updatedAt: item.updatedAt?.trim() || dateISO,
    source: item.source ?? "Manual",
  };
}

function normalizeScheduleEntries(items: Partial<ScheduleEntry>[] | ScheduleEntry[]) {
  return items.map((item) => normalizeScheduleEntry(item));
}

function getTrainingQuizQuestions(module: TrainingModule) {
  if (module.questions.length > 0) return module.questions;
  return [
    {
      id: "q1",
      question: "Which training module are you currently viewing?",
      options: [module.title, "Attendance Review", "Payslip Processing", "Policy Versioning"],
      answer: module.title,
    },
    {
      id: "q2",
      question: "Which category is this module assigned to?",
      options: [module.category, "Finance", "Benefits", "Support"],
      answer: module.category,
    },
  ];
}

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatScheduleDate(dateISO: string) {
  const parsed = new Date(`${dateISO}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? dateISO : formatLocalDate(parsed);
}

function getLocalISODate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function EmployeePortalPrototype() {
  const initialAuthSession = readStoredAuthSession();
  const initialSelectedAccountId = initialAuthSession?.accountId ?? readStoredAccountId();
  const initialSelectedAccount = testAccounts.find((account) => account.id === initialSelectedAccountId) ?? testAccounts[0];
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(initialAuthSession));
  const [selectedAccountId, setSelectedAccountId] = useState(() => initialSelectedAccountId);
  const [activePage, setActivePage] = useState("Dashboard");
  const [currentRole, setCurrentRole] = useState<Role>(() => initialAuthSession?.role ?? readStoredRole(initialSelectedAccount.role));
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedAccountPin, setSelectedAccountPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedPolicyMethod, setSelectedPolicyMethod] = useState<PolicyMethod>("Registered Signature");
  const [selectedPolicyTitle, setSelectedPolicyTitle] = useState<string | null>(null);
  const [selectedTrainingTitle, setSelectedTrainingTitle] = useState<string | null>(null);
  const [selectedPayslipPeriod, setSelectedPayslipPeriod] = useState<string | null>(null);
  const [trainingQuizSubmitted, setTrainingQuizSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [, setFreeformSigned] = useState(false);
  const [, setRegisteredConfirmed] = useState(false);
  const [, setPolicyAcknowledged] = useState(false);
  const [employeeRecords, setEmployeeRecords] = useState<EmployeeRecord[]>(() => normalizeEmployeeRecords(readStoredArray<EmployeeRecord>(storageKeys.employeeRecords, initialEmployeeRecords)));
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(() => normalizeScheduleEntries(readStoredArray<ScheduleEntry>(storageKeys.scheduleEntries, initialScheduleEntries)));
  const [notificationReadIds, setNotificationReadIds] = useState<string[]>(() => readStoredArray<string>(storageKeys.notificationReadIds, []));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => normalizeLeaveRequests(readStoredArray<LeaveRequest>(storageKeys.leaveRequests, initialLeaveRequests)));
  const [newLeaveType, setNewLeaveType] = useState("Vacation Leave");
  const [newLeaveRange, setNewLeaveRange] = useState("");
  const [newLeaveReason, setNewLeaveReason] = useState("");
  const [leaveReviewNotes, setLeaveReviewNotes] = useState<Record<string, string>>({});
  const [writeupRecords, setWriteupRecords] = useState<Writeup[]>(() => normalizeWriteups(readStoredArray<Writeup>(storageKeys.writeupRecords, initialWriteups)));
  const [selectedWriteupId, setSelectedWriteupId] = useState<string | null>(null);
  const [selectedWriteupSignatureMethod, setSelectedWriteupSignatureMethod] = useState<WriteupSignatureMethod>("Registered Signature");
  const [newWriteupEmployeeId, setNewWriteupEmployeeId] = useState(initialEmployeeRecords[0].id);
  const [newWriteupCategory, setNewWriteupCategory] = useState("Attendance");
  const [newWriteupTitle, setNewWriteupTitle] = useState("");
  const [newWriteupSeverity, setNewWriteupSeverity] = useState("Minor");
  const [newWriteupAcknowledgmentRequired, setNewWriteupAcknowledgmentRequired] = useState(true);
  const [newWriteupSignatureRequired, setNewWriteupSignatureRequired] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleEntry>(() => ({
    id: "",
    employeeId: initialEmployeeRecords[0].id,
    employeeName: initialEmployeeRecords[0].name,
    title: "",
    dateISO: getLocalISODate(),
    displayDate: formatScheduleDate(getLocalISODate()),
    status: "Workday",
    shift: "8:00 AM - 5:00 PM",
    notes: "",
    createdBy: "System",
    updatedAt: formatScheduleDate(getLocalISODate()),
    source: "Manual",
  }));
  const [employeeForm, setEmployeeForm] = useState<EmployeeRecord>(() => ({
    id: "",
    name: "",
    role: "Employee",
    department: "",
    position: "",
    email: "",
    mobile: "",
    emergencyContact: "Not set",
    employmentType: "Regular",
    pin: "1234",
    isActive: true,
  }));
  const [policyCatalog, setPolicyCatalog] = useState<PolicyRecord[]>(() => readStoredArray<PolicyRecord>(storageKeys.policyCatalog, initialPolicyCatalog));
  const [policySignatures, setPolicySignatures] = useState<PolicySignature[]>(() => readStoredArray<PolicySignature>(storageKeys.policySignatures, []));
  const [trainingCatalog, setTrainingCatalog] = useState<TrainingModule[]>(() => readStoredArray<TrainingModule>(storageKeys.trainingCatalog, initialTrainingCatalog));
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>(() => readStoredArray<TrainingProgress>(storageKeys.trainingProgress, []));
  const [newPolicyTitle, setNewPolicyTitle] = useState("");
  const [newPolicyCategory, setNewPolicyCategory] = useState("HR Policies");
  const [newPolicyContent, setNewPolicyContent] = useState("");
  const [newPolicyRequired, setNewPolicyRequired] = useState(true);
  const [newPolicyAssignedRoles, setNewPolicyAssignedRoles] = useState<Role[]>(["Employee"]);
  const [newTrainingTitle, setNewTrainingTitle] = useState("");
  const [newTrainingCategory, setNewTrainingCategory] = useState("Office Related Modules");
  const [newTrainingDescription, setNewTrainingDescription] = useState("");
  const [newTrainingRequired, setNewTrainingRequired] = useState(true);
  const [newTrainingAssignedRoles, setNewTrainingAssignedRoles] = useState<Role[]>(["Employee"]);
  const [newTrainingQuizRequired, setNewTrainingQuizRequired] = useState(true);
  const [newTrainingPassingScore, setNewTrainingPassingScore] = useState(80);
  const [reportFilters, setReportFilters] = useState({
    employeeId: "All",
    role: "All" as Role | "All",
    department: "All",
    status: "All",
  });

  const activeAccount = testAccounts.find((item) => item.id === selectedAccountId) ?? testAccounts[0];
  const menu = useMemo(() => roleMenus[currentRole], [currentRole]);
  const stats = dashboardStatsByRole[currentRole];
  const activeEmployeeRecords = useMemo(() => employeeRecords.filter((item) => item.isActive), [employeeRecords]);
  const filteredLeaveRequests = useMemo(() => {
    if (currentRole === "Employee") return leaveRequests.filter((item) => item.employeeId === activeAccount.id);
    return leaveRequests;
  }, [leaveRequests, currentRole, activeAccount.id]);
  const filteredWriteups = useMemo(() => {
    if (currentRole === "Employee") return writeupRecords.filter((item) => item.employeeId === activeAccount.id);
    return writeupRecords;
  }, [writeupRecords, currentRole, activeAccount.id]);
  const selectedWriteupRecord = selectedWriteupId ? writeupRecords.find((item) => item.id === selectedWriteupId) ?? null : null;
  const visiblePolicies = useMemo(() => {
    if (currentRole === "Employee") {
      return policyCatalog.filter((item) => item.status === "Published" && item.assignedRoles.includes(activeAccount.role));
    }
    return policyCatalog;
  }, [policyCatalog, currentRole, activeAccount.role]);
  const selectedPolicyRecord = selectedPolicyTitle ? policyCatalog.find((item) => item.title === selectedPolicyTitle) ?? null : null;
  const selectedPolicySignature = selectedPolicyRecord
    ? policySignatures.find((item) => item.policyId === selectedPolicyRecord.id && item.employeeId === activeAccount.id) ?? null
    : null;
  const employeeAssignedPolicyCount = visiblePolicies.length;
  const visibleTraining = useMemo(() => {
    if (currentRole === "Employee") {
      return trainingCatalog.filter((item) => item.status === "Published" && item.assignedRoles.includes(activeAccount.role));
    }
    return trainingCatalog;
  }, [trainingCatalog, currentRole, activeAccount.role]);
  const selectedTrainingRecord = selectedTrainingTitle ? trainingCatalog.find((item) => item.title === selectedTrainingTitle) ?? null : null;
  const selectedTrainingProgress = selectedTrainingRecord
    ? trainingProgress.find((item) => item.moduleId === selectedTrainingRecord.id && item.employeeId === activeAccount.id) ?? null
    : null;
  const employeeAssignedTrainingCount = visibleTraining.length;

  useEffect(() => {
    writeStoredValue(storageKeys.storageVersion, storageVersion);
  }, []);

  useEffect(() => {
    writeStoredValue(storageKeys.selectedAccountId, selectedAccountId);
  }, [selectedAccountId]);

  useEffect(() => {
    writeStoredValue(storageKeys.currentRole, currentRole);
  }, [currentRole]);

  useEffect(() => {
    try {
      if (!isLoggedIn) {
        removeStoredValue(storageKeys.authSession);
        return;
      }
      writeStoredValue(storageKeys.authSession, { accountId: selectedAccountId, role: currentRole });
    } catch {
      // Ignore storage failures and keep the MVP working in-memory.
    }
  }, [currentRole, isLoggedIn, selectedAccountId]);

  useEffect(() => {
    writeStoredValue(storageKeys.employeeRecords, employeeRecords);
  }, [employeeRecords]);

  useEffect(() => {
    writeStoredValue(storageKeys.scheduleEntries, scheduleEntries);
  }, [scheduleEntries]);

  useEffect(() => {
    writeStoredValue(storageKeys.notificationReadIds, notificationReadIds);
  }, [notificationReadIds]);

  useEffect(() => {
    writeStoredValue(storageKeys.leaveRequests, leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    writeStoredValue(storageKeys.writeupRecords, writeupRecords);
  }, [writeupRecords]);

  useEffect(() => {
    writeStoredValue(storageKeys.policyCatalog, policyCatalog);
  }, [policyCatalog]);

  useEffect(() => {
    writeStoredValue(storageKeys.policySignatures, policySignatures);
  }, [policySignatures]);

  useEffect(() => {
    writeStoredValue(storageKeys.trainingCatalog, trainingCatalog);
  }, [trainingCatalog]);

  useEffect(() => {
    writeStoredValue(storageKeys.trainingProgress, trainingProgress);
  }, [trainingProgress]);

  useEffect(() => {
    const resolvedAccount = testAccounts.find((account) => account.id === selectedAccountId) ?? testAccounts[0];
    const personaMismatch = resolvedAccount.id !== selectedAccountId || currentRole !== resolvedAccount.role;

    if (!personaMismatch) return;

    if (resolvedAccount.id !== selectedAccountId) {
      setSelectedAccountId(resolvedAccount.id);
    }

    if (currentRole !== resolvedAccount.role) {
      setCurrentRole(resolvedAccount.role);
    }

    resetPersonaDependentState();
  }, [currentRole, selectedAccountId]);

  useEffect(() => {
    if (activeEmployeeRecords.some((item) => item.id === newWriteupEmployeeId)) return;
    setNewWriteupEmployeeId(activeEmployeeRecords[0]?.id ?? employeeRecords[0]?.id ?? initialEmployeeRecords[0].id);
  }, [activeEmployeeRecords, employeeRecords, newWriteupEmployeeId]);

  useEffect(() => {
    if (activeEmployeeRecords.some((item) => item.id === scheduleForm.employeeId)) return;
    const fallbackEmployee = activeEmployeeRecords[0] ?? employeeRecords[0] ?? initialEmployeeRecords[0];
    setScheduleForm((prev) => ({
      ...prev,
      employeeId: fallbackEmployee.id,
      employeeName: fallbackEmployee.name,
    }));
  }, [activeEmployeeRecords, employeeRecords, scheduleForm.employeeId]);

  useEffect(() => {
    if (!menu.includes(activePage)) {
      setActivePage("Dashboard");
    }
  }, [activePage, menu]);

  useEffect(() => {
    if (isLoggedIn) return;
    setSelectedAccountPin("");
    setPinError("");
  }, [isLoggedIn, selectedAccountId]);

  useEffect(() => {
    const isIPhoneOrIPad =
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const isStandaloneDisplayMode =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

    setIsIOS(isIPhoneOrIPad);
    setIsStandalone(isStandaloneDisplayMode);
    setIsOffline(typeof navigator !== "undefined" ? !navigator.onLine : false);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsStandalone(true);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsStandalone(true);
    }
    setDeferredInstallPrompt(null);
  };

  const getAccountPin = (accountId: string) => employeeRecords.find((item) => item.id === accountId)?.pin ?? testAccounts.find((item) => item.id === accountId)?.pin ?? "1234";

  const handleUnlockAccount = () => {
    const expectedPin = getAccountPin(activeAccount.id);
    if (selectedAccountPin.trim() !== expectedPin) {
      setPinError("Invalid PIN. Please try again.");
      return;
    }

    setPinError("");
    setIsLoggedIn(true);
    setSelectedAccountPin("");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedAccountPin("");
    setPinError("");
  };

  const renderConnectivityBanner = () =>
    isOffline ? (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        You are offline. The app is using the last saved state from this device, and your current data can still be viewed safely.
      </div>
    ) : null;

  const getTrainingScore = (module: TrainingModule, answers: Record<string, string>) => {
    const questions = getTrainingQuizQuestions(module);
    const total = questions.length;
    const score = questions.filter((q) => answers[q.id] === q.answer).length;
    return { score, total };
  };

  const resetPersonaDependentState = () => {
    setActivePage("Dashboard");
    setSelectedPolicyTitle(null);
    setSelectedTrainingTitle(null);
    setSelectedPayslipPeriod(null);
    setSelectedWriteupId(null);
    setSelectedWriteupSignatureMethod("Registered Signature");
    setSelectedPolicyMethod("Registered Signature");
    setTrainingQuizSubmitted(false);
    setQuizAnswers({});
    setFreeformSigned(false);
    setRegisteredConfirmed(false);
    setPolicyAcknowledged(false);
    setEditingEmployeeId(null);
    setEditingScheduleId(null);
    setEmployeeForm({
      id: "",
      name: "",
      role: "Employee",
      department: "",
      position: "",
      email: "",
      mobile: "",
      emergencyContact: "Not set",
      employmentType: "Regular",
      pin: "1234",
      isActive: true,
    });
    const fallbackEmployee = initialEmployeeRecords[0];
    setScheduleForm({
      id: "",
      employeeId: fallbackEmployee.id,
      employeeName: fallbackEmployee.name,
      title: "",
      dateISO: getLocalISODate(),
      displayDate: formatScheduleDate(getLocalISODate()),
      status: "Workday",
      shift: "8:00 AM - 5:00 PM",
      notes: "",
      createdBy: "System",
      updatedAt: formatScheduleDate(getLocalISODate()),
      source: "Manual",
    });
  };

  const resetEmployeeForm = () => {
    setEditingEmployeeId(null);
    setEmployeeForm({
      id: "",
      name: "",
      role: "Employee",
      department: "",
      position: "",
      email: "",
      mobile: "",
      emergencyContact: "Not set",
      employmentType: "Regular",
      pin: "1234",
      isActive: true,
    });
  };

  const beginEmployeeEdit = (employee: EmployeeRecord) => {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({ ...employee });
  };

  const saveEmployeeRecord = () => {
    const normalized = normalizeEmployeeRecord(employeeForm);
    if (!normalized.id.trim() || !normalized.name.trim()) return;

    const duplicate = employeeRecords.some((item) => item.id === normalized.id && item.id !== editingEmployeeId);
    if (duplicate) return;

    setEmployeeRecords((prev) => {
      if (!editingEmployeeId) {
        return [normalized, ...prev];
      }

      return prev.map((item) => (item.id === editingEmployeeId ? normalized : item));
    });

    resetEmployeeForm();
  };

  const toggleEmployeeActive = (employeeId: string) => {
    setEmployeeRecords((prev) => prev.map((item) => (item.id === employeeId ? { ...item, isActive: !item.isActive } : item)));
  };

  const syncPersonaSelection = (accountId: string, role: Role) => {
    setSelectedAccountId(accountId);
    setCurrentRole(role);
    resetPersonaDependentState();
  };

  const openPolicy = (title: string) => {
    setSelectedPolicyTitle(title);
    setSelectedPolicyMethod("Registered Signature");
    setFreeformSigned(false);
    setRegisteredConfirmed(false);
    setPolicyAcknowledged(false);
  };

  const resetPolicyBuilder = () => {
    setNewPolicyTitle("");
    setNewPolicyCategory("HR Policies");
    setNewPolicyContent("");
    setNewPolicyRequired(true);
    setNewPolicyAssignedRoles(["Employee"]);
  };

  const createPolicy = (publishNow: boolean) => {
    if (!newPolicyTitle.trim() || !newPolicyContent.trim() || newPolicyAssignedRoles.length === 0) return;

    const now = formatLocalDate(new Date());
    const nextPolicy: PolicyRecord = {
      id: `POL-${String(policyCatalog.length + 1).padStart(3, "0")}`,
      title: newPolicyTitle.trim(),
      category: newPolicyCategory.trim() || "General Policies",
      content: newPolicyContent.trim(),
      required: newPolicyRequired,
      assignedRoles: newPolicyAssignedRoles,
      status: publishNow ? "Published" : "Draft",
      createdBy: activeAccount.name,
      createdAt: now,
      publishedAt: publishNow ? now : null,
    };

    setPolicyCatalog((prev) => [nextPolicy, ...prev]);
    resetPolicyBuilder();

    if (publishNow) {
      openPolicy(nextPolicy.title);
    }
  };

  const publishPolicy = (policyId: string) => {
    const now = formatLocalDate(new Date());
    setPolicyCatalog((prev) =>
      prev.map((item) => (item.id === policyId ? { ...item, status: "Published", publishedAt: item.publishedAt ?? now } : item)),
    );
  };

  const signCurrentPolicy = (method: PolicyMethod) => {
    if (!selectedPolicyRecord || selectedPolicyRecord.status !== "Published") return;
    const signedAt = formatLocalDate(new Date());
    setPolicySignatures((prev) => {
      const remaining = prev.filter((item) => !(item.policyId === selectedPolicyRecord.id && item.employeeId === activeAccount.id));
      return [{ policyId: selectedPolicyRecord.id, employeeId: activeAccount.id, employeeName: activeAccount.name, signedAt, method }, ...remaining];
    });
  };

  const openTraining = (title: string) => {
    setSelectedTrainingTitle(title);
    setTrainingQuizSubmitted(false);
    setQuizAnswers({});
    const module = trainingCatalog.find((item) => item.title === title);
    if (!module || currentRole !== "Employee") return;
    setTrainingProgress((prev) => {
      const existing = prev.find((item) => item.moduleId === module.id && item.employeeId === activeAccount.id);
      if (existing && (existing.status === "Completed" || existing.status === "Failed")) return prev;
      const next: TrainingProgress = {
        moduleId: module.id,
        employeeId: activeAccount.id,
        employeeName: activeAccount.name,
        status: "In Progress",
        score: existing?.score ?? null,
        completionDate: existing?.completionDate ?? null,
        answers: existing?.answers ?? {},
      };
      return [next, ...prev.filter((item) => !(item.moduleId === module.id && item.employeeId === activeAccount.id))];
    });
  };

  const resetTrainingBuilder = () => {
    setNewTrainingTitle("");
    setNewTrainingCategory("Office Related Modules");
    setNewTrainingDescription("");
    setNewTrainingRequired(true);
    setNewTrainingAssignedRoles(["Employee"]);
    setNewTrainingQuizRequired(true);
    setNewTrainingPassingScore(80);
  };

  const createTraining = (publishNow: boolean) => {
    if (!newTrainingTitle.trim() || !newTrainingDescription.trim() || newTrainingAssignedRoles.length === 0) return;

    const now = formatLocalDate(new Date());
    const nextModule: TrainingModule = {
      id: `TRN-${String(trainingCatalog.length + 1).padStart(3, "0")}`,
      title: newTrainingTitle.trim(),
      category: newTrainingCategory.trim() || "General Training",
      description: newTrainingDescription.trim(),
      required: newTrainingRequired,
      assignedRoles: newTrainingAssignedRoles,
      quizRequired: newTrainingQuizRequired,
      passingScore: newTrainingPassingScore,
      questions: [],
      status: publishNow ? "Published" : "Draft",
      createdBy: activeAccount.name,
      createdAt: now,
      publishedAt: publishNow ? now : null,
      video: "Embedded training area",
      restriction: newTrainingQuizRequired ? "Quiz required before completion" : "Manual completion allowed",
    };

    setTrainingCatalog((prev) => [nextModule, ...prev]);
    resetTrainingBuilder();

    if (publishNow) {
      openTraining(nextModule.title);
    }
  };

  const publishTraining = (moduleId: string) => {
    const now = formatLocalDate(new Date());
    setTrainingCatalog((prev) =>
      prev.map((item) => (item.id === moduleId ? { ...item, status: "Published", publishedAt: item.publishedAt ?? now } : item)),
    );
  };

  const markTrainingComplete = (module: TrainingModule) => {
    const completionDate = formatLocalDate(new Date());
    setTrainingProgress((prev) => {
      const next: TrainingProgress = {
        moduleId: module.id,
        employeeId: activeAccount.id,
        employeeName: activeAccount.name,
        status: "Completed",
        score: null,
        completionDate,
        answers: {},
      };
      return [next, ...prev.filter((item) => !(item.moduleId === module.id && item.employeeId === activeAccount.id))];
    });
  };

  const submitTrainingQuiz = (module: TrainingModule) => {
    const { score, total } = getTrainingScore(module, quizAnswers);
    const passed = score >= Math.ceil((module.passingScore / 100) * total);
    const completionDate = formatLocalDate(new Date());

    setTrainingProgress((prev) => {
      const next: TrainingProgress = {
        moduleId: module.id,
        employeeId: activeAccount.id,
        employeeName: activeAccount.name,
        status: module.quizRequired ? (passed ? "Completed" : "Failed") : "Completed",
        score,
        completionDate,
        answers: quizAnswers,
      };
      return [next, ...prev.filter((item) => !(item.moduleId === module.id && item.employeeId === activeAccount.id))];
    });

    setTrainingQuizSubmitted(true);
  };

  const openPayslip = (period: string) => {
    setSelectedPayslipPeriod(period);
  };

  const submitLeave = () => {
    if (!newLeaveRange.trim() || !newLeaveReason.trim()) return;
    const now = formatLocalDate(new Date());
    const next: LeaveRequest = {
      id: `LV-${String(leaveRequests.length + 1).padStart(3, "0")}`,
      employeeId: activeAccount.id,
      employeeName: activeAccount.name,
      type: newLeaveType,
      range: newLeaveRange,
      reason: newLeaveReason,
      status: "Submitted",
      requestedAt: now,
      trail: [
        { status: "Draft", actorName: activeAccount.name, date: now, note: "Draft created" },
        { status: "Submitted", actorName: activeAccount.name, date: now, note: "Submitted for review" },
      ],
    };
    setLeaveRequests((prev) => [next, ...prev]);
    setNewLeaveRange("");
    setNewLeaveReason("");
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, note?: string) => {
    const decisionDate = formatLocalDate(new Date());
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              approverName: activeAccount.name,
              decisionDate,
              reviewNote: note?.trim() || item.reviewNote,
              trail: [
                ...item.trail,
                {
                  status,
                  actorName: activeAccount.name,
                  date: decisionDate,
                  note: note?.trim() || undefined,
                },
              ],
            }
          : item,
      ),
    );
    setLeaveReviewNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const cancelLeaveRequest = (id: string) => {
    const decisionDate = formatLocalDate(new Date());
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === id && item.status === "Submitted"
          ? {
              ...item,
              status: "Cancelled",
              approverName: activeAccount.name,
              decisionDate,
              reviewNote: "Cancelled by employee",
              trail: [...item.trail, { status: "Cancelled", actorName: activeAccount.name, date: decisionDate, note: "Cancelled by employee" }],
            }
          : item,
      ),
    );
  };

  const addWriteup = () => {
    if (!newWriteupTitle.trim()) return;
    const employee = employeeRecords.find((item) => item.id === newWriteupEmployeeId && item.isActive) ?? activeEmployeeRecords[0] ?? employeeRecords.find((item) => item.id === newWriteupEmployeeId) ?? initialEmployeeRecords[0];
    const createdAt = formatLocalDateTime(new Date());
    const nextStatus: WriteupStatus = "Pending Review";
    const next: Writeup = {
      id: `WR-${String(writeupRecords.length + 1).padStart(3, "0")}`,
      employeeId: employee.id,
      employee: employee.name,
      category: newWriteupCategory,
      title: newWriteupTitle,
      date: "Apr 20",
      status: nextStatus,
      severity: newWriteupSeverity,
      acknowledgmentRequired: newWriteupAcknowledgmentRequired,
      signatureRequired: newWriteupSignatureRequired,
      createdAt,
      releasedAt: null,
      acknowledgedBy: null,
      acknowledgedAt: null,
      signedBy: null,
      signedAt: null,
      signatureMethod: null,
      trail: [{ action: "Created", actorName: activeAccount.name, dateTime: createdAt, note: "Writeup created" }],
    };
    setWriteupRecords((prev) => [next, ...prev]);
    setNewWriteupTitle("");
    setNewWriteupAcknowledgmentRequired(true);
    setNewWriteupSignatureRequired(false);
  };

  const openWriteup = (id: string) => {
    setSelectedWriteupId(id);
  };

  const releaseWriteup = (id: string) => {
    const releasedAt = formatLocalDateTime(new Date());
    setWriteupRecords((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.status !== "Pending Review") return item;
        const nextStatus: WriteupStatus = item.acknowledgmentRequired
          ? "Pending Acknowledgment"
          : item.signatureRequired
            ? "Pending Signature"
            : "Closed";
        return {
          ...item,
          status: nextStatus,
          releasedAt,
          trail: [...item.trail, { action: "Released", actorName: activeAccount.name, dateTime: releasedAt, note: "Released for employee review" }],
        };
      }),
    );
  };

  const acknowledgeWriteup = (id: string) => {
    const now = formatLocalDateTime(new Date());
    setWriteupRecords((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.status !== "Pending Acknowledgment") return item;
        const nextStatus: WriteupStatus = item.signatureRequired ? "Pending Signature" : "Acknowledged";
        return {
          ...item,
          status: nextStatus,
          acknowledgedBy: activeAccount.name,
          acknowledgedAt: now,
          trail: [...item.trail, { action: "Acknowledged", actorName: activeAccount.name, dateTime: now, note: "Receipt confirmed; not agreement" }],
        };
      }),
    );
  };

  const signWriteup = (id: string, method: WriteupSignatureMethod) => {
    const now = formatLocalDateTime(new Date());
    setWriteupRecords((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.status !== "Pending Signature") return item;
        return {
          ...item,
          status: "Signed",
          signedBy: activeAccount.name,
          signedAt: now,
          signatureMethod: method,
          trail: [...item.trail, { action: "Signed", actorName: activeAccount.name, dateTime: now, note: "Receipt and review recorded", signatureMethod: method }],
        };
      }),
    );
  };

  const closeWriteup = (id: string) => {
    const now = formatLocalDateTime(new Date());
    setWriteupRecords((prev) =>
      prev.map((item) =>
        item.id === id && item.status !== "Closed"
          ? {
              ...item,
              status: "Closed",
              trail: [...item.trail, { action: "Closed", actorName: activeAccount.name, dateTime: now, note: "Writeup closed" }],
            }
          : item,
      ),
    );
  };

  const resetScheduleBuilder = () => {
    const fallbackEmployee = activeEmployeeRecords[0] ?? employeeRecords[0] ?? initialEmployeeRecords[0];
    const todayISO = getLocalISODate();
    setEditingScheduleId(null);
    setScheduleForm({
      id: "",
      employeeId: fallbackEmployee.id,
      employeeName: fallbackEmployee.name,
      title: "",
      dateISO: todayISO,
      displayDate: formatLocalDate(new Date(todayISO)),
      status: "Workday",
      shift: "8:00 AM - 5:00 PM",
      notes: "",
      createdBy: activeAccount.name,
      updatedAt: formatLocalDate(new Date()),
      source: "Manual",
    });
  };

  const beginScheduleEdit = (entry: ScheduleEntry) => {
    setEditingScheduleId(entry.id);
    setScheduleForm({ ...entry });
  };

  const saveScheduleEntry = () => {
    const employee = employeeRecords.find((item) => item.id === scheduleForm.employeeId && item.isActive)
      ?? employeeRecords.find((item) => item.id === scheduleForm.employeeId)
      ?? activeEmployeeRecords[0]
      ?? initialEmployeeRecords[0];
    if (!employee) return;

    const dateISO = scheduleForm.dateISO.trim() || getLocalISODate();
    const updatedAt = formatLocalDate(new Date());
    const nextEntry: ScheduleEntry = {
      ...scheduleForm,
      id: editingScheduleId ?? `SCH-${String(scheduleEntries.length + 1).padStart(3, "0")}`,
      employeeId: employee.id,
      employeeName: employee.name,
      title: scheduleForm.title.trim() || "Schedule entry",
      dateISO,
      displayDate: formatScheduleDate(dateISO),
      status: scheduleForm.status,
      shift: scheduleForm.shift.trim() || "Unassigned",
      notes: scheduleForm.notes.trim(),
      createdBy: editingScheduleId ? scheduleForm.createdBy : activeAccount.name,
      updatedAt,
      source: "Manual",
    };

    setScheduleEntries((prev) =>
      editingScheduleId
        ? prev.map((item) => (item.id === editingScheduleId ? nextEntry : item))
        : [nextEntry, ...prev],
    );

    resetScheduleBuilder();
  };

  const markNotificationAsRead = (id: string) => {
    setNotificationReadIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
  };

  const notifications = useMemo<NotificationItem[]>(() => {
    const todayISO = getLocalISODate();
    const sortKey = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    const readSet = new Set(notificationReadIds);
    const items: NotificationItem[] = [];
    const pushItem = (item: NotificationItem) => items.push(item);

    leaveRequests.forEach((item) => {
      const isRequester = item.employeeId === activeAccount.id;
      const isResolved =
        item.status === "Manager Approved" ||
        item.status === "Manager Rejected" ||
        item.status === "HR Approved" ||
        item.status === "HR Rejected" ||
        item.status === "Cancelled";

      if (isRequester && isResolved) {
        const title =
          item.status === "Manager Approved" || item.status === "HR Approved"
            ? "Leave request approved"
            : item.status === "Cancelled"
              ? "Leave request cancelled"
              : "Leave request rejected";
        pushItem({
          id: `leave-result-${item.id}`,
          title,
          description: `${item.type} • ${item.range} • ${item.reviewNote ?? "Leave request update"}`,
          timestamp: item.decisionDate ?? item.requestedAt,
          type: "Leave",
          actionLabel: "Open",
          canOpen: true,
          unread: !readSet.has(`leave-result-${item.id}`),
          onOpen: () => {
            setActivePage(currentRole === "Employee" ? "Leave" : "Leave Approvals");
          },
        });
      }

      if (currentRole === "Manager" && item.status === "Submitted") {
        pushItem({
          id: `leave-review-${item.id}`,
          title: "Leave approval needed",
          description: `${item.employeeName} • ${item.type} • ${item.range}`,
          timestamp: item.requestedAt,
          type: "Leave",
          actionLabel: "Review",
          canOpen: true,
          unread: !readSet.has(`leave-review-${item.id}`),
          onOpen: () => setActivePage("Leave Approvals"),
        });
      }

      if (currentRole === "HR" && item.status === "Manager Approved") {
        pushItem({
          id: `leave-final-${item.id}`,
          title: "Final leave approval needed",
          description: `${item.employeeName} • ${item.type} • ${item.range}`,
          timestamp: item.decisionDate ?? item.requestedAt,
          type: "Leave",
          actionLabel: "Review",
          canOpen: true,
          unread: !readSet.has(`leave-final-${item.id}`),
          onOpen: () => setActivePage("Leave Approvals"),
        });
      }
    });

    policyCatalog.forEach((policy) => {
      if (policy.status !== "Published" || !policy.assignedRoles.includes(activeAccount.role)) return;
      const signature = policySignatures.find((item) => item.policyId === policy.id && item.employeeId === activeAccount.id) ?? null;
      if (signature) return;
      const notificationId = `policy-${policy.id}`;
      pushItem({
        id: notificationId,
        title: policy.required ? "Policy signature required" : "Policy assigned",
        description: `${policy.title} • ${policy.category}`,
        timestamp: policy.publishedAt ?? policy.createdAt,
        type: "Policy",
        actionLabel: policy.required ? "Sign" : "Open",
        canOpen: true,
        unread: !readSet.has(notificationId),
        onOpen: () => {
          openPolicy(policy.title);
          setActivePage("Policies");
        },
      });
    });

    trainingCatalog.forEach((module) => {
      if (module.status !== "Published" || !module.assignedRoles.includes(activeAccount.role)) return;
      const progress = trainingProgress.find((item) => item.moduleId === module.id && item.employeeId === activeAccount.id) ?? null;
      if (progress?.status === "Completed") return;
      const notificationId = `training-${module.id}`;
      pushItem({
        id: notificationId,
        title: progress?.status === "Failed" ? "Training retry needed" : "Training completion needed",
        description: `${module.title} • ${progress?.status ?? "Assigned"}`,
        timestamp: module.publishedAt ?? module.createdAt,
        type: "Training",
        actionLabel: "Open",
        canOpen: true,
        unread: !readSet.has(notificationId),
        onOpen: () => {
          openTraining(module.title);
          setActivePage("Training");
        },
      });
    });

    writeupRecords.forEach((item) => {
      if (item.employeeId !== activeAccount.id) return;
      if (item.status !== "Pending Acknowledgment" && item.status !== "Pending Signature") return;
      const notificationId = `writeup-${item.id}`;
      pushItem({
        id: notificationId,
        title: item.status === "Pending Signature" ? "Writeup signature needed" : "Writeup acknowledgment needed",
        description: `${item.category} • ${item.title}`,
        timestamp: item.releasedAt ?? item.createdAt,
        type: "Writeup",
        actionLabel: "Open",
        canOpen: true,
        unread: !readSet.has(notificationId),
        onOpen: () => {
          openWriteup(item.id);
          setActivePage("Writeups");
        },
      });
    });

    leaveRequests.forEach((item) => {
      if (item.employeeId !== activeAccount.id || item.status !== "HR Approved") return;
      const notificationId = `schedule-leave-${item.id}`;
      pushItem({
        id: notificationId,
        title: "Schedule updated",
        description: `${item.type} leave • ${item.range} now appears on your schedule`,
        timestamp: item.decisionDate ?? item.requestedAt,
        type: "Schedule",
        actionLabel: "Open",
        canOpen: true,
        unread: !readSet.has(notificationId),
        onOpen: () => setActivePage("Schedule"),
      });
    });

    scheduleEntries.forEach((entry) => {
      if (entry.employeeId !== activeAccount.id) return;
      if (sortKey(entry.dateISO) < sortKey(todayISO)) return;
      const notificationId = `schedule-${entry.id}`;
      pushItem({
        id: notificationId,
        title: "Schedule updated",
        description: `${entry.status} • ${entry.displayDate} • ${entry.shift}`,
        timestamp: entry.updatedAt,
        type: "Schedule",
        actionLabel: "Open",
        canOpen: true,
        unread: !readSet.has(notificationId),
        onOpen: () => setActivePage("Schedule"),
      });
    });

    return items.sort((a, b) => sortKey(b.timestamp) - sortKey(a.timestamp));
  }, [activeAccount.id, activeAccount.role, currentRole, leaveRequests, notificationReadIds, policyCatalog, policySignatures, scheduleEntries, trainingCatalog, trainingProgress, writeupRecords]);

  const unreadNotificationCount = notifications.filter((item) => item.unread).length;

  const renderLogin = () => (
    <div className="min-h-[100dvh] bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8 [overscroll-behavior-y:contain]">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Internal Release</div>
          <h1 className="mt-3 text-3xl font-bold">Employee Portal</h1>
          <p className="mt-4 text-sm text-slate-300">Login, role-based access, leave workflow, payslip viewer, policy signing, training quiz, writeups, and HR pages are ready for internal release use.</p>
          <div className="mt-8 rounded-3xl bg-slate-900 p-5">
            <div className="text-sm font-semibold">Core Features</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Account selector",
                "Role-based navigation",
                "Leave filing + approvals",
                "Payslip detail viewer",
                "Policy signing",
                "Training quiz flow",
                "Writeup tracking",
                "Employee masterlist",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-800 px-4 py-3 text-sm text-slate-300">{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {renderConnectivityBanner()}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">Access</div>
              <h2 className="text-2xl font-bold">Select a test account</h2>
            </div>
            <StatusPill>No password required</StatusPill>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {testAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => syncPersonaSelection(account.id, account.role)}
                className={`rounded-3xl border p-5 text-left transition ${selectedAccountId === account.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:shadow-sm"}`}
              >
                <div className="text-sm font-semibold">{account.name}</div>
                <div className={`mt-1 text-xs ${selectedAccountId === account.id ? "text-slate-300" : "text-slate-500"}`}>{account.id}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedAccountId === account.id ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"}`}>{account.role}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedAccountId === account.id ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>{account.department}</span>
                </div>
                <div className={`mt-4 text-sm ${selectedAccountId === account.id ? "text-slate-300" : "text-slate-500"}`}>{account.position}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Selected account</div>
            <div className="mt-2 text-xl font-bold">{activeAccount.name}</div>
            <div className="mt-1 text-sm text-slate-500">{activeAccount.role} • {activeAccount.department} • {activeAccount.id}</div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                PIN
                <input
                  type="password"
                  inputMode="numeric"
                  value={selectedAccountPin}
                  onChange={(event) => {
                    setSelectedAccountPin(event.target.value);
                    setPinError("");
                  }}
                  placeholder="Enter PIN"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base tracking-[0.35em] outline-none transition focus:border-slate-950"
                />
              </label>
              <p className="text-xs leading-5 text-slate-500">Use the PIN stored for this account. This keeps the release lightweight while still protecting the app view.</p>
              {pinError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{pinError}</div>}
              <button
                onClick={() => {
                  syncPersonaSelection(activeAccount.id, activeAccount.role);
                  handleUnlockAccount();
                }}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Unlock Account
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold">Install app</div>
            {isStandalone ? (
              <div className="mt-2 rounded-2xl bg-white p-4 text-sm text-slate-600">
                This app is already installed on your device.
              </div>
            ) : deferredInstallPrompt ? (
              <>
                <p className="mt-2 text-sm text-slate-600">Install the portal for a more app-like experience on supported browsers.</p>
                <button onClick={handleInstallApp} className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  Install App
                </button>
              </>
            ) : isIOS ? (
              <div className="mt-2 rounded-2xl bg-white p-4 text-sm text-slate-600">
                On iPhone or iPad, tap <span className="font-semibold">Share</span>, then choose <span className="font-semibold">Add to Home Screen</span>.
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Install will appear automatically in supported browsers when available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const dashboardActionItems =
      currentRole === "Employee"
        ? [
            ...visiblePolicies
              .filter((item) => item.required && !policySignatures.some((signature) => signature.policyId === item.id && signature.employeeId === activeAccount.id))
              .map((item) => ({
                key: `policy-${item.id}`,
                title: item.title,
                description: `Required policy in ${item.category}. Open to review and sign.`,
                status: "Policy signature",
                buttonLabel: "Sign",
                onAction: () => {
                  openPolicy(item.title);
                  setActivePage("Policies");
                },
              })),
            ...visibleTraining
              .filter((item) => {
                const progress = trainingProgress.find((entry) => entry.moduleId === item.id && entry.employeeId === activeAccount.id);
                return !progress || progress.status !== "Completed";
              })
              .map((item) => {
                const progress = trainingProgress.find((entry) => entry.moduleId === item.id && entry.employeeId === activeAccount.id);
                const status = progress?.status === "Failed" ? "Needs retry" : progress?.status === "In Progress" ? "In progress" : "Assigned";
                const description =
                  progress?.status === "Failed"
                    ? "Last attempt did not meet the passing score. Open to retry."
                    : progress?.status === "In Progress"
                      ? "Training is in progress and still needs completion."
                      : item.quizRequired
                        ? "Assigned training module with quiz completion still pending."
                        : "Assigned training module waiting to be completed.";

                return {
                  key: `training-${item.id}`,
                  title: item.title,
                  description,
                  status,
                  buttonLabel: "Open",
                  onAction: () => {
                    openTraining(item.title);
                    setActivePage("Training");
                  },
                };
              }),
            ...filteredWriteups
              .filter((item) => item.employeeId === activeAccount.id && (item.status === "Pending Acknowledgment" || item.status === "Pending Signature"))
              .map((item) => ({
                key: `writeup-${item.id}`,
                title: item.title,
                description:
                  item.status === "Pending Acknowledgment"
                    ? "Acknowledge receipt to confirm review of the writeup."
                    : "Signature is required after acknowledgment and review.",
                status: item.status,
                buttonLabel: "Open",
                onAction: () => {
                  openWriteup(item.id);
                  setActivePage("Writeups");
                },
              })),
          ]
        : currentRole === "Manager" || currentRole === "HR"
          ? leaveRequests
              .filter((item) => item.status === (currentRole === "Manager" ? "Submitted" : "Manager Approved"))
              .map((item) => ({
                key: `leave-${item.id}`,
                title: `${item.employeeName} - ${item.type}`,
                description:
                  currentRole === "Manager"
                    ? `Leave request for ${item.range}. Manager review is waiting.`
                    : `Manager-approved leave for ${item.range}. HR final review is waiting.`,
                status: currentRole === "Manager" ? "Needs review" : "Final review",
                buttonLabel: "Review",
                onAction: () => {
                  setActivePage("Leave Approvals");
                },
              }))
          : [];
    const dashboardActionCount = dashboardActionItems.length;
    const parseActivityDate = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    const recentActivityItems = [
      ...leaveRequests.map((item) => {
        const latestTrail = item.trail[item.trail.length - 1];
        return {
          title: `Leave ${latestTrail.status}`,
          description: `${item.employeeName} • ${item.type} • ${item.range}`,
          timestamp: latestTrail.date,
          sortKey: parseActivityDate(latestTrail.date),
        };
      }),
      ...policySignatures.map((item) => ({
        title: "Policy signed",
        description: `${item.employeeName} signed policy ${policyCatalog.find((policy) => policy.id === item.policyId)?.title ?? item.policyId}`,
        timestamp: item.signedAt,
        sortKey: parseActivityDate(item.signedAt),
      })),
      ...trainingProgress
        .filter((item) => item.completionDate)
        .map((item) => ({
          title: item.status === "Failed" ? "Training failed" : "Training completed",
          description: `${item.employeeName} • ${trainingCatalog.find((module) => module.id === item.moduleId)?.title ?? item.moduleId} • ${item.status}`,
          timestamp: item.completionDate ?? "",
          sortKey: parseActivityDate(item.completionDate ?? ""),
        })),
      ...writeupRecords.map((item) => {
        const latestTrail = item.trail[item.trail.length - 1];
        return {
          title: `Writeup ${latestTrail.action}`,
          description: `${item.employee} • ${item.title}`,
          timestamp: latestTrail.dateTime,
          sortKey: parseActivityDate(latestTrail.dateTime),
        };
      }),
    ]
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, 6);

    const totalEmployees = employeeRecords.length;
    const activeEmployees = activeEmployeeRecords.length;
    const inactiveEmployees = Math.max(totalEmployees - activeEmployees, 0);
    const pendingLeaveApprovals = leaveRequests.filter((item) => item.status === "Submitted" || item.status === "Manager Approved").length;
    const pendingPolicySignatures = activeEmployeeRecords.reduce((count, employee) => {
      const assignedPolicies = policyCatalog.filter((item) => item.status === "Published" && item.required && item.assignedRoles.includes(employee.role));
      const signedPolicyIds = policySignatures.filter((item) => item.employeeId === employee.id).map((item) => item.policyId);
      return count + assignedPolicies.filter((item) => !signedPolicyIds.includes(item.id)).length;
    }, 0);
    const incompleteTrainingAssignments = activeEmployeeRecords.reduce((count, employee) => {
      const assignedModules = trainingCatalog.filter((item) => item.status === "Published" && item.assignedRoles.includes(employee.role));
      const completedModuleIds = trainingProgress.filter((item) => item.employeeId === employee.id && item.status === "Completed").map((item) => item.moduleId);
      return count + assignedModules.filter((item) => !completedModuleIds.includes(item.id)).length;
    }, 0);
    const pendingWriteupActions = writeupRecords.filter((item) => item.status === "Pending Acknowledgment" || item.status === "Pending Signature").length;
    const adminMetrics = [
      { label: "Total employees", value: String(totalEmployees), note: "Directory records" },
      { label: "Active employees", value: String(activeEmployees), note: "Currently active" },
      { label: "Inactive employees", value: String(inactiveEmployees), note: "Temporarily inactive" },
      { label: "Pending leave approvals", value: String(pendingLeaveApprovals), note: "Manager + HR queue" },
      { label: "Pending policy signatures", value: String(pendingPolicySignatures), note: "Required policies" },
      { label: "Incomplete training assignments", value: String(incompleteTrainingAssignments), note: "Assigned modules" },
      { label: "Pending writeup actions", value: String(pendingWriteupActions), note: "Acknowledgment or signature" },
    ];

    return (
      <DashboardHome
        currentRole={currentRole}
        activeAccount={activeAccount}
        menu={menu}
        roleBadge={roleBadges[currentRole]}
        stats={stats}
        unreadNotificationCount={unreadNotificationCount}
        dashboardActionItems={dashboardActionItems}
        dashboardActionCount={dashboardActionCount}
        recentActivityItems={recentActivityItems}
        adminMetrics={adminMetrics}
        announcements={announcements}
        setActivePage={setActivePage}
      />
    );
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-xl font-bold text-white">
                {activeAccount.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</div>
                <h3 className="mt-2 text-3xl font-bold leading-tight">{activeAccount.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {activeAccount.position} - {activeAccount.department}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>{activeAccount.role}</StatusPill>
              <StatusPill>{activeAccount.employmentType}</StatusPill>
              <StatusPill>{activeAccount.id}</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionCard title="Contact Info" action={<StatusPill>On file</StatusPill>}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Employee ID", activeAccount.id],
                ["Full Name", activeAccount.name],
                ["Department", activeAccount.department],
                ["Position", activeAccount.position],
                ["Employment Type", activeAccount.employmentType],
                ["Email", activeAccount.email],
                ["Mobile", activeAccount.mobile],
                ["Role", activeAccount.role],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
                  <div className="mt-2 break-words text-base font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Emergency Contact" action={<StatusPill>Priority</StatusPill>}>
            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-400">Contact name</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{activeAccount.emergencyContact}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Primary emergency contact stored for this employee profile.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">Emergency details</div>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">Relationship: On file</div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">Phone: Shared in profile record</div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">Priority: Contact HR if unreachable</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Dependents" action={<StatusPill>Profile view</StatusPill>}>
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">No dependents added yet</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dependents can be shown here when the profile data includes family members or beneficiaries.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Beneficiary information",
                  "Dependent age or relationship details",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">{item}</div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Taxes" action={<StatusPill>Payroll linked</StatusPill>}>
            <div className="space-y-3">
              {[
                ["Government IDs", "Reflected in payroll module"],
                ["Tax withholding", "Applied in payslips"],
                ["Deductions status", "Visible in earnings statements"],
                ["Compliance note", "Updated through HR / payroll workflows"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Compensation" action={<StatusPill>View payslips</StatusPill>}>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Payroll summary</div>
                <div className="mt-2 text-2xl font-bold">Compensation details</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Earnings are reviewed in the payslips area and kept in sync with payroll release cycles.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Pay frequency", "Semi-monthly"],
                  ["Latest payslip", "Available"],
                  ["Payroll mode", "Hybrid"],
                  ["Salary details", "Managed in payroll"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Registered Signature Setup">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div className="text-sm font-semibold">Saved signature on file</div>
              <div className="mt-4 text-3xl italic text-slate-800">J. Carlo</div>
              <p className="mt-3 text-sm text-slate-500">This registered signature can be applied to signature-required company policies after identity confirmation.</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Update Signature</button>
              <button className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Use Freeform Instead</button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    (() => {
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formatAttendanceDate = (value: string) => {
        const [year, month, day] = value.split("-");
        const monthLabel = monthLabels[Number(month) - 1] ?? month;
        return `${monthLabel} ${Number(day)}, ${year}`;
      };
      const firstEntry = attendanceRows[0];
      const lastEntry = attendanceRows[attendanceRows.length - 1];
      const periodLabel = firstEntry && lastEntry ? `${formatAttendanceDate(lastEntry.date)} - ${formatAttendanceDate(firstEntry.date)}` : "Current period";
      const totalEntries = attendanceRows.length;
      const presentCount = attendanceRows.filter((row) => row.status === "Present").length;
      const lateCount = attendanceRows.filter((row) => row.status === "Late").length;
      const deviceCount = attendanceRows.filter((row) => row.source === "Device").length;
      const manualCount = attendanceRows.length - deviceCount;
      const firstPunchIn = firstEntry ? firstEntry.timeIn : "--";
      const latestPunchOut = firstEntry ? firstEntry.timeOut : "--";

      return (
        <SectionCard title={activePage === "Team Attendance" ? "Team Attendance" : "Attendance Logs"} action={<StatusPill>Manual entry only for approved roles</StatusPill>}>
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Period Summary</div>
                    <div className="mt-2 text-2xl font-bold">Timecard Overview</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{periodLabel}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">
                    {activePage === "Team Attendance" ? "Team View" : "My View"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total entries", value: String(totalEntries), note: "Logged this period" },
                    { label: "Present days", value: String(presentCount), note: "On time or present" },
                    { label: "Late days", value: String(lateCount), note: "Needs attention" },
                    { label: "Device / manual", value: `${deviceCount}/${manualCount}`, note: "Source mix" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                      <div className="mt-2 text-2xl font-bold">{item.value}</div>
                      <div className="mt-1 text-sm text-slate-300">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "First punch in", value: firstPunchIn },
                { label: "Latest punch out", value: latestPunchOut },
                { label: "Device entries", value: String(deviceCount) },
                { label: "Manual approvals", value: String(manualCount) },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Daily Entries</div>
                  <p className="mt-1 text-sm text-slate-500">Recent attendance activity in a mobile-friendly card layout.</p>
                </div>
              </div>
              <div className="space-y-3">
                {attendanceRows.map((row, index) => (
                  <div key={row.date} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{formatAttendanceDate(row.date)}</div>
                        <div className="mt-1 text-sm text-slate-500">Entry {index + 1}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill>{row.status}</StatusPill>
                        <StatusPill>{row.source}</StatusPill>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Time in</div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{row.timeIn}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Time out</div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{row.timeOut}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Source</div>
                        <div className="mt-2 text-lg font-bold text-slate-900">{row.source}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Totals</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Total days shown", value: String(totalEntries) },
                    { label: "Present count", value: String(presentCount) },
                    { label: "Late count", value: String(lateCount) },
                    { label: "Manual adjustments", value: String(manualCount) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-400">{item.label}</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Punch Request</div>
                <div className="mt-3 text-xl font-bold">Action Area</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Request an attendance correction or use the manual entry flow for approved roles.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">Request Attendance Correction</button>
                  <button className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">Manual Entry</button>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      );
    })()
  );

  const renderLeave = () => {
    return (
      <LeaveManagement
        currentRole={currentRole}
        activeAccount={activeAccount}
        activePage={activePage}
        leaveRequests={leaveRequests}
        filteredLeaveRequests={filteredLeaveRequests}
        leaveReviewNotes={leaveReviewNotes}
        newLeaveType={newLeaveType}
        newLeaveRange={newLeaveRange}
        newLeaveReason={newLeaveReason}
        setLeaveReviewNotes={setLeaveReviewNotes}
        setNewLeaveType={setNewLeaveType}
        setNewLeaveRange={setNewLeaveRange}
        setNewLeaveReason={setNewLeaveReason}
        submitLeave={submitLeave}
        cancelLeaveRequest={cancelLeaveRequest}
        updateLeaveStatus={updateLeaveStatus}
      />
    );
  };
  const renderPayslips = () => {
    const selected = selectedPayslipPeriod ? payslipDetailMap[selectedPayslipPeriod] : null;
    const hasPayslipSelection = Boolean(selectedPayslipPeriod);
    const history = payslips.map((item, index) => ({
      ...item,
      isActive: item.period === selectedPayslipPeriod,
      order: index + 1,
    }));

    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm ring-1 ring-slate-900/10">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Payslips</div>
                <h3 className="mt-2 text-3xl font-bold leading-tight">Earnings and pay history</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Review recent pay periods, open a statement, and read deductions in a layout that is easier to scan on mobile.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">Hybrid mode</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Pay periods shown", value: String(payslips.length), note: "Available history" },
                { label: "Released payslips", value: String(payslips.filter((item) => item.status === "Released").length), note: "Ready to view" },
                { label: "Statement detail", value: selectedPayslipPeriod ? "Open" : "Select one", note: "Earnings view" },
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

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard title="Pay History" action={<StatusPill>Tap a period</StatusPill>}>
            <div className="space-y-3">
              {history.map((item) => (
                <button
                  key={item.period}
                  onClick={() => openPayslip(item.period)}
                  className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${item.isActive ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold uppercase tracking-wide opacity-70">Pay {item.order}</div>
                        {item.isActive && <StatusPill>Selected</StatusPill>}
                      </div>
                      <div className="mt-2 text-lg font-bold">{item.period}</div>
                      <div className={`mt-1 text-sm ${item.isActive ? "text-slate-200" : "text-slate-500"}`}>{item.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill>{item.status}</StatusPill>
                      <div className={`rounded-2xl px-3 py-2 text-xs font-semibold ${item.isActive ? "bg-white text-slate-950" : "bg-slate-950 text-white"}`}>View</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={selectedPayslipPeriod ? `Earnings Statement • ${selectedPayslipPeriod}` : "Earnings Statement"} action={<StatusPill>Mobile-friendly</StatusPill>}>
            {selected && selectedPayslipPeriod ? (
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Statement summary</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">Net pay {selected.net}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Gross earnings, deductions, and payroll notes are grouped together for faster reading.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Gross earnings</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{selected.gross}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Deductions</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{selected.deductions}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Net pay</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{selected.net}</div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Deductions and taxes</div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Total deductions</div>
                      <div className="mt-2 text-lg font-bold text-slate-900">{selected.deductions}</div>
                    </div>
                    {selected.notes.map((note) => (
                      <div key={note} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{note}</div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-950 p-4 text-white">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Payout snapshot</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Gross", value: selected.gross },
                      { label: "Deductions", value: selected.deductions },
                      { label: "Net", value: selected.net },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">{item.label}</div>
                        <div className="mt-2 text-lg font-bold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : hasPayslipSelection ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                The selected payslip period no longer matches any available payslip details. Please reopen a payslip from the list to continue safely.
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Choose a payslip from the history to preview the detailed earnings statement.</div>
            )}
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderBenefits = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Government Mandatory Benefits">
        <div className="space-y-3">
          {governmentBenefits.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3"><div className="font-semibold">{item.name}</div><StatusPill>{item.status}</StatusPill></div>
              <div className="mt-2 text-sm text-slate-500">{item.note}</div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Company Benefits">
        <div className="space-y-3">
          {companyBenefits.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3"><div className="font-semibold">{item.name}</div><StatusPill>{item.status}</StatusPill></div>
              <div className="mt-2 text-sm text-slate-500">{item.note}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderWriteups = () => (
    <WriteupManagement
      currentRole={currentRole}
      activeAccount={activeAccount}
      activeEmployeeRecords={activeEmployeeRecords}
      filteredWriteups={filteredWriteups}
      selectedWriteupId={selectedWriteupId}
      selectedWriteupRecord={selectedWriteupRecord}
      selectedWriteupSignatureMethod={selectedWriteupSignatureMethod}
      newWriteupEmployeeId={newWriteupEmployeeId}
      newWriteupCategory={newWriteupCategory}
      newWriteupSeverity={newWriteupSeverity}
      newWriteupAcknowledgmentRequired={newWriteupAcknowledgmentRequired}
      newWriteupSignatureRequired={newWriteupSignatureRequired}
      newWriteupTitle={newWriteupTitle}
      openWriteup={openWriteup}
      releaseWriteup={releaseWriteup}
      acknowledgeWriteup={acknowledgeWriteup}
      signWriteup={signWriteup}
      closeWriteup={closeWriteup}
      addWriteup={addWriteup}
      setSelectedWriteupSignatureMethod={setSelectedWriteupSignatureMethod}
      setNewWriteupEmployeeId={setNewWriteupEmployeeId}
      setNewWriteupCategory={setNewWriteupCategory}
      setNewWriteupSeverity={setNewWriteupSeverity}
      setNewWriteupAcknowledgmentRequired={setNewWriteupAcknowledgmentRequired}
      setNewWriteupSignatureRequired={setNewWriteupSignatureRequired}
      setNewWriteupTitle={setNewWriteupTitle}
    />
  );
  const renderPolicies = () => {
    return (
      <PolicyManagement
        currentRole={currentRole}
        activeAccount={activeAccount}
        activeEmployeeRecords={activeEmployeeRecords}
        visiblePolicies={visiblePolicies}
        selectedPolicyTitle={selectedPolicyTitle}
        selectedPolicyRecord={selectedPolicyRecord}
        selectedPolicySignature={selectedPolicySignature}
        selectedPolicyMethod={selectedPolicyMethod}
        newPolicyTitle={newPolicyTitle}
        newPolicyCategory={newPolicyCategory}
        newPolicyContent={newPolicyContent}
        newPolicyRequired={newPolicyRequired}
        newPolicyAssignedRoles={newPolicyAssignedRoles}
        availableRoles={availableRoles}
        employeeAssignedPolicyCount={employeeAssignedPolicyCount}
        selectedPolicyStatus={currentRole === "Employee" ? (selectedPolicySignature ? "Signed" : "Pending") : (selectedPolicyRecord?.status ?? "Draft")}
        openPolicy={openPolicy}
        publishPolicy={publishPolicy}
        signCurrentPolicy={signCurrentPolicy}
        createPolicy={createPolicy}
        setSelectedPolicyMethod={setSelectedPolicyMethod}
        setFreeformSigned={setFreeformSigned}
        setRegisteredConfirmed={setRegisteredConfirmed}
        setPolicyAcknowledged={setPolicyAcknowledged}
        setNewPolicyTitle={setNewPolicyTitle}
        setNewPolicyCategory={setNewPolicyCategory}
        setNewPolicyContent={setNewPolicyContent}
        setNewPolicyRequired={setNewPolicyRequired}
        setNewPolicyAssignedRoles={setNewPolicyAssignedRoles}
      />
    );
  };

  const renderTraining = () => {
    const selectedQuestions = selectedTrainingRecord ? getTrainingQuizQuestions(selectedTrainingRecord) : [];
    const quizScore = selectedTrainingRecord ? getTrainingScore(selectedTrainingRecord, quizAnswers) : { score: 0, total: 0 };

    return (
      <TrainingManagement
        currentRole={currentRole}
        activeAccount={activeAccount}
        activeEmployeeRecords={activeEmployeeRecords}
        visibleTraining={visibleTraining}
        trainingProgress={trainingProgress}
        selectedTrainingTitle={selectedTrainingTitle}
        selectedTrainingRecord={selectedTrainingRecord}
        selectedTrainingProgress={selectedTrainingProgress}
        selectedQuestions={selectedQuestions}
        quizScore={quizScore}
        trainingQuizSubmitted={trainingQuizSubmitted}
        quizAnswers={quizAnswers}
        employeeAssignedTrainingCount={employeeAssignedTrainingCount}
        newTrainingTitle={newTrainingTitle}
        newTrainingCategory={newTrainingCategory}
        newTrainingDescription={newTrainingDescription}
        newTrainingRequired={newTrainingRequired}
        newTrainingAssignedRoles={newTrainingAssignedRoles}
        newTrainingQuizRequired={newTrainingQuizRequired}
        newTrainingPassingScore={newTrainingPassingScore}
        availableRoles={availableRoles}
        openTraining={openTraining}
        publishTraining={publishTraining}
        markTrainingComplete={markTrainingComplete}
        submitTrainingQuiz={submitTrainingQuiz}
        createTraining={createTraining}
        setQuizAnswers={setQuizAnswers}
        setNewTrainingTitle={setNewTrainingTitle}
        setNewTrainingCategory={setNewTrainingCategory}
        setNewTrainingDescription={setNewTrainingDescription}
        setNewTrainingRequired={setNewTrainingRequired}
        setNewTrainingAssignedRoles={setNewTrainingAssignedRoles}
        setNewTrainingQuizRequired={setNewTrainingQuizRequired}
        setNewTrainingPassingScore={setNewTrainingPassingScore}
      />
    );
  };

  const renderSchedule = () => {
    return (
      <ScheduleManagement
        currentRole={currentRole}
        activeAccount={activeAccount}
        activeEmployeeRecords={activeEmployeeRecords}
        scheduleEntries={scheduleEntries}
        leaveRequests={leaveRequests}
        scheduleForm={scheduleForm}
        editingScheduleId={editingScheduleId}
        todayISO={getLocalISODate()}
        formatScheduleDate={formatScheduleDate}
        setScheduleForm={setScheduleForm}
        beginScheduleEdit={beginScheduleEdit}
        resetScheduleBuilder={resetScheduleBuilder}
        saveScheduleEntry={saveScheduleEntry}
      />
    );
  };
  const renderNotifications = () => {
    return (
      <NotificationsManagement
        notifications={notifications}
        currentRole={currentRole}
        markNotificationAsRead={markNotificationAsRead}
      />
    );
  };
  const renderAnnouncements = () => (
    <SectionCard title="Announcements">
      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4"><div className="font-semibold">{item.title}</div><div className="text-xs text-slate-400">{item.date}</div></div>
            <p className="mt-2 text-sm text-slate-500">{item.body}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderDocuments = () => (
    <SectionCard title="Documents">
      <div className="space-y-3">
        {documents.map((item) => (
          <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div><div className="font-semibold">{item.title}</div><div className="text-sm text-slate-500">{item.category}</div></div>
            <StatusPill>{item.status}</StatusPill>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderSupport = () => (
    <SectionCard title="Support Tickets">
      <div className="space-y-3">
        {supportTickets.map((item) => (
          <div key={item.subject} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div><div className="font-semibold">{item.subject}</div><div className="text-sm text-slate-500">Assigned to {item.team}</div></div>
            <StatusPill>{item.status}</StatusPill>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderMasterlist = () => (
    <EmployeeMasterlist
      currentRole={currentRole}
      employeeRecords={employeeRecords}
      activeEmployeeRecords={activeEmployeeRecords}
      availableRoles={availableRoles}
      editingEmployeeId={editingEmployeeId}
      employeeForm={employeeForm}
      setEmployeeForm={setEmployeeForm}
      beginEmployeeEdit={beginEmployeeEdit}
      toggleEmployeeActive={toggleEmployeeActive}
      saveEmployeeRecord={saveEmployeeRecord}
      resetEmployeeForm={resetEmployeeForm}
    />
  );
  const renderAdmin = () => (
    <AdminDashboard setActivePage={setActivePage} adminItems={adminItems} />
  );
  const buildReportSnapshot = () => {
  const employeeLookup = new Map(employeeRecords.map((employee) => [employee.id, employee] as const));
  const filteredEmployees = employeeRecords.filter((employee) => {
    const employeeMatch = reportFilters.employeeId === 'All' || employee.id === reportFilters.employeeId;
    const roleMatch = reportFilters.role === 'All' || employee.role === reportFilters.role;
    const departmentMatch = reportFilters.department === 'All' || employee.department === reportFilters.department;
    const statusMatch =
      reportFilters.status === 'All'
        ? true
        : reportFilters.status === 'Active'
          ? employee.isActive
          : reportFilters.status === 'Inactive'
            ? !employee.isActive
            : true;
    return employeeMatch && roleMatch && departmentMatch && statusMatch;
  });

  const filteredEmployeeIds = new Set(filteredEmployees.map((employee) => employee.id));
  const rowStatusFilter = reportFilters.status === 'Active' || reportFilters.status === 'Inactive' ? 'All' : reportFilters.status;
  const matchesEmployeeScope = (employeeId: string) => {
    const employee = employeeLookup.get(employeeId);
    return Boolean(employee && filteredEmployeeIds.has(employee.id));
  };
  const matchesRowStatus = (candidate: string, alternate?: string) => rowStatusFilter === 'All' || candidate === rowStatusFilter || alternate === rowStatusFilter;

  const filteredLeaveRequests = leaveRequests.filter((item) => matchesEmployeeScope(item.employeeId) && matchesRowStatus(item.status));
  const filteredWriteups = writeupRecords.filter((item) => matchesEmployeeScope(item.employeeId) && matchesRowStatus(item.status));
  const latestPayslip = payslips[0] ?? null;
  const latestPayslipDetail = latestPayslip ? payslipDetailMap[latestPayslip.period] ?? null : null;
  const attendanceSummary = {
    total: attendanceRows.length,
    present: attendanceRows.filter((row) => row.status === 'Present').length,
    late: attendanceRows.filter((row) => row.status === 'Late').length,
    device: attendanceRows.filter((row) => row.source === 'Device').length,
    manual: attendanceRows.filter((row) => row.source !== 'Device').length,
    rows: attendanceRows,
  };
  const payrollRows = filteredEmployees.map((employee) => ({
    employeeId: employee.id,
    employeeName: employee.name,
    role: employee.role,
    department: employee.department,
    employmentType: employee.employmentType,
    status: employee.isActive ? 'Active' : 'Inactive',
    period: latestPayslip?.period ?? 'No payslip available',
    payslipStatus: latestPayslip?.status ?? 'N/A',
    gross: latestPayslipDetail?.gross ?? 'N/A',
    deductions: latestPayslipDetail?.deductions ?? 'N/A',
    net: latestPayslipDetail?.net ?? 'N/A',
  }));

  const filteredTrainingModules = trainingCatalog.flatMap((module) => {
    const assignedEmployees = filteredEmployees.filter((employee) => module.assignedRoles.includes(employee.role));
    if (assignedEmployees.length === 0) return [];

    const progressRecords = trainingProgress.filter((item) => item.moduleId === module.id && assignedEmployees.some((employee) => employee.id === item.employeeId));
    const completedCount = progressRecords.filter((item) => item.status === 'Completed').length;
    const failedCount = progressRecords.filter((item) => item.status === 'Failed').length;
    const inProgressCount = progressRecords.filter((item) => item.status === 'In Progress').length;
    const assignedCount = Math.max(assignedEmployees.length - progressRecords.length, 0);
    const moduleStatus = progressRecords.length === 0 ? (module.status === 'Draft' ? 'Draft' : 'Assigned') : failedCount > 0 ? 'Failed' : inProgressCount > 0 ? 'In Progress' : completedCount >= assignedEmployees.length ? 'Completed' : 'Assigned';

    if (!matchesRowStatus(moduleStatus, module.status)) return [];

    return [{
      module,
      assignedEmployees,
      progressRecords,
      completedCount,
      failedCount,
      inProgressCount,
      assignedCount,
      moduleStatus,
    }];
  });

  const filteredPolicies = policyCatalog.flatMap((policy) => {
    const assignedEmployees = filteredEmployees.filter((employee) => policy.assignedRoles.includes(employee.role));
    if (assignedEmployees.length === 0) return [];

    const signatures = policySignatures.filter((item) => item.policyId === policy.id && assignedEmployees.some((employee) => employee.id === item.employeeId));
    const policyStatus = signatures.length > 0 ? 'Signed' : 'Pending';

    if (!matchesRowStatus(policyStatus, policy.status)) return [];

    return [{
      policy,
      assignedEmployees,
      signatures,
      policyStatus,
    }];
  });

  return {
    generatedAt: formatLocalDate(new Date()),
    filters: reportFilters,
    employees: {
      total: filteredEmployees.length,
      active: filteredEmployees.filter((employee) => employee.isActive).length,
      inactive: filteredEmployees.filter((employee) => !employee.isActive).length,
      list: filteredEmployees,
    },
    leaveRequests: {
      total: filteredLeaveRequests.length,
      submitted: filteredLeaveRequests.filter((item) => item.status === 'Submitted').length,
      managerApproved: filteredLeaveRequests.filter((item) => item.status === 'Manager Approved').length,
      hrApproved: filteredLeaveRequests.filter((item) => item.status === 'HR Approved').length,
      cancelled: filteredLeaveRequests.filter((item) => item.status === 'Cancelled').length,
      list: filteredLeaveRequests,
    },
    training: {
      total: filteredTrainingModules.length,
      assigned: filteredTrainingModules.filter((item) => item.moduleStatus === 'Assigned').length,
      inProgress: filteredTrainingModules.filter((item) => item.moduleStatus === 'In Progress').length,
      completed: filteredTrainingModules.filter((item) => item.moduleStatus === 'Completed').length,
      failed: filteredTrainingModules.filter((item) => item.moduleStatus === 'Failed').length,
      list: filteredTrainingModules,
    },
    payroll: {
      totalEmployees: payrollRows.length,
      releasedPeriods: payslips.filter((item) => item.status === 'Released').length,
      latestPayslip,
      latestPayslipDetail,
      rows: payrollRows,
    },
    attendance: attendanceSummary,
    policies: {
      total: filteredPolicies.length,
      pending: filteredPolicies.filter((item) => item.policyStatus === 'Pending').length,
      signed: filteredPolicies.filter((item) => item.policyStatus === 'Signed').length,
      list: filteredPolicies,
    },
    writeups: {
      total: filteredWriteups.length,
      pendingReview: filteredWriteups.filter((item) => item.status === 'Pending Review').length,
      pendingAcknowledgment: filteredWriteups.filter((item) => item.status === 'Pending Acknowledgment').length,
      pendingSignature: filteredWriteups.filter((item) => item.status === 'Pending Signature').length,
      closed: filteredWriteups.filter((item) => item.status === 'Closed').length,
      list: filteredWriteups,
    },
  };
}


  const handlePrintSummary = () => {
    window.print();
  };

  const renderReports = () => {
    return (
      <ReportsManagement
        snapshot={buildReportSnapshot()}
        reportFilters={reportFilters}
        setReportFilters={setReportFilters}
        employeeRecords={employeeRecords}
        availableRoles={availableRoles}
        exportDateISO={getLocalISODate()}
        handlePrintSummary={handlePrintSummary}
      />
    );
  };
  const renderPlaceholder = (title: string) => (
    <SectionCard title={title}><div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">No built-in page matches "{title}". Showing a safe fallback instead of an empty view.</div></SectionCard>
  );

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard": return renderDashboard();
      case "My Profile": return renderProfile();
      case "Attendance":
      case "Attendance Review":
      case "Team Attendance": return renderAttendance();
      case "Schedule": return renderSchedule();
      case "Leave":
      case "Leave Approvals": return renderLeave();
      case "Payslips": return renderPayslips();
      case "Benefits": return renderBenefits();
      case "Writeups": return renderWriteups();
      case "Policies": return renderPolicies();
      case "Training": return renderTraining();
      case "Notifications": return renderNotifications();
      case "Announcements": return renderAnnouncements();
      case "Documents": return renderDocuments();
      case "Support": return renderSupport();
      case "Employee Masterlist": return renderMasterlist();
      case "Admin": return renderAdmin();
      case "Reports": return renderReports();
      default: return renderPlaceholder(activePage);
    }
  };

  if (!isLoggedIn) return renderLogin();

  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900 [overscroll-behavior-y:contain]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Employee Portal</div>
            <h1 className="mt-2 text-2xl font-bold">Employee Portal</h1>
            <p className="mt-2 text-sm text-slate-400">Role-based employee portal with stable V1 workflows.</p>
          </div>

          <div className="px-4 pt-4">
            <div className="rounded-2xl bg-slate-900 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Role Switch</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(roleMenus) as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      const nextAccount = testAccounts.find((item) => item.role === role) ?? testAccounts[0];
                      syncPersonaSelection(nextAccount.id, role);
                    }}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${currentRole === role ? "bg-white text-slate-950" : "bg-slate-800 text-slate-300"}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5">
            <div className="mb-3 px-3 text-xs uppercase tracking-wide text-slate-500">{roleBadges[currentRole]}</div>
            <div className="space-y-2">
              {menu.map((item) => (
                <button key={item} onClick={() => setActivePage(item)} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${activePage === item ? "bg-white text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}>
                  <span className="flex items-center justify-between gap-2">
                    <span>{item}</span>
                    {item === "Notifications" && unreadNotificationCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{unreadNotificationCount}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="rounded-2xl bg-slate-900 p-4">
              <div className="text-sm font-semibold">Release Notes</div>
              <p className="mt-2 text-sm text-slate-400">Leave, policy signing, training quiz, payslip viewing, and writeup tracking are available in this internal release.</p>
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Employee Portal v1.0</div>
            </div>
          </div>
        </aside>

        <main className="flex-1 pb-[env(safe-area-inset-bottom)]">
          <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-slate-500">Welcome back</div>
                <h2 className="text-2xl font-bold">{activeAccount.name}</h2>
                <p className="text-sm text-slate-500">{activeAccount.id} • {activeAccount.department} • Role view: {currentRole}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm">Feedback</button>
                <button onClick={handleLogout} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Switch User</button>
              </div>
            </div>
          </header>

          <div className="px-4 pt-4 sm:px-6">{renderConnectivityBanner()}</div>

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:px-6 lg:hidden">
            <div className="mb-2 font-semibold">Mobile Navigation</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {menu.map((item) => (
                <button key={item} onClick={() => setActivePage(item)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${activePage === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
                  <span className="inline-flex items-center gap-2">
                    <span>{item}</span>
                    {item === "Notifications" && unreadNotificationCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{unreadNotificationCount}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
















