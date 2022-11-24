import {removeTile, downloadTile, saveTile, getTileUrls, getStorageInfo} from 'leaflet.offline';
import storageLayer from './storageLayer';

const map = L.map('map');
//const urlTemplate = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png';
const urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const baseLayer = L.tileLayer.offline(urlTemplate, {
  attribution: 'Map data {attribution.OpenStreetMap}',
  subdomains: 'abc',
  minZoom: 13,
}).addTo(map);


// アイコンを作成する
var markerIcon = L.icon({
  iconUrl: 'http://www.nowhere.co.jp/blog/wp-content/uploads/2018/07/marker.png', // アイコン画像のURL
  iconSize: [32, 32], // アイコンの大きさ
  iconAnchor: [16, 32], // 画像内でマーカーの位置を指し示す点の位置
  popupAnchor: [0, -32],  // ポップアップが出現する位置（iconAnchorからの相対位置）
});
var marker = L.marker([35.08421332279045, 137.17141124729068], {icon: markerIcon}).addTo(map);

var route = L.polyline([
  [35.08421332279045, 137.17141124729068],
  [35.083013149472905, 137.16992674511627],
  [35.083155818216, 137.16937152786412],
  [35.083298486709594, 137.16908453150677],
  [35.083399451954286, 137.16894773885042],
  [35.08357284849597, 137.16904161616358],
  [35.08363869518739, 137.1687707130599],
], {color: 'blue', weight: 6}).addTo(map);


map.setView([58.4, 43.0], 13); //ロシアのどこか
global.map = map;

function saveTiles() {
  var corner1 = L.latLng(35.0913761661467, 137.1610365872186),//トヨタスタジアム周辺
    corner2 = L.latLng(35.07939984188814, 137.17882171877073);//トヨタスタジアム周辺

  var topLeftPoint = map.project(corner1, 13);  // zoom 13 の時のタイル画像の位置
  var bottomRightPoint = map.project(corner2, 13);  // zoom 13 の時のタイル画像の位置
  const tileInfos = getTileUrls(baseLayer, L.bounds(topLeftPoint, bottomRightPoint), 13);

  var topLeftPoint2 = map.project(corner1, 16);  // zoom 16 の時のタイル画像の位置
  var bottomRightPoint2 = map.project(corner2, 16);  // zoom 16 の時のタイル画像の位置
  const tileInfos2 = getTileUrls(baseLayer, L.bounds(topLeftPoint2, bottomRightPoint2), 16);

  [...tileInfos,...tileInfos2].forEach((tileInfo) => {
    downloadTile(tileInfo.url).then(blob => saveTile(tileInfo, blob));
  });
}

function deleteTiles() {
  getStorageInfo('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').then((tileInfos) => {
    tileInfos.forEach((tileInfo) => {
      removeTile(tileInfo.key);
    });
  });
}

/* 保存状況確認ここから */
// layer switcher control
const layerswitcher = L.control.layers({
  'osm (offline)': baseLayer,
}, null, {collapsed: false}).addTo(map);
// add storage overlay
storageLayer(baseLayer, layerswitcher);

/* 保存状況確認ここまで */


document.getElementById('btnInit').addEventListener('click', () => {
  map.setView([58.4, 43.0], 13);
});

document.getElementById('btnJumpToToyota').addEventListener('click', () => {
  map.setView([35.08421332279045, 137.17141124729068], 16); //トヨタスタジアム
});

document.getElementById('btnSave').addEventListener('click', () => {
  saveTiles();
});

document.getElementById('btnDelete').addEventListener('click', () => {
  deleteTiles();
});

document.getElementById('btnDisplayTiles').addEventListener('click', () => {
  getStorageInfo('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').then((tileInfos) => {
    console.log(tileInfos);
  });
});
