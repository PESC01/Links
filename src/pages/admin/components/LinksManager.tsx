import React, { useEffect, useState } from 'react';
import { Link, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import DialogConfirm from './DialogConfirm';

interface LinkItem {
    id: string;
    title: string;
    url: string;
    created_at: string;
    platform: { name: string };
    category: { name: string };
}

const LinksManager = () => {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, linkId: '', title: '' });
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [platforms, setPlatforms] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            const [categoriesData, platformsData] = await Promise.all([
                supabase.from('categories').select('id, name').order('name'),
                supabase.from('platforms').select('id, name')
            ]);

            if (categoriesData.data) setCategories(categoriesData.data);
            if (platformsData.data) setPlatforms(platformsData.data);
        };

        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchLinks = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('links')
                    .select(`
            id,
            title,
            url,
            created_at,
            platform:platforms(name),
            category:categories(name)
          `)
                    .order('created_at', { ascending: false });

                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory);
                }

                if (selectedPlatform) {
                    query = query.eq('platform_id', selectedPlatform);
                }

                const { data, error } = await query;

                if (error) throw error;
                if (data) setLinks(data);
            } catch (error) {
                console.error('Error obteniendo enlaces:', error);
                toast.error('Error al cargar los enlaces');
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, [selectedCategory, selectedPlatform]);

    const handleDeleteLink = async (id: string, title: string) => {
        setConfirmDialog({
            isOpen: true,
            linkId: id,
            title
        });
    };

    const confirmDelete = async () => {
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', confirmDialog.linkId);

            if (error) throw error;

            setLinks(links.filter(link => link.id !== confirmDialog.linkId));
            toast.success('Enlace eliminado correctamente');
        } catch (error) {
            console.error('Error eliminando enlace:', error);
            toast.error('Error al eliminar el enlace');
        } finally {
            setConfirmDialog({ isOpen: false, linkId: '', title: '' });
        }
    };

    const cancelDelete = () => {
        setConfirmDialog({ isOpen: false, linkId: '', title: '' });
    };

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Gestión de Enlaces</h2>

                <div className="flex gap-4">
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedPlatform || ''}
                        onChange={(e) => setSelectedPlatform(e.target.value || null)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="">Todas las plataformas</option>
                        {platforms.map(plat => (
                            <option key={plat.id} value={plat.id}>{plat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-center my-8">Cargando enlaces...</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {links.length > 0 ? (
                                links.map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{link.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{link.category.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                {link.platform.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(link.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openLink(link.url)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLink(link.id, link.title)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No se encontraron enlaces
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <DialogConfirm
                isOpen={confirmDialog.isOpen}
                title="Eliminar enlace"
                message={`¿Estás seguro de que deseas eliminar el enlace "${confirmDialog.title}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                danger={true}
            />
        </div>
    );
};

export default LinksManager;