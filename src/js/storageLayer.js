/* global L */
import { getStorageInfo, getStoredTilesAsJson } from 'leaflet.offline';
//const urlTemplate = 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png';
const urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';


export default function storageLayer(baseLayer, layerswitcher) {
  let layer;

  const getGeoJsonData = () => getStorageInfo(urlTemplate)
  .then((tiles) => getStoredTilesAsJson(baseLayer, tiles));

  const addStorageLayer = () => {
    getGeoJsonData().then((geojson) => {
      layer = L.geoJSON(geojson).bindPopup(
        (clickedLayer) => clickedLayer.feature.properties.key,
      );
      layerswitcher.addOverlay(layer, 'offline tiles');
    });
  };

  addStorageLayer();

  baseLayer.on('storagesize', (e) => {
    document.getElementById('storage').innerHTML = e.storagesize;
    if (layer) {
      layer.clearLayers();
      getGeoJsonData().then((data) => {
        layer.addData(data);
      });
    }
  });
}