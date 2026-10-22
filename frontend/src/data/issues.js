/**
 * Mock issues data used across all three portals.
 *
 * Priority is auto-computed from reportCount (number of distinct users who
 * reported the same problem):
 *   1 report   → low
 *   2-4        → medium
 *   5-9        → high
 *   10+        → critical
 */

/**
 * Derive priority from number of reports.
 */
export function computePriority(count) {
  if (count >= 10) return 'critical'
  if (count >= 5) return 'high'
  if (count >= 2) return 'medium'
  return 'low'
}

const RAW_ISSUES = [
  {
    id: 'ISS-001',
    title: 'Login page crashes on Safari 17',
    description: 'When attempting to login using Safari 17 on macOS Sonoma, the page becomes unresponsive after submitting credentials. Console shows a TypeError related to the fetch API polyfill.',
    reportCount: 14,
    reporters: [
      { id: 'user-1', name: 'Riya Sharma' },
      { id: 'user-2', name: 'Arjun Patel' },
      { id: 'user-4', name: 'Vikram Singh' },
      { id: 'user-7', name: 'Anita Rao' },
      { id: 'user-9', name: 'Kiran Desai' },
    ],
    status: 'assigned',
    reportedBy: { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
    assignedTo: { id: 'dev-1', name: 'Dana Walsh', email: 'dana@example.com' },
    assignmentType: 'admin_assigned',
    adminApproved: true,
    createdAt: '2026-10-20T09:15:00Z',
    updatedAt: '2026-10-21T14:30:00Z',
  },
  {
    id: 'ISS-002',
    title: 'Dark mode toggle does not persist across sessions',
    description: 'Users report that the dark mode preference resets to light mode every time they close and reopen the browser. The setting should be stored in localStorage.',
    reportCount: 3,
    reporters: [
      { id: 'user-2', name: 'Arjun Patel' },
      { id: 'user-5', name: 'Neha Kapoor' },
      { id: 'user-8', name: 'Rohan Mehta' },
    ],
    status: 'in_progress',
    reportedBy: { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
    assignedTo: { id: 'dev-2', name: 'Sam Reyes', email: 'sam@example.com' },
    assignmentType: 'self_picked',
    adminApproved: true,
    createdAt: '2026-10-18T11:20:00Z',
    updatedAt: '2026-10-22T10:00:00Z',
  },
  {
    id: 'ISS-003',
    title: 'API rate limiting returns wrong error code',
    description: 'When rate limit is exceeded, the API returns 500 instead of 429. This confuses client-side retry logic and causes infinite retry loops.',
    reportCount: 7,
    reporters: [
      { id: 'user-3', name: 'Meera Joshi' },
      { id: 'user-1', name: 'Riya Sharma' },
      { id: 'user-6', name: 'Dev Ops Bot' },
      { id: 'user-10', name: 'Sanya Gupta' },
      { id: 'user-11', name: 'Rahul Nair' },
    ],
    status: 'open',
    reportedBy: { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
    assignedTo: null,
    assignmentType: null,
    adminApproved: false,
    createdAt: '2026-10-22T08:45:00Z',
    updatedAt: '2026-10-22T08:45:00Z',
  },
  {
    id: 'ISS-004',
    title: 'CSV export truncates records after 10,000 rows',
    description: 'Large data exports via CSV are silently truncated. No error or warning is shown to the user. Expected behavior: paginated download or streaming.',
    reportCount: 2,
    reporters: [
      { id: 'user-1', name: 'Riya Sharma' },
      { id: 'user-6', name: 'Dev Ops Bot' },
    ],
    status: 'open',
    reportedBy: { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
    assignedTo: null,
    assignmentType: null,
    adminApproved: false,
    createdAt: '2026-10-21T16:10:00Z',
    updatedAt: '2026-10-21T16:10:00Z',
  },
  {
    id: 'ISS-005',
    title: 'Email notifications arriving with 6-hour delay',
    description: 'Transactional emails (password reset, approval notifications) are delayed by up to 6 hours. The queue processor seems to be throttled incorrectly.',
    reportCount: 8,
    reporters: [
      { id: 'user-4', name: 'Vikram Singh' },
      { id: 'user-2', name: 'Arjun Patel' },
      { id: 'user-3', name: 'Meera Joshi' },
      { id: 'user-5', name: 'Neha Kapoor' },
      { id: 'user-7', name: 'Anita Rao' },
    ],
    status: 'assigned',
    reportedBy: { id: 'user-4', name: 'Vikram Singh', email: 'vikram@example.com' },
    assignedTo: { id: 'dev-3', name: 'Lee Nakamura', email: 'lee@example.com' },
    assignmentType: 'admin_assigned',
    adminApproved: true,
    createdAt: '2026-10-19T13:00:00Z',
    updatedAt: '2026-10-20T09:20:00Z',
  },
  {
    id: 'ISS-006',
    title: 'Mobile menu overlay blocks scroll on iOS',
    description: 'On iOS devices, when the mobile hamburger menu is opened and then closed, the underlying page scroll remains locked. Users have to refresh to regain scroll.',
    reportCount: 1,
    reporters: [
      { id: 'user-2', name: 'Arjun Patel' },
    ],
    status: 'resolved',
    reportedBy: { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
    assignedTo: { id: 'dev-1', name: 'Dana Walsh', email: 'dana@example.com' },
    assignmentType: 'self_picked',
    adminApproved: true,
    createdAt: '2026-10-15T10:30:00Z',
    updatedAt: '2026-10-19T17:45:00Z',
  },
  {
    id: 'ISS-007',
    title: 'Webhook payload missing timestamp field',
    description: 'The webhook payload for flag change events is missing the `changed_at` timestamp. Downstream services rely on this field for ordering.',
    reportCount: 4,
    reporters: [
      { id: 'user-5', name: 'Neha Kapoor' },
      { id: 'user-6', name: 'Dev Ops Bot' },
      { id: 'user-10', name: 'Sanya Gupta' },
      { id: 'user-11', name: 'Rahul Nair' },
    ],
    status: 'open',
    reportedBy: { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
    assignedTo: null,
    assignmentType: null,
    adminApproved: false,
    createdAt: '2026-10-22T12:00:00Z',
    updatedAt: '2026-10-22T12:00:00Z',
  },
  {
    id: 'ISS-008',
    title: 'Search results not updating on filter change',
    description: 'When changing the filter dropdown on the flags search page, results are not re-fetched. User has to manually clear and re-type the search query.',
    reportCount: 1,
    reporters: [
      { id: 'user-3', name: 'Meera Joshi' },
    ],
    status: 'closed',
    reportedBy: { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
    assignedTo: { id: 'dev-2', name: 'Sam Reyes', email: 'sam@example.com' },
    assignmentType: 'admin_assigned',
    adminApproved: true,
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-17T14:00:00Z',
  },
]

// Auto-compute priority from reportCount
export const ISSUES = RAW_ISSUES.map((issue) => ({
  ...issue,
  priority: computePriority(issue.reportCount),
}))

// Issues that developers have self-picked but are pending admin approval
export const PENDING_APPROVALS = [
  {
    id: 'ISS-003',
    title: 'API rate limiting returns wrong error code',
    reportCount: 7,
    priority: 'high',
    requestedBy: { id: 'dev-4', name: 'Priya Menon', email: 'priya@example.com' },
    requestedAt: '2026-10-22T14:30:00Z',
    reportedBy: { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
  },
  {
    id: 'ISS-007',
    title: 'Webhook payload missing timestamp field',
    reportCount: 4,
    priority: 'medium',
    requestedBy: { id: 'dev-1', name: 'Dana Walsh', email: 'dana@example.com' },
    requestedAt: '2026-10-22T13:15:00Z',
    reportedBy: { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
  },
]

export const PRIORITY_META = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200', threshold: '10+ reports' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-700 border-orange-200', threshold: '5-9 reports' },
  medium:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200', threshold: '2-4 reports' },
  low:      { label: 'Low',      color: 'bg-green-100 text-green-700 border-green-200', threshold: '1 report' },
}

export const STATUS_META = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  assigned:    { label: 'Assigned',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
}
