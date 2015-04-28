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
  footwearFilter,
  fitnessFilter;
//accessor functions
var genderAccessor = function(a) {return a.gender;};
var ageAccessor = function(a) {return a.age_bin;};
var groupAccessor = function(a) {return a.group_size;};
var footwearAccessor = function(a) {return a.footwear;};
var fitnessAccessor = function(a) {return a.fitness;};
//formatting functions
var percentFormatter = d3.format(".1%");


//load data
d3.csv('data/jmt_2014_us_by_state.csv', function(data) {
  data.forEach(function(d){
    d.state_code = d.state_code;
    d.count = +d.count;
  })
  stateData = data;
});

d3.csv('data/jmt_2014_us_by_country.csv', function(data) {
  data.forEach(function(d){
    d.country_code = d.country_code;
    d.count = +d.count;
  })
  countryData = data;
});

d3.csv('data/jmt_2014_demographic_data.csv', function(data) {
  //update globals
  demoRespndents = data.length;
  //set crossfilter object
  demoCrossFilter = crossfilter(data);
  //update crossfilter filters
  genderFilter = demoCrossFilter.dimension(genderAccessor);
  ageFilter = demoCrossFilter.dimension(ageAccessor);
  groupFilter = demoCrossFilter.dimension(groupAccessor); 
  footwearFilter = demoCrossFilter.dimension(footwearAccessor);
  fitnessFilter = demoCrossFilter.dimension(fitnessAccessor);  
});


//setup page
$( document ).ready(function(){
  //default view
  d3.selectAll('#jm-signature, #jm-subtitle')
    .transition()        
      .duration(1000) 
      .style('opacity', .95);  
  d3.select('.down-btn')
    .style('display','inline-block');
  d3.select('#us')
    .style('background-color','#e6e6e6');
  drawUSMap(false);

  //waypoints
  $('#to-geography').waypoint(function() {
    if (d3.select('#map-subheader').text().length === 0) {
      d3.select('#map-subheader').text('724 responses (93.8%) came from 42 states and the capital.');
      styleUSMap(stateData); 
      drawMapPoints();
    }
  });
  $('.wp1').waypoint(function() {
    $('.wp1').addClass('animated fadeInUp');
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
