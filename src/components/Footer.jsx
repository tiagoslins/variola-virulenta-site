import React from 'react';

/**
 * The footer component for the website.
 * @returns {JSX.Element} The rendered Footer component.
 */
const Footer = () => (
    <footer className="bg-black text-gray-500 pb-24 pt-8">
        <div className="container mx-auto px-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Variola Virulenta. Conteúdo crítico para tempos urgentes.</p>
            <p>Horário atual em Santo André, SP: {new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
        </div>
    </footer>
);

export default Footer;
