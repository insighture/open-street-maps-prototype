
const map = L.map('map').setView([-27.9234, 153.3119], 16); // Gold Coast

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

  
const layers = {
    cabin: L.layerGroup(),
    campsite: L.layerGroup(),
    facility: L.layerGroup()
  };
  
  fetch('locations.json')
    .then(res => res.json())
    .then(locations => {
      locations.forEach(loc => {
        const icon = L.icon({
          iconUrl: loc.icon,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
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