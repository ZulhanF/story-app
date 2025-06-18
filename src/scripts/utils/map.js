// Import Leaflet from CDN
let L = null;

// Try to get Leaflet from global scope
if (typeof window !== 'undefined' && window.L) {
  L = window.L;
} else {
  console.error('Leaflet not found. Please make sure Leaflet is loaded before this script.');
}

let map = null;
let marker = null;

export function initMap() {
  if (!L) {
    console.error('Leaflet is not available');
    return;
  }

  if (marker) {
    marker.remove();
    marker = null;
  }
  
  if (map) {
    map.remove();
    map = null;
  }

  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  if (latInput) latInput.value = '';
  if (lngInput) lngInput.value = '';

  try {
    map = L.map('map').setView([-6.2, 106.8], 5);

    // Use only OpenStreetMap to avoid CSP issues
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    osmLayer.addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }

      const latInput = document.getElementById('latInput');
      const lngInput = document.getElementById('lngInput');
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
    });
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

export function getSelectedLocation() {
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  
  if (!latInput || !lngInput) {
    return null;
  }

  const lat = latInput.value;
  const lng = lngInput.value;
  
  if (!lat || !lng) {
    return null;
  }

  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };
} 