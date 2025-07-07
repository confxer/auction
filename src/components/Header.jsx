import './Header.css';

function Header({ theme, toggleTheme }) {
    return (
        <header className="header">
            <div className="header-links">
                <a href="#">로그인</a>
                <span>|</span>
                <a href="#">회원가입</a>
                <span>|</span>
                <a href="#">쪽지</a>
            </div>
            <button onClick={toggleTheme} className="theme-toggle">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </header>
    );
}

export default Header;