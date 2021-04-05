jQuery(document).ready(function ($) {
  //darkmode
  $("#darkTrigger").change(function () {
    if ($("body").hasClass("dark")) {
      $("body").removeClass("dark");
    } else {
      $("body").addClass("dark");
    }
  });

  var d = new Date();
  var n = d.getHours();

  if (n > 17 || n < 8) {
    $("body").addClass("dark");
  }

  am4core.ready(function () {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    /* Create map instance */
    var chart = am4core.create("chartdiv", am4maps.MapChart);

    /* Set map definition */
    chart.geodata = am4geodata_worldLow;

    /* Set projection */
    chart.projection = new am4maps.projections.Miller();

    /* Create map polygon series */
    var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    /* Make map load polygon (like country names) data from GeoJSON */
    polygonSeries.useGeodata = true;

    /* Configure series */
    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.applyOnClones = true;
    polygonTemplate.togglable = true;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeOpacity = 0.5;
    polygonTemplate.fill = chart.colors.getIndex(0);
    var lastSelected;
    // polygonTemplate.events.on("hit", function (ev) {
    //   if (lastSelected) {
    //     // This line serves multiple purposes:
    //     // 1. Clicking a country twice actually de-activates, the line below
    //     //    de-activates it in advance, so the toggle then re-activates, making it
    //     //    appear as if it was never de-activated to begin with.
    //     // 2. Previously activated countries should be de-activated.
    //     lastSelected.isActive = false;
    //   }
    //   ev.target.series.chart.zoomToMapObject(ev.target);
    //   if (lastSelected !== ev.target) {
    //     lastSelected = ev.target;
    //   }
    // });

    /* Create selected and hover states and set alternative fill color */
    var ss = polygonTemplate.states.create("active");
    ss.properties.fill = chart.colors.getIndex(2);

    var hs = polygonTemplate.states.create("hover");
    //hs.properties.fill = chart.colors.getIndex(4);
    // Hide Antarctica
    polygonSeries.exclude = ["AQ"];

    // Small map
    chart.smallMap = new am4maps.SmallMap();
    // Re-position to top right (it defaults to bottom left)
    chart.smallMap.align = "right";
    chart.smallMap.valign = "top";
    chart.smallMap.series.push(polygonSeries);

    // Zoom control
    chart.zoomControl = new am4maps.ZoomControl();

    var homeButton = new am4core.Button();
    homeButton.events.on("hit", function () {
      chart.goHome();
    });

    homeButton.icon = new am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.path =
      "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);

    // Add images - marker line
    // Add line bullets
    var cities = chart.series.push(new am4maps.MapImageSeries());
    cities.mapImages.template.nonScaling = true;

    var city = cities.mapImages.template.createChild(am4core.Circle);
    city.radius = 6;
    city.fill = chart.colors.getIndex(0).brighten(-0.2);
    city.strokeWidth = 2;
    city.stroke = am4core.color("#fff");

    function addCity(coords, title) {
      var city = cities.mapImages.create();
      city.latitude = coords.latitude;
      city.longitude = coords.longitude;
      city.tooltipText = title;
      return city;
    }

    var paris = addCity({ latitude: 48.8567, longitude: 2.351 }, "Paris");
    var toronto = addCity(
      { latitude: 43.8163, longitude: -79.4287 },
      "Toronto"
    );
    var la = addCity({ latitude: 34.3, longitude: -118.15 }, "Los Angeles");
    var havana = addCity({ latitude: 23, longitude: -82 }, "Havana");

    // Add lines
    var lineSeries = chart.series.push(new am4maps.MapArcSeries());
    lineSeries.mapLines.template.line.strokeWidth = 2;
    lineSeries.mapLines.template.line.strokeOpacity = 0.5;
    lineSeries.mapLines.template.line.stroke = city.fill;
    lineSeries.mapLines.template.line.nonScalingStroke = true;
    lineSeries.mapLines.template.line.strokeDasharray = "1,1";
    lineSeries.zIndex = 10;

    var shadowLineSeries = chart.series.push(new am4maps.MapLineSeries());
    shadowLineSeries.mapLines.template.line.strokeOpacity = 0;
    shadowLineSeries.mapLines.template.line.nonScalingStroke = true;
    shadowLineSeries.mapLines.template.shortestDistance = false;
    shadowLineSeries.zIndex = 5;

    function addLine(from, to) {
      var line = lineSeries.mapLines.create();
      line.imagesToConnect = [from, to];
      line.line.controlPointDistance = -0.3;

      var shadowLine = shadowLineSeries.mapLines.create();
      shadowLine.imagesToConnect = [from, to];

      return line;
    }

    addLine(paris, toronto);
    addLine(toronto, la);
    addLine(la, havana);

    // Add plane
    var plane = lineSeries.mapLines.getIndex(0).lineObjects.create();
    plane.position = 0;
    plane.width = 48;
    plane.height = 48;

    plane.adapter.add("scale", function (scale, target) {
      return 0.5 * (1 - Math.abs(0.5 - target.position));
    });

    var planeImage = plane.createChild(am4core.Sprite);
    planeImage.scale = 0.08;
    planeImage.horizontalCenter = "middle";
    planeImage.verticalCenter = "middle";
    planeImage.path =
      "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
    planeImage.fill = chart.colors.getIndex(2).brighten(-0.2);
    planeImage.strokeOpacity = 0;

    var shadowPlane = shadowLineSeries.mapLines
      .getIndex(0)
      .lineObjects.create();
    shadowPlane.position = 0;
    shadowPlane.width = 48;
    shadowPlane.height = 48;

    var shadowPlaneImage = shadowPlane.createChild(am4core.Sprite);
    shadowPlaneImage.scale = 0.05;
    shadowPlaneImage.horizontalCenter = "middle";
    shadowPlaneImage.verticalCenter = "middle";
    shadowPlaneImage.path =
      "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";
    shadowPlaneImage.fill = am4core.color("#000");
    shadowPlaneImage.strokeOpacity = 0;

    shadowPlane.adapter.add("scale", function (scale, target) {
      target.opacity = 0.6 - Math.abs(0.5 - target.position);
      return 0.5 - 0.3 * (1 - Math.abs(0.5 - target.position));
    });

    // Plane animation
    var currentLine = 0;
    var direction = 1;
    function flyPlane() {
      // Get current line to attach plane to
      plane.mapLine = lineSeries.mapLines.getIndex(currentLine);
      plane.parent = lineSeries;
      shadowPlane.mapLine = shadowLineSeries.mapLines.getIndex(currentLine);
      shadowPlane.parent = shadowLineSeries;
      shadowPlaneImage.rotation = planeImage.rotation;

      // Set up animation
      var from, to;
      var numLines = lineSeries.mapLines.length;
      if (direction == 1) {
        from = 0;
        to = 1;
        if (planeImage.rotation != 0) {
          planeImage
            .animate({ to: 0, property: "rotation" }, 1000)
            .events.on("animationended", flyPlane);
          return;
        }
      } else {
        from = 1;
        to = 0;
        if (planeImage.rotation != 180) {
          planeImage
            .animate({ to: 180, property: "rotation" }, 1000)
            .events.on("animationended", flyPlane);
          return;
        }
      }

      // Start the animation
      var animation = plane.animate(
        {
          from: from,
          to: to,
          property: "position",
        },
        5000,
        am4core.ease.sinInOut
      );
      animation.events.on("animationended", flyPlane);
      /*animation.events.on("animationprogress", function(ev) {
      var progress = Math.abs(ev.progress - 0.5);
      //console.log(progress);
      //planeImage.scale += 0.2;
    });*/

      shadowPlane.animate(
        {
          from: from,
          to: to,
          property: "position",
        },
        5000,
        am4core.ease.sinInOut
      );

      // Increment line, or reverse the direction
      currentLine += direction;
      if (currentLine < 0) {
        currentLine = 0;
        direction = 1;
      } else if (currentLine + 1 > numLines) {
        currentLine = numLines - 1;
        direction = -1;
      }
    }

    // Go!
    flyPlane();
    
    //algo
    var countries = [];
    $.getJSON('countries.json', function(data) {
      countries = data;
  });
    
    var countriesName = [];
    for(var i=0;i<chart.geodata.features.length;i++){
      countriesName.push(chart.geodata.features[i].properties.name);
    }

    $("#autocomplete").autocomplete({
      source: countriesName,
      select: function (event, ui) {
       var countryData = chart.geodata.features.find(m=>m.properties.name == ui.item.value);
       var country = countries.find(m=>m.name == ui.item.value);
        var target = polygonSeries.getPolygonById("FR");
  
  // Pre-zoom
        chart.zoomToMapObject(target);
       for(var i=0;i<country.authorizedCountries.length;i++){
        var countryChange = country.authorizedCountries[i];
        polygonSeries.getPolygonById(countryChange.country_code).fill = am4core.color("#8ef562");
       }
       for(var i=0;i<country.unauthorizedCountries.length;i++){
        var countryChange = country.unauthorizedCountries[i];
        polygonSeries.getPolygonById(countryChange.country_code).fill = am4core.color("#f53b3b");
       }
        //worldSeries.find()
        //boucle sur countries
        //trouver les pays autorisés et inversement
        //changer couleur en fonction
        //afficher restrictions si il y'a sous forme de tooltip
      },
    });
  }); // end am4core.ready()
});
