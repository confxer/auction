import { useState } from 'react';
import './NavBar.css';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const menus = [
        '데일리경매', '삶의흔적경매', '기획경매', '세컨핸드',
        '판매자 입점', '체리시옥션이란', '커뮤니티', '이용가이드'
    ];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <button className="menu-toggle" onClick={toggleMenu}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <ul className={isOpen ? 'active' : ''}>
                {menus.map(menu => (
                    <li key={menu}>
                        <a href="#">{menu}</a>
                    </li>
                ))}
            </ul>
            <div className="nav-buttons">
                <button>물품등록</button>
            </div>
        </nav>
    );
}

export default NavBar;