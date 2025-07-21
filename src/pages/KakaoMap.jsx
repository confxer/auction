// src/components/KakaoMap.js (라이브러리 사용 시)
import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const KakaoMap = () => {
  return (
    <Map
    center={{ lat: 33.5563, lng: 126.79581 }}
    style={{ width: "100%", height: "360px" }}
  >
    <MapMarker position={{ lat: 33.55635, lng: 126.795841 }}>
      <div style={{color:"#000"}}>아 위치 어디지</div>
    </MapMarker>
  </Map>
  );
};

export default KakaoMap;