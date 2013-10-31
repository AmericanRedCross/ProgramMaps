//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.");
}

var latrines = [];
var markersBounds = [];

var markers = new L.MarkerClusterGroup({
    showCoverageOnHover:false, 
    spiderfyDistanceMultiplier:3,
    maxClusterRadius: 30,    
});

var centroidOptions = {    
    radius: 7,
    fillColor: "#ED1B2E",
    color: "#FFF",
    weight: 2.5,
    opacity: 1,
    fillOpacity: 1
};

var tileLayerUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
var attribution = 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a> | Map style by <a href="http://hot.openstreetmap.org" target="_blank">H.O.T.</a> | &copy; <a href="http://redcross.org" title="Red Cross" target="_blank">Red Cross</a> 2013 | <a title="Disclaimer" onClick="showDisclaimer();">Disclaimer</a>';
var tileLayer = L.tileLayer(tileLayerUrl, {attribution: attribution});

var map = L.map('map', {   
    zoom: 0,
    // scrollWheelZoom: false,
    layers: [tileLayer]
});

// on marker mouseover
function displayPopup(e) {   
    var target = e.target;
    target.openPopup();   
}
// on marker mouseout
function clearPopup(e) {    
    var target = e.target;
    target.closePopup();    
}

function getLatrines() {
    $.ajax({
        type: 'GET',
        url: 'data/ZWE_toilets.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(data) {
            formatData(data);            
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function formatData(data){
    $.each(data, function(index, item) {
        var latlng = [item.LONG, item.LAT];
        var mapCoord = {
            "type": "Feature",
            "properties": {
                "community": item.COMMUNITY, 
                "vulnerability": item.VULNERABILITY

            },
            "geometry": {
                "type": "Point",
                "coordinates": latlng
            }
        }
        latrines.push(mapCoord);
    }); 
    markersToMap();
}

function markersToMap(){
    marker = L.geoJson(latrines, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, centroidOptions);
        },
        onEachFeature: function(feature, layer) {
            var community = feature.properties.community;
            var vulnerability = feature.properties.vulnerability;            
            var popupContent = feature.geometry.coordinates[0] + ", " + feature.geometry.coordinates[1]
            var popupOptions = {
                'minWidth': 30,
                'offset': [0,-10],
                'closeButton': false,
            }; 
            layer.bindPopup(popupContent, popupOptions);
            layer.on({
                // click: centroidClick,
                mouseover: displayPopup,
                mouseout: clearPopup,
            });   
        }            
    });
    markers.addLayer(marker);
    markers.addTo(map);
    markersBounds = markers.getBounds();
    map.fitBounds(markersBounds);
} 


// reset map bounds using Zoom to Extent button
function zoomOut() {
    map.fitBounds(markersBounds);
}

// start function chain to initialize map
getLatrines();