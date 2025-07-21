// src/components/KakaoMap.js (라이브러리 사용 시)
import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const KakaoMap = () => {
  return (
    <Map
    center={{ lat: 37.5709, lng: 126.9923 }}
    style={{ width: "100%", height: "360px" }}
  >
    <MapMarker position={{ lat: 37.5709, lng: 126.9923 }}>
      <div style={{color:"#000"}}>단성사
      </div>
    </MapMarker>
  </Map>
  );
};

export default KakaoMap;