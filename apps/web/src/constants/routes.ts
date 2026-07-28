export const ROUTES = {
  HOME:        '/',
  LOGIN:       '/login',
  REGISTER:    '/register',
  DASHBOARD:   '/dashboard',
  LESSONS:     '/lessons',
  PRACTICE:    (id: string) => `/practice/${id}`,
  PROFILE:     '/profile',
  LEADERBOARD: '/leaderboard',
  SETTINGS:    '/settings'
} as const
