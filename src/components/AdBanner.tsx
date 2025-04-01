import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Primero, definimos el objeto atOptions globalmente
        (window as any).atOptions = {
            'key': 'a5b8480b2cf2c526c693f2bcb282b8f8',
            'format': 'iframe',
            'height': 60,
            'width': 468,
            'params': {}
        };

        // Creamos el script que cargará el anuncio
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//www.highperformanceformat.com/a5b8480b2cf2c526c693f2bcb282b8f8/invoke.js';
        script.async = true;

        // Añadimos el script al contenedor
        if (adContainerRef.current) {
            adContainerRef.current.appendChild(script);
        }

        // Limpieza al desmontar el componente
        return () => {
            if (adContainerRef.current && script.parentNode === adContainerRef.current) {
                adContainerRef.current.removeChild(script);
                // Eliminamos la variable global al desmontar
                delete (window as any).atOptions;
            }
        };
    }, []);

    return (
        <div className="w-full py-4">
            <div
                ref={adContainerRef}
                className="ad-container flex justify-center items-center min-h-[60px] rounded-md overflow-hidden"
            >
                {/* El anuncio se cargará aquí */}
            </div>
        </div>
    );
};

export default AdBanner;