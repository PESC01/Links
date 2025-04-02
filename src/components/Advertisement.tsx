import React, { useEffect, useRef } from 'react';

interface AdvertisementProps {
    type: 'banner' | 'sidebar'; // Puedes agregar más tipos según necesites
}

const Advertisement: React.FC<AdvertisementProps> = ({ type }) => {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Creamos los scripts dinámicamente según el tipo de anuncio
        if (type === 'banner') {
            // Primer script que define atOptions
            const atOptionsScript = document.createElement('script');
            atOptionsScript.type = 'text/javascript';
            atOptionsScript.text = `
        atOptions = {
          'key' : 'a5b8480b2cf2c526c693f2bcb282b8f8',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;

            // Segundo script que invoca el anuncio
            const invocationScript = document.createElement('script');
            invocationScript.type = 'text/javascript';
            invocationScript.src = '//www.highperformanceformat.com/a5b8480b2cf2c526c693f2bcb282b8f8/invoke.js';

            // Añadir al contenedor
            if (adContainerRef.current) {
                adContainerRef.current.appendChild(atOptionsScript);
                adContainerRef.current.appendChild(invocationScript);
            }
        } else if (type === 'sidebar') {
            // Script para anuncios de barra lateral
            const sidebarScript = document.createElement('script');
            sidebarScript.type = 'text/javascript';
            sidebarScript.src = '//pl26272670.effectiveratecpm.com/c3/cf/e7/c3cfe7492e8962299a24dd6d2ad48c58.js';

            if (adContainerRef.current) {
                adContainerRef.current.appendChild(sidebarScript);
            }
        }

        // Limpieza al desmontar el componente
        return () => {
            if (adContainerRef.current) {
                adContainerRef.current.innerHTML = '';
            }
        };
    }, [type]);

    return <div ref={adContainerRef} className="advertisement-container my-4"></div>;
};

export default Advertisement;