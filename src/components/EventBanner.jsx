import './EventBanner.css';

function EventBanner() {
    return (
        <div className="event-banner">
            <h4>9월 vip 온라인 경매</h4>
            <h3>제100회 새로운 시작</h3>
            <div className="event-details">
                <div>경매 입찰 기간<br />25.07.07(월)~25.09.16(화)</div>
                <div>전시기간<br />25.07.14(월) 9시 ~ 25.09.16(화) 18시</div>
            </div>
            <a href="#">바로가기</a>
        </div>
    );
}

export default EventBanner;