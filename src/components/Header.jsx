function Header() {
    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid #eee' }}>
            {/* 로고 이미지 제거됨 */}
            <div>
                <a href="#" style={{ color: '#232323', textDecoration: 'none', fontWeight: 400 }}>로그인</a>
                <span style={{ color: '#bbb', margin: '0 8px' }}>|</span>
                <a href="#" style={{ color: '#232323', textDecoration: 'none', fontWeight: 400 }}>회원가입</a>
                <span style={{ color: '#bbb', margin: '0 8px' }}>|</span>
                <a href="#" style={{ color: '#232323', textDecoration: 'none', fontWeight: 400 }}>쪽지</a>
            </div>
        </header>
    );
}
export default Header;