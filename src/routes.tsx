import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Center, Loader } from '@mantine/core';
import { ProtectedRoutes } from './hooks/ProtectedRoutes';
import { RootRedirect } from './hooks/RootRedirect';

// Route-level code splitting: har page apne alag chunk me jaata hai, taaki pehli
// load pe pura app (849KB) ek saath download na ho. Login sabse chhota entry hai.
const Login = lazy(() => import('./pages/auth/login'));
const Dashboard = lazy(() => import('./pages/index'));
const SuperAdmin = lazy(() => import('./pages/super-admin/index'));
const Payments = lazy(() => import('./pages/super-admin/payments/index'));
const Tenants = lazy(() => import('./pages/super-admin/tenants/index'));
const TenantView = lazy(() => import('./pages/super-admin/tenants/TenantView'));
const Subscription = lazy(
  () => import('./pages/super-admin/subscriptions/index'),
);
const NotFound = lazy(() => import('./components/NotFound'));
const SchoolDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StudentList = lazy(() =>
  import('./components/students/StudentList').then((m) => ({
    default: m.StudentList,
  })),
);
const Subjects = lazy(() => import('./pages/subjects'));
const Classes = lazy(() => import('./pages/classes'));
const Teachers = lazy(() => import('./pages/teachers'));
const Fees = lazy(() => import('./pages/fees'));
const Timetable = lazy(() => import('./pages/timetable'));
const TeacherDashboard = lazy(() => import('./pages/teacher'));
const Attendance = lazy(() => import('./pages/attendance'));
const StudentDashboard = lazy(() => import('./pages/student'));
const Parents = lazy(() => import('./pages/parents'));
const ParentPortal = lazy(() => import('./pages/parent'));

function PageLoader() {
  return (
    <Center h="60vh">
      <Loader />
    </Center>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth/login" element={<Login />} />
        <Route element={<ProtectedRoutes allowedRoles={['super_admin']} />}>
          <Route path="/super_admin/dashboard" element={<Dashboard />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/super-admin/payments" element={<Payments />} />
          <Route path="/super-admin/tenants" element={<Tenants />} />
          <Route path="/super-admin/tenants/:id" element={<TenantView />} />
          <Route path="/super-admin/subscriptions" element={<Subscription />} />
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={['school_admin']} />}>
          <Route path="/school_admin/dashboard" element={<SchoolDashboard />} />
          <Route path="/admin/students" element={<StudentList />} />
          <Route path="/admin/subjects" element={<Subjects />} />
          <Route path="/admin/classes" element={<Classes />} />
          <Route path="/admin/teachers" element={<Teachers />} />
          <Route path="/admin/fees" element={<Fees />} />
          <Route path="/admin/timetable" element={<Timetable />} />
          <Route path="/admin/parents" element={<Parents />} />
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/attendance" element={<Attendance />} />
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={['parent']} />}>
          <Route path="/parent/dashboard" element={<ParentPortal />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
