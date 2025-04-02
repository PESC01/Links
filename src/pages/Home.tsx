import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Facebook, Flag, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReportLinkModal from '../components/ReportLinkModal';
import Advertisement from '../components/Advertisement';
import { useTranslation } from 'react-i18next'; // Importar hook de traducción

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

const LINKS_PER_PAGE = 20;

const Home = () => {
  const { t } = useTranslation(); // Hook para traducciones
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreLinks, setHasMoreLinks] = useState(false);

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
    // Al cambiar la plataforma, reiniciar la paginación
    if (selectedPlatform) {
      setCurrentPage(0);
      setLinks([]);
    }
  }, [selectedPlatform]);

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
          // Consulta principal con paginación
          const { data: linksData, count } = await supabase
            .from('links')
            .select(`
              *,
              platform:platforms(name),
              category:categories(name)
            `, { count: 'exact' })
            .eq('platform_id', platformData.id)
            .order('created_at', { ascending: false })
            .range(currentPage * LINKS_PER_PAGE, (currentPage + 1) * LINKS_PER_PAGE - 1);

          if (linksData) {
            setLinks(linksData);
            // Verificar si hay más páginas
            setHasMoreLinks(count !== null && (currentPage + 1) * LINKS_PER_PAGE < count);
          }
        }
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedPlatform) {
      fetchLinksByPlatform();
    }
  }, [selectedPlatform, currentPage]);

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(previousPlatform =>
      previousPlatform === platform ? null : platform
    );
  };

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handleLinkClick = (url: string) => {
    // Verificar si es la primera vez que el usuario hace clic en este enlace
    const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');

    if (!clickedLinks[url]) {
      // Primera vez: mostrar anuncio
      setPendingUrl(url);
      setAdModalOpen(true);

      // Guardar en localStorage que el usuario ha visto el anuncio para este enlace
      clickedLinks[url] = true;
      localStorage.setItem('clickedLinks', JSON.stringify(clickedLinks));
    } else {
      // Segunda vez: abrir el enlace
      window.open(url, '_blank');
    }
  };

  // Función para cerrar el modal de anuncio
  const handleAdModalClose = () => {
    setAdModalOpen(false);
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

        {/* Anuncio de banner en la parte superior */}
        <Advertisement type="banner" />

        {selectedPlatform ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('recentLinks')} {selectedPlatform}
            </h1>

            {/* Banner para invitar a compartir enlaces */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg mb-6 shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold">{t('haveGroupPlatform', { platform: selectedPlatform })}</h3>
                  <p className="mt-1">{t('shareWithCommunity')}</p>
                </div>
                <Link
                  to="/add-link"
                  className="px-6 py-2 bg-white text-indigo-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  {t('shareMyGroup')}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {loading && currentPage === 0 ? (
                <p className="text-center text-gray-600">{t('loading')}</p>
              ) : links.length > 0 ? (
                <>
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
                    </React.Fragment>
                  ))}

                  {/* Botón para cargar más enlaces */}
                  {hasMoreLinks && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleLoadMore}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        disabled={loading}
                      >
                        {loading ? t('loading') : t('next')}
                        {!loading && <ChevronRight size={16} className="ml-2" />}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-600">{t('noLinksForPlatform')}</p>
              )}

              {/* Anuncio de barra lateral después de algunos enlaces */}
              {links.length > 0 && <Advertisement type="sidebar" />}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('categories')}</h1>

            {/* Banner para invitar a compartir enlaces */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg mb-8 shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold">{t('haveGroupShare')}</h3>
                  <p className="mt-1">{t('helpCommunity')}</p>
                </div>
                <Link
                  to="/add-link"
                  className="px-6 py-2 bg-white text-indigo-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  {t('shareALink')}
                </Link>
              </div>
            </div>

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

        {/* Anuncio de banner en la parte inferior */}
        <Advertisement type="banner" />

        {/* Modal de anuncio */}
        {adModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{t('beforeContinuing')}</h2>
              <div className="my-4">
                <Advertisement type="banner" />
              </div>
              <p className="mb-4 text-center">
                {t('toAccessLink')}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleAdModalClose}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {t('close')}
                </button>
              </div>
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