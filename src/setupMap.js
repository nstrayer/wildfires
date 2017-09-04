// setup mapbox map

import mapboxgl from 'mapbox-gl';

export function setupMap(destinationID = 'map'){
  mapboxgl.accessToken = 'pk.eyJ1IjoibnN0cmF5ZXIiLCJhIjoiY2lwaGN3ZzJoMDE0YnRsbWRkbnhqaGZ2eSJ9.8cnHebILbPFV3oK_e_A8Fw';
 
  //Setup mapbox-gl map
  const map = new mapboxgl.Map({
    container: destinationID, // container id
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-119.577,38.693],
    zoom: 3.1,
  });
  
  //map.scrollZoom.disable();
  
  // disable map rotation using right click + drag
  map.dragRotate.disable();
  map.touchZoomRotate.disable();

  //map.addControl(new mapboxgl.Navigation());
  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-right');
  
  return map;
}
