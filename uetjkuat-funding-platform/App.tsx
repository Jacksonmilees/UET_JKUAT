
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import { NewsProvider } from './contexts/NewsContext';
import { AIProvider } from './contexts/AIContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MerchPage from './pages/MerchPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import { Route, RoutePage } from './types';
import { registerServiceWorker } from './utils/pwa';

const AppContent: React.FC = () => {
    const [route, setInternalRoute] = useState<Route>({ page: 'home' });
    const { user } = useAuth();

    // Function to parse hash and return a route object
    const parseHash = (hash: string): Route => {
        const path = hash.substring(2); // remove #/
        const [page, param] = path.split('/');

        switch (page as RoutePage) {
            case 'projectDetail':
                const id = parseInt(param, 10);
                return { page: 'projectDetail', params: { id: isNaN(id) ? null : id } };
            case 'dashboard':
                return { page: 'dashboard' };
            case 'news':
                return { page: 'news' };
            case 'login':
                return { page: 'login' };
            case 'register':
                return { page: 'register' };
            case 'merch':
                return { page: 'merch' };
            case 'cart':
                return { page: 'cart' };
            case 'admin':
                return { page: 'admin' };
            default:
                return { page: 'home' };
        }
    };

    // Effect to handle hash changes (e.g., browser back/forward buttons)
    useEffect(() => {
        const handleHashChange = () => {
            setInternalRoute(parseHash(window.location.hash));
        };

        // Set initial route from hash
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // setRoute function to be passed down, which now updates the hash
    const setRoute = useCallback((newRoute: Route) => {
        let hash = `#/${newRoute.page}`;
        if (newRoute.page === 'projectDetail' && newRoute.params?.id) {
            hash += `/${newRoute.params.id}`;
        }
        window.location.hash = hash;
    }, []);

    const renderPage = () => {
        // Admin route protection
        if (route.page === 'admin' && user?.role !== 'admin') {
            return <HomePage setRoute={setRoute} />;
        }

        switch (route.page) {
            case 'home':
                return <HomePage setRoute={setRoute} />;
            case 'projectDetail':
                if (route.params?.id) {
                    return <ProjectDetailPage projectId={route.params.id} setRoute={setRoute} />;
                }
                return <HomePage setRoute={setRoute} />;
            case 'dashboard':
                return <DashboardPage setRoute={setRoute} />;
            case 'news':
                return <NewsPage />;
            case 'login':
                 return <LoginPage setRoute={setRoute} />;
            case 'register':
                return <RegisterPage setRoute={setRoute} />;
            case 'merch':
                return <MerchPage setRoute={setRoute} />;
            case 'cart':
                return <CartPage setRoute={setRoute} />;
            case 'admin':
                return <AdminPage setRoute={setRoute} />;
            default:
                return <HomePage setRoute={setRoute} />;
        }
    };

    return (
      <Layout setRoute={setRoute} currentRoute={route.page}>
        {renderPage()}
      </Layout>
    );
}


const App: React.FC = () => {
    // Register service worker on mount
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return (
        <ErrorBoundary>
            <NotificationProvider>
                <AIProvider>
                    <AuthProvider>
                        <FinanceProvider>
                            <ProjectProvider>
                                <CartProvider>
                                    <NewsProvider>
                                       <AppContent />
                                    </NewsProvider>
                                </CartProvider>
                            </ProjectProvider>
                        </FinanceProvider>
                    </AuthProvider>
                </AIProvider>
            </NotificationProvider>
        </ErrorBoundary>
    );
};

export default App;
