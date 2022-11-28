// import {removeTile, downloadTile, saveTile, getTileUrls, getStorageInfo} from 'leaflet.offline';
import * as leafletOffline from 'leaflet.offline';
import * as idb from 'idb';

const tileStoreName = 'tileStore';
const dbPromise = idb.openDB('leaflet.offline', 2, {
  upgrade(db, oldVersion) {
    idb.deleteDB('leaflet_offline');
    idb.deleteDB('leaflet_offline_areas');

    if (oldVersion < 1) {
      const tileStore = db.createObjectStore(tileStoreName, {
        keyPath: 'key'
      });
      tileStore.createIndex(urlTemplateIndex, 'urlTemplate');
      tileStore.createIndex('z', 'z');
      tileStore.createIndex('channel', 'channel');
      tileStore.createIndex('channel_ss', 'channel_ss');
      console.log("come");
    }
  }

});

leafletOffline.rsSaveTile = async (tileInfo, blob) => {
  ['urlTemplate', 'z', 'x', 'y', 'key', 'url', 'createdAt','channel','channel_ss'].forEach(key => {
    if (tileInfo[key] === undefined) {
      throw Error(`Missing ${key} prop`);
    }
  });
  return (await dbPromise).put(tileStoreName, {
    blob,
    ...tileInfo
  });
}

leafletOffline.rsGetStorageInfoByChannel = async (channel) => {
  const range = IDBKeyRange.only(channel);
  return (await dbPromise).getAllFromIndex(tileStoreName, 'channel', range);
}

leafletOffline.rsGetStorageInfoByChannelSS = async (channelSS) => {
  return await new Promise((resolve, reject) => {
    leafletOffline.getStorageInfo('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').then((tileInfos)=>{
      resolve(tileInfos.filter((tileInfo)=>tileInfo.channel_ss === channelSS))
    });
  });
}

export default leafletOffline;