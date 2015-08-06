d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var width = parseInt(d3.select("#viz").style("width").slice(0, -2)),
    height = $(window).height() - 85,
    padding = 20,
    firstTime = true;

var svg = d3.select("#viz").append("svg")
    .attr("width", width)
    .attr("height", height)

var canvas = d3.select('#viz').append("canvas")
    .attr("width", width)
    .attr("height", height)

var context = canvas.node().getContext("2d");

// var projection = d3.geo.mercator()
//     .center([0, 5 ])
//     .scale(150)
//     .rotate([-180,0]);

var projection = d3.geo.orthographic()
    .scale(320)
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("circle")
            .attr("d", path.projection(projection))
            .attr("r", 5/zoom.scale());
        g.selectAll("path")
            .attr("d", path.projection(projection));
  });

var g = svg.append("g");

//Set up the queue so that all the stuff shows up at the same time. Also, the code is cleaner
queue()
    .defer(d3.json,"data/world-110m2.json")
    .defer(d3.csv,"data/world.csv")
    .await(ready);

//define the function that gets run when the data are loaded.
function ready(error, topology, fires){

    fires.forEach(function(d){
        d.latitude = +d.latitude
        d.longitude = +d.longitude
        var proj = projection([d.longitude,d.latitude])

        context.beginPath();
        context.arc(proj[0], proj[1],2, 0,2*Math.PI);
        context.globalAlpha = 0.4;
        context.fillStyle="red";
        context.fill();
        context.closePath();
    })

    console.log(fires.length)
    var countries = topojson.feature(topology, topology.objects.countries).features
    g.selectAll("path")
          .data(countries)
        .enter()
          .append("path")
          .attr("d", path)

    svg.call(zoom);
}
