import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoryLinks from './pages/CategoryLinks';
import AddLink from './pages/AddLink';
import AdminPage from './pages/admin/AdminPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rutas de administrador
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  if (!user) {
    return <Navigate to="/add-link" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:id" element={<CategoryLinks />} />
                      <Route path="/add-link" element={<AddLink />} />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;