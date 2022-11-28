import rsLeafletOffline from './rs-leaflet.offline';
import storageLayer from './storageLayer';

// 各SSの地図 Lat Lang
const ssLatLang = {
  'hq': [[35.087576802356914, 137.16735489453436], [35.080184438718206, 137.17471487563532]],
  'ss1': [[34.986082077202106, 137.3189949172782], [34.961184892930056, 137.40173569606924]],
  'ss2': [[35.04273665812517, 137.37622064550678], [35.00815569554807, 137.4277190555427]],
  'ss3': [[34.95561831094035, 137.157567677717], [34.95392997765496, 137.16421955567998]],
  'ss4': [[35.46833351975122, 137.47219395552153], [35.42707980383908, 137.512019392616]],
  'ss5': [[35.36209566938667, 137.38755760751033], [35.30888129709696, 137.47252998493818]],
};

const map = L.map('map');
const urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const baseLayer = L.tileLayer.offline(urlTemplate, {
  attribution: 'Map data {attribution.OpenStreetMap}',
  subdomains: 'abc',
  minZoom: 9,
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

L.rectangle(ssLatLang['hq'], {color: "#ff7800", weight: 1}).addTo(map);
L.rectangle(ssLatLang['ss1'], {color: "#ff7800", weight: 1}).addTo(map);
L.rectangle(ssLatLang['ss2'], {color: "#ff7800", weight: 1}).addTo(map);
L.rectangle(ssLatLang['ss3'], {color: "#ff7800", weight: 1}).addTo(map);
L.rectangle(ssLatLang['ss4'], {color: "#ff7800", weight: 1}).addTo(map);
L.rectangle(ssLatLang['ss5'], {color: "#ff7800", weight: 1}).addTo(map);

map.setView([35.08421332279045, 137.17141124729068], 13);

function saveTiles(channel, ss, latLang) {
  var corner1 = L.latLng(latLang[0][0], latLang[0][1]),
    corner2 = L.latLng(latLang[1][0], latLang[1][1]);//トヨタスタジアム周辺

  const zooms = [13, 16];
  let tileInfos = [];

  zooms.forEach((zoom) => {
    var topLeftPoint = map.project(corner1, zoom);  // zoom 13 の時のタイル画像の位置
    var bottomRightPoint = map.project(corner2, zoom);  // zoom 13 の時のタイル画像の位置
    tileInfos = [...tileInfos, ...rsLeafletOffline.getTileUrls(baseLayer, L.bounds(topLeftPoint, bottomRightPoint), zoom)];
  });

  tileInfos.forEach((tileInfo) => {
    tileInfo['channel'] = channel;//テスト試合のチャンネル
    tileInfo['channel_ss'] = channel + '_' + ss;

    rsLeafletOffline.downloadTile(tileInfo.url).then(blob => rsLeafletOffline.saveTile(tileInfo, blob));
  });
}

function deleteTiles() {
  rsLeafletOffline.getStorageInfo('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').then((tileInfos) => {
    tileInfos.forEach((tileInfo) => {
      rsLeafletOffline.removeTile(tileInfo.key);
    });
  });
}

function deleteTilesByChannelSS(channel, ss) {
  rsLeafletOffline.rsGetStorageInfoByChannelSS(channel + '_' + ss).then((tileInfos) => {
    tileInfos.forEach((tileInfo) => {
      rsLeafletOffline.removeTile(tileInfo.key);
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

document.getElementById('btnInit').addEventListener('click', (event) => {
  event.preventDefault();
  map.setView([58.4, 43.0], 13);
});

document.getElementById('btnJumpToToyota').addEventListener('click', (event) => {
  event.preventDefault();
  map.setView([35.08421332279045, 137.17141124729068], 13); //トヨタスタジアム
});

document.getElementById('btnSave0').addEventListener('click', (event) => {
  event.preventDefault();
  saveTiles(220312, 'hq', ssLatLang['hq']);//トヨタスタジアム周辺
});
document.getElementById('btnSave1').addEventListener('click', (event) => {
  event.preventDefault();
  saveTiles(220312, 1, ssLatLang['ss1']);//恵那
});
document.getElementById('btnSave2').addEventListener('click', (event) => {
  event.preventDefault();
  saveTiles(220312, 2, ssLatLang['ss2']);//恵那
});

document.getElementById('btnSave3').addEventListener('click', (event) => {
  event.preventDefault();
  saveTiles(220312, 3, ssLatLang['ss3']);//トヨタスタジアム周辺
});

document.getElementById('btnSave4').addEventListener('click', (event) => {
  event.preventDefault();
  saveTiles(220312, 4, ssLatLang['ss4']);//トヨタスタジアム周辺
});

document.getElementById('btnSave5').addEventListener('click', (event) => {
  event.preventDefault();
  saveTiles(220312, 5, ssLatLang['ss5']);//トヨタスタジアム周辺
});

document.getElementById('btnDelete').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTiles();
});

document.getElementById('btnDelete0').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTilesByChannelSS(220312, 'hq');
});

document.getElementById('btnDelete1').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTilesByChannelSS(220312, 1);
});
document.getElementById('btnDelete2').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTilesByChannelSS(220312, 2);
});
document.getElementById('btnDelete3').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTilesByChannelSS(220312, 3);
});
document.getElementById('btnDelete4').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTilesByChannelSS(220312, 4);
});
document.getElementById('btnDelete5').addEventListener('click', (event) => {
  event.preventDefault();
  deleteTilesByChannelSS(220312, 5);
});

document.getElementById('btnDisplayTiles').addEventListener('click', (event) => {
  event.preventDefault();
  rsLeafletOffline.getStorageInfo('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').then((tileInfos) => {
    console.log(tileInfos);
  });
});

global.map = map;
global.rsLeafletOffline = rsLeafletOffline;