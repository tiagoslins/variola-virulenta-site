import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext'; // Assuming a similar context for the player

// Layouts and Components
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/Home';
import ArticlesPage from './pages/Articles';
import SingleArticlePage from './pages/Article';
import EpisodesPage from './pages/Episodes';
import GlossaryPage from './pages/Glossary';
import TeamPage from './pages/Team';
import BioPage from './pages/Bio';
import TagPage from './pages/Tag';
import SearchPage from './pages/Search';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard/Dashboard';
import NotFoundPage from './pages/NotFound';


// Define application routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />, // Wraps all pages with Header, Footer, etc.
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'articles', element: <ArticlesPage /> },
            { path: 'article/:id', element: <SingleArticlePage /> },
            { path: 'episodes', element: <EpisodesPage /> },
            { path: 'glossary', element: <GlossaryPage /> },
            { path: 'team', element: <TeamPage /> },
            { path: 'bio/:id', element: <BioPage /> },
            { path: 'tag/:tag', element: <TagPage /> },
            { path: 'search/:query', element: <SearchPage /> },
            { path: 'login', element: <LoginPage /> },
            { 
                path: 'dashboard', 
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
        ]
    }
]);


export default function App() {
    return (
        <AuthProvider>
            <PlayerProvider> {/* Manages audio player state globally */}
                <RouterProvider router={router} />
            </PlayerProvider>
        </AuthProvider>
    );
}