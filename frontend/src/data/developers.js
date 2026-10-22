/**
 * Mock developer data for the admin developer-management view
 * and developer-side portal.
 */

export const DEVELOPERS = [
  {
    id: 'dev-1',
    name: 'Dana Walsh',
    email: 'dana@example.com',
    avatar: 'DW',
    status: 'occupied',
    specialty: 'Frontend',
    activeIssues: 2,
    resolvedTotal: 14,
    joinedAt: '2026-03-15T00:00:00Z',
    currentIssue: 'ISS-001',
  },
  {
    id: 'dev-2',
    name: 'Sam Reyes',
    email: 'sam@example.com',
    avatar: 'SR',
    status: 'occupied',
    specialty: 'Backend',
    activeIssues: 1,
    resolvedTotal: 22,
    joinedAt: '2026-01-10T00:00:00Z',
    currentIssue: 'ISS-002',
  },
  {
    id: 'dev-3',
    name: 'Lee Nakamura',
    email: 'lee@example.com',
    avatar: 'LN',
    status: 'occupied',
    specialty: 'Infrastructure',
    activeIssues: 1,
    resolvedTotal: 9,
    joinedAt: '2026-06-01T00:00:00Z',
    currentIssue: 'ISS-005',
  },
  {
    id: 'dev-4',
    name: 'Priya Menon',
    email: 'priya@example.com',
    avatar: 'PM',
    status: 'free',
    specialty: 'Full Stack',
    activeIssues: 0,
    resolvedTotal: 18,
    joinedAt: '2026-02-20T00:00:00Z',
    currentIssue: null,
  },
  {
    id: 'dev-5',
    name: 'Kai Hernandez',
    email: 'kai@example.com',
    avatar: 'KH',
    status: 'free',
    specialty: 'DevOps',
    activeIssues: 0,
    resolvedTotal: 7,
    joinedAt: '2026-08-10T00:00:00Z',
    currentIssue: null,
  },
  {
    id: 'dev-6',
    name: 'Aisha Okafor',
    email: 'aisha@example.com',
    avatar: 'AO',
    status: 'free',
    specialty: 'Backend',
    activeIssues: 0,
    resolvedTotal: 11,
    joinedAt: '2026-04-05T00:00:00Z',
    currentIssue: null,
  },
]

export const STATUS_BADGE = {
  free:     { label: 'Free',     classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  occupied: { label: 'Occupied', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
}
