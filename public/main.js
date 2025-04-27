/** @type {import("cesium").Viewer} */
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  timeline: true,
  animation: true,
});

const ws = new WebSocket(`ws://${location.hostname}:${location.port}`);

ws.onopen = () => {
  console.log('WebSocket connection opened');
};

const otherDotEntities = [];

const updateDots = (dots) => {
  for (const entityId in otherDotEntities) {
    if (dots.some((dot) => dot.id === entityId)) {
      continue;
    }

    viewer.entities.remove(otherDotEntities[entityId]);
    delete otherDotEntities[entityId];
  }

  for (const dot of dots) {
    if (!otherDotEntities[dot.id]) {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(dot.position.lon, dot.position.lat),
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
        },
      });
      otherDotEntities[dot.id] = entity;
    } else {
      otherDotEntities[dot.id].position = Cesium.Cartesian3.fromDegrees(dot.position.lon, dot.position.lat);
    }
  }
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "update") {
    updateDots(data.dots);
  }
};

const reportMyLocation = (lon, lat) => {
  const position = { lon, lat };
  ws.send(JSON.stringify({ type: "dotPosition", position }));
};

let myEntity = null;

const setMyLocation = (lon, lat) => {
  if (!myEntity) {
    myEntity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      point: {
        pixelSize: 10,
        color: Cesium.Color.GREEN,
      },
    });

    return;
  }

  myEntity.position = Cesium.Cartesian3.fromDegrees(lon, lat);
};

viewer.screenSpaceEventHandler.setInputAction((click) => {
  const pickedPosition = viewer.scene.pickPosition(click.position);
  if (Cesium.defined(pickedPosition)) {
    const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    setMyLocation(lon, lat);
    reportMyLocation(lon, lat);
  }

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);