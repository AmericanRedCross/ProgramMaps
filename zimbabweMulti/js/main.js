//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.");
}

var latrines = [];
var cookstoves = [];
var markersBounds = [];

var latrinesMarkerLayer = new L.MarkerClusterGroup({
    // showCoverageOnHover:false, 
    maxClusterRadius: 80,
    iconCreateFunction: function (cluster) {
        return L.divIcon({ html: "<div class='clusterCount'>" + cluster.getChildCount() + "</div>", className: 'latrineCluster', iconSize: L.point(20, 20) });
    }    
});

var cookstovesMarkerLayer = new L.MarkerClusterGroup({
    // showCoverageOnHover:false, 
    maxClusterRadius: 80,
    iconCreateFunction: function (cluster) {
        return L.divIcon({ html: "<div class='clusterCount'>" + cluster.getChildCount() + "</div>", className: 'cookstoveCluster', iconSize: L.point(20, 20) });
    }   
});

var latrineIcon = L.icon({
    iconUrl: 'img/outhouseIcon.png',
    popupAnchor: [17, 17]
});

var cookstoveIcon = L.icon({
    iconUrl: 'img/cookstoveIcon.png',
    popupAnchor: [17, 17]
})


var tileLayerUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
var attribution = 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a> | Map style by <a href="http://hot.openstreetmap.org" target="_blank">H.O.T.</a> | &copy; <a href="http://redcross.org" title="Red Cross" target="_blank">Red Cross</a> 2013 | <a title="Disclaimer" onClick="showDisclaimer();">Disclaimer</a>';
var tileLayer = L.tileLayer(tileLayerUrl, {attribution: attribution});

var map = L.map('map', {   
    zoom: 0,    
    layers: [tileLayer, latrinesMarkerLayer, cookstovesMarkerLayer]
});

var baseMaps = {
    "OSM": tileLayer
};

var overlayMaps = {
    "Latrines": latrinesMarkerLayer,
    "Cook Stoves": cookstovesMarkerLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

function latrineClick(a) {   
    var target = a.layer;
    var targetLatLng = target.getLatLng();
    map.setView(targetLatLng, 17);
    var community = target.feature.properties.community;
    var vulnerability = target.feature.properties.vulnerability;
    var popupContent = "<b>Community:</b> " + community + "<br><b>Beneficiary vulnerability:</b> " + vulnerability;
    var popup = L.popup()
        .setLatLng(targetLatLng)
        .setContent(popupContent)
        .openOn(map);         
}

function cookstoveClick(a) {
    var target = a.layer;
    var targetLatLng = target.getLatLng();
    map.setView(targetLatLng, 17);
    var ward = target.feature.properties.ward;
    var community = target.feature.properties.community;    
    var popupContent = "<b>Ward:</b> " + ward + "<br><b>Community:</b> " + community;
    var popup = L.popup()
        .setLatLng(targetLatLng)
        .setContent(popupContent)
        .openOn(map);   
}

function getLatrines() {
    $.ajax({
        type: 'GET',
        url: 'data/ZWE_toilets.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(data) {
            formatLatrinesData(data);            
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function formatLatrinesData(data){
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
    getCookstoves();
}

function getCookstoves() {
    $.ajax({
        type: 'GET',
        url: 'data/ZWE_cookstoves.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(data) {
            formatCookstovesData(data);            
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function formatCookstovesData(data){
    $.each(data, function(index, item) {
        var latlng = [item.LONG, item.LAT];
        var mapCoord = {
            "type": "Feature",
            "properties": {
                "ward": item.WARD,
                "community": item.COMMUNITY                
            },
            "geometry": {
                "type": "Point",
                "coordinates": latlng
            }
        }
        cookstoves.push(mapCoord);
    }); 
    latrinesMarkersToMap();
}

function latrinesMarkersToMap(){
    var latrinesMarkers = L.geoJson(latrines, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: latrineIcon});
        },           
    });
    latrinesMarkers.on('click', function(a) {
        latrineClick(a);
    })
    latrinesMarkerLayer.addLayer(latrinesMarkers);
    latrinesMarkerLayer.addTo(map);

    cookstovesMarkersToMap();
};

function cookstovesMarkersToMap(){
    var cookstovesMarkers = L.geoJson(cookstoves, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: cookstoveIcon});
        },           
    });
    cookstovesMarkers.on('click', function(a) {
        cookstoveClick(a);
    })
    cookstovesMarkerLayer.addLayer(cookstovesMarkers);
    cookstovesMarkerLayer.addTo(map);

    markersBounds = cookstovesMarkerLayer.getBounds();    
    map.fitBounds(markersBounds);
    
};



// reset map bounds using Zoom to Extent button
function zoomOut() {
    map.fitBounds(markersBounds);
}

// start function chain to initialize map
getLatrines();