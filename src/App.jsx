import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import WebsiteDetailPage from './pages/WebsiteDetailPage.jsx';
import WebsiteEditPage from './pages/WebsiteEditPage.jsx';
import WebsitePublicPage from './pages/WebsitePublicPage.jsx';
import WebsitesPage from './pages/WebsitesPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/websites/:websiteId/view" element={<WebsitePublicPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/websites" element={<WebsitesPage />} />
          <Route path="/websites/:websiteId" element={<WebsiteDetailPage />} />
          <Route path="/websites/:websiteId/edit" element={<WebsiteEditPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
