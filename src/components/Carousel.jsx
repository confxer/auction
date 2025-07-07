import './Carousel.css';

function Carousel() {
    return (
        <div className="carousel">
            <div className="image-container">
                <img src="/images/scooter.jpg" alt="스쿠터" />
            </div>
            <div className="image-container">
                <img src="/images/p3.jpg" alt="고양이 오브제" />
            </div>
            <div className="image-container">
                <img src="/images/sopum.jpg" alt="소품" />
            </div>
        </div>
    );
}

export default Carousel;