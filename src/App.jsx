import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavBar from './components/NavBar';
import Carousel from './components/Carousel';
import EventBanner from './components/EventBanner';
import QuickMenu from './components/QuickMenu';
import Footer from './components/Footer';
import HeaderTitle from './components/HeaderTitle';

function App() {
    return (
        <div>
            <HeaderTitle />
            <Header />
            <SearchBar />
            <NavBar />
            <main style={{ display: 'flex', gap: 24, margin: 24 }}>
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