var geojson;
var markers = [];
var worldCountries = [];
var arcPrograms = [];
var sectorList = [];
var yearList = [];
var worldColored = [];
var selectedYearProgramData = [];
var displayedProgramData = [];
var formattedSectorName = "";
var formattedProgramName = "";
var points = [];
var displayedCountryNames = [];


var center = new L.LatLng(14.21304, -67.862829);
var bounds = new L.LatLngBounds([90, 260], [-80, -190]);

var map = L.map('map', {
    center: center,
    zoom: 5,
    attributionControl: false,
    maxBounds: bounds,
});
var cloudmade = new L.TileLayer('http://{s}.tile.openstreetmap.com/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    });
var attrib = new L.Control.Attribution({
    position: 'bottomleft'
});
attrib.addAttribution('Map Data &copy; <a href="http://redcross.org">Red Cross</a>');
map.addControl(attrib);

function resetView() {
    map.setView(center, 5);
}

function mapStyle(feature) {
    return {
        fillColor: feature.properties.mapColor,
        weight: 2,
        opacity: 1,
        color: "#F0F0F0",
        fillOpacity: 1
    };
}

// change display accordingly to the zoom level

function mapDisplay() {
map.on('viewreset', function() {
    zoom = map.getZoom();
    if (zoom < 6) {
        if (map.hasLayer(cloudmade)) {
            map.removeLayer(cloudmade);
        }
        map.addLayer(geojson);
        map.removeLayer(markers);
    } else {
        map.addLayer(markers);
        map.addLayer(cloudmade);
        map.removeLayer(geojson);
    }
})
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
            getARC();   
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function getARC() {
    $.ajax({
        type: 'GET',
        url: 'data/arcPrograms.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            arcPrograms = json;
            getColor();
            getMarkers();
            mapDisplay();
        },
        error: function(e) {
            console.log(e);
        }
    });
}
  
function getColor () {
    worldColored = worldCountries;
    displayedCountryNames = [];
    $.each (arcPrograms, function (ai, program){
        var currentCountry = program.COUNTRY.toUpperCase();
        if ($.inArray(currentCountry, displayedCountryNames) === -1) {
            displayedCountryNames.push(currentCountry);
        }
        });

    $.each(worldColored.features, function (ci, country) {
        var currentCountry = country.properties.name.toUpperCase();
        if ($.inArray(currentCountry, displayedCountryNames) === -1) {
            country.properties.mapColor = 'white';
        } else {
            country.properties.mapColor = 'red';
        }
    });

    geojson = L.geoJson(worldColored, {
        style: mapStyle,
    });
    map.addLayer(geojson);   
}

function getMarkers() {
    $.each(arcPrograms, function(index, item) {
        var latlng = [item.Long, item.Lat];
        var coord = {
            "type": "Feature",
            "properties": {
                "Country": item.COUNTRY,
                "Region": item.REGION,
                "Community": item.COMMUNITY,
                "Project": item.PROJECT_NAME,
                "Sector": item.SECTOR_PRIMARY
            },
            "geometry": {
                "type": "Point",
                "coordinates": latlng
            }
        }
        points.push(coord);
    });
    var Options = {
        radius: 5,
        fillColor: "#FF0000",
        color: "#FFF",
        weight: 2.5,
        opacity: 0.8,
        fillOpacity: 0.8
    };

    markers = L.geoJson(points, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, Options);
            }
        });
}

getWorld();


