import React, { useState } from 'react';
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
  const [selected, setSelected] = useState(null);
  const [directions, setDirections] = useState(null);

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
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  };


  return (
    <div className="App" style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1>高速道路IC可視化デモ</h1>

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

      <LoadScript googleMapsApiKey="AIzaSyD9PUKlSOwulEI8h7tLHIpO8Yt09Vh8OK4">
        <GoogleMap
          mapContainerStyle={{width: "100%", height: "500px"}}
          center={{lat: 36.2048, lng: 138.2529}}
          zoom={5}
        >
          {selected && (
            <InfoWindow
              position={selected.position}
              onCloseClick={() => setSelected(null)}
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
