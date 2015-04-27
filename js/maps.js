//shared map vars
var viewBoxWidth;
var viewBoxHeight;
var mapWidth;
var mapHeight;
var projection;
var path;
var mapSVG;
var mapG;
var zoom = d3.behavior.zoom()
  .scaleExtent([1, 8]);
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
    name: "Mount Whitney",
    location: {
      latitude: 36.57855,
      longitude: -118.29239
    },
    properties: {
      text: "Elevation: 14,505 feet"
    }
  }
];


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
  //setup svg dimensions
  viewBoxWidth = 960;
  viewBoxHeight = 480;
  mapWidth = $('#map').width();
  mapHeight = mapWidth * viewBoxHeight / viewBoxWidth;
  //define map projection
  projection = d3.geo.equirectangular()
    .translate([viewBoxWidth / 2, viewBoxHeight / 2])
    .scale(153);
  //define path generator
  path = d3.geo.path()
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
  });
}

function drawUSMap (styleFlag) {
  //remove existing map
  d3.selectAll('#map svg').remove();
  //setup svg dimensions
  viewBoxWidth = 960;
  viewBoxHeight = 480;
  mapWidth = $('#map').width();
  mapHeight = mapWidth * viewBoxHeight / viewBoxWidth;
  //define map projection
  projection = d3.geo.albersUsa()
    .translate([viewBoxWidth/2, viewBoxHeight/2])
    .scale(viewBoxWidth);
  //define path generator
  path = d3.geo.path()
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
  d3.json('data/maps/us.json', function(json) {
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
    respondnentText = ' Respondnents';
  } else {
    if(filterData[0].count === 1) {
      respondentCount = 1;
      respondnentText = ' Respondent';
    } else {
      respondentCount = filterData[0].count;
      respondnentText = ' Respondnents';
    }
  }
  //create tooltip
  var tooltip = d3.select('body').append('div')
    .attr('id', 'map-tooltip')
    .attr('class', 'tooltip');
  tooltip
    .html('<h4>' + hoverObj.properties.name + '</h4>' + '<p>' + respondentCount  + respondnentText + ' (' + percentFormatter(respondentCount / numMapRespondents) + ')' + '</p>');    
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
  d3.selectAll('#map-tooltip, #map-point-tooltip')  
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
  mapG.selectAll(".map-point")
  .data(mapPoints)
  .enter().append("circle", ".map-point")
  .attr("r", 3)
  .style('fill', 'yellow')
  .style('stroke','black')
  .style('z-index',1000)
  .on('mouseover', function(d) {
    mapPointTooltipShow(d);
  })  
  .on('mouseout', function() { 
    tooltipHide();
  }) 
  .attr("transform", function(d) {
    return "translate(" + projection([
      d.location.longitude,
      d.location.latitude
    ]) + ")"
  });
}



//shared map resize function
$(window).resize(function() {
  var mapWidth = $('#map').width();
  mapSVG.attr('width', mapWidth);
  mapSVG.attr('height', mapWidth * viewBoxHeight / viewBoxWidth);
});
