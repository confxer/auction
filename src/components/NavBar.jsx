function NavBar() {
    const menus = [
        '데일리경매', '삶의흔적경매', '기획경매', '세컨핸드',
        '판매자 입점', '체리시옥션이란', '커뮤니티', '이용가이드'
    ];
    return (
        <nav
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 32,
                padding: '0 40px',
                height: 60,
                background: '#fff',
                borderBottom: '1.5px solid #ececec'
            }}
        >
            <ul style={{
                display: 'flex',
                gap: 36,
                listStyle: 'none',
                margin: 0,
                padding: 0,
                fontWeight: 700,
                fontSize: 18
            }}>
                {menus.map(menu => (
                    <li key={menu}>
                        <a
                            href="#"
                            style={{
                                textDecoration: 'none',
                                color: '#111', // 진한 검정색
                                padding: '6px 14px',
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 18,
                                transition: 'background 0.15s'
                            }}
                        >
                            {menu}
                        </a>
                    </li>
                ))}
            </ul>
            <button
                style={{
                    marginLeft: 32,
                    padding: '8px 24px',
                    borderRadius: 9999,
                    border: '1.5px solid #111',
                    background: '#fff',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer'
                }}
            >
                물품등록
            </button>
        </nav>
    );
}
export default NavBar;