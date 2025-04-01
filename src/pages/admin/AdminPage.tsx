import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './components/Dashboard';
import LinksManager from './components/LinksManager';
import UsersManager from '../../pages/admin/components/UsersManager';
import ReportsManager from '../../pages/admin/components/ReportsManager';

type AdminSection = 'dashboard' | 'links' | 'users' | 'reports';

const AdminPage = () => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('auth.users')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error verificando estado de administrador:', error);
                    setIsAdmin(false);
                } else {
                    setIsAdmin(data?.is_admin || false);
                }
            } catch (error) {
                console.error('Error:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Cargando...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard />;
            case 'links':
                return <LinksManager />;
            case 'users':
                return <UsersManager />;
            case 'reports':
                return <ReportsManager />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} onChangeSection={setActiveSection} />
            <div className="flex-1 overflow-auto p-8">
                <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
                {renderActiveSection()}
            </div>
        </div>
    );
};

export default AdminPage;