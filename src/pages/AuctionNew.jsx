import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AuctionNew.css';
import { useUser } from '../UserContext';

function AuctionNew() {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('가전');
  const [brand, setBrand] = useState('기타');
  const [status, setStatus] = useState('신품');
  const [desc, setDesc] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [startPrice, setStartPrice] = useState('');
  const [buyNow, setBuyNow] = useState('');
  const [bidUnit, setBidUnit] = useState('1000');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [minBid, setMinBid] = useState('1');
  const [autoExt, setAutoExt] = useState(false);

  const [shipping, setShipping] = useState('무료');
  const [shippingType, setShippingType] = useState('택배');
  const [location, setLocation] = useState('');

  const navigate = useNavigate();

  const handleImageUpload = (file) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // 쿠키에서 accessToken을 꺼내는 함수 추가
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert('이미지를 먼저 업로드하세요.');
      return;
    }

    if (!title || !startPrice || !startDate || !startTime || !endDate || !endTime || !minBid) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const startDateTime = new Date(`${startDate} ${startTime}`);
    const endDateTime = new Date(`${endDate} ${endTime}`);
    const now = new Date();

    if (startDateTime <= now) {
      alert('시작일시는 현재 시간보다 이후여야 합니다.');
      return;
    }

    if (endDateTime <= startDateTime) {
      alert('종료일시는 시작일시보다 이후여야 합니다.');
      return;
    }

    const formData = new FormData();
    
    const auctionData = {
      title,
      category,
      status,
      brand,
      description: desc,
      startPrice: parseInt(startPrice),
      buyNowPrice: buyNow ? parseInt(buyNow) : null,
      bidUnit: parseInt(bidUnit),
      startTime: `${startDate}T${startTime}:00`,
      endTime: `${endDate}T${endTime}:00`,
      minBidCount: parseInt(minBid),
      autoExtend: autoExt,
      shippingFee: shipping,
      shippingType,
      location,
      userId: user.id,
    };

    formData.append('auction', new Blob([JSON.stringify(auctionData)], { type: "application/json" }));
    formData.append('image', imageFile);

    try {
      const token = getCookie('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
      console.log('📤 전송할 데이터:', auctionData);
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ 서버 응답:', res.status, errorText);
        throw new Error(`서버 오류 (${res.status}): ${errorText}`);
      }
      
      const result = await res.json();
      console.log('✅ 성공 응답:', result);
      alert('경매가 등록되었습니다');
      navigate(`/auction/${result.id}`);
    } catch (err) {
      console.error('❌ 오류 발생:', err);
      alert('에러 발생: ' + err.message);
    }
  };

  const CATEGORY_LIST = ['가전', '전자제품', '패션', '명품', '도서', '취미', '스포츠'];
  const BRAND_LIST = ['삼성', 'LG', 'Apple', 'Sony', 'Nike', '기타'];

  return (
    <div className="auction-new-container">
      <div className="auction-new-header">
        <h1>경매 등록</h1>
        <p>상품 정보를 입력하여 새로운 경매를 등록하세요</p>
      </div>

      <form className="auction-new-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">기본 정보</h3>
          
          <div className="form-group">
            <label className="form-label required">상품명</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="상품명을 입력하세요"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select 
                className="form-select"
                value={category} 
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORY_LIST.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">상품 상태</label>
              <select 
                className="form-select"
                value={status} 
                onChange={e => setStatus(e.target.value)}
              >
                <option value="신품">신품</option>
                <option value="중고">중고</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">브랜드</label>
              <select 
                className="form-select"
                value={brand} 
                onChange={e => setBrand(e.target.value)}
              >
                {BRAND_LIST.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">상품 설명</label>
            <textarea 
              className="form-textarea"
              placeholder="상품에 대한 자세한 설명을 입력하세요"
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              rows="6" 
              required 
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">상품 이미지</h3>
          
          <div className="image-upload-area">
            <div className="image-upload-box">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => handleImageUpload(e.target.files[0])}
                className="image-upload-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="업로드 미리보기" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>이미지를 클릭하여 업로드하세요</p>
                    <span>최대 5MB, JPG, PNG, GIF</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">경매 설정</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">시작가</label>
              <div className="price-input-wrapper">
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="0"
                  value={startPrice} 
                  onChange={e => setStartPrice(e.target.value)} 
                  required 
                />
                <span className="price-unit">원</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">즉시구매가</label>
              <div className="price-input-wrapper">
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="선택사항"
                  value={buyNow} 
                  onChange={e => setBuyNow(e.target.value)} 
                />
                <span className="price-unit">원</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">입찰단위</label>
              <select 
                className="form-select"
                value={bidUnit} 
                onChange={e => setBidUnit(e.target.value)}
              >
                <option value="1000">1,000원</option>
                <option value="5000">5,000원</option>
                <option value="10000">10,000원</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">시작일시</label>
              <div className="datetime-inputs">
                <input 
                  type="date" 
                  className="form-input"
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  required 
                />
                <input 
                  type="time" 
                  className="form-input"
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">종료일시</label>
              <div className="datetime-inputs">
                <input 
                  type="date" 
                  className="form-input"
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  required 
                />
                <input 
                  type="time" 
                  className="form-input"
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">최소 입찰 수</label>
              <input 
                type="number" 
                className="form-input"
                value={minBid} 
                onChange={e => setMinBid(e.target.value)} 
                min={1} 
                required 
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={autoExt} 
                  onChange={e => setAutoExt(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">자동 연장 (마지막 입찰 시 5분 연장)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">배송 정보</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">배송비</label>
              <select 
                className="form-select"
                value={shipping} 
                onChange={e => setShipping(e.target.value)}
              >
                <option value="무료">무료</option>
                <option value="착불">착불</option>
                <option value="선불">선불</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">배송 방법</label>
              <select 
                className="form-select"
                value={shippingType} 
                onChange={e => setShippingType(e.target.value)}
              >
                <option value="택배">택배</option>
                <option value="퀵">퀵</option>
                <option value="직거래">직거래</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">거래지역</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="예: 서울시 강남구"
                value={location} 
                onChange={e => setLocation(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
            취소
          </button>
          <button type="submit" className="btn-primary">
            경매 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuctionNew;
