var geojson = L.geoJson();
var worldCountries = [];
var arcPrograms = [];
var sectorList = [];
var yearList = [];
var worldColored = [];
var selectedYearProgramData = [];
var displayedProgramData = [];
var formattedSectorName = "";
// var dd = "";
// var dd2 = "";

var center = new L.LatLng(30, 30);
var bounds = new L.LatLngBounds([90, 260], [-80, -190]);

var map = L.map('map', {
    center: center,
    zoom: 1,
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
    map.setView(center, 1);
}

// method to update the info div based on feature properties passed
info.update = function (props) {
    programIndicator = false;
    var infoCountry = (props ? props.name : '<p class="countryClick">Click on a country.</p>');
    var infoPrograms = "<ul class='programList'>";
    var selectedCountry = (props ? props.name.toUpperCase() : 'none');   
    $.each(displayedProgramData, function (ai, program) {
        var pName = program.COUNTRY.toUpperCase();
        var imageCode = program.SECTOR_PRIMARY.toLowerCase().replace(/\s+/g, '').replace(/-/g, '').replace(/\//g, '');
        if (pName === selectedCountry) {
            infoPrograms += "<li class='programListItem'><img class='imageBullet' title='" + program.SECTOR_PRIMARY + "'' src=images/" + imageCode + ".png>" + program.PROJECT_NAME + "</li>";
            programIndicator = true;
        }
    });
    infoPrograms += "</ul>";
    $('#programInfo').empty();
    if (programIndicator === true) {
        $('#programInfo').append(infoPrograms);
    } else {
        $('#programInfo').append('<p class="noPrograms">No programs match the criteria.</p>');
    }
    $('#countryName').empty();
    $('#countryName').append(infoCountry);
};

// load country geometry data
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

// load program data
function getARC() {
    $.ajax({
        type: 'GET',
        url: 'data/arcPrograms.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            arcPrograms = json;
            createYearsDropdown();            
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function createYearsDropdown() {
    $.each(arcPrograms, function (ai, program) {
        var startYear = new Date(program["Project Period START_DT"]).getFullYear();
        var endYear = new Date(program["Project Period END_DT"]).getFullYear();        
        // look at value for startYear
        // some progams have "" for project start/end date so ignore if var = NaN
        if (isNaN(startYear) !== true){
            // ignore years in the future, i don't want these to be included in the map options
            if (startYear <= new Date().getFullYear()) {
                // push start year to array if not yet there
                if ($.inArray(startYear, yearList) === -1){
                    yearList.push(startYear);
                } 
            }
        }            
        // repeat previous code for endYear
        if (isNaN(endYear) !== true){
            if (endYear <= new Date().getFullYear()) {
                if ($.inArray(endYear, yearList) === -1) {
                    yearList.push(endYear);
                } 
            }           
        }
    });
    // fill in missing years
    var maxYear = Math.max.apply(Math, yearList);
    var minYear = Math.min.apply(Math, yearList);
    for (var y = minYear; y < maxYear; y++) {
        if ($.inArray(y, yearList) === -1) {
            yearList.push(y);
        }
    }
    // sort so that the years appear in order in dropdown
    yearList = yearList.sort(function(a,b){return b-a}); 
    // create item elements in dropdown list   
    var yearsDropdown = document.getElementById("yearInput");
    for(var i = 0; i < yearList.length; i++) {
        var item = yearList[i];
        var listItemYear = "<li>" + item + "</li>"
        $('#yearInput').append(listItemYear);       
    }
    // give page element properties for UI functionality
    var dd2 = new DropDown( $('#ddYear') );
    // set displayed text in selection box to maxYear
    $('#yearSpan').append(maxYear); 
    changeYear(maxYear);
}

function changeYear(year) {
    var yearChoice = parseInt(year);
    // populate arrays *data for year's displayed programs* and 
    selectedYearProgramData = [];
    $.each(arcPrograms, function (ai, program) {
        var currentCountry = program.COUNTRY.toUpperCase();        
        var startYear = new Date(program["Project Period START_DT"]).getFullYear();
        var endYear = new Date (program["Project Period END_DT"]).getFullYear();
        if (yearChoice == startYear || yearChoice == endYear || (yearChoice < endYear && yearChoice > startYear)) {            
            selectedYearProgramData.push(program);
        }                
    });
    // build sector dropdown
    sectorList = [];
    $.each(selectedYearProgramData, function (ai, program) {
        var aSector = program.SECTOR_PRIMARY;
        if ($.inArray(aSector, sectorList) === -1) {
            sectorList.push(aSector);
        }
    });
    $('#sectorSpan').empty();
    $('#sectorInput').empty();
    $('#sectorSpan').append("All Sectors");
    $('#sectorInput').append("<li id='All Sectors'>All Sectors</li>")
    for(var i = 0; i < sectorList.length; i++) {
        var option = sectorList[i];
        formatSectorName(option);
        var listItemSector = "<li id='" + option + "'>" + formattedSectorName + "</li>";
        $('#sectorInput').append(listItemSector); 
    }

    var dd2 = new DropDown2( $('#ddSector') );
    changeSector("All Sectors");
}

//changes display text in program sectors dropdown
function formatSectorName(option) {
    if (option === "Measles") {
        formattedSectorName = "Measles Vaccination Campaign";
    } else if (option === "DM - Recovery"){
        formattedSectorName = "Disaster Recovery";
    } else if (option === "DM - Preparedness/DRR"){
        formattedSectorName = "Disaster Preparedness";
    } else if (option === "Community Health - HIV"){
        formattedSectorName = "Community Based Health & HIV";
    } else if (option === "DM - Response"){
        formattedSectorName = "Disaster Response";
    } else if (option === "Integrated"){
        formattedSectorName = "Integrated Programming";
    } else if (option === "OD"){
        formattedSectorName = "Organizational Development";
    } else if (option === "Malaria") {
        formattedSectorName = "Malaria Prevention Initiative";
    } else {
        formattedSectorName = option;
    }
}

function changeSector(sector) {
    map.removeLayer(geojson);
    info.update();    
    worldColored = worldCountries;
    displayedCountryNames = [];
    displayedProgramData = [];
    // populate arrays *data for displayed programs* and *names for displayed countries*
    $.each(selectedYearProgramData, function (ai, program) {
        var currentCountry = program.COUNTRY.toUpperCase();
        var currentProgramSector = program.SECTOR_PRIMARY;        
        if (sector === currentProgramSector || sector === "All Sectors") {
            displayedProgramData.push(program);
            if ($.inArray(currentCountry, displayedCountryNames) === -1) {
            displayedCountryNames.push(currentCountry);
            }
        }               
    });
    // add map color property to each geojson country based on names list of displayed countries
    $.each(worldColored.features, function (ci, country) {
        var currentCountry = country.properties.name.toUpperCase();
        if ($.inArray(currentCountry, displayedCountryNames) === -1) {
            country.properties.mapColor = "#FFF";
        } else {
            country.properties.mapColor = 'red';
        }
    });
    // Add country polygons to map
    geojson = L.geoJson(worldColored, {
        style: mapStyle,
        onEachFeature: featureEvents
    }).addTo(map);   
}

// doubleclick (not on a country) clears infobox (remove this?)
function clearCountry(e) {
    geojson.setStyle(mapStyle);
    info.update();    
}
map.on('dblclick', clearCountry);

// functions for geoJson map layer
function mapStyle(feature) {
    return {
        fillColor: feature.properties.mapColor,
        weight: 2,
        opacity: 1,
        color: "#D7D7D8",
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

// pass country name to Tooltip  div on mouseover/out
function displayName(e) {    
    var countryTarget = e.target;
    var tooltipText = countryTarget.feature.properties.name;
    $('#tooltip').append(tooltipText);     
}

function clearName(e) {
    $('#tooltip').empty();
}

// for map click event ---> zoom to country, highlight border, update info box
function countryClick(e) {
    map.fitBounds(e.target.getBounds());
    geojson.setStyle(mapStyle);
    $('.wrapper-dropdown-1').removeClass('active');
    $('.wrapper-dropdown-2').removeClass('active'); 
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
function showAll(){
    map.removeLayer(redLayer);
    map.removeLayer(greyLayer);
    parseWorld(worldcountries, iroc_response);
    buildStuff();
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



// Year Dropdown 
function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    // this.val = '';
    // this.index = -1;
    this.initEvents();
}

DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var selectedYear = $(this).html();
            obj.placeholder.text(selectedYear);
            changeYear(selectedYear);
        });
    },
}

// Sector Dropdown
function DropDown2(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.initEvents();
}
DropDown2.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var selectedSector = $(this).text();
            var sectorId = $(this).attr('id');
            obj.placeholder.text(selectedSector);
            changeSector(sectorId);
        });
    },
}

$("#")

// close any open dropdown if page is clicked elsewhere
$(document).click(function() {
    $('.wrapper-dropdown-1').removeClass('active');
    $('.wrapper-dropdown-2').removeClass('active');        
});
// only one dropdown open at a time
$('.wrapper-dropdown-1').click(function() {
    $('.wrapper-dropdown-2').removeClass('active');        
});
$('.wrapper-dropdown-2').click(function() {
    $('.wrapper-dropdown-1').removeClass('active'); 
});



getWorld();
info.update();

