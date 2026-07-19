import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/index";
import Login from "./pages/auth/login";
import SuperAdmin from "./pages/super-admin/index";
import Payments from "./pages/super-admin/payments/index";
import Tenants from "./pages/super-admin/tenants/index";
import TenantView from "./pages/super-admin/tenants/TenantView";
import Subscription from "./pages/super-admin/subscriptions/index";
import { ProtectedRoutes } from "./hooks/ProtectedRoutes";
import NotFound from "./components/NotFound";
import SchoolDashboard from "./pages/admin/Dashboard";
import { StudentList } from "./components/students/StudentList";
import Subjects from "./pages/subjects";
import Classes from "./pages/classes";
import Teachers from "./pages/teachers";
import Fees from "./pages/fees";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route element={<ProtectedRoutes allowedRoles={["super_admin"]} />}>
        <Route path="/super_admin/dashboard" element={<Dashboard />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/super-admin/payments" element={<Payments />} />
        <Route path="/super-admin/tenants" element={<Tenants />} />
        <Route path="/super-admin/tenants/:id" element={<TenantView />} />
        <Route path="/super-admin/subscriptions" element={<Subscription />} />
      </Route>
      <Route element={<ProtectedRoutes allowedRoles={["school_admin"]} />}>
        <Route path="/school_admin/dashboard" element={<SchoolDashboard />} />
        <Route path="/admin/students" element={<StudentList />} />
        <Route path="/admin/subjects" element={<Subjects />} />
        <Route path="/admin/classes" element={<Classes />} />
        <Route path="/admin/teachers" element={<Teachers />} />
        <Route path="/admin/fees" element={<Fees />} />

      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
