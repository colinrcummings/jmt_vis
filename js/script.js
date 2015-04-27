//global vars
var geoRespondents = 772;
var stateData;
var countryData;
var percentFormatter = d3.format(".1%");

//load state data
d3.csv('data/jmt_2014_us_by_state.csv', function(data) {
  data.forEach(function(d){
    d.state_code = d.state_code;
    d.count = +d.count;
  })
  stateData = data;
});

//load country data
d3.csv('data/jmt_2014_us_by_country.csv', function(data) {
  data.forEach(function(d){
    d.country_code = d.country_code;
    d.count = +d.count;
  })
  countryData = data;
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
