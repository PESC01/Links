import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Crea e inserta el script de anuncio
        const script = document.createElement('script');
        script.src = 'https://www.effectiveratecpm.com/bugtjp9w1x?key=8769f4085754840d1b068ff40d6e9bc5';
        script.async = true;

        // Añade el script al contenedor
        if (adContainerRef.current) {
            adContainerRef.current.appendChild(script);
        }

        // Limpieza al desmontar
        return () => {
            if (adContainerRef.current && script.parentNode === adContainerRef.current) {
                adContainerRef.current.removeChild(script);
            }
        };
    }, []);

    return (
        <div className="w-full py-4">
            <div ref={adContainerRef} className="ad-container bg-gray-50 flex justify-center items-center min-h-[90px] rounded-md overflow-hidden">
                {/* El anuncio se cargará aquí */}
            </div>
        </div>
    );
};

export default AdBanner;