import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReportLinkModal from '../components/ReportLinkModal';
import Advertisement from '../components/Advertisement';

interface Link {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: { name: string };
  created_at: string;
}

const CategoryLinks = () => {
  const { id } = useParams();
  const [links, setLinks] = useState<Link[]>([]);
  const [category, setCategory] = useState<{ name: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [categoryData, linksData] = await Promise.all([
        supabase.from('categories').select('name').eq('id', id).single(),
        supabase
          .from('links')
          .select(`
            *,
            platform:platforms(name)
          `)
          .eq('category_id', id)
          .order('created_at', { ascending: false })
      ]);

      if (categoryData.data) setCategory(categoryData.data);
      if (linksData.data) setLinks(linksData.data);
    };

    fetchData();
  }, [id]);

  const handleLinkClick = (url: string) => {
    const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');

    if (!clickedLinks[url]) {
      setPendingUrl(url);
      setAdModalOpen(true);
      clickedLinks[url] = true;
      localStorage.setItem('clickedLinks', JSON.stringify(clickedLinks));
    } else {
      window.open(url, '_blank');
    }
  };

  const handleReportClick = (e: React.MouseEvent, link: Link) => {
    e.stopPropagation();
    setSelectedLink(link);
    setReportModalOpen(true);
  };

  const handleAdModalClose = () => {
    setAdModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {category?.name || 'Cargando...'}
      </h1>

      <Advertisement type="banner" />

      <div className="space-y-4">
        {links.map((link, index) => (
          <React.Fragment key={link.id}>
            <div
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleLinkClick(link.url)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{link.title}</h2>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {link.platform.name}
                  </span>
                </div>
                <p className="text-gray-600">{link.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(link.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleReportClick(e, link)}
                className="absolute bottom-2 right-2 text-gray-400 hover:text-red-500 p-2"
                title="Reportar enlace"
              >
                <Flag size={16} />
              </button>
            </div>

            {(index + 1) % 3 === 0 && <Advertisement type="sidebar" />}
          </React.Fragment>
        ))}
        {links.length === 0 && (
          <p className="text-center text-gray-600">No hay enlaces en esta categoría</p>
        )}
      </div>

      <Advertisement type="banner" />

      {selectedLink && (
        <ReportLinkModal
          linkId={selectedLink.id}
          linkTitle={selectedLink.title}
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedLink(null);
          }}
        />
      )}

      {adModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Antes de continuar...</h2>
            <div className="my-4">
              <Advertisement type="banner" />
            </div>
            <p className="mb-4 text-center">
              Para acceder al enlace, cierra esta ventana y haz clic nuevamente.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleAdModalClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryLinks;