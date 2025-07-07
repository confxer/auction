function QuickMenu() {
    const icons = [
        { label: '전체카테고리', url: 'https://dummyimage.com/64x64/eeeeee/222222&text=ALL' },
        { label: 'TOP 100', url: 'https://dummyimage.com/64x64/eeeeee/222222&text=TOP' },
        { label: '마이페이지', url: 'https://dummyimage.com/64x64/eeeeee/222222&text=MY' },
        { label: '경매일정', url: 'https://dummyimage.com/64x64/eeeeee/222222&text=CAL' },
        { label: '이벤트', url: 'https://dummyimage.com/64x64/eeeeee/222222&text=EVT' },
        { label: '공지사항', url: 'https://dummyimage.com/64x64/eeeeee/222222&text=NOTI' }
    ];
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, margin: '40px 0' }}>
            {icons.map(icon => (
                <div key={icon.label} style={{ textAlign: 'center' }}>
                    <img
                        src={icon.url}
                        alt={icon.label}
                        style={{
                            marginBottom: 8,
                            width: 32,        // 이미지 크기 줄임
                            height: 32,
                            objectFit: 'cover'
                        }}
                    />
                    <div style={{
                        fontSize: 14,      // 메뉴 글자 크기
                        fontWeight: 700,   // 글자 굵게(bold)
                        color: '#222',
                        marginTop: 2
                    }}>
                        {icon.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
export default QuickMenu;