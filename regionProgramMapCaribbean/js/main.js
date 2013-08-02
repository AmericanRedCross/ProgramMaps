var geojson;
var worldCountries = [];
var arcPrograms = [];
var sectorList = [];
var yearList = [];
var worldColored = [];
var selectedYearProgramData = [];
var displayedProgramData = [];
var formattedProgramName = "";
var points = [];
var projectPoints = [];
var displayedCountryNames = [];
var programList = [];


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

var markers = new L.MarkerClusterGroup();

attrib.addAttribution('Map Data &copy; <a href="http://redcross.org">Red Cross</a>');
map.addControl(attrib);
map.addLayer(cloudmade);
cloudmade.setOpacity(0);

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

// create colored countries
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

    countries = new L.layerGroup().addTo(map);

    geojson = L.geoJson(worldColored, {
        onEachFeature: featureEvents,
        style: mapStyle
    }).addTo(countries);   
}

//build sector dropdown

function programDropdown () {
    $.each(arcPrograms, function(index, item) {
        latlng = [item.Long, item.Lat];
        var coord = {
            "type": "Feature",
            "properties": {
                "Country": item.COUNTRY,
                "Region": item.REGION,
                "Community": item.COMMUNITY,
                "Project": item.PROJECT_NAME,
            },
            "geometry": {
                "type": "Point",
                "coordinates": latlng
            }
        }
        points.push(coord);
    });    
    Options = {
        radius: 5,
        fillColor: "#FF0000",
        color: "#FFF",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 1
    };

    programList = [];
    $.each(points, function (ai, program) {
        var aProgram = program.properties.Project;
        if ($.inArray(aProgram, programList) === -1) {
            programList.push(aProgram);
        }
    });
    $('#sectorSpan').empty();
    $('#sectorInput').empty();
    $('#sectorSpan').append("All Projects");
    $('#sectorInput').append("<li id='All Projects'>All Projects</li>")
    for(var i = 0; i < programList.length; i++) {
        var option = programList[i];
        formatProgramName(option);
        var listItemSector = "<li id='" + option + "'>" + formattedProgramName + "</li>";
        $('#sectorInput').append(listItemSector); 
    }

    var dd = new DropDown( $('#ddProgram') );
    changeProgram("All Projects");
}

function changeProgram(project) {

    map.removeLayer(markers);
    info.update();
<<<<<<< HEAD
    displayedCommunityNames = [];
=======
>>>>>>> 64c6ba09cc7dd7c997cc0724e41bfb2c54c5c2c8
    projectPoints = [];
    $.each(points, function (ai, program) {
        var currentProgram = program.properties.Project;
        if (project === currentProgram) {
<<<<<<< HEAD
            // projectPoints.push(project);

            markers.addLayer(new L.marker(program.geometry.coordinates));

        } else if (project === "All Projects")
            // projectPoints.push(project);
            markers.addLayer(new L.marker(program.geometry.coordinates));
=======
            projectPoints.push(program);
        } else if (project === "All Projects")
            projectPoints.push(program);
>>>>>>> 64c6ba09cc7dd7c997cc0724e41bfb2c54c5c2c8
    })

    // markers = L.geoJson(projectPoints, {
    //         pointToLayer: function (feature, latlng) {
    //             return L.circleMarker(latlng, Options);
    //         },
    //         onEachFeature: markerEvents
    //     }).addTo(map);

    map.addLayer(markers);
}


// acronym meanings and their actual sector

function formatProgramName(option) {
    if (option === "RITA") {
        formattedProgramName = "Resilience in the Americas";
        Sector = "Integrated"
    } else if (option === "IPA"){
        formattedProgramName = "Integrated Participatory Assessment";
        Sector = "DM - Preparedness/DRR"
    } else if (option === "OFDA" || option === "ODFA"){
        formattedProgramName = "USAID's Office of Foreign Disaster Assistance";
        Sector = "DM - Preparedness/DRR"
    } else if (option === "CHAP"){
        formattedProgramName = "Caribbean HIV Action and Prevention";
        Sector = "Community Health - HIV"
    } else {
        formattedProgramName = option;
    }
}

// update info box

info.update = function (props) {
    programIndicator = false;
    var infoCommunity = (props ? props.Country + "<br>" + props.Community: '<p class="communityClick"> Click on a community.</p>');
    var infoPrograms = "<ul class='programList'>";
    var selectedCommunity = (props ? props.Community.toUpperCase() : 'none');
    $.each(points, function (ai, program) { //use markers or points feature?? -- points
        formatProgramName(program.properties.Project);
        var pName = program.properties.Community.toUpperCase();
        var imageCode = Sector.toLowerCase().replace(/\s+/g, '').replace(/-/g, '').replace(/\//g, '');
        if (pName === selectedCommunity) {
            infoPrograms += "<li class='programListItem'><img class=imageBullet title='" + Sector + "' src='images/" + imageCode + ".png'/>" 
            + formattedProgramName + "</li>"; //try to use the replacement for the "PROJECT_NAME" here
            programIndicator = true;
        }
    });

    infoPrograms += "</ul>";
    $('#programInfo').empty();
    if (programIndicator === true) {
        $('#programInfo').append(infoPrograms);
    } else {
        $('#programInfo').append('<p class="noPrograms">No programs match the criteria.</p>');

    }     $('#countryName').empty();
    $('#countryName').append(infoCommunity);
};

// actions for when the user clicks the markers

function communityClick (e) {
    markers.setStyle({color: "#FFF"});
    $('.wrapper-dropdown-1').removeClass('active');
    var community = e.target;
    community.setStyle({
        color: "#FF0000",
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        community.bringToFront();
    }
    if (map.getZoom() > 5) {
        info.update(community.feature.properties);
        // community.bringToFront();
    } else {
        info.update();
        // community.bringtoBack();
    }
}
var markerEvents = function (feature, layer) {
    layer.on({
        click: communityClick,
        mouseover: displayName,
        mouseout: clearName,
    })
}

// change display accordingly to the zoom level

function mapDisplay() {
    var remove = {fillOpacity:0, opacity:0}
    var add = {fillOpacity:1, opacity:1}
    map.on('viewreset', function() {
        if (map.getZoom() < 6) {
            cloudmade.setOpacity(0);
            markers.setStyle(remove);
            geojson.setStyle(add);
            // L.featureGroup([communities]).bringtoBack();
        } else {
            geojson.setStyle(remove);
            markers.setStyle(add);
            cloudmade.setOpacity(1);
        }
    })
}

// load json files

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
            mapDisplay();
            programDropdown();
        },
        error: function(e) {
            console.log(e);
        }
    });
}

// zoom to country when click the polygon
function countryClick (e) {
    map.fitBounds(e.target.getBounds());
}

// pass country name to Tooltip  div on mouseover/out
function displayName(e) {    
    var commTarget = e.target;
    var tooltipText = commTarget.feature.properties.Community;
    $('#tooltip').append(tooltipText);     
}

function clearName(e) {
    $('#tooltip').empty();
}

var featureEvents = function (feature, layer) {
    layer.on({
        click: countryClick,
        mouseover: displayName,
        mouseout: clearName
    });       
}

// tooltip follows cursor
$(document).ready(function() {
    $('#map').mouseover(function(e) {        
        //Set the X and Y axis of the tooltip
        $('#tooltip').css('top', e.pageY + 10 );
        $('#tooltip').css('left', e.pageX + 20 );         
    }).mousemove(function(e) {    
        //Keep changing the X and Y axis for the tooltip, thus, the tooltip move along with the mouse
        $("#tooltip").css({top:(e.pageY+15)+"px",left:(e.pageX+20)+"px"});        
    });
});

//disclaimer text
function showDisclaimer() {
    $('#disclaimerText').show();
}
function closeDisclaimer() {
    $('#disclaimerText').hide();
}

// tweet popup
$('.popup').click(function(event) {
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

// Sector Dropdown
function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.initEvents();
}

DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        // obj.dd.on('click', function(event){
        //     $(this).toggleClass('active');
        //     return false;
        // });

        obj.opts.on('click',function(){
            var selectedProgram = $(this).text();
            var sectorId = $(this).attr('id');
            obj.placeholder.text(selectedProgram);
            changeProgram(sectorId);
        });
    }
}

$("#ddProgram").click(function(){
    $(this).toggleClass('active');
    return false;
});

// close any open dropdown if page is clicked elsewhere
$(document).click(function() {
    $('.wrapper-dropdown-1').removeClass('active');
});

getWorld();
info.update();



