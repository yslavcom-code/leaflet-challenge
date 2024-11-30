// Initialize the map
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const colors = ['yellow', 'darkorange', 'red', 'firebrick', 'darkred', 'maroon'];
const depths = [-10, 10, 30, 50, 70, 90];

// Create Markers
function createMarker(feature, latlng) {
    const magnitude = feature.properties.mag;
    const depth = feature.geometry.coordinates[2];

    const color = depth > depths[5] ? colors[5] :
        depth > depths[4] ? colors[4] :
            depth > depths[3] ? colors[3] :
                depth > depths[2] ? colors[2] :
                    depth > depths[1] ? colors[1] :
                        colors[0];

    const radius = magnitude * 5;

    return L.circleMarker(latlng, {
        radius: radius,
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });
}

// Plot earthquakes
function plotEarthquakes(earthquakes) {
    L.geoJSON(earthquakes, {
        pointToLayer: createMarker,
        onEachFeature: (feature, layer) => {
            const { mag, place, time } = feature.properties;
            const depth = feature.geometry.coordinates[2];
            layer.bindPopup(`
                <strong>Location:</strong> ${place}<br>
                <strong>Magnitude:</strong> ${mag}<br>
                <strong>Depth:</strong> ${depth} km<br>
                <strong>Time:</strong> ${new Date(time).toLocaleString()}
            `);
        }
    }).addTo(map);
}

// All earthquakes for the past week
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// Fetch earthquake data
fetch(url)
    .then(response => response.json())
    .then(data => plotEarthquakes(data.features));

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend'); // Create the legend container

    // Style the legend directly in JavaScript
    div.style.backgroundColor = 'white'; // White background
    div.style.border = '1px solid #ccc'; // Optional border
    div.style.padding = '10px'; // Padding for spacing
    div.style.borderRadius = '5px'; // Rounded corners
    div.style.fontSize = '14px'; // Font size
    div.style.lineHeight = '1.5em'; // Line height for spacing
    div.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)'; // Optional shadow for depth

    div.innerHTML = '<h4>Depth (km)</h4>';
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background: ${colors[i]}; width: 10px; height: 10px; display: inline-block; margin-right: 5px;"></i>` +
            `${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}<br>` : '+'}`;
    }

    return div;
};

legend.addTo(map);