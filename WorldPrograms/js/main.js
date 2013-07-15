
var geojson = L.geoJson();
var worldCountries = [];
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

// create custom control for display of arc logo, map info, etc
var info = L.control();



// this shit for the custom control info box thing is a fucking MESS

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    // how to put a year input drop down menu into here? 
    this._div.innerHTML = '<img class=arclogo src="images/redcross-logo.png" /><br>' + '<h4>Active International Programs</h4><br><hr><div id="programInfo"></div>' 
    return this._div;
    this.update();    
};

// method to update the control based on feature properties passed
info.update = function (props) {
    var infoContent = (props ? '<b>' + props.name : 'Click on a country') + "</p><ul>";
    $.each(arcPrograms, function (ai, program) {
        var pName = program.COUNTRY.toUpperCase();
        var selectedCountry = props.name.toUpperCase();
        if (pName === selectedCountry) {
            infoContent += "<li>" + program.PROJECT_NAME + "</li>";
        }
    });
    infoContent += "</ul>";
    $('#programInfo').empty();     
    $('#programInfo').append(infoContent);
};

info.addTo(map);


function mapStyle(feature) {
    return{
    fillColor: feature.properties.mapColor,
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 0.7
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
            colorMap();
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function colorMap() {
    var programCountries = [];
    // populate array with names of countries that have programs
    $.each(arcPrograms, function (ai, program) {
        var pName = program.COUNTRY.toUpperCase();
        if ($.inArray(pName, programCountries) === -1) {
            programCountries.push(pName);
        }
    });
    // add map color property to each geojson country based on program list
    $.each(worldCountries.features, function (ci, country) {
        var cName = country.properties.name.toUpperCase();
        if ($.inArray(cName, programCountries) === -1) {
            country.properties.mapColor = "#808080";
        } else {
            country.properties.mapColor = 'red';
        }
    });
    // Add country polygons to map
    geojson = L.geoJson(worldCountries, {
        style: mapStyle,
        onEachFeature: featureEvents
    }).addTo(map);
     
}

   
getWorld();

