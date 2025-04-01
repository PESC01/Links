import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Facebook, Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReportLinkModal from '../components/ReportLinkModal';

// Creamos un contexto para compartir la función de reset
export const HomeContext = React.createContext({
  resetSelectedPlatform: () => { }
});

interface Category {
  id: string;
  name: string;
}

interface Link {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: { name: string };
  category: { name: string };
  created_at: string;
}

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  // Función para resetear la plataforma seleccionada
  const resetSelectedPlatform = () => {
    setSelectedPlatform(null);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (data) setCategories(data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLinksByPlatform = async () => {
      if (!selectedPlatform) {
        setLinks([]);
        return;
      }

      setLoading(true);

      try {
        const { data: platformData } = await supabase
          .from('platforms')
          .select('id')
          .eq('name', selectedPlatform)
          .single();

        if (platformData) {
          const { data: linksData } = await supabase
            .from('links')
            .select(`
              *,
              platform:platforms(name),
              category:categories(name)
            `)
            .eq('platform_id', platformData.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (linksData) setLinks(linksData);
        }
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinksByPlatform();
  }, [selectedPlatform]);

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(previousPlatform =>
      previousPlatform === platform ? null : platform
    );
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleReportClick = (e: React.MouseEvent, link: Link) => {
    e.stopPropagation(); // Evitar que se abra el enlace
    setSelectedLink(link);
    setReportModalOpen(true);
  };

  return (
    <HomeContext.Provider value={{ resetSelectedPlatform }}>
      <div>
        <div className="flex justify-center space-x-8 mb-8">
          <button
            onClick={() => handlePlatformSelect('whatsapp')}
            className={`flex flex-col items-center p-4 rounded-full ${selectedPlatform === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-white'
              } shadow-md hover:shadow-lg transition-shadow`}
          >
            <MessageCircle size={32} />
            <span className="mt-2">WhatsApp</span>
          </button>
          <button
            onClick={() => handlePlatformSelect('telegram')}
            className={`flex flex-col items-center p-4 rounded-full ${selectedPlatform === 'telegram' ? 'bg-blue-500 text-white' : 'bg-white'
              } shadow-md hover:shadow-lg transition-shadow`}
          >
            <Send size={32} />
            <span className="mt-2">Telegram</span>
          </button>
          <button
            onClick={() => handlePlatformSelect('facebook')}
            className={`flex flex-col items-center p-4 rounded-full ${selectedPlatform === 'facebook' ? 'bg-blue-700 text-white' : 'bg-white'
              } shadow-md hover:shadow-lg transition-shadow`}
          >
            <Facebook size={32} />
            <span className="mt-2">Facebook</span>
          </button>
        </div>

        {selectedPlatform ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Enlaces recientes de {selectedPlatform}
            </h1>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-600">Cargando enlaces...</p>
              ) : links.length > 0 ? (
                links.map((link) => (
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
                          {link.category.name}
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
                ))
              ) : (
                <p className="text-center text-gray-600">No hay enlaces para esta plataforma</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Categorías</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                </Link>
              ))}
            </div>
          </div>
        )}

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
    </HomeContext.Provider>
  );
}

export default Home;