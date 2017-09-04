// draw a legend based on our scales for color and size
import {legendSize, legendColor} from 'd3-svg-legend';

export function drawLegend(c, powerScale, colorScale){
  
  const sizeLegend = legendSize()
    .title('Power (MW)')
    .scale(powerScale)
    .shape('circle')
    .shapePadding(15)
    .labelOffset(20)
    .orient('vertical');
    
  const colorMax = colorScale.domain()[1];
  const colorMin = colorScale.domain()[0];
  const colorFifth = (colorMax - colorMin) / 5;
  
  const colorLegend = legendColor()
    .title('Temperature (k)')
    .shapeWidth(30)
    .shapePadding(12)
    .cells([
      colorMin, 
      colorMin + colorFifth, 
      colorMin + 2*colorFifth, 
      colorMin + 3*colorFifth,
      colorMin + 4*colorFifth,
      colorMax
    ])
    .orient('vertical')
    .scale(colorScale);

  
  const legendG = c.svg.selectAppend("g.legends")
    .translate([c.width - 150, c.height]);
    
  const sizeG = legendG.selectAppend('g.sizeLegend')
    .translate([-50,0])
    .call(sizeLegend);
    
  const colorG = legendG.selectAppend('g.colorLegend')
    .translate([50,0])
    .call(colorLegend);
    
  return legendG;
}