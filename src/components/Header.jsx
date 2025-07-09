import { Link } from 'react-router-dom';
import './Header.css';

function Header({ theme, toggleTheme }) {
    return (
        <header className="header">
            <div className="header-links">
                <Link to="/signin">로그인</Link>
                <span>|</span>
                <Link to="/signup">회원가입</Link>
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