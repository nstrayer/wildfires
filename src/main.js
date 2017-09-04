// main script for viz

import {conventions} from 'd3-jetpack';
import {select, extent} from 'd3';
import {scaleLinear,scaleLog, scaleSequential} from 'd3-scale';
import {interpolateRdBu} from 'd3-scale-chromatic';
import {csv} from 'd3-fetch';
import {setupMap} from './setupMap';
import {getScale} from './getScale';
import {drawLegend} from './drawLegend';

const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const dataURL = 'https://firms.modaps.eosdis.nasa.gov/active_fire/viirs/text/VNP14IMGTDL_NRT_USA_contiguous_and_Hawaii_48h.csv';

csv(proxyUrl + dataURL, (d) => ({
  lat: +d.latitude,
  lon: +d.longitude,
  brightness: +d.bright_ti4,
  power: +d.frp,
  date: d.acq_date,
  time: +d.acq_time,
  confidence: d.confidence,
})).then((fireDataFull) => {
  // remove loading message
  select("#loading").remove();
  
  const fireData = fireDataFull
   .filter(d => d.confidence !== 'low' && d.power > 100);

  const powerScale = scaleLinear()
    .domain([50,2500])
    .range([5,25]);
    
  const colorScale = scaleLinear()
    .domain(extent(fireData, (d) => d.brightness))
    .range(['#fee08b', '#b2182b']);
  
  //Setup mapbox-gl map
  const map = setupMap('map');
  
  // Setup our svg layer that we can manipulate with d3
  const container = map.getCanvasContainer();
  const mapCanvas = select(container).select('canvas');
  
  const c = conventions({
    parentSel: select(container),
    totalWidth: container.offsetWidth,
    margin: {left: 0, right: 0, top: 0, bottom: 0}
  });
  
  // draw legend
  const legendG = drawLegend(c, powerScale, colorScale);
  
  const renderFires = (fireData) => {
    const scale = getScale(map);
    const height = +mapCanvas.style('height').replace('px','');
    const width = +mapCanvas.style('width').replace('px','');
    
    // make sure legend stays in bottom left
    legendG.translate([width - 150, height - 200]);
    
    // Bind data
    const fires = c.svg.selectAll('circle.fire').data(fireData);
    
    fires.enter()
      .append('circle.fire')
      .st({
        fill: (d) => colorScale(d.brightness),
        fillOpacity: 0.5,
      })
      .merge(fires)
      .at({
        cx: (d) => scale([d.lon, d.lat])[0], 
        cy: (d) => scale([d.lon, d.lat])[1],
        r:  (d) => powerScale(d.power),
      });
  };
  
  // re-render our visualization whenever the view changes
  map.on("viewreset", () => renderFires(fireData) );
  map.on("move", () => renderFires(fireData) );
  
  // render our initial visualization
  renderFires(fireData);
  
  const aboutSection = select('#description');
  
  aboutSection.on('click', function(){
    const aboutDiv = select(this);
    const bodyDiv = aboutDiv.select('#aboutBody');
    const opened = bodyDiv.classed('hidden');
    aboutDiv.classed('shrunk', !opened);
    select('.fa-expand').classed('hidden', opened);
    select('.fa-compress').classed('hidden', !opened);
    
    bodyDiv.attr('class', opened ? '': 'hidden' );
    
  });
  
}); // closes data loading


