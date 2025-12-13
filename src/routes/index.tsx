import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'

const Dashboards = lazy(() => import('@/app/(admin)/dashboards/page'))

// HRM Routes
const HrmEmployees = lazy(() => import('@/app/(admin)/hrm/employees/page'))
const HrmEmployeeDetailPage = lazy(() => import('@/app/(admin)/hrm/employees/EmployeeDetailPage'))
const HrmEmployeeEditPage = lazy(() => import('@/app/(admin)/hrm/employees/EmployeeEditPage'))
const HrmEmployeeCreatePage = lazy(() => import('@/app/(admin)/hrm/employees/EmployeeCreatePage'))
const HrmOrgUnitsPage = lazy(() => import('@/app/(admin)/hrm/org-units/OrgUnitsPage'))
const HrmOrgUnitDetailPage = lazy(() => import('@/app/(admin)/hrm/org-units/OrgUnitDetailPage'))
const HrmOrgUnitEditPage = lazy(() => import('@/app/(admin)/hrm/org-units/OrgUnitEditPage'))
const HrmPositionsPage = lazy(() => import('@/app/(admin)/hrm/positions/PositionsPage'))
const HrmPositionDetailPage = lazy(() => import('@/app/(admin)/hrm/positions/PositionDetailPage'))
const HrmPositionEditPage = lazy(() => import('@/app/(admin)/hrm/positions/PositionEditPage'))
const HrmUsersPage = lazy(() => import('@/app/(admin)/hrm/users/UsersPage'))
const HrmUserDetailPage = lazy(() => import('@/app/(admin)/hrm/users/UserDetailPage'))

// Auth Routes (preserved for login flow, NOT in sidebar)
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))
const Error404 = lazy(() => import('@/app/(other)/error-pages/pages-404/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
  hidden?: boolean // Internal routes not shown in sidebar
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/dashboards" />,
  },
]

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboards',
    name: 'Dashboards',
    element: <Dashboards />,
  },
]

export const authRoutes: RoutesProps[] = [
  {
    name: 'Sign In',
    path: '/auth/sign-in',
    element: <AuthSignIn />,
  },
  {
    name: 'Sign Up',
    path: '/auth/sign-up',
    element: <AuthSignUp />,
  },
  {
    name: 'Reset Password',
    path: '/auth/reset-password',
    element: <ResetPassword />,
  },
  {
    name: 'Lock Screen',
    path: '/auth/lock-screen',
    element: <LockScreen />,
  },
  {
    name: '404 Error',
    path: '/error-pages/pages-404',
    element: <Error404 />,
  },
]

// HRM Routes
const hrmRoutes: RoutesProps[] = [
  {
    name: 'Employee Directory',
    path: '/hrm/employees',
    element: <HrmEmployees />,
  },
  {
    name: 'Create Employee',
    path: '/hrm/employees/create',
    element: <HrmEmployeeCreatePage />,
    hidden: true,
  },
  {
    name: 'Employee Detail',
    path: '/hrm/employees/:employeeId',
    element: <HrmEmployeeDetailPage />,
    hidden: true,
  },
  {
    name: 'Employee Edit',
    path: '/hrm/employees/:employeeId/edit',
    element: <HrmEmployeeEditPage />,
    hidden: true,
  },
  {
    name: 'Organization Units',
    path: '/hrm/org-units',
    element: <HrmOrgUnitsPage />,
  },
  {
    name: 'Org Unit Detail',
    path: '/hrm/org-units/:orgUnitId',
    element: <HrmOrgUnitDetailPage />,
    hidden: true,
  },
  {
    name: 'Org Unit Edit',
    path: '/hrm/org-units/:orgUnitId/edit',
    element: <HrmOrgUnitEditPage />,
    hidden: true,
  },
  {
    name: 'Positions',
    path: '/hrm/positions',
    element: <HrmPositionsPage />,
  },
  {
    name: 'Position Detail',
    path: '/hrm/positions/:positionId',
    element: <HrmPositionDetailPage />,
    hidden: true,
  },
  {
    name: 'Position Edit',
    path: '/hrm/positions/:positionId/edit',
    element: <HrmPositionEditPage />,
    hidden: true,
  },
  {
    name: 'Users & Roles',
    path: '/hrm/users',
    element: <HrmUsersPage />,
  },
  {
    name: 'User Detail',
    path: '/hrm/users/:userId',
    element: <HrmUserDetailPage />,
    hidden: true,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...hrmRoutes,
]
