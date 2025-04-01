import React, { useEffect, useState } from 'react';
import { Check, X, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import DialogConfirm from './DialogConfirm';

interface Report {
    id: string;
    reason: string;
    status: 'pending' | 'reviewed' | 'rejected';
    created_at: string;
    link: {
        id: string;
        title: string;
        url: string;
    };
    user: {
        email: string;
    };
}

const ReportsManager = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'rejected'>('pending');
    const [confirmDeleteLink, setConfirmDeleteLink] = useState({ isOpen: false, linkId: '', title: '' });
    const [confirmReportAction, setConfirmReportAction] = useState({
        isOpen: false,
        reportId: '',
        action: '' as 'approve' | 'reject',
        title: ''
    });

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('reports')
                    .select(`
            id,
            reason,
            status,
            created_at,
            link:links(id, title, url),
            user:auth.users(email)
          `)
                    .order('created_at', { ascending: false });

                if (filterStatus !== 'all') {
                    query = query.eq('status', filterStatus);
                }

                const { data, error } = await query;

                if (error) throw error;
                if (data) setReports(data);
            } catch (error) {
                console.error('Error obteniendo reportes:', error);
                toast.error('Error al cargar los reportes');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [filterStatus]);

    const handleStatusChange = async (reportId: string, action: 'approve' | 'reject', linkTitle: string) => {
        setConfirmReportAction({
            isOpen: true,
            reportId,
            action,
            title: linkTitle
        });
    };

    const confirmStatusChange = async () => {
        try {
            const newStatus = confirmReportAction.action === 'approve' ? 'reviewed' : 'rejected';

            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', confirmReportAction.reportId);

            if (error) throw error;

            // Actualizar la lista de reportes
            setReports(reports.map(report =>
                report.id === confirmReportAction.reportId
                    ? { ...report, status: newStatus }
                    : report
            ));

            toast.success(
                confirmReportAction.action === 'approve'
                    ? 'Reporte marcado como revisado'
                    : 'Reporte rechazado'
            );
        } catch (error) {
            console.error('Error actualizando reporte:', error);
            toast.error('Error al actualizar el reporte');
        } finally {
            setConfirmReportAction({ isOpen: false, reportId: '', action: 'approve', title: '' });
        }
    };

    const handleDeleteLink = (linkId: string, title: string) => {
        setConfirmDeleteLink({
            isOpen: true,
            linkId,
            title
        });
    };

    const confirmDeleteLinkAction = async () => {
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', confirmDeleteLink.linkId);

            if (error) throw error;

            // Actualiza los reportes relacionados con este enlace
            setReports(reports.filter(report => report.link.id !== confirmDeleteLink.linkId));

            toast.success('Enlace eliminado correctamente');
        } catch (error) {
            console.error('Error eliminando enlace:', error);
            toast.error('Error al eliminar el enlace');
        } finally {
            setConfirmDeleteLink({ isOpen: false, linkId: '', title: '' });
        }
    };

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'reviewed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Gestión de Reportes</h2>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1 rounded-md ${filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-3 py-1 rounded-md ${filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFilterStatus('reviewed')}
                        className={`px-3 py-1 rounded-md ${filterStatus === 'reviewed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                            }`}
                    >
                        Revisados
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`px-3 py-1 rounded-md ${filterStatus === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
                            }`}
                    >
                        Rechazados
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-center my-8">Cargando reportes...</p>
            ) : (
                <div className="space-y-4">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.id} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{report.link.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            Reportado el {new Date(report.created_at).toLocaleDateString()} por {report.user.email}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(report.status)}`}>
                                        {report.status === 'pending' && 'Pendiente'}
                                        {report.status === 'reviewed' && 'Revisado'}
                                        {report.status === 'rejected' && 'Rechazado'}
                                    </span>
                                </div>

                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Motivo del reporte:</h4>
                                    <p className="text-gray-800">{report.reason}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => openLink(report.link.url)}
                                        className="flex items-center text-indigo-600 hover:text-indigo-900"
                                    >
                                        <ExternalLink size={16} className="mr-1" />
                                        <span>Ver enlace</span>
                                    </button>

                                    <div className="flex space-x-2">
                                        {report.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(report.id, 'approve', report.link.title)}
                                                    className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                                                    title="Marcar como revisado"
                                                >
                                                    <Check size={16} className="mr-1" />
                                                    <span>Aprobar</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(report.id, 'reject', report.link.title)}
                                                    className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                                                    title="Rechazar reporte"
                                                >
                                                    <X size={16} className="mr-1" />
                                                    <span>Rechazar</span>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDeleteLink(report.link.id, report.link.title)}
                                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            title="Eliminar enlace"
                                        >
                                            <Trash2 size={16} className="mr-1" />
                                            <span>Eliminar enlace</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-8 bg-white rounded-lg shadow-md">
                            No hay reportes {filterStatus !== 'all' ? `con estado "${filterStatus}"` : ''}
                        </p>
                    )}
                </div>
            )}

            {/* Diálogos de confirmación */}
            <DialogConfirm
                isOpen={confirmReportAction.isOpen}
                title={confirmReportAction.action === 'approve' ? "Aprobar reporte" : "Rechazar reporte"}
                message={`¿Estás seguro de que deseas ${confirmReportAction.action === 'approve' ? 'aprobar' : 'rechazar'} el reporte para "${confirmReportAction.title}"?`}
                confirmText={confirmReportAction.action === 'approve' ? "Aprobar" : "Rechazar"}
                onConfirm={confirmStatusChange}
                onCancel={() => setConfirmReportAction({ isOpen: false, reportId: '', action: 'approve', title: '' })}
                danger={confirmReportAction.action === 'reject'}
            />

            <DialogConfirm
                isOpen={confirmDeleteLink.isOpen}
                title="Eliminar enlace"
                message={`¿Estás seguro de que deseas eliminar el enlace "${confirmDeleteLink.title}"? Esta acción es irreversible y eliminará todos los reportes asociados.`}
                confirmText="Eliminar"
                onConfirm={confirmDeleteLinkAction}
                onCancel={() => setConfirmDeleteLink({ isOpen: false, linkId: '', title: '' })}
                danger={true}
            />
        </div>
    );
};

export default ReportsManager;