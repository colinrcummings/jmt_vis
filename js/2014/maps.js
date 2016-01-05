//map view vars
var projection;
var mapSVG;
var mapG;
var zoom = d3.behavior.zoom()
  .scaleExtent([1, 8]);
//map formatting vars
var greens = [
  ['#31a354'],
  ['#a1d99b','#31a354'],
  ['#e5f5e0','#a1d99b','#31a354'],
  ['#edf8e9','#bae4b3','#74c476','#238b45'],
  ['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'],
  ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#31a354','#006d2c'],
  ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'],
  ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'],
  ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']
];
var mapPoints = [
  {
    name: "Mt. Whitney",
    location: {
      latitude: 36.57855,
      longitude: -118.29239
    },
    properties: {
      text: "Elevation: 14,505 feet"
    }
  }
];
//spin.js vars
var target = document.getElementById('map'),
spinner,
opts = {
  lines: 12, // The number of lines to draw
  length: 7, // The length of each line
  width: 4, // The line thickness
  radius: 7, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};


//map change functions
function mapChange (map){
  switch(map) {
    case 'world':
       d3.select('#us')
        .style('background-color','#fff');
      d3.select('#world')
        .style('background-color','#e6e6e6');
      d3.select('#map-subheader').text('48 responses (6.2%) came from 15 countries outside of the United States.');
      drawWorldMap(true);
      break;
    case 'us':
      d3.select('#world')
        .style('background-color','#fff');
      d3.select('#us')
        .style('background-color','#e6e6e6');
      d3.select('#map-subheader').text('724 responses (93.8%) came from 42 states and the capital.');
      drawUSMap(true);
      break;
  }
}

//map draw functions
function drawWorldMap (styleFlag) {
  //remove existing map
  d3.selectAll('#map svg').remove();
  //start spinner
  startSpin();
  //setup svg dimensions
  var viewBoxWidth = 960;
  var viewBoxHeight = viewBoxWidth * 0.5;
  var mapWidth = $('#map').width();
  var mapHeight = mapWidth * 0.5;
  //define map projection
  projection = d3.geo.equirectangular()
    .translate([viewBoxWidth / 2, viewBoxHeight / 2])
    .scale(153);
  //define path generator
  var path = d3.geo.path()
    .projection(projection);
  //create svg element
  mapSVG = d3.select('#map').append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
    .attr('width', mapWidth)
    .attr('height', mapHeight)
    .attr('id', 'country-svg');
  //load GeoJSON data
  d3.json('data/maps/countries.json', function(json) {
    //append g element to svg
    mapG = mapSVG.append('g');
    //define GeoJSON features
    var countries = topojson.feature(json, json.objects.countries).features;
    //bind data and create one path per country feature
    mapG.selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'country')
      .attr('id', function(d){return d.id;})
      .style('fill', '#fff');
    //add tooltips
    mapG.selectAll('path')
      .on('mouseover', function(d) {
        mapTooltipShow(d, 'world');
      })
      .on('mouseout', function() {
        tooltipHide();
      });
    //style map
    if(styleFlag === true){
      styleCountryMap(countryData);
      drawMapPoints();
    }
    //remove spinner
    stopSpin();
  });
}

function drawUSMap (styleFlag) {
  //remove existing map
  d3.selectAll('#map svg').remove();
  //setup svg dimensions
  var viewBoxWidth = 960;
  var viewBoxHeight = viewBoxWidth * 0.5;
  var mapWidth = $('#map').width();
  var mapHeight = mapWidth * 0.5;
  //define map projection
  projection = d3.geo.albersUsa()
    .translate([viewBoxWidth/2, viewBoxHeight/2])
    .scale(viewBoxWidth);
  //define path generator
  var path = d3.geo.path()
    .projection(projection);
  //create svg element
  mapSVG = d3.select('#map')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
    .attr('width', mapWidth)
    .attr('height', mapHeight)
    .attr('id', 'us-svg');
  //append g element to svg
  mapG = mapSVG.append('g');
  //load in GeoJSON data
  d3.json('data/maps/us_states.json', function(json) {
    //bind data and create one path per state feature
    mapG.selectAll('path')
     .data(json.features)
     .enter()
     .append('path')
     .attr('d', path)
     .attr('class', 'state')
     .attr('id', function(d) { return d.id;})
     .style('fill', '#fff');
    //add tooltips
    mapG.selectAll('path')
      .on('mouseover', function(d) {
        mapTooltipShow(d, 'us');
      })
      .on('mouseout', function() {
        tooltipHide();
      });
    //style map
    if(styleFlag === true){
      styleUSMap(stateData);
      drawMapPoints();
    }
  });
}


//tooltip functions
function mapTooltipShow (hoverObj, map) {
  var filterData;
  var respondentCount;
  var respondnentText;
  //determine tooltip text
  switch(map) {
    case 'world':
      filterData = countryData.filter(function(d){return d.country_code === hoverObj.id;});
      break;
    case 'us':
      filterData = stateData.filter(function(d){return d.state_code === hoverObj.id;});
      break;
  }
  if (filterData.length === 0) {
    respondentCount = 0;
    respondnentText = ' responses';
  } else {
    if(filterData[0].count === 1) {
      respondentCount = 1;
      respondnentText = ' response';
    } else {
      respondentCount = filterData[0].count;
      respondnentText = ' responses';
    }
  }
  //create tooltip
  var tooltip = d3.select('body').append('div')
    .attr('id', 'map-tooltip')
    .attr('class', 'tooltip');
  tooltip
    .html('<h4>' + hoverObj.properties.name + '</h4>' + '<p>' + respondentCount  + respondnentText + ' (' + percentFormatter(respondentCount / geoRespondents) + ')' + '</p>');
  //position tooltip
  var mouse = d3.mouse(d3.select('body').node()).map( function(d) { return parseInt(d); } );
  var screenWidth = $('body').width();
  var tooltipWidth = $('#map-tooltip').width();
  if((mouse[0] + tooltipWidth) > screenWidth) {
    tooltip
      .style('left', (mouse[0] + (screenWidth - (mouse[0] + tooltipWidth + 5))) + 'px')
      .style('top', (mouse[1] + 20) + 'px');
  } else {
    tooltip
      .style('left', mouse[0] + 'px')
      .style('top', (mouse[1] + 20) + 'px');
  }
  //show tooltip
  tooltip
    .transition()
    .duration(300)
    .style('opacity', .95);
}

function mapPointTooltipShow (hoverObj) {
  //create tooltip
  var tooltip = d3.select('body').append('div')
    .attr('id', 'map-tooltip')
    .attr('class', 'tooltip');
  tooltip
    .html('<h4>' + hoverObj.name + '</h4>' + '<p>' + hoverObj.properties.text + '</p>');
  //position tooltip
  var mouse = d3.mouse(d3.select('body').node()).map( function(d) { return parseInt(d); } );
  var screenWidth = $('body').width();
  var tooltipWidth = $('#map-tooltip').width();
  if((mouse[0] + tooltipWidth) > screenWidth) {
    tooltip
      .style('left', (mouse[0] + (screenWidth - (mouse[0] + tooltipWidth + 5))) + 'px')
      .style('top', (mouse[1] + 20) + 'px');
  } else {
    tooltip
      .style('left', mouse[0] + 'px')
      .style('top', (mouse[1] + 20) + 'px');
  }
  //show tooltip
  tooltip
    .transition()
    .duration(300)
    .style('opacity', .95);
}

function tooltipHide () {
  d3.selectAll('.tooltip')
    .remove();
}


//map style functions
function styleCountryMap(data) {
  var colors = greens[3];
  var colorScale = d3.scale.quantile()
    .domain([0, colors.length - 1, d3.max(data, function (d) { return d.count; })])
    .range(colors);
  d3.selectAll('.country')
    .transition()
    .duration(750)
    .style('fill', '#fff');
  data.forEach(function(d,i){
    d3.selectAll('#' + d.country_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
}

function styleUSMap(data) {
  var colors = greens[8];
  var colorScale = d3.scale.quantile()
    .domain([0, colors.length - 1, d3.max(data, function (d) { return d.count; })])
    .range(colors);
  d3.selectAll('.state')
    .transition()
    .duration(750)
    .style('fill', '#fff');
  data.forEach(function(d,i){
    d3.select('#' + d.state_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
}

function drawMapPoints () {
  mapG.selectAll('.map-point')
  .data(mapPoints)
  .enter().append('path')
    .attr('class','map-point')
    .attr('d', d3.svg.symbol().type('triangle-up').size(32))
    .style('opacity', 0)
    .style('fill', 'yellow')
    .style('stroke','black')
    .on('mouseover', function(d) {
      mapPointTooltipShow(d);
    })
    .on('mouseout', function() {
      tooltipHide();
    })
    .attr('transform', function(d) {
      return 'translate(' + projection([
        d.location.longitude,
        d.location.latitude
      ]) + ')'
    });
  d3.selectAll('.map-point')
    .transition()
    .duration(1000)
    .style('opacity', 1);
}


//shared map resize function
$(window).resize(function() {
  var mapWidth = $('#map').width();
  mapSVG.attr('width', mapWidth);
  mapSVG.attr('height', mapWidth * 0.5);
});


//spin.js functions
function startSpin () {
  spinner = new Spinner(opts).spin(target);
}

function stopSpin () {
  spinner = spinner.stop();
}
