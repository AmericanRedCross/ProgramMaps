//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.");
}

var latrines = [];
var markersBounds = [];

var markers = new L.MarkerClusterGroup({
    showCoverageOnHover:false, 
    maxClusterRadius: 50,    
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
    layers: [tileLayer]
});

function latrineClick(a) {   
    var target = a.layer;
    map.setView(target.getLatLng(), 17)
    var community = target.feature.properties.community;
    var vulnerability = target.feature.properties.vulnerability;
    var popupContent = "<b>Community:</b> " + community + "<br><b>Beneficiary vulnerability:</b> " + vulnerability;
    var popupOptions = {
        'offset': [0,-20]                
    }; 
    target.bindPopup(popupContent, popupOptions).openPopup(); 
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

var latrineIcon = L.icon({
    iconUrl: 'img/outhouseIcon.png',
    popupAnchor: [10, 15]
});

function markersToMap(){
    var markerLayer = L.geoJson(latrines, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: latrineIcon});
        },           
    });
    markers.on('click', function(a) {
        latrineClick(a);
    })
    markers.addLayer(markerLayer);
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