import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  GoogleMap,
  LoadScript,
  InfoWindow,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

function App() {
  const [start, setStart] = useState('');
  const [goal, setGoal] = useState('');
  const [selected, setSelected] = useState(null);
  const [directions, setDirections] = useState(null);
  const [icData, setIcData] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch('/ic-data.json')
    .then((res) => res.json())
    .then((data) => setIcData(data))
    .catch((err) => console.error('ICデータの読み込みに失敗しました:', err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!start || !goal) return;

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
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].overview_path.forEach(p => bounds.extend(p));
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
            onChange={(e) => setStart(e.target.value)}
            placeholder="例: 東京駅"
            style={{ marginLeft: 8, marginRight: 20 }}
          />
        </label>

        <label>
          到着地点:
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="例: 大阪駅"
            style={{ marginLeft: 8, marginRight: 20  }}
          />
        </label>
        
        <button type="submit" style={{ marginLeft: 10 }}>経路検索</button>
      </form>

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{width: "100%", height: "500px"}}
          zoom={10}
          onLoad = {map => mapRef.current = map}
        >
          {icData.map((ic, index) => (
            <Marker
              key={index}
              position={{ lat: ic.lat, lng: ic.lng }}
              onClick={() => setSelected({ name: ic.name, position: { lat: ic.lat, lng: ic.lng } })}
            />
          ))}
          {selected && (
            <InfoWindow
              position={selected.position}
              onCloseClick={() => setSelected(null)}
              options={{ disableAutoPan: true }}
            >
              <div>{selected.name}</div>
            </InfoWindow>
          )}
          
          {directions && (
            <DirectionsRenderer directions={directions} />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}    

export default App;
