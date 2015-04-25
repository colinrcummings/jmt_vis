$( document ).ready(function(){
  d3.selectAll('#jm-signature, #jm-subtitle')
    .transition()        
      .duration(1000) 
      .style('opacity', 1);  
  d3.select('.down-btn')
    .style('display','inline-block');
});
