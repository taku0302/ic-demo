import React, { useState } from 'react';
import './App.css';
import mapImage from './map.jpg';

const pins = [
  { id: 1, name: 'IC名A', top: 110, left: 350 },
  { id: 2, name: 'IC名B', top: 305, left: 50 },
];

function App() {
  const [start, setStart] = useState('');
  const [goal, setGoal] = useState('');

  return (
    <div className="App" style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h1>高速道路IC可視化デモ</h1>

      <form style={{ marginBottom: 20 }}>
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
            style={{ marginLeft: 8 }}
          />
        </label>
      </form>

      <div
        id="map"
        style={{
          position: 'relative',
          width: 600,
          height: 400,
          border: '1px solid #ccc',
          backgroundImage: `url(${mapImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {pins.map((pin) => (
          <React.Fragment key={pin.id}>
            <div
              className="pin"
              style={{
                position: 'absolute',
                top: pin.top,
                left: pin.left,
                width: 24,
                height: 24,
                backgroundColor: 'red',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                cursor: 'pointer',
              }}
              title={pin.name}
            />
            <div
              className="tooltip"
              style={{
                position: 'absolute',
                top: pin.top - 20,
                left: pin.left + 30,
                backgroundColor: '#333',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                fontSize: 14,
              }}
            >
              {pin.name}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default App;
