//crossfilter object
var demoCrossFilter;
//crossfilter filters
var genderFilter,
  ageFilter,
  groupFilter,
  footwearFilter,
  fitnessFilter;
//accessor functions
var genderAccessor = function(a) {return a.gender;};
var ageAccessor = function(a) {return a.age_bin;};
var groupAccessor = function(a) {return a.group_size;};
var footwearAccessor = function(a) {return a.footwear;};
var fitnessAccessor = function(a) {return a.fitness;};

d3.csv('data/jmt_2014_demographic_data.csv', function(data) {
  demoCrossFilter = crossfilter(data);
  //update crossfilter filters
  genderFilter = demoCrossFilter.dimension(genderAccessor);
  ageFilter = demoCrossFilter.dimension(ageAccessor);
  groupFilter = demoCrossFilter.dimension(groupAccessor); 
  footwearFilter = demoCrossFilter.dimension(footwearAccessor);
  fitnessFilter = demoCrossFilter.dimension(fitnessAccessor);
  //draw charts
  drawBarChart('age',keyThenCount(ageAccessor, ageFilter.top(Infinity)),['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c'],['Under 21', '21 to 32', '33 to 42', '43 to 52', '53 to 64','65 and up']);
  drawBarChart('footwear',keyThenCount(footwearAccessor, ageFilter.top(Infinity)),['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c'],['Boots','Hiking shoes','Trail runners','Ultra-light shoes','Sandals/barefoot']);
  drawBarChart('fitness',keyThenCount(fitnessAccessor, fitnessFilter.top(Infinity)),['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c'],['Decline to state', 'Below avg.', 'Average', 'Above avg.', 'Sig. above avg.']);
});


//bar chart function
function drawBarChart (name, data, colors,domain) {
  //setup svg dimensions
  var margin = {top: 0, right: 5, bottom: 35, left: 25};
  var viewBoxWidth = 348 - margin.left - margin.right;
  var viewBoxHeight = (viewBoxWidth * 0.49) - margin.top - margin.bottom;
  var chartWidth = $('.chart').width();
  var chartHeight = chartWidth * 0.49;

  var colorScale = d3.scale.quantile()
    .domain(data.map(function(d){return d.values}))
    .range(colors);

  var x = d3.scale.ordinal()
    .domain(domain)
    .rangeRoundBands([0, viewBoxWidth * .9], .1);

  var y = d3.scale.linear()
    .domain([0, d3.max(data.map(function(d){return d.values}))])
    .rangeRound([viewBoxHeight, 0])
    .nice();

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickFormat(d3.format("d"));

  var svg = d3.select('#' + name + '-bar')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight)
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + viewBoxHeight + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  var bars = svg.selectAll("rect") 
    .data(data)
    .enter().append("rect")
      .attr('class', name + '-bar')
      .attr('id', function(d){return name + '-' + d.key.split(' ').join('-'); })
      .attr("x", function(d) { return x(d.key); })
      .attr("y", viewBoxHeight)
      .attr("width", x.rangeBand())
      .attr("height",0)
      .style('stroke','#777')
    .transition()
      .duration(200)
      .attr("height", function(d) { return y(0) - y(d.values); })
      .attr("y", function(d) { return y(d.values); })
      .style('fill', function(d){return colorScale(d.values)});
}


//drawPieChart('group',keyThenCount(groupAccessor, groupFilter.top(Infinity)))
//pie chart functions
function drawPieChart (name, data) {
  
}


//data functions
function keyThenCount (accessor, data) {
  var keyAndCount = d3.nest()
    .key(accessor)
    .rollup(function(d) {
      return d.length;
    });
  var keyAndCountData = keyAndCount.entries(
    data.map(function(d) {
      return d;
    })
  );
  return keyAndCountData;
}


$(window).resize(function() {
  var chartWidth = $('.chart').width();
  $('.chart').attr('width', chartWidth);
  $('.chart').attr('height', chartWidth * 0.49);
});