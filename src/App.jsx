import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavBar from './components/NavBar';
import Carousel from './components/Carousel';
import EventBanner from './components/EventBanner';
import QuickMenu from './components/QuickMenu';
import Footer from './components/Footer';
import HeaderTitle from './components/HeaderTitle';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import './App.css';

function App() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme || (prefersDark ? 'dark' : 'light');
    });

    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const location = useLocation();
    const hideComponents = location.pathname === '/signup' || location.pathname === '/signin';

    return (
        <div>
            {!hideComponents && <Header theme={theme} toggleTheme={toggleTheme} />}
            {!hideComponents && <HeaderTitle theme={theme}/>}
            {!hideComponents && <SearchBar />}
            {!hideComponents && <NavBar />}
            <Routes>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/" element={
                    <main className="main-content">
                        <div style={{ flex: 2 }}>
                            <Carousel />
                        </div>
                        <div style={{ flex: 1 }}>
                            <EventBanner />
                        </div>
                    </main>
                } />
            </Routes>
            {!hideComponents && <QuickMenu />}
            {!hideComponents && <Footer />}
        </div>
    );
}

export default App;