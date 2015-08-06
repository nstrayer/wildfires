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

var projection = d3.geo.albers()
    .scale(width*0.95)
    .translate([ width/ 2, height / 2]);

// var projection = d3.geo.mercator()
//     .center([0, 5 ])
//     .scale(200)
//     .rotate([-180,0]);

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
    .defer(d3.json,"data/us-10m.json")
    .defer(d3.csv,"data/fires.csv")
    .await(ready);

//define the function that gets run when the data are loaded.
function ready(error, us, fires){

    fires.forEach(function(d){
        d.latitude = +d.latitude
        d.longitude = +d.longitude
    })

    g.append("g")
          .attr("id", "states")
        .selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
          .attr("d", path)

    g.append("path")
      .datum(topojson.mesh(us, us.objects.states))
      .attr("id", "state-borders")
      .attr("d", path);


    g.selectAll("circle")
        .data(fires).enter()
        .append("circle")
        .attr("cx", function(d){return projection([d.longitude,d.latitude])[0]  })
        .attr("cy", function(d){return projection([d.longitude,d.latitude])[1]  })
        .attr("r", 5)
        .attr("fill", "red")
        .attr("fill-opacity", "0.5")
        .each(pulse)

    svg.call(zoom);
}

function pulse(d,i) {
    var circle = d3.select(this);
    (function repeat() {
        circle = circle.transition()
            .duration(500)
            .attr("stroke-width", 20)
            .attr("r", 3)
            .transition()
            .ease('linear')
            .duration(500)
            .attr('stroke-width', 0.5)
            .attr("r", 10)
            .ease('linear')
            .each("end", repeat);
    })();
}
