var geojson = L.geoJson();
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
    doubleClickZoom: false
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
        fillOpacity: 0.8
    };
}

var cloudmade = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
            addMarkers();            
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
            country.properties.mapColor = "white";
        } else {
            country.properties.mapColor = 'red';
        }
    });

    geojson = L.geoJson(worldColored, {
        style: mapStyle,
    }).addTo(map);   
}

function addMarkers () {
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
    $.each(points, function (pointIndex, point) {
        var html = point.properties.Country + "<br>" + point.properties.Region + "<br>" + point.properties.Community
        L.geoJson(point, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, Options);
            }
        }).bindPopup(html)
        .addTo(map);
    })
}


getWorld();

