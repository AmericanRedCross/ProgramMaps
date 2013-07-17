var geojson = L.geoJson();
var worldCountries = [];
var coloredCountries = [];
var activeCountries = [];
var activePrograms = [];
var arcPrograms = [];
var center = new L.LatLng(30, 0);
var bounds = new L.LatLngBounds([90, 200], [-80, -200]);

var map = L.map('map', {
    center: center,
    zoom: 1,
    attributionControl: false,
    zoomControl: false,
    maxBounds: bounds
});

// method to update the info div based on feature properties passed
info.update = function (props) {
    var infoContent = (props ? props.name : 'Click on a country') + "</p><ul>";
    var selectedCountry = (props? props.name.toUpperCase() : 'none')
    $.each(activePrograms, function (ai, program) {
            var pName = program.COUNTRY.toUpperCase();
            if (pName === selectedCountry) {
                infoContent += "<li>" + program.PROJECT_NAME + "</li>";
            }
    });
    infoContent += "</ul>";
    $('#programInfo').empty();     
    $('#programInfo').append(infoContent);
};

function mapStyle(feature) {
    return{
    fillColor: feature.properties.mapColor,
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 1
    };
}

var featureEvents = function (feature, layer) {
    layer.on({
        click: countryClick,
    });       
}

function countryClick (e) {
    geojson.setStyle(mapStyle);
    var country = e.target;    
    country.setStyle({
        weight: 5,
        color: '#fed53c',
        dashArray: '',
        fillOpacity: 1
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
            colorMap(2013);
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function colorMap(year) {
    coloredCountries = worldCountries;
    activeCountries = [];
    activePrograms = [];
    yearInt = parseInt(year);
    // populate array with names of countries that have programs
    $.each(arcPrograms, function (ai, program) {
        var pName = program.COUNTRY.toUpperCase();
        var startYear = new Date(program["Project Period START_DT"]).getFullYear();
        var endYear = new Date (program["Project Period END_DT"]).getFullYear();
        if (startYear == yearInt || endYear == yearInt || (endYear > yearInt && startYear < yearInt)) {
            activePrograms.push(program);
            if ($.inArray(pName, activeCountries) === -1) {
                activeCountries.push(pName);
            };
        };       
    });
    // add map color property to each geojson country based on program list
    $.each(coloredCountries.features, function (ci, country) {
        var cName = country.properties.name.toUpperCase();
        if ($.inArray(cName, activeCountries) === -1) {
            country.properties.mapColor = "#D7D7D8";
        } else {
            country.properties.mapColor = 'red';
        }
    });
    // Add country polygons to map
    geojson = L.geoJson(coloredCountries, {
        style: mapStyle,
        onEachFeature: featureEvents
    }).addTo(map);
     
}

function changeYear(){
    var x = document.getElementById("yearInput").selectedIndex;
    var newYear = document.getElementsByTagName("option")[x].value;
    map.removeLayer(geojson);
    info.update();
    colorMap(newYear);
}
   
getWorld();
info.update();



