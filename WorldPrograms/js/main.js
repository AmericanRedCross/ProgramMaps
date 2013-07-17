var geojson = L.geoJson();
var worldCountries = [];
var coloredCountries = [];
var activeCountries = [];
var activePrograms = [];
var arcPrograms = [];
var center = new L.LatLng(30, 0);
var bounds = new L.LatLngBounds([90, 200], [-80, -200]);
var sectorList = [];

var map = L.map('map', {
    center: center,
    zoom: 1,
    attributionControl: false,
    // zoomControl: false,
    maxBounds: bounds,
    doubleClickZoom: false
});

// method to update the info div based on feature properties passed
info.update = function (props) {
    var infoContent = (props ? props.name : 'Click on a country') + "</p><ul class='programList'>";
    var selectedCountry = (props? props.name.toUpperCase() : 'none')
    $.each(activePrograms, function (ai, program) {
            var pName = program.COUNTRY.toUpperCase();
            var imageCode = program.SECTOR_PRIMARY.toLowerCase().replace(/\s+/g, '').replace(/-/g, '').replace(/\//g, '');
            if (pName === selectedCountry) {
                infoContent += "<li class='programListItem'><img class='imageBullet' src=images/" + imageCode + ".png>" + program.PROJECT_NAME + "</li>";
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
        mouseover: displayName,
        mouseout: clearName
    });       
}

function displayName (e) {    
    var country = e.target;
    var tooltipText = country.feature.properties.name;
    $('#tooltip').append(tooltipText);     
}
function clearName (e) {
    $('#tooltip').empty();
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
            createSectorsDropdown();
            colorMap(2013);
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function createSectorsDropdown() {
    $.each(arcPrograms, function (ai, program) {
        var aSector = program.SECTOR_PRIMARY
        if ($.inArray(aSector, sectorList) === -1) {
            sectorList.push(aSector);
        };
    });
    var sectorsDropdown = document.getElementById("sectorInput");
    for(var i = 0; i < sectorList.length; i++) {
        var option = sectorList[i];
        var el = document.createElement("option");
        el.textContent = option;
        el.value = option;
        sectorsDropdown.appendChild(el);
    }
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
    
// NEED TO TAKE THE CURRENT ACTIVE PROGRAM LIST AND LOOP THROUGH IT ONLY TAKING THE SUBSET OF ONES WITH THE RIGHT SECTOR AND THEN BUILD THE MAP WITH THOSE?


// function chooseSector() {
//     activeCountries = [];
//     activeProgramsSectorSubset = [];
//     var x = document.getElementById("sectorInput").selectedIndex;
//     var sectorChoice = document.getElementsByTagName("option")[x].value;
//     if (x == "ALL") {
//         changeYear();
//     } else

//     map.removeLayer(geojson);
//     info.update();
//     // populate array with names of countries that have programs in selected sector
//     $.each(arcPrograms, function (ai, program) {
//         var currentProgramCountryName = program.COUNTRY.toUpperCase();
//         var currentProgramName = program.;
//         if ()) {
//             activePrograms.push(program);
//             if ($.inArray(pName, activeCountries) === -1) {
//                 activeCountries.push(pName);
//             };
//         };       
//     });
//     // add map color property to each geojson country based on program list
//     $.each(coloredCountries.features, function (ci, country) {
//         var cName = country.properties.name.toUpperCase();
//         if ($.inArray(cName, activeCountries) === -1) {
//             country.properties.mapColor = "#D7D7D8";
//         } else {
//             country.properties.mapColor = 'red';
//         }
//     });
//     // Add country polygons to map
//     geojson = L.geoJson(coloredCountries, {
//         style: mapStyle,
//         onEachFeature: featureEvents
//     }).addTo(map);     
// }




function clearCountry(e) {
    geojson.setStyle(mapStyle);
    info.update();    
}
   
map.on('dblclick', clearCountry);


$(document).ready(function() {
    //Select all anchor tag with rel set to tooltip
    $('#container').mouseover(function(e) {        
        //Set the X and Y axis of the tooltip
        $('#tooltip').css('top', e.pageY + 10 );
        $('#tooltip').css('left', e.pageX + 20 );         
    }).mousemove(function(e) {    
        //Keep changing the X and Y axis for the tooltip, thus, the tooltip move along with the mouse
        $("#tooltip").css({top:(e.pageY+15)+"px",left:(e.pageX+20)+"px"});        
    }).mouseout(function() {    
        //Put back the title attribute's value
        $(this).attr('title',$('.tipBody').html());    
        //Remove the appended tooltip template
        $(this).children('div#tooltip').remove();   
    });
});



getWorld();
info.update();




