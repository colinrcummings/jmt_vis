$( document ).ready(function(){
  d3.selectAll('#jm-signature, #jm-subtitle')
    .transition()        
      .duration(1000) 
      .style('opacity', 1);  
});
