// whitney map point for style methods
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

/////////////////////////////////
// california county map class //
/////////////////////////////////
var CaliforniaCountyMap = function(json) {
  // set shape data
  this.json = json;
  //set viewbox dimensions
  this.viewBoxWidth = 960;
  this.viewBoxHeight = 480;
  // define map projection
  this.projection = d3.geo.albersUsa()
    .translate([this.viewBoxWidth * 1.25, this.viewBoxHeight / 1.75])
    .scale(this.viewBoxWidth * 2.43);
  // define path generator
  this.path = d3.geo.path()
    .projection(this.projection);
  // define zoom
  this.zoom = d3.behavior.zoom()
    .scale(1)
    .translate([0, 0])
    .scaleExtent([1, 8]);
}

CaliforniaCountyMap.prototype.draw = function(targetID) {
  // set initial svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // create svg with viewbox
  this.svg = d3.select(targetID).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight)
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
  // append g element to svg
  this.g = this.svg.append('g');
  // draw counties
  this.g.selectAll('path')
    .data(topojson.feature(this.json, this.json.objects.counties).features)
    .enter().append('path')
      .attr('d', this.path)
      .attr('id', function(d){ return 'incits' + +d.id; })
      .attr('class', 'ca-county')
      .style('fill', '#fcfcfc');
  // configure zoom based off of screen size
  if($(window).width() > 750) {
    var _viewBoxWidth = this.viewBoxWidth;
    var _viewBoxHeight = this.viewBoxHeight;
    var _zoom = this.zoom;
    var _g = this.g;
    this.svg.call(this.zoom.on('zoom', function(){
      var t = d3.event.translate;
      var s = d3.event.scale;
      t[0] = Math.min((s - 1), Math.max(_viewBoxWidth * (1 - s), t[0]));
      t[1] = Math.min((s - 1), Math.max(_viewBoxHeight * (1 - s), t[1]));
      _zoom.translate(t);
      _g.attr('transform', 'translate(' + t + ')' + ' scale(' + s + ')');
    }));
  }
}

CaliforniaCountyMap.prototype.style = function(data) {
  // add choropleth
  var colors = ['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'];
  var colorScale = d3.scale.quantile()
    .domain([0, colors.length - 1, d3.max(data, function (d) { return +d.count; })])
    .range(colors);
  data.forEach(function(d,i){
    d3.selectAll('#incits' + d.incits_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
  // add tooltips
  this.g.selectAll('path')
    .on('mouseenter', function(d) {
      var dataElement = data.filter(function(r){
        return +r.incits_code === +d.id;
      });
      var respCount;
      if(dataElement.length === 0) {
        respCount = 0;
      } else {
        respCount = +dataElement[0].count;
      }
      var caliData = data.filter(function(e){
        return +e.california === 1;
      })
      var denom = d3.sum(caliData, function(e) {
        return e.count;
      });
      var header = d.properties.name;
      var body = noDecimalNum(respCount) + ' ' +
        pluralize(respCount, 'respondents','respondent') + ' (' +
        oneDecimalPct(respCount/denom) + ' California)';
      appendTooltip(d3.event, header, body);
    })
    .on('mousemove', function() {
      moveTooltip(d3.event);
    })
    .on('mouseleave', function() {
      removeTooltip();
    });
    // add whitney
    var _projection = this.projection;
    this.g.selectAll('.map-point')
      .data(mapPoints)
      .enter().append('path')
        .attr('class','map-point')
        .attr('d', d3.svg.symbol().type('triangle-up').size(32))
        .style('opacity', 0)
        .style('fill', 'yellow')
        .style('stroke','black')
        .on('mouseover', function(d) {
          appendTooltip(d3.event, d.name, d.properties.text);
        })
        .on('mouseout', function() {
          removeTooltip();
        })
        .attr('transform', function(d) {
          return 'translate(' + _projection([
            d.location.longitude,
            d.location.latitude
          ]) + ')'
        });
      d3.selectAll('.map-point')
        .transition()
        .duration(1000)
        .style('opacity', 1);
}

CaliforniaCountyMap.prototype.resize = function(targetID) {
  // update svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // update svg
  this.svg
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
}


////////////////////////
// us state map class //
////////////////////////
var USStateMap = function(json) {
  // set shape data
  this.json = json;
  //set viewbox dimensions
  this.viewBoxWidth = 960;
  this.viewBoxHeight = 480;
  // define map projection
  this.projection = d3.geo.albersUsa()
    .translate([this.viewBoxWidth / 2, this.viewBoxHeight / 2])
    .scale(this.viewBoxWidth);
  // define path generator
  this.path = d3.geo.path()
    .projection(this.projection);
  // define zoom
  this.zoom = d3.behavior.zoom()
    .scale(1)
    .translate([0, 0])
    .scaleExtent([1, 8]);
}

USStateMap.prototype.draw = function(targetID) {
  // set initial svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // create svg with viewbox
  this.svg = d3.select(targetID).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight)
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
  // append g element to svg
  this.g = this.svg.append('g');
  // draw states
  this.g.selectAll('path')
   .data(this.json.features)
   .enter()
   .append('path')
   .attr('d', this.path)
   .attr('class', 'state')
   .attr('id', function(d) { return d.id;})
   .style('fill', '#fcfcfc');
  // configure zoom based off of screen size
  if($(window).width() > 750) {
    var _viewBoxWidth = this.viewBoxWidth;
    var _viewBoxHeight = this.viewBoxHeight;
    var _zoom = this.zoom;
    var _g = this.g;
    this.svg.call(this.zoom.on('zoom', function(){
      var t = d3.event.translate;
      var s = d3.event.scale;
      t[0] = Math.min((s - 1), Math.max(_viewBoxWidth * (1 - s), t[0]));
      t[1] = Math.min((s - 1), Math.max(_viewBoxHeight * (1 - s), t[1]));
      _zoom.translate(t);
      _g.attr('transform', 'translate(' + t + ')' + ' scale(' + s + ')');
    }));
  }
}

USStateMap.prototype.style = function(data) {
  // add choropleth with a custom threshold scale
  var colors = ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'];
  var colorScale = d3.scale.threshold()
    .domain([7,14,21,28,35,42,49,60])
    .range(colors);
  data.forEach(function(d,i){
    d3.selectAll('#' + d.state_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
  // add tooltips
  this.g.selectAll('path')
    .on('mouseenter', function(d) {
      var dataElement = data.filter(function(r){
        return r.state_code == d.id;
      });
      var respCount;
      if(dataElement.length === 0) {
        respCount = 0;
      } else {
        respCount = +dataElement[0].count;
      }
      var denom = d3.sum(data, function(e) {
        return e.count;
      });
      var header = d.properties.name;
      var body = noDecimalNum(respCount) + ' ' +
        pluralize(respCount, 'respondents','respondent') +' (' +
        oneDecimalPct(respCount/denom) + ' USA)';
      appendTooltip(d3.event, header, body);
    })
    .on('mousemove', function() {
      moveTooltip(d3.event);
    })
    .on('mouseleave', function() {
      removeTooltip();
    });
    // add whitney
    var _projection = this.projection;
    this.g.selectAll('.map-point')
      .data(mapPoints)
      .enter().append('path')
        .attr('class','map-point')
        .attr('d', d3.svg.symbol().type('triangle-up').size(32))
        .style('opacity', 0)
        .style('fill', 'yellow')
        .style('stroke','black')
        .on('mouseover', function(d) {
          appendTooltip(d3.event, d.name, d.properties.text);
        })
        .on('mouseout', function() {
          removeTooltip();
        })
        .attr('transform', function(d) {
          return 'translate(' + _projection([
            d.location.longitude,
            d.location.latitude
          ]) + ')'
        });
      d3.selectAll('.map-point')
        .transition()
        .duration(1000)
        .style('opacity', 1);
}

USStateMap.prototype.resize = function(targetID) {
  // update svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // update svg
  this.svg
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
}


/////////////////////////
// us county map class //
/////////////////////////
var USCountyMap = function(json) {
  // set shape data
  this.json = json;
  //set viewbox dimensions
  this.viewBoxWidth = 960;
  this.viewBoxHeight = 480;
  // define map projection
  this.projection = d3.geo.albersUsa()
    .translate([this.viewBoxWidth / 2, this.viewBoxHeight / 2])
    .scale(this.viewBoxWidth);
  // define path generator
  this.path = d3.geo.path()
    .projection(this.projection);
  // define zoom
  this.zoom = d3.behavior.zoom()
    .scale(1)
    .translate([0, 0])
    .scaleExtent([1, 8]);
}

USCountyMap.prototype.draw = function(targetID) {
  // set initial svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // create svg with viewbox
  this.svg = d3.select(targetID).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight)
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
  // append g element to svg
  this.g = this.svg.append('g');
  // draw counties
  this.g.selectAll('path')
    .data(topojson.feature(this.json, this.json.objects.counties).features)
    .enter().append('path')
      .attr('d', this.path)
      .attr('id', function(d){ return 'incits' + +d.id; })
      .attr('class', 'county')
      .style('fill', '#fcfcfc');
  // draw inner state boundaries
  this.g.insert('path', '.graticule')
    .datum(topojson.mesh(this.json, this.json.objects.states, function(a, b) {
      return a !== b;
    }))
    .attr('d', this.path)
    .attr('class', 'state-boundary');
  // draw outer us boundary
  this.g.insert('path', '.graticule')
    .datum(topojson.feature(this.json, this.json.objects.land))
    .attr('class', 'state-boundary')
    .attr('d', this.path);
  // configure zoom based off of screen size
  if($(window).width() > 750) {
    var _viewBoxWidth = this.viewBoxWidth;
    var _viewBoxHeight = this.viewBoxHeight;
    var _zoom = this.zoom;
    var _g = this.g;
    this.svg.call(this.zoom.on('zoom', function(){
      var t = d3.event.translate;
      var s = d3.event.scale;
      t[0] = Math.min((s - 1), Math.max(_viewBoxWidth * (1 - s), t[0]));
      t[1] = Math.min((s - 1), Math.max(_viewBoxHeight * (1 - s), t[1]));
      _zoom.translate(t);
      _g.attr('transform', 'translate(' + t + ')' + ' scale(' + s + ')');
    }));
  }
}

USCountyMap.prototype.style = function(data, incitsRef) {
  // add choropleth
  var colors = ['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'];
  var colorScale = d3.scale.quantile()
    .domain([0, colors.length - 1, d3.max(data, function (d) { return +d.count; })])
    .range(colors);
  data.forEach(function(d,i){
    d3.selectAll('#incits' + d.incits_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
  // add tooltips
  this.g.selectAll('path')
    .on('mouseenter', function(d) {
      var icitsCode = +d.id;
      if(icitsCode !== undefined) {
        var dataElement = data.filter(function(r){
          return +r.incits_code == icitsCode;
        });
        var incitsElement = incitsRef.filter(function(i){
          return +i.incits_code === icitsCode;
        });
        if(incitsElement.length === 1) {
          var respCount;
          if(dataElement.length === 0) {
            respCount = 0;
          } else {
            respCount = +dataElement[0].count;
          }
          var denom = d3.sum(data, function(e) {
            return e.count;
          });
          var header = incitsElement[0].county_name + ', ' + incitsElement[0].state;
          var body = noDecimalNum(respCount) + ' ' +
            pluralize(respCount, 'respondents','respondent') + ' (' +
            oneDecimalPct(respCount/denom) + ' USA)';
          appendTooltip(d3.event, header, body);
        }
      }
    })
    .on('mousemove', function() {
      moveTooltip(d3.event);
    })
    .on('mouseleave', function() {
      removeTooltip();
    });
    // add whitney
    var _projection = this.projection;
    this.g.selectAll('.map-point')
      .data(mapPoints)
      .enter().append('path')
        .attr('class','map-point')
        .attr('d', d3.svg.symbol().type('triangle-up').size(32))
        .style('opacity', 0)
        .style('fill', 'yellow')
        .style('stroke','black')
        .on('mouseover', function(d) {
          appendTooltip(d3.event, d.name, d.properties.text);
        })
        .on('mouseout', function() {
          removeTooltip();
        })
        .attr('transform', function(d) {
          return 'translate(' + _projection([
            d.location.longitude,
            d.location.latitude
          ]) + ')'
        });
      d3.selectAll('.map-point')
        .transition()
        .duration(1000)
        .style('opacity', 1);
}

USCountyMap.prototype.resize = function(targetID) {
  // update svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // update svg
  this.svg
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
}


/////////////////////////////
// world country map class //
/////////////////////////////
var WorldCountryMap = function(json) {
  // set shape data
  this.json = json;
  //set viewbox dimensions
  this.viewBoxWidth = 960;
  this.viewBoxHeight = 480;
  // define map projection
  this.projection = d3.geo.equirectangular()
    .translate([this.viewBoxWidth / 2, this.viewBoxHeight / 2])
    .scale(153);
  // define path generator
  this.path = d3.geo.path()
    .projection(this.projection);
  // define zoom
  this.zoom = d3.behavior.zoom()
    .scale(1)
    .translate([0, 0])
    .scaleExtent([1, 8]);
}

WorldCountryMap.prototype.draw = function(targetID) {
  // set initial svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // create svg with viewbox
  this.svg = d3.select(targetID).append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight)
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
  // append g element to svg
  this.g = this.svg.append('g');
  //define country features
  var countries = topojson.feature(this.json, this.json.objects.countries).features;
  // draw countries
  this.g.selectAll('path')
   .data(countries)
   .enter()
   .append('path')
   .attr('d', this.path)
   .attr('class', 'country')
   .attr('id', function(d) { return d.id;})
   .style('fill', '#fcfcfc');
  // configure zoom based off of screen size
  if($(window).width() > 750) {
    var _viewBoxWidth = this.viewBoxWidth;
    var _viewBoxHeight = this.viewBoxHeight;
    var _zoom = this.zoom;
    var _g = this.g;
    this.svg.call(this.zoom.on('zoom', function(){
      var t = d3.event.translate;
      var s = d3.event.scale;
      t[0] = Math.min((s - 1), Math.max(_viewBoxWidth * (1 - s), t[0]));
      t[1] = Math.min((s - 1), Math.max(_viewBoxHeight * (1 - s), t[1]));
      _zoom.translate(t);
      _g.attr('transform', 'translate(' + t + ')' + ' scale(' + s + ')');
    }));
  }
}

WorldCountryMap.prototype.style = function(data) {
  // add choropleth
  var colors = ['#edf8e9','#bae4b3','#74c476','#238b45'];
  var colorScale = d3.scale.quantile()
    .domain([0, colors.length - 1, d3.max(data, function (d) { return +d.count; })])
    .range(colors);
  data.forEach(function(d,i){
    d3.selectAll('#' + d.country_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
  // add tooltips
  this.g.selectAll('path')
    .on('mouseenter', function(d) {
      var dataElement = data.filter(function(r){
        return r.country_code == d.id;
      });
      var respCount;
      if(dataElement.length === 0) {
        respCount = 0;
      } else {
        respCount = +dataElement[0].count;
      }
      var denom = d3.sum(data, function(e) {
        return e.count;
      });
      var header = d.properties.name;
      var body = noDecimalNum(respCount) + ' ' +
        pluralize(respCount, 'respondents','respondent') + ' (' +
        oneDecimalPct(respCount/denom) +  ' World)';
      appendTooltip(d3.event, header, body);
    })
    .on('mousemove', function() {
      moveTooltip(d3.event);
    })
    .on('mouseleave', function() {
      removeTooltip();
    });
    // add whitney
    var _projection = this.projection;
    this.g.selectAll('.map-point')
      .data(mapPoints)
      .enter().append('path')
        .attr('class','map-point')
        .attr('d', d3.svg.symbol().type('triangle-up').size(32))
        .style('opacity', 0)
        .style('fill', 'yellow')
        .style('stroke','black')
        .on('mouseover', function(d) {
          appendTooltip(d3.event, d.name, d.properties.text);
        })
        .on('mouseout', function() {
          removeTooltip();
        })
        .attr('transform', function(d) {
          return 'translate(' + _projection([
            d.location.longitude,
            d.location.latitude
          ]) + ')'
        });
      d3.selectAll('.map-point')
        .transition()
        .duration(1000)
        .style('opacity', 1);
}

WorldCountryMap.prototype.resize = function(targetID) {
  // update svg dimensions
  this.svgWidth = $(targetID).width();
  this.svgHeight = this.svgWidth * this.viewBoxHeight / this.viewBoxWidth;
  // update svg
  this.svg
    .attr('width', this.svgWidth)
    .attr('height', this.svgHeight);
}

//////////////
// tooltips //
//////////////
function appendTooltip(e, header, body) {
  // default tooltip settings
  var offsetX = 15;
  var offsetY = 25;
  // append tooltip element to body
  $("body").append(
    '<div id="tooltip">' +
      '<h4>' + header + '</h4>' +
      '<p>' + body + '</p>' +
    '</div>'
  );
  // set x and y coordinates for tooltip
  $('#tooltip').css('left', e.pageX + offsetX );
  $('#tooltip').css('top', e.pageY + offsetY );
  // show tooltip
  $('#tooltip').fadeIn('500');
}

function moveTooltip(e) {
  // default tooltip settings
  var offsetX = 15;
  var offsetY = 25;
  // new tooltip position
  var x = e.pageX;
  var y = e.pageY;
  var tipToBottom, tipToRight;
  // distance to the right
  tipToRight = $(window).width() - (x + offsetX + $('#tooltip').outerWidth() + 5);
  // check if tooltip is too close to the right
  if(tipToRight < offsetX) {
    x = e.pageX + tipToRight;
  }
  // distance to the bottom
  tipToBottom = $(window).height() - (y + offsetY + $('#tooltip').outerHeight() + 5);
  // check if tooltip is too close to the bottom
  if(tipToBottom < offsetY) {
    y = e.pageY + tipToBottom;
  }
  // assign new tooltip position
  $('#tooltip').css('left', x + offsetX );
  $('#tooltip').css('top', y + offsetY );
}

function removeTooltip() {
  // remove tooltip
  $('#tooltip').remove();
}


//////////////////////////
// helpers & formatters //
//////////////////////////
function pluralize (number, pluralTrue, pluralFalse) {
  if (number === 1) {
    return pluralFalse;
  } else {
    return pluralTrue;
  }
}

var oneDecimalPct = d3.format('.1%');
var noDecimalNum = d3.format(',.0f');
