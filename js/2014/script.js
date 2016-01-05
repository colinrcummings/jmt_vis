//data vars
var stateData;
var countryData;
var geoRespondents = 772;
var demoRespndents;
//crossfilter object
var demoCrossFilter;
//crossfilter filters
var genderFilter,
  ageFilter,
  groupFilter,
  backpackingFilter,
  trainingFilter,
  fitnessFilter,
  footwearFilter,
  packweightFilter,
  bodyweightFilter,
  milesFilter,
  dificultyFilter,
  whitneyFilter;
//accessor functions
var genderAccessor = function(a) {return a.gender;};
var ageAccessor = function(a) {return a.age_bin;};
var groupAccessor = function(a) {return a.group_size;};
var backpackingAccessor = function(a) {return a.backpacking;};
var trainingAccessor = function(a) {return a.training;};
var fitnessAccessor = function(a) {return a.fitness;};
var footwearAccessor = function(a) {return a.footwear;};
var packweightAccessor = function(a) {return a.pack_weight_bin;};
var bodyweightAccessor = function(a) {return a.pack_weight_body_weight_bin;};
var milesAccessor = function(a) {return a.mi_day_bin;};
var dificultyAccessor = function(a) {return a.dificulty;};
var whitneyAccessor = function(a) {return a.whitney;};
//formatting functions
var percentFormatter = d3.format(".1%");
//chart vars
var charts = {
  "gender": {
    "name": "gender"
    },
  "age": {
    "name": "age",
    "domain": ['Under 30', '30 to 39', '40 to 49', '50 to 59', '60 and up']
    },
  "group": {
    "name": "group"
    },
  "backpacking": {
    "name": "backpacking",
    "domain": ['< 5 days', '6-10 days', '11-20 days', '21-50 days', '51-100 days', '101 days +']
    },
  "training": {
    "name": "training",
    "domain": ['< 2 hrs', '2-4 hrs', '5-8 hrs', '9-16 hrs', '16 hrs +']
    },
  "fitness": {
    "name": "fitness",
    "domain": ['Decline to state', 'Out of shape', 'Below avg', 'Average', 'Above avg', 'Sig. above avg']
    },
  "footwear": {
    "name": "footwear",
    "domain": ['Boots', 'Hiking shoes', 'Trail runners', 'Vibrams, sandals, none']
    },
  "packweight": {
    "name": "packweight",
    "domain": ['< 25 lbs', '25-30 lbs', '30-35 lbs', '35-40 lbs', '40-45 lbs', '45-50 lbs', '50-55 lbs', '55 lbs +']
    },
  "bodyweight": {
    "name": "bodyweight",
    "domain": ['< 16%', '16-20%', '20-24%', '24-28%', '28-32%', '32-36%', '36% +']
    },
  "miles": {
    "name": "miles",
    "domain": ['< 8 mi', '8-10 mi', '10-12 mi', '12-14 mi', '14-16 mi', '16-18 mi', '18-20 mi', '20 mi +']
    },
  "dificulty": {
    "name": "dificulty",
    "domain": ['Not at all', 'Minimally', 'Somewhat', 'Fairly', 'Very', 'Death march']
    },
  "whitney": {
    "name": "whitney"
    }
};
var genderChart,
  ageChart,
  groupChart,
  backpackingChart,
  trainingChart,
  fitnessChart,
  footwearChart,
  packweightChart,
  bodyweightChart,
  milesChart,
  dificultyChart,
  whitneyChart;
var barGreens = ['#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c'];


//load data
d3.csv('data/jmt_2014_us_by_state.csv', function(data) {
  data.forEach(function(d){
    d.state_code = d.state_code;
    d.count = +d.count;
  })
  stateData = data;
});

d3.csv('data/jmt_2014_world_by_country.csv', function(data) {
  data.forEach(function(d){
    d.country_code = d.country_code;
    d.count = +d.count;
  })
  countryData = data;
});

d3.csv('data/jmt_2014_demographic_data_2.csv', function(data) {
  //update globals
  demoRespndents = data.length;
  //set crossfilter object
  demoCrossFilter = crossfilter(data);
  //update crossfilter filters
  genderFilter = demoCrossFilter.dimension(genderAccessor);
  ageFilter = demoCrossFilter.dimension(ageAccessor);
  groupFilter = demoCrossFilter.dimension(groupAccessor);
  backpackingFilter = demoCrossFilter.dimension(backpackingAccessor);
  trainingFilter = demoCrossFilter.dimension(trainingAccessor);
  fitnessFilter = demoCrossFilter.dimension(fitnessAccessor);
  footwearFilter = demoCrossFilter.dimension(footwearAccessor);
  packweightFilter = demoCrossFilter.dimension(packweightAccessor);
  bodyweightFilter = demoCrossFilter.dimension(bodyweightAccessor);
  milesFilter = demoCrossFilter.dimension(milesAccessor);
  dificultyFilter = demoCrossFilter.dimension(dificultyAccessor);
  whitneyFilter = demoCrossFilter.dimension(whitneyAccessor);
});


//chart view functions
function drawCharts() {
  ageChart.draw(charts.age, keyThenCount(ageAccessor, ageFilter.top(Infinity)));
  genderChart.draw(charts.gender, keyThenCount(genderAccessor, genderFilter.top(Infinity)));
  groupChart.draw(charts.group, keyThenCount(groupAccessor, groupFilter.top(Infinity)));
  backpackingChart.draw(charts.backpacking, keyThenCount(backpackingAccessor, backpackingFilter.top(Infinity)));
  trainingChart.draw(charts.training, keyThenCount(trainingAccessor, trainingFilter.top(Infinity)));
  fitnessChart.draw(charts.fitness, keyThenCount(fitnessAccessor, fitnessFilter.top(Infinity)));
  footwearChart.draw(charts.footwear, keyThenCount(footwearAccessor, footwearFilter.top(Infinity)));
  packweightChart.draw(charts.packweight, keyThenCount(packweightAccessor, packweightFilter.top(Infinity)));
  bodyweightChart.draw(charts.bodyweight, keyThenCount(bodyweightAccessor, bodyweightFilter.top(Infinity)));
  milesChart.draw(charts.miles, keyThenCount(milesAccessor, milesFilter.top(Infinity)));
  dificultyChart.draw(charts.dificulty, keyThenCount(dificultyAccessor, dificultyFilter.top(Infinity)));
  whitneyChart.draw(charts.whitney, keyThenCount(whitneyAccessor, whitneyFilter.top(Infinity)));
}

function updateCharts() {
  ageChart.update(charts.age, keyThenCount(ageAccessor, ageFilter.top(Infinity)));
  genderChart.update(charts.gender, keyThenCount(genderAccessor, genderFilter.top(Infinity)));
  groupChart.update(charts.group, keyThenCount(groupAccessor, groupFilter.top(Infinity)));
  backpackingChart.update(charts.backpacking, keyThenCount(backpackingAccessor, backpackingFilter.top(Infinity)));
  trainingChart.update(charts.training, keyThenCount(trainingAccessor, trainingFilter.top(Infinity)));
  fitnessChart.update(charts.fitness, keyThenCount(fitnessAccessor, fitnessFilter.top(Infinity)));
  footwearChart.update(charts.footwear, keyThenCount(footwearAccessor, footwearFilter.top(Infinity)));
  packweightChart.update(charts.packweight, keyThenCount(packweightAccessor, packweightFilter.top(Infinity)));
  bodyweightChart.update(charts.bodyweight, keyThenCount(bodyweightAccessor, bodyweightFilter.top(Infinity)));
  milesChart.update(charts.miles, keyThenCount(milesAccessor, milesFilter.top(Infinity)));
  dificultyChart.update(charts.dificulty, keyThenCount(dificultyAccessor, dificultyFilter.top(Infinity)));
  whitneyChart.update(charts.whitney, keyThenCount(whitneyAccessor, whitneyFilter.top(Infinity)));
}


//bar chart classes
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
    .range(barGreens);
  this.bars = this.svg.selectAll('rect')
    .data(data)
    .enter().append("rect")
      .attr('class', chart.name + '-bar')
      .attr('id', function(d){return chart.name + '-' + d.key.replace(/[_\W]+/g, '').split(' ').join('-').toLowerCase(); })
      .attr("x", function(d) { return x(d.key); })
      .attr("y", this.viewBoxHeight)
      .attr("width", this.x.rangeBand())
      .attr("height", 0)
      .style('fill','white')
      .style('stroke','white')
      .on("click", function(d){
        barClick(this, d);
      })
      .on('mouseover', function(d) {
        barTooltipShow(d);
      })
      .on('mouseout', function() {
        tooltipHide();
      })
    .transition()
    .duration(750)
      .attr("height", function(d) { return y(0) - y(d.values); })
      .attr("y", function(d) { return y(d.values); })
      .style('fill', function(d){return colorScale(d.values)})
      .style('stroke','#777');
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
    .range(barGreens);
  this.bars = this.svg.selectAll('.' + chart.name + '-bar')
    .data(data, function(d) { return d.key; });
  this.bars.enter().append("rect")
    .attr('class', chart.name + '-bar')
    .attr('id', function(d){return name + '-' + d.key.replace(/[_\W]+/g, '').split(' ').join('-').toLowerCase(); })
    .attr("x", function(d) { return x(d.key); })
    .attr("y", this.viewBoxHeight)
    .attr("height", 0)
    .attr("width", x.rangeBand())
    .style('fill', 'white')
    .style('stroke','white')
    .on('mouseover', function(d) {
      barTooltipShow(d);
    })
    .on('mouseout', function() {
      tooltipHide();
    })
  .on("click", function(d){
      barClick(this, d);
    });
  this.bars.exit().remove();
  this.bars
    .transition()
    .duration(500)
      .attr("height", function(d) { return y(0) - y(d.values); })
      .attr("y", function(d) { return y(d.values); })
      .style('fill', function(d){return colorScale(d.values)})
      .style('stroke','#777');
}


function barTooltipShow (hoverObj) {
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
    .html('<h4>' + hoverObj.key + '</h4>' + '<p>' + hoverObj.values + ' ' + respondnentText + ' (' + percentFormatter(hoverObj.values / demoRespndents) + ')' + '</p>');
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

function barClick(clickRect, clickObj) {
  switch(clickRect.className.baseVal) {
    case 'age-bar':
      ageFilter.filter(clickObj.key);
      d3.select('#age-clear-btn').style('display','inline-block');
      d3.select('#age-header').text('Age (' + clickObj.key + ')');
      break;
    case 'backpacking-bar':
      backpackingFilter.filter(clickObj.key);
      d3.select('#backpacking-clear-btn').style('display','inline-block');
      d3.select('#backpacking-header').text('Backpacks Last 10 Yrs. (' + clickObj.key + ')');
      break;
    case 'training-bar':
      trainingFilter.filter(clickObj.key);
      d3.select('#training-clear-btn').style('display','inline-block');
      d3.select('#training-header').text('Weekly Training (' + clickObj.key + ')');
      break;
    case 'fitness-bar':
      fitnessFilter.filter(clickObj.key);
      d3.select('#fitness-clear-btn').style('display','inline-block');
      d3.select('#fitness-header').text('Fitness (' + clickObj.key + ')');
      break;
    case 'footwear-bar':
      footwearFilter.filter(clickObj.key);
      d3.select('#footwear-clear-btn').style('display','inline-block');
      d3.select('#footwear-header').text('Footwear (' + clickObj.key + ')');
      break;
    case 'packweight-bar':
      packweightFilter.filter(clickObj.key);
      d3.select('#packweight-clear-btn').style('display','inline-block');
      d3.select('#packweight-header').text('Total Pack Weight (' + clickObj.key + ')');
      break;
    case 'bodyweight-bar':
      bodyweightFilter.filter(clickObj.key);
      d3.select('#bodyweight-clear-btn').style('display','inline-block');
      d3.select('#bodyweight-header').text('Pack % Bodyweight (' + clickObj.key + ')');
      break;
    case 'miles-bar':
      milesFilter.filter(clickObj.key);
      d3.select('#miles-clear-btn').style('display','inline-block');
      d3.select('#miles-header').text('Daily Mileage (' + clickObj.key + ')');
      break;
    case 'dificulty-bar':
      dificultyFilter.filter(clickObj.key);
      d3.select('#dificulty-clear-btn').style('display','inline-block');
      d3.select('#dificulty-header').text('Hike Dificulty Rating (' + clickObj.key + ')');
      break;
  }
  updateCharts();
}

function clearBarClick(filter) {
  switch(filter) {
    case 'age':
      ageFilter.filterAll();
      d3.select('#age-clear-btn').style('display','none');
      d3.select('#age-header').text('Age (All)');
      break;
    case 'backpacking':
      backpackingFilter.filterAll();
      d3.select('#backpacking-clear-btn').style('display','none');
      d3.select('#backpacking-header').text('Backpacks Last 10 Yrs. (All)');
      break;
    case 'training':
      trainingFilter.filterAll();
      d3.select('#training-clear-btn').style('display','none');
      d3.select('#training-header').text('Weekly Training (All)');
      break;
    case 'fitness':
      fitnessFilter.filterAll();
      d3.select('#fitness-clear-btn').style('display','none');
      d3.select('#fitness-header').text('Fitness (All)');
      break;
    case 'footwear':
      footwearFilter.filterAll();
      d3.select('#footwear-clear-btn').style('display','none');
      d3.select('#footwear-header').text('Footwear (All)');
      break;
    case 'packweight':
      packweightFilter.filterAll();
      d3.select('#packweight-clear-btn').style('display','none');
      d3.select('#packweight-header').text('Total Pack Weight (All)');
      break;
    case 'bodyweight':
      bodyweightFilter.filterAll();
      d3.select('#bodyweight-clear-btn').style('display','none');
      d3.select('#bodyweight-header').text('Pack % Bodyweight (All)');
      break;
    case 'miles':
      milesFilter.filterAll();
      d3.select('#miles-clear-btn').style('display','none');
      d3.select('#miles-header').text('Daily Mileage (All)');
      break;
    case 'dificulty':
      dificultyFilter.filterAll();
      d3.select('#dificulty-clear-btn').style('display','none');
      d3.select('#dificulty-header').text('Hike Dificulty Rating (All)');
      break;
  }
  updateCharts();
}


//pie chart classes and functions
var PieChart = function(chart, data) {
  this.viewBoxWidth = 440;
  this.viewBoxHeight = this.viewBoxWidth * 0.49;
  this.chartWidth = $('.chart').width();
  this.chartHeight = this.chartWidth * 0.49;
  this.radius = Math.min(this.viewBoxWidth, this.viewBoxHeight) / 2;
  this.arc = d3.svg.arc()
    .outerRadius(this.radius - 17);
  this.pie = d3.layout.pie()
    .value(function(d){ return d.values; });
  this.svg = d3.select('#' + chart.name + '-pie')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + this.viewBoxWidth + ' ' + this.viewBoxHeight)
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr("transform", "translate(" + this.viewBoxWidth  / 2 + "," + this.viewBoxHeight / 2 + ")");
}

PieChart.prototype.draw = function(chart, data) {
  var colorScale = d3.scale.quantile()
    .domain(data.map(function(d){return d.values}))
    .range(barGreens);
  this.path = this.svg.datum(data).selectAll('path')
    .data(this.pie)
    .enter().append('path')
      .attr('class', chart.name + '-slice')
      .attr('id', function(d){ return chart.name + '-' + d.data.key.replace(/[_\W]+/g, '').split(' ').join('-').toLowerCase(); })
      .style('fill', 'white')
      .style('stroke','white')
      .each(function() { this._current = {startAngle: 0, endAngle: 0}; });
  this.path
    .on("click", function(d){
       pieClick(this, d);
    })
    .on('mouseover', function(d) {
      pieTooltipShow(d);
    })
    .on('mouseout', function() {
      tooltipHide();
    })
    .transition()
    .duration(750)
    .style('fill', function(d){return colorScale(d.data.values)})
    .style('stroke','#777')
    .attrTween("d", arcTween);
    //.attr('d', this.arc)
    //.each(function(d){ this._current = d.data.values; });
}

PieChart.prototype.update = function(chart, data) {
  var colorScale = d3.scale.quantile()
    .domain(data.map(function(d){return d.values}))
    .range(barGreens);
  // add transition to new path
  this.path = this.svg.datum(data).selectAll('path')
    .data(this.pie)
    .transition()
    .duration(500)
    .style('fill', function(d){return colorScale(d.data.values)})
    .style('stroke','#777')
    .attrTween('d', arcTween);
  // add any new paths
  this.path = this.svg.datum(data).selectAll('path')
    .data(this.pie)
    .enter().append("path")
      .attr('class', chart.name + '-slice')
      .attr('id', function(d){ return chart.name + '-' + d.data.key.replace(/[_\W]+/g, '').split(' ').join('-').toLowerCase(); })
      .style('fill', function(d){return colorScale(d.data.values)})
      .style('stroke','#777')
      .on("click", function(d){
        pieClick(this, d);
      })
      .on('mouseover', function(d) {
        pieTooltipShow(d);
      })
      .on('mouseout', function() {
        tooltipHide();
      })
      .attr('d', this.arc)
      .each(function(d){ this._current = d; });
  // remove data not being used
  this.path = this.svg.datum(data).selectAll("path")
    .data(this.pie).exit().remove();
}


function arcTween(a) {
  var arc = d3.svg.arc()
    .outerRadius(90.8);
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function pieTooltipShow (hoverObj) {
  //determine tooltip text
  var respondnentText;
  if(hoverObj.value === 1) {
    respondnentText = ' response';
  } else {
    respondnentText = ' responses';
  }
  //create tooltip
  var tooltip = d3.select('body').append('div')
    .attr('id', 'chart-tooltip')
    .attr('class', 'tooltip');
  tooltip
    .html('<h4>' + hoverObj.data.key + '</h4>' + '<p>' + hoverObj.value + ' ' + respondnentText + ' (' + percentFormatter(hoverObj.value / demoRespndents) + ')' + '</p>');
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

function pieClick(clickRect, clickObj) {
  switch(clickRect.className.baseVal) {
    case 'gender-slice':
      genderFilter.filter(clickObj.data.key);
      d3.select('#gender-clear-btn').style('display','inline-block');
      d3.select('#gender-header').text('Gender (' + clickObj.data.key + ')');
      break;
    case 'group-slice':
      groupFilter.filter(clickObj.data.key);
      d3.select('#group-clear-btn').style('display','inline-block');
      d3.select('#group-header').text('Group Size (' + clickObj.data.key + ')');
      break;
    case 'whitney-slice':
      whitneyFilter.filter(clickObj.data.key);
      d3.select('#whitney-clear-btn').style('display','inline-block');
      d3.select('#whitney-header').text('Exit at Whitney (' + clickObj.data.key + ')');
      break;
  }
  updateCharts();
}

function clearPieClick(filter) {
  switch(filter) {
    case 'gender':
      genderFilter.filterAll();
      d3.select('#gender-clear-btn').style('display','none');
      d3.select('#gender-header').text('Gender (All)');
      break;
    case 'group':
      groupFilter.filterAll();
      d3.select('#group-clear-btn').style('display','none');
      d3.select('#group-header').text('Group Size (All)');
      break;
    case 'whitney':
      whitneyFilter.filterAll();
      d3.select('#whitney-clear-btn').style('display','none');
      d3.select('#whitney-header').text('Exit at Whitney (All)');
      break;
  }
  updateCharts();
}


//chart resize function
$(window).resize(function() {
  var chartWidth = $('.chart').width();
  $('.chart').attr('width', chartWidth);
  $('.chart').attr('height', chartWidth * 0.49);
});


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


//render page
$( document ).ready(function(){
  //setup splash
  d3.selectAll('#jm-signature, #jm-subtitle')
    .transition()
      .duration(1000)
      .style('opacity', .95);
  d3.select('.down-btn')
    .style('display','inline-block');
  d3.select('#us')
    .style('background-color','#e6e6e6');
  //setup map
  drawUSMap(false);
  //setup charts
  genderChart = new PieChart(charts.gender);
  ageChart = new BarChart(charts.age);
  groupChart = new PieChart(charts.group);
  backpackingChart = new BarChart(charts.backpacking);
  trainingChart = new BarChart(charts.training);
  fitnessChart = new BarChart(charts.fitness);
  footwearChart = new BarChart(charts.footwear);
  packweightChart = new BarChart(charts.packweight);
  bodyweightChart = new BarChart(charts.bodyweight);
  milesChart = new BarChart(charts.miles);
  dificultyChart = new BarChart(charts.dificulty);
  whitneyChart = new PieChart(charts.whitney);

  //mouse position event
  $('#geography-section').mouseover(function() {
    if (d3.select('#map-subheader').text().length === 0) {
      d3.select('#map-subheader').text('724 responses (93.8%) came from 42 states and the capital.');
      styleUSMap(stateData);
      drawMapPoints();
    }
  });
  $('#demographics-section').mouseover(function() {
    if (d3.select('#demographics-subheader').text().length === 0) {
      d3.select('#demographics-subheader').text('The charts below are interactive. Click one or more to drill down and explore different groupings (e.g. female and solo).');
      drawCharts();
      $(window).trigger('resize');
    }
  });
  //waypoint events
  $('#to-geography').waypoint(function() {
    if (d3.select('#map-subheader').text().length === 0) {
      d3.select('#map-subheader').text('724 responses (93.8%) came from 42 states and the capital.');
      styleUSMap(stateData);
      drawMapPoints();
    }
  });
  $('#to-demographics').waypoint(function() {
    if (d3.select('#demographics-subheader').text().length === 0) {
      d3.select('#demographics-subheader').text('The charts below are interactive. Click one or more to drill down and explore different groupings (e.g. female and solo).');
      drawCharts();
      $(window).trigger('resize');
    }
  });
  $('.wp1').waypoint(function() {
    $('.wp1').addClass('animated fadeInUp');
    $('.wp2').addClass('animated fadeIn delay-075s');
  }, {
    offset: '75%'
  });
  //smooth scroll
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 900);
        return false;
      }
    }
  });
});
