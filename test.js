var ageChart;
var footwearChart;
var fitnessChart;
 var colors = ['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c'];
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
  //instantiate charts
  ageChart = new BarChart(charts.age);
  footwearChart = new BarChart(charts.footwear);
  fitnessChart = new BarChart(charts.fitness);
  drawCharts();
});

var BarChart = function(chart) {
    this.margin = {top: 0, right: 5, bottom: 35, left: 25};
    this.viewBoxWidth = 348 - this.margin.left - this.margin.right;
    this.viewBoxHeight = (this.viewBoxWidth * 0.49) - this.margin.top - this.margin.bottom;
    this.chartWidth = $('.chart').width();
    this.chartHeight = this.chartWidth * 0.49;
    this.svg = d3.select('#' + chart.name + '-bar')
      .attr('preserveAspectRatio', 'xMidYMid')
      .attr('viewBox', '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight)
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.x = d3.scale.ordinal()
      .domain(chart.domain)
      .rangeRoundBands([0, this.viewBoxWidth * .9], .1);
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom');
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.viewBoxHeight + ')')
      .call(this.xAxis);
}

BarChart.prototype.draw = function(chart, data) {
    this.y = d3.scale.linear()
      .domain([0, d3.max(data.map(function(d){return d.values}))])
      .rangeRound([this.viewBoxHeight, 0])
      .nice();
    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient('left')
      .ticks(5)
      .tickFormat(d3.format("d"));
    this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);
    var x = this.x;
    var y = this.y;
    var colorScale = d3.scale.quantile()
      .domain(data.map(function(d){return d.values}))
      .range(colors);
    this.bars = this.svg.selectAll('rect')
      .data(data)
      .enter().append("rect")
        .attr('class', chart.name + '-bar')
        .attr('id', function(d){return chart.name + '-' + d.key.split(' ').join('-'); })
        .attr("x", function(d) { return x(d.key); })
        .attr("y", this.viewBoxHeight)
        .attr("width", this.x.rangeBand())
        .attr("height",0)
        .style('stroke','#777')
        .on("click", function(d){
          chartClick(this, d);
        })
        .on('mouseover', function(d) {
          chartTooltipShow(d);
        })  
        .on('mouseout', function() { 
          tooltipHide();
        }) 
      .transition()
        .duration(200)
        .attr("height", function(d) { return y(0) - y(d.values); })
        .attr("y", function(d) { return y(d.values); })
        .style('fill', function(d){return colorScale(d.values)});
}

BarChart.prototype.update = function(chart, data) {
    this.svg.select(".y.axis").remove();
    this.y = d3.scale.linear()
      .domain([0, d3.max(data.map(function(d){return d.values}))])
      .rangeRound([this.viewBoxHeight, 0])
      .nice();
    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient('left')
      .ticks(5)
      .tickFormat(d3.format("d"));
    this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);
    var x = this.x;
    var y = this.y;
    var colorScale = d3.scale.quantile()
      .domain(data.map(function(d){return d.values}))
      .range(colors);
    this.bars = this.svg.selectAll('.' + chart.name + '-bar')
      .data(data, function(d) { return d.key; });
    this.bars.enter().append("rect")
      .attr('class', chart.name + '-bar')
      .attr('id', function(d){return name + '-' + d.key.split(' ').join('-'); })
      .attr("x", function(d) { return x(d.key); })
      .attr("y", function(d) { return y(d.values); })
      .attr("height", function(d) { return y(0) - y(d.values); })
      .attr("width", x.rangeBand())
      .style('fill', function(d){return colorScale(d.values)})
      .on('mouseover', function(d) {
        chartTooltipShow(d);
      })  
      .on('mouseout', function() { 
        tooltipHide();
      }) 
    .on("click", function(d){
        chartClick(this, d);
      });
    this.bars.exit().remove();
    this.bars
      .transition()
      .duration(750)
        .attr("y", function(d) { return y(d.values); })
        .attr("height", function(d) { return y(0) - y(d.values); })
        .style('fill', function(d){return colorScale(d.values)});;
}

function drawCharts() {
  ageChart.draw(charts.age, keyThenCount(ageAccessor, ageFilter.top(Infinity)));
  footwearChart.draw(charts.footwear, keyThenCount(footwearAccessor, footwearFilter.top(Infinity)));
  fitnessChart.draw(charts.fitness, keyThenCount(fitnessAccessor, fitnessFilter.top(Infinity)));
}

function updateCharts() {
  ageChart.update(charts.age, keyThenCount(ageAccessor, ageFilter.top(Infinity)));
  footwearChart.update(charts.footwear, keyThenCount(footwearAccessor, footwearFilter.top(Infinity)));
  fitnessChart.update(charts.fitness, keyThenCount(fitnessAccessor, fitnessFilter.top(Infinity)));
}

function chartClick(clickRect, clickObj) {
  switch(clickRect.className.baseVal) {
    case 'age-bar':
      ageFilter.filter(clickObj.key);
      d3.select('#age-clear-btn').style('display','inline-block');
      d3.select('#age-header').text('Age (' + clickObj.key + ')');
      break;
    case 'footwear-bar':
      footwearFilter.filter(clickObj.key);
      d3.select('#footwear-clear-btn').style('display','inline-block');
      d3.select('#footwear-header').text('Footwear (' + clickObj.key + ')');
      break;
    case 'fitness-bar':
      fitnessFilter.filter(clickObj.key);
      d3.select('#fitness-clear-btn').style('display','inline-block');
      d3.select('#fitness-header').text('Fitness (' + clickObj.key + ')');
      break;
  }
  updateCharts();
}

function clearChartClick(filter) {
  switch(filter) {
    case 'age':
      ageFilter.filterAll();
      d3.select('#age-clear-btn').style('display','none');
      d3.select('#age-header').text('Age (All)');
      break;
    case 'footwear':
      footwearFilter.filterAll();
      d3.select('#footwear-clear-btn').style('display','none');
      d3.select('#footwear-header').text('Footwear (All)');
      break;
    case 'fitness':
      fitnessFilter.filterAll();
      d3.select('#fitness-clear-btn').style('display','none');
      d3.select('#fitness-header').text('Fitness (All)');
      break;
  }
  updateCharts();
}

//tooltip functions
function chartTooltipShow (hoverObj) {
  //determine tooltip text
  var respondnentText;
  if(hoverObj.values === 1) {
    respondnentText = ' response';
  } else {
    respondnentText = ' responses';
  }

  //create tooltip
  var tooltip = d3.select('body').append('div')
    .attr('id', 'chart-tooltip')
    .attr('class', 'tooltip');
  tooltip
    .html('<h4>' + hoverObj.key + '</h4>' + '<p>' + hoverObj.values + ' ' + respondnentText + '</p>');    
  //position tooltip
  var mouse = d3.mouse(d3.select('body').node()).map( function(d) { return parseInt(d); } );
  var screenWidth = $('body').width();
  var tooltipWidth = $('#chart-tooltip').width();
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

var charts = {
  "age": {
    "name": "age",
    "domain": ['Under 21', '21 to 32', '33 to 42', '43 to 52', '53 to 64','65 and up']
    },
  "footwear": {
    "name": "footwear",
    "domain": ['Boots','Hiking shoes','Trail runners','Ultra-light shoes','Sandals/barefoot']
    },
  "fitness": {
    "name": "fitness",
    "domain": ['Decline to state', 'Below avg.', 'Average', 'Above avg.', 'Sig. above avg.']
  }
};


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


//helper functions
$(window).resize(function() {
  var chartWidth = $('.chart').width();
  $('.chart').attr('width', chartWidth);
  $('.chart').attr('height', chartWidth * 0.49);
});