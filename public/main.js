/** @type {import("cesium").Viewer} */
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  timeline: true,
  animation: true,
});
