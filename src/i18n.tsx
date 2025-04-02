import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Archivos de traducción
const resources = {
    en: {
        translation: {
            // Textos de navegación
            "linkShare": "LinkShare",
            "shareLink": "Share Link",
            "signIn": "Sign In",
            "signOut": "Sign Out",

            // Categorías
            "categories": "Categories",
            "haveGroupShare": "Do you have a group you want to share?",
            "helpCommunity": "Help the community find the best groups",
            "shareALink": "Share a link",

            // Plataformas
            "recentLinks": "Recent links from",
            "haveGroupPlatform": "Do you have a {{platform}} group?",
            "shareWithCommunity": "Share it with the community and reach more people",
            "shareMyGroup": "Share my group",
            "loading": "Loading...",
            "loadingLinks": "Loading links...",
            "noLinksForPlatform": "No links for this platform",
            "noLinksInCategory": "No links in this category",
            "next": "Next",
            "reportLink": "Report link",

            // Modal de anuncio
            "beforeContinuing": "Before continuing...",
            "toAccessLink": "To access the link, close this window and click again.",
            "close": "Close"
        }
    },
    es: {
        translation: {
            // Textos de navegación
            "linkShare": "LinkShare",
            "shareLink": "Compartir Enlace",
            "signIn": "Iniciar Sesión",
            "signOut": "Cerrar Sesión",

            // Categorías
            "categories": "Categorías",
            "haveGroupShare": "¿Tienes un grupo que quieras compartir?",
            "helpCommunity": "Ayuda a la comunidad a encontrar los mejores grupos",
            "shareALink": "Compartir un enlace",

            // Plataformas
            "recentLinks": "Enlaces recientes de",
            "haveGroupPlatform": "¿Tienes un grupo de {{platform}}?",
            "shareWithCommunity": "Compártelo con la comunidad y llega a más personas",
            "shareMyGroup": "Compartir mi grupo",
            "loading": "Cargando...",
            "loadingLinks": "Cargando enlaces...",
            "noLinksForPlatform": "No hay enlaces para esta plataforma",
            "noLinksInCategory": "No hay enlaces en esta categoría",
            "next": "Siguiente",
            "reportLink": "Reportar enlace",

            // Modal de anuncio
            "beforeContinuing": "Antes de continuar...",
            "toAccessLink": "Para acceder al enlace, cierra esta ventana y haz clic nuevamente.",
            "close": "Cerrar"
        }
    }
};

i18n
    .use(LanguageDetector) // Detecta el idioma del navegador
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es', // Idioma predeterminado si no se detecta
        interpolation: {
            escapeValue: false // No es necesario para React
        }
    });

export default i18n;