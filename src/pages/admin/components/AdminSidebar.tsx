import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Link2, Users, Flag, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

type AdminSection = 'dashboard' | 'links' | 'users' | 'reports';

interface AdminSidebarProps {
    activeSection: AdminSection;
    onChangeSection: (section: AdminSection) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onChangeSection }) => {
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="w-64 bg-indigo-800 text-white p-4">
            <div className="mb-8">
                <h2 className="text-xl font-bold">Admin</h2>
            </div>

            <nav className="space-y-2">
                <button
                    onClick={() => onChangeSection('dashboard')}
                    className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                        }`}
                >
                    <Home size={20} className="mr-3" />
                    <span>Dashboard</span>
                </button>

                <button
                    onClick={() => onChangeSection('links')}
                    className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'links' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                        }`}
                >
                    <Link2 size={20} className="mr-3" />
                    <span>Enlaces</span>
                </button>

                <button
                    onClick={() => onChangeSection('users')}
                    className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'users' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                        }`}
                >
                    <Users size={20} className="mr-3" />
                    <span>Usuarios</span>
                </button>

                <button
                    onClick={() => onChangeSection('reports')}
                    className={`flex items-center w-full p-3 rounded-lg ${activeSection === 'reports' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                        }`}
                >
                    <Flag size={20} className="mr-3" />
                    <span>Reportes</span>
                </button>
            </nav>

            <div className="absolute bottom-4 w-56">
                <Link
                    to="/"
                    className="flex items-center p-3 rounded-lg hover:bg-indigo-700"
                >
                    <Home size={20} className="mr-3" />
                    <span>Volver al sitio</span>
                </Link>

                <button
                    onClick={handleSignOut}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-700"
                >
                    <LogOut size={20} className="mr-3" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;