import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Archive,
  ArrowLeftRight,
  Atom,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  CalendarRange,
  ChevronsUpDown,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  ContactRound,
  CreditCard,
  Database,
  FileBarChart,
  FileCheck2,
  FileText,
  FlaskConical,
  FolderOpen,
  FolderTree,
  Grid2x2,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  Image,
  Plug,
  Infinity as InfinityIcon,
  KeyRound,
  Languages,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Table2,
  Library,
  Lightbulb,
  LifeBuoy,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Orbit,
  Network,
  Package,
  PanelLeft,
  PanelTop,
  ReceiptText,
  Ruler,
  Search,
  Settings2,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tags,
  Target,
  Timer,
  UserCheck,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  Utensils,
  Wallet,
  WalletCards,
} from 'lucide-react';

export const Icons = {
  // ─────────────────────────────────────────────
  // Platform
  // ─────────────────────────────────────────────

  dashboard: LayoutDashboard,
  analyze: BarChart3,
  organizations: Building2,
  companies: Building2,
  users: Users,
  roles: ShieldCheck,
  resources: Layers,
  permissions: KeyRound,
  audit: ScrollText,
  security: ShieldAlert,
  settings: Settings2,
  media: Image,
  menu: BookOpen,
  menuCategory: FolderTree,
  menuItem: Utensils,
  menuItemVariant: Tags,
  modifierGroup: Boxes,
  modifier: SlidersHorizontal,
  menuItemModifier: SlidersHorizontal,
  priceList: Banknote,
  menuItemPrice: Banknote,
  integrations: Plug,
  grid: LayoutGrid,
  table: Table2,
  grid2x2: Grid2x2,

  // ─────────────────────────────────────────────
  // HR / Employees
  // ─────────────────────────────────────────────

  employees: Users,
  mealType: Utensils,
  mealSchedule: Clock3,
  mealDay: CalendarDays,
  mealOrder: ClipboardList,
  employee: UserRound,
  employeeAdd: UserPlus,
  employeeCheck: UserCheck,
  employeeSettings: UserCog,

  departments: Network,
  positions: BriefcaseBusiness,
  organization: Building2,

  // ─────────────────────────────────────────────
  // Recruitment
  // ─────────────────────────────────────────────

  recruitment: Target,
  jobs: BriefcaseBusiness,
  jobPostings: Megaphone,
  candidates: ContactRound,
  applicant: UserPlus,
  interviews: Handshake,
  applications: ClipboardList,
  hiring: BadgeCheck,
  talentPool: Users,

  // ─────────────────────────────────────────────
  // Attendance / Time
  // ─────────────────────────────────────────────

  attendance: Clock3,
  checkIn: LogIn,
  workHours: Timer,
  schedules: CalendarRange,
  calendar: CalendarDays,
  leave: CalendarDays,
  shifts: Clock3,

  // ─────────────────────────────────────────────
  // Payroll / Finance
  // ─────────────────────────────────────────────

  payroll: Banknote,
  salary: WalletCards,
  payments: CreditCard,
  paymentProvider: Wallet,
  expenses: ReceiptText,
  compensation: Banknote,

  // ─────────────────────────────────────────────
  // Documents
  // ─────────────────────────────────────────────

  documents: FileText,
  document: FileCheck2,
  documentArchive: Archive,
  files: FolderOpen,
  contracts: FileCheck2,

  // ─────────────────────────────────────────────
  // Performance
  // ─────────────────────────────────────────────

  performance: Gauge,
  goals: Target,
  evaluations: ClipboardCheck,
  achievements: Star,
  activity: Activity,

  // ─────────────────────────────────────────────
  // Content / Curriculum
  // ─────────────────────────────────────────────

  subjects: Atom,
  topics: FolderTree,
  concepts: Lightbulb,
  courses: Library,
  courseModules: Layers,
  lessons: BookOpen,
  contentObjectives: Target,
  contentVersions: ScrollText,
  contentBlocks: Boxes,
  contentPublications: Globe,
  contentTranslations: Languages,
  contentTags: Tags,
  scienceUnits: Ruler,
  scienceConstants: InfinityIcon,
  scienceFormulas: Sigma,
  scienceConversions: ArrowLeftRight,
  scienceSimulations: Orbit,
  scienceSimulationPrefabs: Atom,
  scienceExperiments: FlaskConical,
  assessmentQuestions: CircleHelp,
  assessmentQuestionBanks: ClipboardList,
  assessmentProblems: Calculator,
  assessmentAssessments: ClipboardCheck,

  // ─────────────────────────────────────────────
  // Training
  // ─────────────────────────────────────────────

  training: GraduationCap,
  learning: GraduationCap,
  certifications: BadgeCheck,

  // ─────────────────────────────────────────────
  // ERP / Resources
  // ─────────────────────────────────────────────
  packages: Package,
  assets: Archive,
  categories: Tags,
  database: Database,

  // ─────────────────────────────────────────────
  // Reports / Analytics
  // ─────────────────────────────────────────────

  reports: FileBarChart,
  analytics: BarChart3,
  statistics: Activity,
  insights: Sparkles,

  // ─────────────────────────────────────────────
  // System
  // ─────────────────────────────────────────────

  notifications: Bell,
  messages: Mail,
  search: Search,
  support: LifeBuoy,

  securitySettings: LockKeyhole,
  systemSettings: SlidersHorizontal,
  modules: PanelTop,
  workflows: GitBranch,

  // ─────────────────────────────────────────────
  // App shell / chrome
  // ─────────────────────────────────────────────

  brand: BriefcaseBusiness,
  sidebarToggle: PanelLeft,
  expandVertical: ChevronsUpDown,
  logout: LogOut,
} as const;

export type IconName = keyof typeof Icons;

export function resolveIcon(name?: string | null): LucideIcon {
  return name && name in Icons ? Icons[name as IconName] : Icons.settings;
}

function humanize(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/// Options for MDatalist, which renders `icon` in both the dropdown row and the
/// trigger. The stored value stays the registry key, because that is what
/// `resolveIcon` reads back — the same contract `Resource.icon` already uses.
export const ICON_OPTIONS: Array<{
  value: string;
  label: string;
  icon: LucideIcon;
}> = (Object.keys(Icons) as IconName[])
  .map((key) => ({ value: key, label: humanize(key), icon: Icons[key] }))
  .sort((a, b) => a.label.localeCompare(b.label));
