
// // JSLint bullshit
// var L;
// var $;
// var window;
// var getArcPrograms;
// var colorMap;
// var console;
// var highlightStyle;
// var programStyle;




var map = L.map('map', {
        // Some basic options to keep the map still and prevent 
        // the user from zooming and such.
        // scrollWheelZoom: false,
        // touchZoom: false,
        // doubleClickZoom: false,
        // zoomControl: false,
        // dragging: false
    });

map.fitBounds([[-37, -26], [41, 59]]);

$(window).resize(function () {
    map.fitBounds([[-37, -26], [41, 59]]);
});

var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
        key: 'BC9A493B41014CAABB98F0471D759707',
        styleId: 22677
    }).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    var infoContent = '<img class=arclogo src="images/redcross-logo.png" /><br>' + '<h4>Africa Programs 2012</h4><hr>' + (props ? '<b>' + props.NAME : 'Hover over a country') + "</p><ul class='programList'>";
    // $.each(arcPrograms, function (ai, program) {
    //     var pName = program.COUNTRY.toUpperCase();
    //     var selectedCountry = props.NAME.toUpperCase();
    //     if (pName === selectedCountry) {
    //         popupContent += "<li class='programListItem'><img class='imageBullet' src=images/" + program.SECTOR_PRIMARY.substring(0, 2) + ".png>" + program.PROJECT_NAME + "</li>";
    //     }
    // });
    // infoContent += "</ul>";
    this._div.innerHTML = infoContent
};


info.addTo(map);

var geojson = L.geoJson();
var arcPrograms = [];
var africaCountries = [];

function getAfrica() {
    $.ajax({
        type: 'GET',
        url: "data/africaCountries.json",
        contentType: "application/json",
        dataType: 'json',
        timeout: 10000,
        success: function (json) {
            africaCountries = json;
            getArcPrograms();
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function getArcPrograms() {
    $.ajax({
        type: 'GET',
        url: "data/arcPrograms.json",
        contentType: "application/json",
        dataType: 'json',
        timeout: 10000,
        success: function (json) {
            arcPrograms = json;
            colorMap();
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function colorMap() {
    var programCountries = [];

    $.each(arcPrograms, function (ai, program) {
        var pName = program.COUNTRY.toUpperCase();
        if ($.inArray(pName, programCountries) === -1) {
            programCountries.push(pName);
        }
    });

    $.each(africaCountries.features, function (ci, country) {
        var cName = country.properties.NAME.toUpperCase();
        if ($.inArray(cName, programCountries) === -1) {
            country.properties.mapColor = "#808080";
        } else {
            country.properties.mapColor = 'red';
        }
    });
    // Add polygons to map
    geojson = L.geoJson(africaCountries, {
        style: mapStyle,
        onEachFeature: featureEvents
    }).addTo(map);
}

var featureEvents = function (feature, layer) {
    layer.on({
        mouseover: highlightingEvent,
        mouseout: resetHighlight,
        click: zoomToFeature
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
    info.update(country.feature.properties);
    // var popupContent = "<p class='countryListHeader'>" + country.feature.properties.NAME + "</p><hr><ul class='programList'>";
    // $.each(arcPrograms, function (ai, program) {
    //     var pName = program.COUNTRY.toUpperCase();
    //     var selectedCountry = country.feature.properties.NAME.toUpperCase();
    //     if (pName === selectedCountry) {
    //         popupContent += "<li class='programListItem'><img class='imageBullet' src=images/" + program.SECTOR_PRIMARY.substring(0, 2) + ".png>" + program.PROJECT_NAME + "</li>";
    //     }
    // });
    // popupContent += "</ul>";
    // $("#countryInfo").append(popupContent);
}


function resetHighlight (e) {
    geojson.resetStyle(e.target);
    info.update();
    $("#countryInfo").empty();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Style for polygons
function mapStyle(feature) {
    return{
    fillColor: feature.properties.mapColor,
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: '3',
    fillOpacity: 0.7
    };
}

// style for highlighting
var highlightStyle = {
    weight: 6
};

getAfrica();

