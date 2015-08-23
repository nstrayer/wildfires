d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var width = parseInt(d3.select("#viz").style("width").slice(0, -2)),
    height = $(window).height() - 85,
    padding = 20,
    firstTime = true,
    sens = 0.25,
    proj,
    countries;

var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height)

var canvas = d3.select('#viz').append("canvas")
    .attr("width", width)
    .attr("height", height)

var context = canvas.node().getContext("2d");

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2])

var path = d3.geo.path()
    .projection(projection);

var circle = d3.geo.circle();

var energy = d3.scale.linear()
  .range([2,20])

// zoom and pan
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 25])
    .on("zoom",function() {
        move();
        g.selectAll("circle")
           .attr("d", path.projection(projection))
           .attr("r", function(d){return energy(d.frp)/zoom.scale()}  );
    });

var g = svg.append("g");

//Set up the queue so that all the stuff shows up at the same time. Also, the code is cleaner
queue()
    .defer(d3.json,"data/us-10m.json")
    .defer(d3.csv,"data/fires.csv")
    .await(ready);

function dataClean(rawData, confCutOff, sizeCutOff){
    sureFires = []
    rawData.forEach(function(d){
        d.latitude   = +d.latitude
        d.longitude  = +d.longitude
        d.confidence = +d.confidence
        d.frp        = +d.frp

        if (d.confidence > confCutOff && d.frp > sizeCutOff){
          sureFires.push(d)
        }
    })
    console.log(sureFires.length)
    return sureFires;
}

//define the function that gets run when the data are loaded.
function ready(error, us, fires){

    fires = dataClean(fires, 95, 300)

    energy.domain(d3.extent(fires, function(d){return d.frp}))

    g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);

    g.selectAll("circle")
      .data(fires).enter()
      .append("circle")
      .attr("cx", function(d){return projection([d.longitude,d.latitude])[0]  })
      .attr("cy", function(d){return projection([d.longitude,d.latitude])[1]  })
      .attr("r", function(d){return energy(d.frp)})
      .attr("fill", "red")
      .attr("fill-opacity", "0.2")
    // drawCanvas(fires);

    canvas.call(zoom);
}

function move() {
  var t = d3.event.translate,
      s = d3.event.scale;
  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
  zoom.translate(t);
  g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}

// function drawCanvas(data) {
//   // clear canvas
//   context.fillStyle = "#fff";
//   context.clearRect(0,0,canvas.attr("width"),canvas.attr("height"));
//   context.fill();
//
//   data.forEach(function(d){
//       proj = projection([d.longitude,d.latitude])
//
//       context.beginPath();
//       context.arc(proj[0], proj[1],2, 0,2*Math.PI);
//       context.globalAlpha = 0.4;
//       context.fillStyle="red";
//       context.fill();
//       context.closePath();
//   })
// }
var confidence = document.getElementById('confValue');

noUiSlider.create(confidence, {
	start: 50,
	range: {
		min: 0,
		max: 100
	},
	pips: {
		mode: 'values',
		values: [20, 80],
		density: 4
	}
});

var tipHandles = confidence.getElementsByClassName('noUi-handle'),
	   tooltips = [];

// Add divs to the slider handles.I hate how clunky this is. Maybe submit a pr to the repo?
for ( var i = 0; i < tipHandles.length; i++ ){
	tooltips[i] = document.createElement('div');
	tipHandles[i].appendChild(tooltips[i]);
}

confidence.noUiSlider.on('update', function(values, handle, unencoded){ //what to do when the slider is moved.
        tooltips[handle].innerHTML = Math.round(values[handle],1);
    })

confidence.noUiSlider.on('change', function(values, handle, unencoded){ //what to do when the slider is dropped.
        console.log(Math.round(+values,1))
    })
