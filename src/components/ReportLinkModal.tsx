import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ReportLinkModalProps {
    linkId: string;
    linkTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

const ReportLinkModal: React.FC<ReportLinkModalProps> = ({
    linkId,
    linkTitle,
    isOpen,
    onClose
}) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Debes iniciar sesión para reportar enlaces');
            onClose();
            return;
        }

        if (!reason.trim()) {
            toast.error('Por favor, indica el motivo del reporte');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('reports').insert({
                link_id: linkId,
                user_id: user.id,
                reason
            });

            if (error) throw error;

            toast.success('Enlace reportado correctamente');
            setReason('');
            onClose();
        } catch (error) {
            console.error('Error al reportar enlace:', error);
            toast.error('Error al reportar el enlace');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Reportar enlace</h2>
                <p className="mb-4 text-gray-700">
                    Estás reportando: <span className="font-medium">{linkTitle}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo del reporte
                        </label>
                        <textarea
                            id="reason"
                            rows={4}
                            className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explica por qué estás reportando este enlace..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Reportar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportLinkModal;