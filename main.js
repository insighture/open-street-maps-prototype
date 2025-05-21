const bounds = [
  [-39.2, 141.5],  // Southwest corner
  [-35.9, 149.0]   // Northeast corner
];

const map = L.map('map').fitBounds(bounds); // Victoria

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const labelLayer = L.layerGroup().addTo(map); // labels always on top

const layers = {
  cabin: L.layerGroup(),
  campsite: L.layerGroup(),
  facility: L.layerGroup(),
  toilets: L.layerGroup(),
  bbq: L.layerGroup()
};

// Add property boundaries and labels
fetch('boundaries_vic_final.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: 'red',
        weight: 2,
        dashArray: '5, 5',
        fillOpacity: 0.1
      }
    }).addTo(map);

    data.features.forEach(feature => {
      const name = feature.properties.name;
      const coords = getCentroid(feature.geometry);

      const label = L.marker(coords, {
        icon: L.divIcon({
          className: 'property-label',
          html: `<div>${name}</div>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        })
      });

      labelLayer.addLayer(label);
    });
  });

// Add markers (cabins, campsites, etc.)
fetch('locations_vic_final.json')
  .then(res => res.json())
  .then(locations => {
    locations.forEach(loc => {
      const icon = L.icon({
        iconUrl: loc.icon,
        iconSize: [32, 16],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker(loc.coords, { icon }).bindPopup(
        `<strong>${loc.name}</strong><br>Type: ${loc.type}`
      );

      layers[loc.type]?.addLayer(marker);
    });

    // Initially hide all feature layers (until zoomed in)
    Object.values(layers).forEach(layer => map.removeLayer(layer));

    // Layer toggle controls
    L.control.layers(null, {
      "Cabins": layers.cabin,
      "Campsites": layers.campsite,
      "Facilities": layers.facility,
      "Toilets": layers.toilets,
      "BBQ": layers.bbq,
    }).addTo(map);
  })
  .catch(err => console.error("Error loading markers:", err));

// Toggle features based on zoom
map.on('zoomend', () => {
  const zoom = map.getZoom();
  const show = zoom >= 10;

  Object.values(layers).forEach(layer => {
    if (show && !map.hasLayer(layer)) map.addLayer(layer);
    else if (!show && map.hasLayer(layer)) map.removeLayer(layer);
  });
});

// Utility to get the centroid of a polygon
function getCentroid(geometry) {
  const coords = geometry.coordinates[0]; // assuming Polygon
  let x = 0, y = 0;
  coords.forEach(coord => {
    x += coord[0];
    y += coord[1];
  });
  return [y / coords.length, x / coords.length]; // [lat, lng]
}