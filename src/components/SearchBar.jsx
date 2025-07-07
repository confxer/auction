import './SearchBar.css';

function SearchBar() {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="검색어를 입력해주세요"
            />
            <button>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" fill="none"/>
                    <line x1="18" y1="18" x2="23" y2="23" strokeWidth="2"/>
                </svg>
            </button>
        </div>
    );
}

export default SearchBar;