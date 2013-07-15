
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

// create custom control for display of arc logo, map info, etc
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method to update the control based on feature properties passed

// when clearing the info.update on reset highlight it passes nothing to this function which messes it up
info.update = function (props) {
    var infoContent = '<img class=arclogo src="images/redcross-logo.png" /><br>' + '<h4>International Programs 2013</h4><hr>' + (props ? '<b>' + props.name : 'Click on a country') + "</p><ul class='programList'>";
    this._div.innerHTML = infoContent
};

info.addTo(map);


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
        // mouseover: highlightingEvent,
        // mouseout: resetHighlight,
        click: countryClick
    });       
}

// function highlightingEvent (e) {
//     var country = e.target;
//     country.setStyle({
//         weight: 5,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 0.7
//     });
//     if (!L.Browser.ie && !L.Browser.opera) {
//         country.bringToFront();
//     }      
// }

// function resetHighlight (e) {
//     geojson.resetStyle(e.target);    
// }

function countryClick (e) {
    geojson.resetStyle(geojson);
    var country = e.target;
    country.setStyle({
        weight: 5,
        color: '#fed53c',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        country.bringToFront();
    }
    info.update(country.feature.properties);  
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