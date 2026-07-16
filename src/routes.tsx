import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/index";
import Login from "./pages/auth/login";
import SuperAdmin from "./pages/super-admin/index";
import Payments from "./pages/super-admin/payments/index";
import Tenants from "./pages/super-admin/tenants/index";
import TenantView from "./pages/super-admin/tenants/[id]";
import Subscription from "./pages/super-admin/subscriptions/index";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/super-admin" element={<SuperAdmin />} />
      <Route path="/super-admin/payments" element={<Payments />} />
      <Route path="/super-admin/tenants" element={<Tenants />} />
      <Route path="/super-admin/tenants/:id" element={<TenantView />} />
      <Route path="/super-admin/subscriptions" element={<Subscription />} />
    </Routes>
  );
}
