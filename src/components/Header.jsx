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
            <div onClick={toggleTheme} style={{
                width: '45px',
                borderRadius: '20px',
                backgroundColor: 'gray'
            }}>
                {theme === 'light' ? <div style={{
                    display:'flex',
                    float:'left',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                }}>🌙</div> : <div style={{
                    display:'flex',
                    float:'right',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                }}>☀️</div>}
            </div>
        </header>
    );
}

export default Header;