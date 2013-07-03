
	var map = L.map('map', {
        // Some basic options to keep the map still and prevent 
        // the user from zooming and such.
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
        zoomControl: false,
        dragging: false
    });
	map.fitBounds([
		[-37, -26],
		[41, 59]
	]);

	$(window).resize(function(){
		map.fitBounds([
			[-37, -26],
			[41, 59]
		]);	
	});


	var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		key: 'BC9A493B41014CAABB98F0471D759707',
		styleId: 22677
	}).addTo(map);

	
	var arcPrograms =[];
	var africaCountries =[];

	function getAfrica (){
		$.ajax({
		type: 'GET',
		url: "data/africaCountries.json",
		contentType: "application/json",
		dataType: 'json',
		timeout: 10000,
		success: function(json) {
			africaCountries = json;
			getArcPrograms();
		},
		error: function(e) {
			console.log(e);
		}
	});
	}

	function getArcPrograms (){
		$.ajax({
		type: 'GET',
		url: "data/arcPrograms.json",
		contentType: "application/json",
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
		var red = [];
		var programCountries = [];
		var grey = [];
		var nonProgramCountries = [];

		$.each(arcPrograms, function(ai, program) {
			var pName = program.COUNTRY.toUpperCase();
			if ($.inArray(pName, programCountries) == -1) {
				programCountries.push(pName);
			}	
		});

		$.each(africaCountries.features, function(ci, country) {
			var cName = country.properties.NAME.toUpperCase();
			if ($.inArray(cName, programCountries) == -1) {
				grey.push(country);
			} else {
				red.push(country);
			}
		});		

		// Set default style for polygons
		var programStyle = {
			color: "red",
			weight: 2,
			opacity: 1
    	};
    	var nonProgramStyle = {
    		color: "#808080",
			weight: 2,
			opacity: 1
    	};
    	// style for highlighting
    	var highlightStyle = {
		    weight: 6		    
		};

		
		var programHighlightingEvent = function(feature, layer) {
			// Create a self-invoking function that passes in the layer
    		// and the properties associated with this particular record.
			(function(layer, properties) {
				// Create a mouseover event
				layer.on("mouseover", function (e){
					layer.setStyle(highlightStyle);
					var popupContent = "<p class='countryListHeader'>" + properties.NAME + "</p><hr><ul class='programList'>";
					$.each(arcPrograms, function(ai, program) {
						var pName = program.COUNTRY.toUpperCase();
						var selectedCountry = properties.NAME.toUpperCase();
						if (pName == selectedCountry) {
							popupContent += "<li class='programListItem'><img class='imageBullet' src=images/" + program.SECTOR_PRIMARY.substring(0,2) + ".png>" + program.PROJECT_NAME + "</li>"					
						}					
					});
					popupContent += "</ul>"	
					$("#countryInfo").append(popupContent);
					// alert(popupContent);
				});				

				

				// Create a mouseout event that undoes the mouseover changes
				layer.on("mouseout", function (e){
					layer.setStyle(programStyle);
					$("#countryInfo").empty();
				});
			// Close the "anonymous" wrapper function, and call it while passing
      		// in the variables necessary to make the events work the way we want.
			})(layer, feature.properties);
		};

		var nonProgramHighlightingEvent = function(feature, layer) {			
			(function(layer, properties) {				
				layer.on("mouseover", function (e){
					layer.setStyle(highlightStyle);
				});
				var popupContent = "<p class= countryListHeader>" + properties.NAME + "</p><hr><p>Nothing here!</p> ";				
				$("#countryInfo").append(popupContent);
				layer.on("mouseout", function (e) {
					layer.setStyle(nonProgramStyle);
					$("#countryInfo").empty();
				});
			})(layer, feature.properties);
		};

		// Add polygons to map
		L.geoJson(grey, {
			style: nonProgramStyle,
			onEachFeature: nonProgramHighlightingEvent
		}).addTo(map);

		L.geoJson(red, {
			style: programStyle,
			onEachFeature: programHighlightingEvent
		}).addTo(map);
	}

getAfrica();
	



