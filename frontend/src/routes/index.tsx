import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { Sidebar } from "../components/Layout/Sidebar";
import { Topbar } from "../components/Layout/Topbar";
import { LoginPage } from "../features/auth/LoginPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ClientesList } from "../features/clientes/ClientesList";
import { ClienteForm } from "../features/clientes/ClienteForm";
import { VehiculosList } from "../features/vehiculos/VehiculosList";
import { VehiculoForm } from "../features/vehiculos/VehiculoForm";
import { ProductosList } from "../features/inventario/ProductosList";
import { ProductoForm } from "../features/inventario/ProductoForm";
import { OTList } from "../features/otes/OTList";
import { OTForm } from "../features/otes/OTForm";
import { FacturasList } from "../features/facturacion/FacturasList";
import { FacturaDetail } from "../features/facturacion/FacturaDetail";
import { CalendarPage } from "../features/citas/CalendarPage";
import { UsuariosList } from "../features/usuarios/UsuariosList";
import { UsuarioForm } from "../features/usuarios/UsuarioForm";
import { ReportesPage } from "../features/reportes/ReportesPage";

const MainLayout = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Topbar />
      <main className="page-wrapper">
        <ConfirmDialog />
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<ClientesList />} />
            <Route path="clientes/nuevo" element={<ClienteForm />} />
            <Route path="clientes/:id" element={<ClienteForm />} />
            <Route path="vehiculos" element={<VehiculosList />} />
            <Route path="vehiculos/nuevo" element={<VehiculoForm />} />
            <Route path="vehiculos/:id" element={<VehiculoForm />} />
            <Route path="inventario" element={<ProductosList />} />
            <Route path="inventario/nuevo" element={<ProductoForm />} />
            <Route path="inventario/:id" element={<ProductoForm />} />
            <Route path="otes" element={<OTList />} />
            <Route path="otes/nuevo" element={<OTForm />} />
            <Route path="otes/:id" element={<OTForm />} />
            <Route path="facturacion" element={<FacturasList />} />
            <Route path="facturacion/:id" element={<FacturaDetail />} />
            <Route path="citas" element={<CalendarPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="usuarios" element={<UsuariosList />} />
            <Route path="usuarios/nuevo" element={<UsuarioForm />} />
            <Route path="usuarios/:id" element={<UsuarioForm />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  </div>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/*" element={<MainLayout />} />
    </Route>
  </Routes>
);
