////////////////////////
// us state map class //
////////////////////////
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
  console.log(data);
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
  var colors = ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'];
  var colorScale = d3.scale.quantile()
    .domain([0, colors.length - 1, d3.max(data, function (d) { return +d.count; })])
    .range(colors);
  data.forEach(function(d,i){
    d3.selectAll('#' + d.state_code)
      .transition()
      .duration(750)
      .style('fill', colorScale(d.count));
  });
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

USCountyMap.prototype.style = function(data) {
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