
var geojson = L.geoJson();
var worldCountries = [];
var center = new L.LatLng(30, 0);
var bounds = new L.LatLngBounds([90, 200], [-80, -200]);


var map = L.map('map', {
    center: center,
    zoom: 1,
    attributionControl: false,
    zoomControl: false,
    maxBounds: bounds
});

function mapStyle(feature) {
    return{
    fillColor: "#808080",
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 0.7
    };
}

var featureEvents = function (feature, layer) {
    layer.on({
        mouseover: highlightingEvent,
        mouseout: resetHighlight,        
    });       
}

function highlightingEvent (e) {
    var country = e.target;
    country.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        country.bringToFront();
    }      
}

function resetHighlight (e) {
    geojson.resetStyle(e.target);    
}

function getWorld() {
    $.ajax({
        type: 'GET',
        url: 'data/worldCountries.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            worldCountries = json;
            geojson = L.geoJson(worldCountries, {
                style: mapStyle, 
                onEachFeature: featureEvents       
            }).addTo(map);
        },
        error: function(e) {
            console.log(e);
        }
    });
}


getWorld();