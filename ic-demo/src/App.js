import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>高速道路IC可視化デモ</h1>
      <div id="map" style={{ width: "600px", height: "400px", margin: "20px auto", border: "1px solid #ccc" }}>
        Google Map 表示予定エリア
      </div>
    </div>
  );
}

export default App;
