import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReportLinkModal from '../components/ReportLinkModal';

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
    window.open(url, '_blank');
  };

  const handleReportClick = (e: React.MouseEvent, link: Link) => {
    e.stopPropagation(); // Evitar que se abra el enlace
    setSelectedLink(link);
    setReportModalOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {category?.name || 'Cargando...'}
      </h1>
      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
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
        ))}
        {links.length === 0 && (
          <p className="text-center text-gray-600">No hay enlaces en esta categoría</p>
        )}
      </div>

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
    </div>
  );
}

export default CategoryLinks;