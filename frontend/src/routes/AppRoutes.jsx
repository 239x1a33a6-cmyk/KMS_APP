import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import CreateResourcePage from "../pages/CreateResourcePage";
import EditResourcePage from "../pages/EditResourcePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ResourceDetailsPage from "../pages/ResourceDetailsPage";
import ResourcesPage from "../pages/ResourcesPage";
import FavoritesPage from "../pages/FavoritesPage";
import ArchivedPage from "../pages/ArchivedPage";
import TrashPage from "../pages/TrashPage";
import ProfilePage from "../pages/ProfilePage";
import PublicResourcePage from "../pages/PublicResourcePage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/public/:id" element={<PublicResourcePage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/resources"
      element={
        <ProtectedRoute>
          <ResourcesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/favorites"
      element={
        <ProtectedRoute>
          <FavoritesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/archived"
      element={
        <ProtectedRoute>
          <ArchivedPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/trash"
      element={
        <ProtectedRoute>
          <TrashPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/resources/new"
      element={
        <ProtectedRoute>
          <CreateResourcePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/resources/:id"
      element={
        <ProtectedRoute>
          <ResourceDetailsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/resources/:id/edit"
      element={
        <ProtectedRoute>
          <EditResourcePage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
