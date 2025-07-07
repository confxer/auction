import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavBar from './components/NavBar';
import Carousel from './components/Carousel';
import EventBanner from './components/EventBanner';
import QuickMenu from './components/QuickMenu';
import Footer from './components/Footer';
import HeaderTitle from './components/HeaderTitle';
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

    return (
        <div>
            <Header theme={theme} toggleTheme={toggleTheme} />
            <HeaderTitle />
            <SearchBar />
            <NavBar />
            <main className="main-content">
                <div style={{ flex: 2 }}>
                    <Carousel />
                </div>
                <div style={{ flex: 1 }}>
                    <EventBanner />
                </div>
            </main>
            <QuickMenu />
            <Footer />
        </div>
    );
}

export default App;