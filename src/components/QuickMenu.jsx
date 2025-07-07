import './QuickMenu.css';

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
        <div className="quick-menu">
            {icons.map(icon => (
                <div key={icon.label} className="icon">
                    <img src={icon.url} alt={icon.label} />
                    <div>{icon.label}</div>
                </div>
            ))}
        </div>
    );
}

export default QuickMenu;