import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  GoogleMap,
  LoadScript,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";

function App() {
  const [start, setStart] = useState('');
  const [goal, setGoal] = useState('');
  const [directions, setDirections] = useState(null);
  const [icData, setIcData] = useState([]);
  const [filteredICs, setFilteredICs] = useState([]);
  const [startIC, setStartIC] = useState(null);
  const [goalIC, setGoalIC] = useState(null);
  const mapRef = useRef(null);

  // ICデータ読み込み
  useEffect(() => {
    fetch('/ic-data.json')
      .then(res => res.json())
      .then(data => setIcData(data))
      .catch(err => console.error('ICデータの読み込みに失敗しました:', err));
  }, []);

  // 2点間距離計算
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 最寄りIC
  const findNearestIC = (position, icList) => {
    if (!icList || icList.length === 0) return null;
    let nearest = null;
    let minDistance = Infinity;
    icList.forEach(ic => {
      const distance = getDistance(position.lat(), position.lng(), ic.lat, ic.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = ic;
      }
    });
    return nearest;
  };

  // 経路上判定
  const isOnRoute = (ic, path, thresholdKm = 0.3) => {
    return path.some(p => getDistance(ic.lat, ic.lng, p.lat(), p.lng()) < thresholdKm);
  };

  // 経路検索
const handleSearch = (e) => {
  e.preventDefault();
  if (!start || !goal) return;

  const NEAR_THRESHOLD_KM = 10; // 10km以上離れていたら無効
  const service = new window.google.maps.DirectionsService();

  service.route(
    {
      origin: start,
      destination: goal,
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK") {
        setDirections(result);

        const leg = result.routes[0].legs[0];
        const startPos = leg.start_location;
        const endPos = leg.end_location;
        const path = result.routes[0].overview_path;

        // 経路上ICのみに絞る
        const icOnRoute = icData.filter(ic => isOnRoute(ic, path));

        // 最寄りIC
        let nearestStartIC = findNearestIC(startPos, icOnRoute);
        let nearestGoalIC = findNearestIC(endPos, icOnRoute);

        // 距離チェック
        if (nearestStartIC) {
          const distStartIC = getDistance(
            startPos.lat(), startPos.lng(),
            nearestStartIC.lat, nearestStartIC.lng
          );
          if (distStartIC > NEAR_THRESHOLD_KM) nearestStartIC = null;
        }

        if (nearestGoalIC) {
          const distGoalIC = getDistance(
            endPos.lat(), endPos.lng(),
            nearestGoalIC.lat, nearestGoalIC.lng
          );
          if (distGoalIC > NEAR_THRESHOLD_KM) nearestGoalIC = null;
        }

        // state更新
        setStartIC(nearestStartIC);
        setGoalIC(nearestGoalIC);

        // 重複除外した表示用ICを作成
        const uniqueICs = [];
        if (nearestStartIC) uniqueICs.push(nearestStartIC);
        if (
          nearestGoalIC &&
          (nearestGoalIC.lat !== nearestStartIC?.lat ||
           nearestGoalIC.lng !== nearestStartIC?.lng)
        ) {
          uniqueICs.push(nearestGoalIC);
        }

        setFilteredICs(uniqueICs);

        // 地図を経路全体にフィット
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach(p => bounds.extend(p));
        mapRef.current.fitBounds(bounds);

      } else {
        console.error("Directions request failed due to " + status);
      }
    }
  );
};

  return (
    <div className="App" style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1>高速道路IC可視化</h1>

      <form style={{ marginBottom: 20 }} onSubmit={handleSearch}>
        <label>
          出発地点:
          <input
            type="text"
            value={start}
            onChange={e => setStart(e.target.value)}
            placeholder="例: 東京駅"
            style={{ marginLeft: 8, marginRight: 20 }}
          />
        </label>

        <label>
          到着地点:
          <input
            type="text"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="例: 大阪駅"
            style={{ marginLeft: 8, marginRight: 20 }}
          />
        </label>

        <button type="submit" style={{ marginLeft: 10 }}>経路検索</button>
      </form>

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          zoom={10}
          onLoad={map => (mapRef.current = map)}
        >
          {/* ピンなし、吹き出しだけ表示 */}
          {filteredICs.map((ic, index) => (
            <InfoWindow
              key={index}
              position={{ lat: ic.lat, lng: ic.lng }}
              options={{ disableAutoPan: true, closeBoxURL: "",
                enableEventPropagation: true, pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div
                style={{
                  background: "red",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {ic.name}
              </div>
            </InfoWindow>
          ))}

          {/* 経路表示 */}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      {/* IC未登録メッセージ */}
      {directions && (
        <div style={{ marginTop: 10, fontWeight: 'bold', color: 'red' }}>
          {!startIC && <div>まだ入口ICは登録されていません</div>}
          {!goalIC && <div>まだ出口ICは登録されていません</div>}
        </div>
      )}
    </div>
  );
}

export default App;
