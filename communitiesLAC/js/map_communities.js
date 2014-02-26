// initialize map
var map_communities = L.map('map_communities', {scrollWheelZoom: true}).setView([-12.043333, -77.028333], 3);

// function that returns which color to display for markers/points
function getColor(d) {
    return d == "LARRA" ? '#E6976A' :
           d == "LARRA II" ? '#FE5278' :
		   d == "RITA"  ? '#C57AFA' :
           d == "LARRITA" ? '#E1ED19' :
		   d == "Past DDR Community"  ? '#6C84FD' :
		   '#F4F4F4';
}

// initialize OSM base layer
var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors.',
    maxZoom: 18
});

// add MapBox base layer of terrain plus streets
var mapboxLayer = L.mapbox.tileLayer('americanredcross.hc5olfpa').addTo(map_communities);

// add data from respective geojson file to communitiesLayer
var communitiesGeoJSON = $.getJSON( "data/communities.geojson", addMarkers);

// initialize legend control
var legend = L.control({position: 'bottomright'});

// add html code to legend
legend.onAdd = function (map_communities) {
    var div = L.DomUtil.create('div', 'info legend');
	div.innerHTML += '<i style="background: #E6976A"></i>LARRA<br></br>';
	div.innerHTML += '<i style="background: #FE5278"></i>LARRA II<br></br>';
	div.innerHTML += '<i style="background: #C57AFA"></i>RITA<br></br>';
	div.innerHTML += '<i style="background: #E1ED19"></i>LARITA<br></br>';
	div.innerHTML += '<i style="background: #6C84FD"></i>Past DDR Community<br></br>';
	div.innerHTML += '<span style="font-size: 12px; font-style: italic;"> Some program locations may be misplaced or missing.</br>As data is submitted the map can be updated</span>';
    return div;
};

//add the legend to the map
legend.addTo(map_communities);

// reset map bounds using Zoom to Extent button
function zoomOut() {
    map_communities.fitBounds(markers);
}

// set up markers/points
var markers = L.markerClusterGroup();

// add markers to the map
function addMarkers(){
	for (var i = 0; i < communitiesGeoJSON.responseJSON.features.length; i++) {
		var feature = communitiesGeoJSON.responseJSON.features[i];
		var marker = L.circleMarker(
			new L.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]),
			{
				radius: 10,
				color: "#FFFFFF",
				weight: .5,
				opacity: .5,
				fillOpacity: .8,
				fillColor: getColor(feature.properties.Type),
			}
		);
		marker.bindPopup("<b>Community: </b>" + feature.properties.Place + "</br><b>Country: </b>" + feature.properties.Admin_0);
		markers.addLayer(marker);
	}

	map_communities.addLayer(markers);
}
