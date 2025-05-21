
const bounds = [
  [-39.2, 141.5],  // Southwest corner
  [-35.9, 149.0]   // Northeast corner
];


const map = L.map('map').fitBounds(bounds); // Gold Coast

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);




const layers = {
  cabin: L.layerGroup(),
  campsite: L.layerGroup(),
  facility: L.layerGroup()
};

function getCentroid(geometry) {
  const coords = geometry.coordinates[0]; // assuming Polygon
  let x = 0, y = 0;
  coords.forEach(coord => {
    x += coord[0];
    y += coord[1];
  });
  return [y / coords.length, x / coords.length]; // [lat, lng]
}

fetch('boundaries_vic_final.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 2,
        dashArray: '5, 5',
        fillOpacity: 0.1
      }
    }).addTo(map);

    // Add labels for each property
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
      }).addTo(map);
    });

    function getCentroid(geometry) {
      const coords = geometry.coordinates[0]; // assuming Polygon
      let x = 0, y = 0;
      coords.forEach(coord => {
        x += coord[0];
        y += coord[1];
      });
      return [y / coords.length, x / coords.length]; // [lat, lng]
    }
  });

fetch('locations_vic.json')
  .then(res => res.json())
  .then(locations => {
    locations.forEach(loc => {
      const icon = L.icon({
        iconUrl: loc.icon,
        iconSize: [16, 16],
        iconAnchor: [8, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker(loc.coords, { icon }).bindPopup(
        `<strong>${loc.name}</strong><br>Type: ${loc.type}`
      );

      layers[loc.type]?.addLayer(marker);
    });

    // Add to map
    Object.values(layers).forEach(layer => layer.addTo(map));

    // Layer toggle
    L.control.layers(null, {
      "Cabins": layers.cabin,
      "Campsites": layers.campsite,
      "Facilities": layers.facility
    }).addTo(map);
  })
  .catch(err => console.error("Error loading markers:", err));