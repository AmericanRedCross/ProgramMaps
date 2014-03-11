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
	div.innerHTML += '<i style="background: #E1ED19"></i>LARRITA<br></br>';
	div.innerHTML += '<i style="background: #6C84FD"></i>Past DDR Community<br></br>';
	div.innerHTML += '<span style="font-size: 12px; font-style: italic;">Where submitted data was inaccurate or incomplete,</br>some program locations may be misplaced or missing.</span>';
    return div;
};

//add the legend to the map
legend.addTo(map_communities);

// reset map bounds using Zoom to Extent button
function zoomOut() {
    map_communities.fitBounds(markers);
}

// set up marker cluster groups for different types of programming
var markers_LARRA = L.markerClusterGroup({
	iconCreateFunction: function (cluster) {
		return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>', className: 'marker-cluster-LARRA', iconSize: L.point(30, 30) });
	}
});
var markers_LARRADOS = L.markerClusterGroup({
	iconCreateFunction: function (cluster) {
		return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>', className: 'marker-cluster-LARRADOS', iconSize: L.point(30, 30) });
	}
});
var markers_RITA = L.markerClusterGroup({
	iconCreateFunction: function (cluster) {
		return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>', className: 'marker-cluster-RITA', iconSize: L.point(30, 30) });
	}
});
var markers_LARRITA = L.markerClusterGroup({
	iconCreateFunction: function (cluster) {
		return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>', className: 'marker-cluster-LARRITA', iconSize: L.point(30, 30) });
	}
});
var markers_DDR = L.markerClusterGroup({
	iconCreateFunction: function (cluster) {
		return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>', className: 'marker-cluster-DDR', iconSize: L.point(30, 30) });
	}
});

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
		if (feature.properties.Type == "LARRA") markers_LARRA.addLayer(marker);
		else if (feature.properties.Type == "LARRA II") markers_LARRADOS.addLayer(marker);
		else if (feature.properties.Type == "RITA") markers_RITA.addLayer(marker);
		else if (feature.properties.Type == "LARRITA") markers_LARRITA.addLayer(marker);
		else if (feature.properties.Type == "Past DDR Community") markers_DDR.addLayer(marker);
		else alert("Failed to place marker");
	}
	map_communities.addLayer(markers_LARRA);
	map_communities.addLayer(markers_LARRADOS);
	map_communities.addLayer(markers_RITA);
	map_communities.addLayer(markers_LARRITA);
	map_communities.addLayer(markers_DDR);
}
