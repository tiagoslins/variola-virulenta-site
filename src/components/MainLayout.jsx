import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PersistentAudioPlayer from './PersistentAudioPlayer';
import SupportBanner from './SupportBanner';

/**
 * The main layout wrapper for the application.
 * It includes the header, footer, and other persistent UI elements.
 * The actual page content is rendered via the <Outlet /> component.
 * @returns {JSX.Element} The rendered MainLayout component.
 */
const MainLayout = () => {
    const location = useLocation();

    // Scroll to top on page change
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="bg-black min-h-screen font-sans flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Outlet renders the matched child route component */}
                <Outlet />
            </main>
            <PersistentAudioPlayer />
            <SupportBanner />
            <Footer />
        </div>
    );
};

export default MainLayout;
