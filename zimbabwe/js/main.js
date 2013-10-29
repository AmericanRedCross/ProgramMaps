var windowHeight = $(window).height();


//disclaimer text
function showDisclaimer() {
    window.alert("The maps on this page do not imply the expression of any opinion on the part of the American Red Cross concerning the legal status of a territory or of its authorities.");
}


// MAP SHIT 
var latrines = [];
var markersBounds = [];
var displayedPoints = [];
var markers = new L.MarkerClusterGroup();

var countryStyle = {
    color: '#fff',
    weight: 1,
    fillColor: '#d7d7d8',
    fillOpacity: 1,
    clickable: false
};

var centroidOptions = {
    radius: 8,
    fillColor: "#ED1B2E",
    color: "#FFF",
    weight: 2.5,
    opacity: 1,
    fillOpacity: 1
};

var cloudmadeUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | &copy; <a href="http://redcross.org" title="Red Cross" target="_blank">Red Cross</a> 2013';
var cloudmade = L.tileLayer(cloudmadeUrl, {attribution: attribution});

var map = L.map('map', {   
    zoom: 4,
    // scrollWheelZoom: false,
    layers: [cloudmade]
});
// cloudmade.setOpacity(0); 

// change display accordingly to the zoom level
// function mapDisplay() {
//     var remove = {fillOpacity:0, opacity:0}
//     var add = {fillOpacity:1, opacity:1}
//     map.on('viewreset', function() {
//         if (map.getZoom() < 6) {
//             cloudmade.setOpacity(0);
//             geojson.setStyle(add);
//         } else {
//             geojson.setStyle(remove);
//             cloudmade.setOpacity(1);
//         }
//     })
// }

// on marker click open modal
// function centroidClick (e) {
//     var thumbnail_id = "#" + e.target.feature.properties.thumbnail_id;    
//     if ($(thumbnail_id).hasClass("ONLINE")) {
//         url = $(thumbnail_id).find('a').attr('href');
//         window.open(url, '_blank');
//     } else {
//         callModal(thumbnail_id);
//     }    
// }

// on marker mouseover
// function displayName(e) {   
//     var target = e.target;
//     target.openPopup();   
// }
// on marker mouseout
// function clearName(e) {    
//     var target = e.target;
//     target.closePopup();    
// }

// beginning of function chain to initialize map
function getWorld() {
    $.ajax({
        type: 'GET',
        url: 'data/worldcountries.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            worldcountries = json;
            countries = new L.layerGroup().addTo(map);
            geojson = L.geoJson(worldcountries,{
                style: countryStyle
            }).addTo(countries);
            getLatrines();
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function getLatrines() {
    $.ajax({
        type: 'GET',
        url: 'data/latrineData.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(data) {
            formatCentroids(data);
            // mapDisplay();
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function formatCentroids(data){
    $.each(data, function(index, item) {
        var gpsString = item.GPS.replace(/\s/g, "");
        var longStart = gpsString.indexOf("E");
        var itemLat = parseFloat(gpsString.replace("S","-").substr(0,longStart-1)).toString();
        var itemLong = parseFloat(gpsString.substr(longStart + 1)).toString();    
        var latlng = [itemLat, itemLong];
        var mapCoord = {
            "type": "Feature",
            "properties": {
                "name": item.BENEFICIARY,
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
    map.removeLayer(markers);
    markers = new L.MarkerClusterGroup({showCoverageOnHover:false, spiderfyDistanceMultiplier:3,});
      

    marker = L.geoJson(latrines, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, centroidOptions);
        },
        // onEachFeature: function(feature, layer) {
        //     var thumbnail_id = "#" + feature.properties.thumbnail_id;
        //     var popupContent = $(thumbnail_id).find('.caption').html();
        //     var popupOptions = {
        //         'minWidth': 30,
        //         'offset': [0,-10],
        //         'closeButton': false,
        //     }; 
        //     layer.bindPopup(popupContent, popupOptions);
        //     layer.on({
        //         click: centroidClick,
        //         mouseover: displayName,
        //         mouseout: clearName,
        //     });   
        // }            
    });
    markers.addLayer(marker);
    markers.addTo(map);
    markersBounds = markers.getBounds();
    markersBounds._northEast.lat += 5;
    markersBounds._northEast.lng += 5;
    markersBounds._southWest.lat -= 5;
    markersBounds._southWest.lat -= 5;
    map.fitBounds(markersBounds);
} 


$(window).resize(function(){    
    map.fitBounds(markersBounds);    
    windowHeight = $(window).height();
})



// reset map bounds using Zoom to Extent button
function zoomOut() {
    map.fitBounds(markersBounds);
}

// tweet popup
$('.twitterpopup').click(function(event) {
    var width  = 575,
        height = 400,
        left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, 'twitter', opts);

    return false;
});

// start function chain to initialize map
getLatrines();