//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.");
}

var communities = [];
var markersBounds = [];

var markers = new L.MarkerClusterGroup({
    // showCoverageOnHover:false, 
    maxClusterRadius: 100,    
});

var pointOptions = {    
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

function markerClick(a) {   
    var target = a.layer;
    var targetLatLng = target.getLatLng();
    map.setView(targetLatLng, 12);
    var admin0 = target.feature.properties.admin0;
    var community = target.feature.properties.community;    
    var popupContent = "<b>Admin_0:</b> " + admin0 + "<br><b>Community:</b> " + community;
    var popup = L.popup()
        .setLatLng(targetLatLng)
        .setContent(popupContent)
        .openOn(map);   
}

function getCommunities() {
    $.ajax({
        type: 'GET',
        url: 'data/List_de_Comunidades_Proyectos_CRA_Sudamerica.json',
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
        var latlng = [item.Long, item.Lat];
        var mapCoord = {
            "type": "Feature",
            "properties": {
                "admin0": item.Admin_0,
                "admin1": item.Admin_1,
                "admin2": item.Admin_2,
                "admin3": item.Admin_3,
                "project": item.Project,
                "community": item.Community,
            },
            "geometry": {
                "type": "Point",
                "coordinates": latlng
            }
        }
        communities.push(mapCoord);
    }); 
    markersToMap();
}

function markersToMap(){
    var markerLayer = L.geoJson(communities, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, pointOptions);
        },           
    });
    markers.on('click', function(a) {
        markerClick(a);
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
getCommunities();