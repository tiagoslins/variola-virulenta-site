import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Assumes useAuth hook exists in src/hooks/

/**
 * The main header and navigation bar for the website.
 * @returns {JSX.Element} The rendered Header component.
 */
const Header = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/search/${trimmedQuery}`);
            setQuery('');
        }
    };
    
    // Style for active NavLink
    const activeLinkStyle = {
      color: '#48bb78', // green-400
      textDecoration: 'underline',
    };

    return (
        <header className="bg-black border-b-2 border-green-500 sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center gap-4">
                <Link to="/" className="text-2xl font-black text-white tracking-tighter">
                    Variola Virulenta
                </Link>
                
                <div className="hidden lg:flex items-center space-x-6">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium">Início</NavLink>
                    <NavLink to="/articles" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium">Artigos</NavLink>
                    <NavLink to="/episodes" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium">Episódios</NavLink>
                    <NavLink to="/glossary" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium">Glossário</NavLink>
                    <NavLink to="/team" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium">Quem Somos</NavLink>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <input 
                            type="search" 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)} 
                            placeholder="Buscar..." 
                            className="bg-gray-800 border border-gray-700 text-white rounded-md py-1 px-3 w-40 md:w-48 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" 
                        />
                    </form>
                    {user ? (
                        <Link to="/dashboard" className="bg-green-500 text-black py-1 px-3 rounded-md font-bold hover:bg-green-400 transition-colors text-sm whitespace-nowrap">
                            Painel
                        </Link>
                    ) : (
                        <Link to="/login" className="border border-gray-600 text-gray-300 py-1 px-3 rounded-md font-bold hover:bg-green-500 hover:text-black transition-colors text-sm whitespace-nowrap">
                            Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
