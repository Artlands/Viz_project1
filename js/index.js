//This javascript is using D3.V5 library

// Width and height, height2 is for slider
var margin = {top:20, right:200, bottom: 100, left: 50},
    margin2 = {top: 450, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseTime = d3.timeParse("%Y"),
    bisectDate = d3.bisector( d => d.date).left;

// Set up scales
var xScale = d3.scaleTime().range([0, width]),
    xScale2 = d3.scaleTime().range([0, width]),
    xScale3 = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom(xScale)
              .tickSize(-height),
    xAxis2 = d3.axisBottom(xScale2)
               .ticks(d3.timeYear.every(5)),
    xAxis3 = d3.axisBottom(xScale3)
               .ticks(d3.timeYear.every(1))
               .tickSize(-height2)
               .tickFormat( () => null ),
    yAxis = d3.axisLeft(yScale)
              .tickSize(-width)
              .tickFormat(d3.format(".2f"));

// Define the line
var line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.rating))
    .curve(d3.curveMonotoneX)
    .defined(d => !isNaN(d.rating));// Hiding line value for missing data

// For Comparision area
var line0 = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.rating0))
    .curve(d3.curveMonotoneX)
    .defined( d=> ! isNaN(d.rating0));

var area0 = d3.area()
    .x(line0.x())
    .y1(line0.y())
    .curve(d3.curveMonotoneX)
    .defined( line0.defined());

var line1 = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.rating1))
    .curve(d3.curveMonotoneX)
    .defined( d=> ! isNaN(d.rating1));

var area1 = d3.area()
    .x(line1.x())
    .y1(line1.y())
    .curve(d3.curveMonotoneX)
    .defined( line1.defined());

// Store the Max and Min value of rating.
var maxY, minY;

// Comparison Flag and dataset
var comparision = false,
    dataSelect = new Set(),
    dataSelectArr = [],
    temp = -1,
    cmpdata = [];

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create invisible rect for mouse tracking
svg.append("rect")
   .attr("width", width)
   .attr("height", height)
   .attr("x", 0)
   .attr("y", 0)
   .attr("id", "mouse-tracker")
   .style("fill", "none");

// --------------------------For slider part--------------------------
var context = svg.append("g")
                 .attr("class", "context")
                 .attr("transform", "translate(" + 0 + "," + 410 + ")");

// Append clip path for lines plotted, hiding those part out of bounds
svg.append("defs")
   .append("clipPath")
   .attr("id", "clip")
   .append("rect")
   .attr("width", width)
   .attr("height", height);
// --------------------------End slider part--------------------------

// 11 Custom colors
var color = d3.scaleOrdinal().range(["#48A36D", "#80CEAA", "#7EC4CF",  "#809ECE", "#9E81CC", "#CE80B0", "#d41c00", "#E37756", "#E2AA59","#e3e335", "#ffffff"]);

// Read data from csv file and preprocess it
d3.csv("data/Data.csv"). then( data => {

  // Sort country names, put world in the last place
  var countries = data
                .filter(d =>!(("columns" in d) || (d["Country Name"] === "World")))
                .sort((a,b) => {
                  var x = a["Country Name"],
                      y = b["Country Name"];
                  return (x < y)? -1 : 1;
                });
  var world = data.filter(d => d["Country Name"] === "World");

  var dataset = countries.concat(world);
  var dateArr;

  dataset = dataset.map(d => {
    dateArr = Object.keys(d)
              .filter( d => d !== "Country Name" && d !== "Series Name");
    // console.log(dateArr);
    return {
      name: d["Country Name"],
      values:dateArr.map( i => {
        return {
          date: parseTime(i),
          rating: +d[i]
        };
      }),
      visible: (d["Country Name"] === "World" )
    };
  });
  // console.log(dataset);

  // Add visible item index to dataSelect
  dataSelect.add(10);

  // Match a color to a country
  color.domain(dataset.map(d => d.name));

  //yMin, yMax
  var yMin = d3.min(dataset, d => d3.min(d.values, v => v.rating)),
      yMax = d3.max(dataset, d => d3.max(d.values, v => v.rating));

  xScale.domain(d3.extent(dateArr.map(d => parseTime(d))));
  yScale.domain([yMin, yMax]);
  // Setting a duplicate xdomain for burshing reference
  xScale2.domain(xScale.domain());
  xScale3.domain(xScale.domain());

// --------------------------For slider part--------------------------
  var brush = d3.brushX()
                .extent([[0,0], [width, height2]])
                .on("brush", brushing)
                .on("end", brushended);

  // Create brushing xAxis
  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);
  context.append("g")
      .attr("class", "axis axis--grid")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis3);
  context.append("g")
         .attr("class", "brush")
         .call(brush);
// --------------------------End slider part--------------------------

  //Draw line graph
  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis);

  svg.append("g")
     .attr("class", "y axis")
     .call(yAxis);

  svg.append("g")
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 4)
     .attr("x", -8)
     .attr("dy", "0.7em")
     .style("text-anchor", "end")
     .text("GDP growth (annual %)");

 // Draw focus
  var focus = svg.append("g")
        .attr("class", "circle")
        .style("display", "none")
        .attr("pointer-events", "none");
  focus.append("circle")
        .attr("r", 5);

 // create a tooltip
  var Tooltip = d3.select("body")
      .append("div")
      .style("display", "none")
      .attr("class", "tooltip")

  // Create areas variable
  var areas;

 // Draw Line
  var lines = svg.selectAll(".line-group")
      .data(dataset)
      .enter()
      .append("g")
      .attr("clip-path", "url(#clip)")
      .attr("class", "line-group")
      .attr("id", d => "line-" + d.name.replace(" ", ""));

  lines.append("path")
      .attr("class", "line")
      .attr("d", d => d.visible? line(d.values) : null)
      .style("stroke", d => color(d.name))
      .on("mouseover", function(d) {
          d3.selectAll('.line').style("opacity", 0.2);
          d3.select(this).style("opacity", 1).style("stroke-width", "2.5px");
          d3.selectAll(".legend").style("opacity", 0.2);
          d3.select("#leg-" + d.name.replace(" ","")).style("opacity", 1);

          // Show circle
          var x0 = xScale.invert(d3.mouse(this)[0]),
              x1 = d3.timeYear.round(x0),
              i = bisectDate(d.values, x1);
          focus.attr("transform", "translate(" + xScale(x1) + "," + yScale(d.values[i].rating) + ")"); // Find position
          focus.style("display", null);
          focus.selectAll("circle")
              .attr("fill", color(d.name));

          // Show tooltip
          Tooltip.style("display", null)
              .html( "<strong>" + d.name + "</strong>" + "<br>"
                  + " GDP Growth in " + "<strong>" + d.values[i].date.getFullYear() + "</strong> :" + "<br>"
                  + "<strong>" + d.values[i].rating.toFixed(2) + "%" + "</strong>" )
              .style("left", (d3.mouse(this)[0]+70) + "px")
              .style("top", (d3.mouse(this)[1]) + "px");
       })
      .on("mouseout", function() {
          d3.selectAll('.line').style("opacity", 1);
          d3.select(this).style("stroke-width", "1.5px");
          d3.selectAll(".legend").style("opacity", 1);
          focus.style("display", "none");

          // Hide tooltip
          Tooltip.style("display", "none")
       });

  // Draw legend
  var legendSpace = height/(dataset.length + 1);
  var legend = svg.selectAll('.legend')
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("id", d => "leg-" + d.name.replace(" ", ""));

  legend.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", width + (margin.right/3) - 25)
      .attr("y", (d, i) => (i + 1/2) * legendSpace - 4)
      .attr("fill", d => d.visible? color(d.name) : "#A1A1A1")
      .attr("class", "legend-box")
      .on("click", (d, i) => {
          // Show the line that has been hide
          if(temp !== -1) {
              d3.select("#line-" + dataset[temp].name.replace(" ", "")).attr("display", null);
          }

          d.visible = ! d.visible;

          //update dataSelect set
          if (d.visible) {
              dataSelect.add(i);
          }
          else {
              dataSelect.delete(i);
          }

          if(dataSelect.size === 2 ) {
              d3.selectAll(".comparision-btn")
                  .transition()
                  .attr("opacity", 1);
          } else {
              if(!svg.select(".area-group").empty()) areas.remove();
              comparision = false;
              d3.selectAll(".comparision-btn")
                  .transition()
                  .attr("opacity", 0);
          }

          // Update appearance of comparision button
          d3.select("#comparision-btn-left")
              .transition()
              .attr("fill", "#A1A1A1");
          d3.select("#comparision-btn-right")
              .transition()
              .attr("fill", "#A1A1A1");
          d3.select("#comparision-text")
              .transition()
              .attr("fill", "#000000");

          //Update axis
          maxY = findMaxY(dataset);
          minY = findMinY(dataset);
          yScale.domain([minY, maxY]);
          svg.select(".y.axis")
              .transition()
              .call(yAxis);

          // Update graph
          lines.select("path")
              .transition()
              .attr("d", d=> d.visible? line(d.values) : null);
          legend.select("rect")
              .transition()
              .attr("fill", d => d.visible? color(d.name) : "#A1A1A1");
         })
      .on("mouseover", function(d) {
          d3.select(this)
              .transition()
             .attr("fill", d =>color(d.name));
         })
         .on("mouseout", function(d) {
           d3.select(this)
             .transition()
             .attr("fill", d => d.visible? color(d.name) : "#A1A1A1");
         });

    legend.append("text")
           .attr("x", width + (margin.right/3) - 10)
           .attr("y", (d, i) => (i + 1/2) * legendSpace + 4 )
           .attr("fill", "#bfbfbf")
           .text(d => d.name);

    // Comparision button
    svg.append("g")
        .attr("class", "comparision-btn")
        .attr("opacity", "0")
        .append("rect")
        .attr("width", 42)
        .attr("height", 16)
        .attr("x", width + (margin.right/3) - 25)
        .attr("y",(dataset.length + 1/2) * legendSpace - 7)
        .attr("fill", "#e6e6e6")
        .attr("id", "comparision-btn-left");

    svg.append("g")
        .attr("class", "comparision-btn")
        .attr("opacity", "0")
        .append("rect")
        .attr("width", 42)
        .attr("height", 16)
        .attr("x", width + (margin.right/3) +17 )
        .attr("y",(dataset.length + 1/2) * legendSpace - 7)
        .attr("fill", "#e6e6e6")
        .attr("id", "comparision-btn-right");

    svg.append("g")
        .attr("class", "comparision-btn")
        .attr("opacity", "0")
        .append("text")
        .attr("class", "legend-box")
        .attr("x", width + (margin.right/3) - 10)
        .attr("y", (dataset.length + 1/2) * legendSpace + 4 )
        .text("Comparison")
        .attr("id", "comparision-text")
        .on("click", function() {
            comparision = !comparision;
            d3.select(this)
                .transition()
                .attr("fill", comparision? "#ffffff" : "#000000");

            d3.select("#comparision-btn-left")
                .transition()
                .attr("fill", comparision? "#91bfdb" : "#e6e6e6");

            d3.select("#comparision-btn-right")
                .transition()
                .attr("fill", comparision? "#fc8d59" : "#e6e6e6");

            if(dataSelect.size === 2 && comparision) {
                // Set to Array
                dataSelectArr = Array.from(dataSelect);
                // Hide the line of the first item
                temp = dataSelectArr[0];
                d3.select("#line-" + dataset[temp].name.replace(" ", "")).attr("display", "none");

                // Select date from dataset
                var subdata = dataSelectArr.map( i => dataset[i]);
                cmpdata = [(subdata[0].values.map((d, i) => {
                    return {
                        date: d.date,
                        rating0:subdata[0].values[i].rating,
                        rating1: subdata[1].values[i].rating
                    }
                }))];

                areas = svg.selectAll(".area-group")
                    .data(cmpdata)
                    .enter(cmpdata[0])
                    .append("g")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "area-group");
                drawComp();
            } else {
                comparision = false;
                // Show the second item
                d3.select("#line-" + dataset[dataSelectArr[0]].name.replace(" ", "")).attr("display", null);
                areas.remove();
            }
        });

    //For brusher of the slider bar at the bottom
    function brushing() {
      xScale.domain(!d3.event.selection ? xScale2.domain() : d3.event.selection.map(xScale2.invert)); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent
      if(dataSelect.size === 2 && comparision) {
          reDrawComp();
      }
      reDraw();
    }

    function brushended() {
      if( !d3.event.sourceEvent) {
        return; // Only transition after input;
      }
      if( !d3.event.selection) {
        xScale.domain(xScale2.domain());
      }
      else {
        var d0 = d3.event.selection.map(xScale2.invert),
            d1 = d0.map(d3.timeYear.round);
        // If empty when rounded, use floor & ceil instead.
        if (d1[0] >= d1[1]) {
          d1[0] = d3.timeYear.floor(d0[0]);
          d1[1] = d3.timeYear.offset(d1[0]);
        }
        d3.select(this).transition().call(d3.event.target.move, d1.map(xScale2));
        xScale.domain([d1[0], d1[1]]);
      }

      if(dataSelect.size === 2 && comparision) {
          reDrawComp();
      }
      reDraw();
    }

    function reDraw() {
        svg.select(".x.axis")
            .transition()
            .call(xAxis);

        maxY = findMaxY(dataset);
        minY = findMinY(dataset);
        yScale.domain([minY, maxY]);

        svg.select(".y.axis")
            .transition()
            .call(yAxis);

        lines.select("path")
            .transition()
            .attr("d", d => d.visible ? line(d.values) : null);

    }

    function drawComp() {

        areas.append("clipPath")
            .attr("id", "clip-above")
            .append("path")
            .transition()
            .attr("d", area1.y0(0));

        areas.append("path")
            .attr("class", "area above")
            .attr("clip-path", "url(#clip-above)")
            .transition()
            .attr("d", area0.y0(height));

        areas.append("clipPath")
            .attr("id", "clip-below")
            .append("path")
            .transition()
            .attr("d", area1.y0(height));

        areas.append("path")
            .attr("class", "area below")
            .attr("clip-path", "url(#clip-below)")
            .transition()
            .attr("d", area0.y0(0));

    }

    function reDrawComp() {
        areas.select("#clip-above")
             .select("path")
             .transition()
             .attr("d", area1.y0(0));

        areas.select(".above")
            .transition()
            .attr("d", area0.y0(height));

        areas.select("#clip-below")
            .select("path")
            .transition()
            .attr("d", area1.y0(height));

        areas.select(".below")
            .transition()
            .attr("d", area0.y0(0));
    }
}); // End of read csv file.

function findMaxY(data) {
  var maxYValues = data.map( d => {
    if (d.visible) {
      return d3.max(d.values, value => value.rating) + 1;
    }
  });
  return d3.max(maxYValues);
}

function findMinY(data) {
  var minYValues = data.map( d => {
    if (d.visible) {
      return d3.min(d.values, value => value.rating) - 1;
    }
  });
  return d3.min(minYValues);
}


