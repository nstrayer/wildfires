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
    proj;

var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height)

var canvas = d3.select('#viz').append("canvas")
    .attr("width", width)
    .attr("height", height)

var context = canvas.node().getContext("2d");

// var projection = d3.geo.mercator()
//     .center([0, 5])
//     .scale(150)
//     .rotate([-180,0]);

// var projection = d3.geo.albers()
//     .scale(1000)
//     .translate([width / 2, height / 2]);
//
var projection = d3.geo.orthographic()
    .scale(400)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .rotate([90,-35,8])
    .precision(.1);

// var projection = d3.geo.satellite()
//     .distance(1.1)
//     .scale(5500)
//     .rotate([76.00, -35.50, 32.12])
//     .center([-2, 5])
//     .tilt(25)
//     .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6)
//     .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var energy = d3.scale.linear()
  .range([5,15])

// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")
            .attr("d", path.projection(projection));
  });

var g = svg.append("g");

//Set up the queue so that all the stuff shows up at the same time. Also, the code is cleaner
queue()
    .defer(d3.json,"data/world-110m2.json")
    .defer(d3.csv,"data/fires.csv")
    .await(ready);

//define the function that gets run when the data are loaded.
function ready(error, topology, fires){

    sureFires = []
    fires.forEach(function(d){
        d.latitude = +d.latitude
        d.longitude = +d.longitude
        d.confidence = +d.confidence
        d.frp = +d.frp

        if (d.confidence > 90 && d.frp > 200){
          sureFires.push(d)
        }
    })
    fires = sureFires
    energy.domain(d3.extent(fires, function(d){return d.frp}))

    drawCanvas(fires);

    var countries = topojson.feature(topology, topology.objects.countries).features
    g.selectAll("path")
          .data(countries)
        .enter()
          .append("path")
          .attr("d", path)


    canvas.call(d3.behavior.drag()
      .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
      .on("drag", function() {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        g.selectAll("path").attr("d", path);
        drawCanvas(fires);

      }));

    // canvas.call(zoom);
}

function drawCanvas(data) {

  // clear canvas
  context.fillStyle = "#fff";
  context.clearRect(0,0,canvas.attr("width"),canvas.attr("height"));
  context.fill();

  data.forEach(function(d){
      proj = projection([d.longitude,d.latitude])

      context.beginPath();
      context.arc(proj[0], proj[1], energy(d.frp), 0,2*Math.PI);
      context.globalAlpha = 0.4;
      context.fillStyle="red";
      context.fill();
      context.closePath();
  })
}
