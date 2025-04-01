import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Stats {
    totalLinks: number;
    totalUsers: number;
    totalReports: number;
    pendingReports: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats>({
        totalLinks: 0,
        totalUsers: 0,
        totalReports: 0,
        pendingReports: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Obtener estadísticas en paralelo
                const [linksData, usersData, reportsData, pendingReportsData] = await Promise.all([
                    supabase.from('links').select('id', { count: 'exact', head: true }),
                    supabase.from('auth.users').select('id', { count: 'exact', head: true }),
                    supabase.from('reports').select('id', { count: 'exact', head: true }),
                    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending')
                ]);

                setStats({
                    totalLinks: linksData.count || 0,
                    totalUsers: usersData.count || 0,
                    totalReports: reportsData.count || 0,
                    pendingReports: pendingReportsData.count || 0
                });
            } catch (error) {
                console.error('Error obteniendo estadísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <p>Cargando estadísticas...</p>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-500">Total Enlaces</h3>
                    <p className="text-3xl font-bold">{stats.totalLinks}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-500">Total Usuarios</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-500">Total Reportes</h3>
                    <p className="text-3xl font-bold">{stats.totalReports}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-500">Reportes Pendientes</h3>
                    <p className="text-3xl font-bold">{stats.pendingReports}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Acciones rápidas</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                        onClick={() => window.location.href = '/admin/reports'}
                    >
                        Ver reportes pendientes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;