import React from 'react';

/**
 * A fixed banner at the bottom of the page to encourage support.
 * @returns {JSX.Element} The rendered SupportBanner component.
 */
const SupportBanner = () => (
    <div className="bg-green-500 text-black p-2 fixed bottom-0 left-0 w-full z-40 text-center font-bold text-sm">
        <a 
            href="https://apoia.se/variolavirulenta" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline"
        >
            Gostou do nosso trabalho? Apoie-nos no Apoia.se e ajude a manter o jornalismo independente.
        </a>
    </div>
);

export default SupportBanner;
