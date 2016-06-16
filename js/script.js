var width = parseInt(d3.select("#viz").style("width").slice(0, -2)),
    confLevel = 95,
    sizeVal = 300,
    sizeDomain = [0,0],
    sizeRange = [3,25],
    brightnessRange = ["#4575b4", "#d73027"],
    brightnessDomain = [0,0],
    mapStyle = "mapbox://styles/mapbox/light-v9";

    mapboxgl.accessToken = "pk.eyJ1IjoibnN0cmF5ZXIiLCJhIjoiY2lwaGN3ZzJoMDE0YnRsbWRkbnhqaGZ2eSJ9.8cnHebILbPFV3oK_e_A8Fw";

//Function to make sure the fire data is nice and proper.
function dataClean(rawData, confCutOff, sizeCutOff){
    sureFires = []
    rawData.forEach(function(d){
        d.latitude   = +d.latitude
        d.longitude  = +d.longitude
        d.confidence = +d.confidence
        d.frp        = +d.frp

        if (d.confidence >= confCutOff && d.frp >= sizeCutOff){
          sureFires.push(d)
        }
    })
    return sureFires;
}

// Setup mapbox-gl map
var map = new mapboxgl.Map({
    container: 'viz', // container id
    style: mapStyle,
    center: [-95.977, 41.706],
    zoom: 3
})
// map.scrollZoom.disable()
// map.addControl(new mapboxgl.Navigation());

// Setup our svg layer that we can manipulate with d3
var container = map.getCanvasContainer()
var svg = d3.select(container).append("svg")

function project(d) { return map.project(getLL(d)); }
function getLL(d) { return new mapboxgl.LngLat(+d.longitude, +d.latitude) }

var energy = d3.scale.linear()
  .range(sizeRange)

var brightness = d3.scale.linear()
  .range(brightnessRange)

function render() {
    var dots = svg.selectAll("circle.dot")
      .data(fires,function(d){ return d.bright_t31 + d.frp + d.acq_date})

    dots.exit()
        .transition().duration(1000)
        .attr("r", 1)
        .remove()

    dots.enter().append("circle").classed("dot", true)
        .attr("r", 1)
        .attr("fill", function(d){return brightness(d.brightness)})
        .attr("fill-opacity", "0.5")
        .transition().duration(1000)
        .attr("r", function(d){return energy(d.frp)}  );

    dots
    .attr({
      cx: function(d) {
        var x = project(d).x;
        return x
      },
      cy: function(d) {
        var y = project(d).y;
        return y
      },
    })
}

d3.csv("data/fires.csv", function(err, data) {

    rawData = dataClean(data, 0, 1); //We gotta remove the data that has zero size. So not really "rawData" but whatevs.
    fires   = dataClean(rawData, confLevel, 300)

    //Calculate the scales for size and brightness
    //We have to save the extents for the legend.
    brightnessDomain = d3.extent(rawData, function(d){return +d.frp})
    energy.domain(brightnessDomain)
    sizeDomain = d3.extent(rawData, function(d){return +d.brightness})
    brightness.domain(sizeDomain)

    drawLegend() //draw our legend.

    // re-render our visualization whenever the view changes
    map.on("viewreset", function() {
        render()
    })
    map.on("move", function() {
        render()
    })
    // render our initial visualization
    render()
    })

// =========================================================
// Slider stuff
// =========================================================
//Confidence Slider

var confidence = document.getElementById('confValue');

noUiSlider.create(confidence, {
	start: 95,
	range: { min: 0, max: 100 },
	pips: { mode: 'values', values: [5, 50, 95], density: 4 }
});

var tipHandles = confidence.getElementsByClassName('noUi-handle'),
	   tooltips = [];

// Add divs to the slider handles.I hate how clunky this is. Maybe submit a pr to the repo?
for ( var i = 0; i < tipHandles.length; i++ ){
	tooltips[i] = document.createElement('div');
	tipHandles[i].appendChild(tooltips[i]);
}

confidence.noUiSlider.on('update', function(values, handle, unencoded){ //what to do when the slider is moved.
        tooltips[handle].innerHTML = Math.round(values[handle],1) + "%";
    })

confidence.noUiSlider.on('change', function(values, handle, unencoded){ //what to do when the slider is dropped.
        confLevel = Math.round(+values,1)
        fires = dataClean(rawData, confLevel, sizeVal) //re-filter data
        render() //draw it again.
    })


// =========================================================
// Size Slider
// =========================================================
var size = document.getElementById('sizeValue');

noUiSlider.create(size, {
	start: 300,
    range: {
		'min': [ 0 ],
		'30%': [ 150 ],
        '50%': [ 350 ],
		'70%': [ 500 ],
		'max': [ 6900 ]
	},
	pips:  { mode: 'values', values: [15, 350, 6800], density: 4 }
});

var tipHandles2 = size.getElementsByClassName('noUi-handle'),
	  tooltips2 = [];

// Add divs to the slider handles.I hate how clunky this is. Maybe submit a pr to the repo?
for ( var i = 0; i < tipHandles2.length; i++ ){
	tooltips2[i] = document.createElement('div');
	tipHandles2[i].appendChild(tooltips2[i]);
}

size.noUiSlider.on('update', function(values, handle, unencoded){ //what to do when the slider is moved.
    tooltips2[handle].innerHTML = Math.round(values[handle],1);
})

size.noUiSlider.on('change', function(values, handle, unencoded){ //what to do when the slider is dropped.
    sizeVal = Math.round(+values,1)
    fires = dataClean(rawData, confLevel, sizeVal) //re-filter data
    render()
})

//==================================================================================
//Legend stuffs:
//==================================================================================
function drawLegend(){

    var sideLength = 150;

    //set up the data
    var legendData = [
        {brightnessDomain: brightnessDomain[0], brightnessRange: brightnessRange[0],
        sizeDomain: sizeDomain[0], sizeRange: sizeRange[0]
        },
        {brightnessDomain: brightnessDomain[1], brightnessRange: brightnessRange[1],
        sizeDomain: sizeDomain[1], sizeRange: sizeRange[1]
        }];

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", sideLength)
        .attr("width", sideLength)
        .attr("transform", "translate(" + (width - 180) +  "," + 15 + ")scale(1)")
        // .attr("transform", "translate(" + (width - 50) +  "," + 20 + ")scale(0.2)")
        .on("click", clicked)

    legend.append("rect")
        .attr("height", sideLength)
        .attr("width", sideLength)
        .attr("rx", 15)
        .attr("ry", 15)
        .attr("fill", "#aaa")
        .attr("fill-opacity", 0.9)
        .style("stroke-width", "2px")
        .style("stroke", "black")

    legend.selectAll("legendPoint")
        .data(legendData)
        .enter().append("g")
        .attr("transform", function(d,i){
            return "translate(" + xChooser(i) +  "," + sideLength/2 + ")"
        })
        .each(function(d,i){

            d3.select(this).append("line")
                .attr("y1",  (50 - 3))
                .attr("y2", -(50 - 3))
                .style({
                    "stroke":"black",
                    "stroke-width": 1,
                    "fill-opacity": 0.5
                })

            d3.select(this).append("circle")
                .attr("r",   d.sizeRange)
                .attr("fill", d.brightnessRange)

            d3.select(this).append("text")
                .attr("y", 60)
                .attr("text-anchor", "middle")
                .text(d.brightnessDomain + " K")

            d3.select(this).append("text")
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .text(d.sizeDomain + " MW")

        })

    function xChooser(i){
        return i == 0 ? sideLength/2 - 40 : sideLength/2 + 40
    }
}



function clicked(){
    //add expand functionality here.
    if(!legendOpen){
        d3.select(this).transition()
            .attr("transform", "translate(" + (width - 180) +  "," + 20 + ")scale(1)")

        d3.selectAll(".legendCover").attr("fill-opacity", 0)
        legendOpen = true
    } else {
        d3.select(this).transition()
            .attr("transform", "translate(" + (width - 50) +  "," + 20 + ")scale(0.2)")
            .each("end", function(){d3.selectAll(".legendCover").attr("fill-opacity", 1)})

        legendOpen = false
    }
}


//
// legend.append("rect")
//     .attr("height", 100)
//     .attr("width", 100)
//     .attr("rx", 15)
//     .attr("ry", 15)
//     .attr("fill", "#aaa")
//     .attr("fill-opacity", 0.9)
//     .style("stroke-width", "2px")
//     .style("stroke", "black")
//
//
//
// function clicked(){
//     //add expand functionality here.
//     if(!legendOpen){
//         d3.select(this).transition()
//             .attr("transform", "translate(" + (width - 180) +  "," + 20 + ")scale(1)")
//
//         d3.selectAll(".legendCover").attr("fill-opacity", 0)
//         legendOpen = true
//     } else {
//         d3.select(this).transition()
//             .attr("transform", "translate(" + (width - 50) +  "," + 20 + ")scale(0.2)")
//             .each("end", function(){d3.selectAll(".legendCover").attr("fill-opacity", 1)})
//
//         legendOpen = false
//     }
// }
//
//
// var legendEdge = 140;
// function xChooser(i){
//     if(i == 0){
//         return legendEdge/2 - 35
//     } else {
//         return legendEdge/2 + 35
//     }
// }
// var legendOpen = false;
//
// var legend = svg.append("g")
//     .attr("class", "legend")
//     .attr("height", legendEdge)
//     .attr("width", legendEdge)
//     .attr("transform", "translate(" + (width - 50) +  "," + 20 + ")scale(0.2)")
//     .on("click", function(){})
//
// legend.append("rect")
//     .attr("height", legendEdge )
//     .attr("width", legendEdge)
//     .attr("rx", 15)
//     .attr("ry", 15)
//     .attr("fill", "#aaa")
//     .attr("fill-opacity", 0.9)
//     .style("stroke-width", "2px")
//     .style("stroke", "black")
//
// legend.selectAll(".legendCirc")
//     .data(sizeRange).enter()
//     .append("circle")
//     .attr("r", function(d){return d})
//     .attr("cx", function(d,i){return xChooser(i)})
//     .attr("cy", function(d){return (legendEdge * (2/5)) - d})
//
// legend.selectAll(".legendCirc")
//     .data(brightnessRange).enter()
//     .append("circle")
//     .attr("r", 20)
//     .attr("cx", function(d,i){return xChooser(i) })
//     .attr("cy", legendEdge * (4/5) - 17 )
//     .attr("fill", function(d){return d})
//
// //draw values for the legend:
// var sizeText = legend.selectAll(".sizeValue")
//     .attr("class", "sizeValue")
//     .data(sizeDomain).enter()
//     .append("text")
//     .attr("x", function(d,i){return xChooser(i) })
//     .attr("y", legendEdge * (2/5) + 15)
//     .text("")
//     .attr("text-anchor", "middle")
//     .attr("font-family", "optima")
//     .attr("font-size", 11)
//
// //draw values for the legend:
// var brightText = legend.selectAll(".brightnessValue")
//     .attr("class", "brightnessValue")
//     .data(brightnessDomain).enter()
//     .append("text")
//     .attr("x", function(d,i){return xChooser(i) })
//     .attr("y", legendEdge * (4/5) + 15 )
//     .text("")
//     .attr("text-anchor", "middle")
//     .attr("font-family", "optima")
//     .attr("font-size", 11)
//
// legend.append("rect")
//     .attr("class", "legendCover")
//     .attr("height", legendEdge )
//     .attr("width",  legendEdge )
//     .attr("rx", 15)
//     .attr("ry", 15)
//     .attr("fill", "#aaa")
//     .attr("fill-opacity", 1)
//     .style("stroke-width", "2px")
//     .style("stroke", "black")
//
// legend.append("text")
//     .attr("class", "legendCover")
//     .attr("x", legendEdge )
//     .attr("y", legendEdge + 65 )
//     .attr("text-anchor", "end")
//     .attr("font-size", 75)
//     .attr("font-family", "optima")
//     .text("Click for legend")
