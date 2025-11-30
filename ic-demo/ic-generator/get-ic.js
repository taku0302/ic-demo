import icNames from "./ic-names.js";
import fetch from "node-fetch";
import fs from "fs";

const API_KEY = "AIzaSyBtu27bwWgGzFPVbtg3j5lX_-06ot8_UN4";

// Google Places API から IC 情報を取得
async function fetchICData() {
  const results = [];

  for (const name of icNames) {
    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(name)}` +
      `&language=ja` +
      `&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        console.log(` 見つからない: ${name}`);
        continue;
      }

      const place = data.results[0];

      results.push({
        name: name,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.formatted_address
      });

      console.log(` ${name} 取得成功`);
    } catch (err) {
      console.error(` エラー: ${name}`, err);
    }
  }

  fs.writeFileSync(
    "ic-data-auto.json",
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log(" ic-data.json を作成しました");
}

fetchICData();
