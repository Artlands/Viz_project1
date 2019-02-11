//This javascript is using D3.V5 library

// Width and height, height2 is for slider
var margin = {top:20, right:200, bottom: 100, left: 50},
    margin2 = {top: 450, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

// Set up scales
var xScale = d3.scaleTime().range([0, width]),
    xScale2 = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom(xScale),
    xAxis2 = d3.axisBottom(xScale2)
               .ticks(10),
    yAxis = d3.axisLeft(yScale)
              .tickFormat(d3.format(".2f"));

// Define the line
var line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.rating))
    .curve(d3.curveLinear)
    .defined(d => !isNaN(d.rating));// Hiding line value for missing data

// Define updated yAxis
var maxY, minY;

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
   .style("fill", "white");

// -------------For slider part-------------
var context = svg.append("g")
                 .attr("transform", "translate(" + 0 + "," + 410 + ")")
                 .attr("class", "context");

// Append clip path for lines plotted, hiding those part out of bounds
svg.append("defs")
   .append("clipPath")
   .attr("id", "clip")
   .append("rect")
   .attr("width", width)
   .attr("height", height);
// -------------End slider part-------------

// 11 Custom colors
var color = d3.scaleOrdinal().range(["#48A36D", "#80CEAA", "#7EC4CF",  "#809ECE", "#9E81CC", "#CE80B0", "#E05A6D", "#E37756", "#E2AA59","#DBC75F", "#7d7c7b"]);

// Read data from csv file and preprocess it
d3.csv("data/Data.csv"). then( data => {
  // Sort country names
  var countries = data
                .filter(d =>!(("columns" in d) || (d["Country Name"] === "World")))
                .sort((a,b) => {
                  var x = a["Country Name"],
                      y = b["Country Name"];
                  return (x < y)? -1 : 1;
                });
  var world = data.filter(d => d["Country Name"] == "World");
  var dataset = countries.concat(world);
  var dateArr;

  dataset = dataset.map(d => {
    dateArr = Object.keys(d)
              .filter( d => d !== "Country Name" && d !== "Series Name");
    return {
      name: d["Country Name"],
      values:dateArr.map( i => {
        year = new Date();
        return {
          date: year.setFullYear(+i),
          rating: +d[i]
        };
      }),
      visible: (d["Country Name"] === "World" ? true : false)
    };
  });
  console.log(dataset);

// Match a color to a country
  color.domain(dataset.map(d => d.name));

  //yMin, yMax
  var yMin = d3.min(dataset, d => d3.min(d.values, v => v.rating));
      yMax = d3.max(dataset, d => d3.max(d.values, v => v.rating));

  // console.log(yMin);
  // console.log(yMax);

  xScale.domain(d3.extent(dateArr.map(d => {
    year = new Date();
    return year.setFullYear(+d)
  })));

  // console.log(dateArr);

  // .map(d => parseDate(d))
  yScale.domain([yMin, yMax]);
  // Setting a duplicate xdomain for burshing reference
  xScale2.domain(xScale.domain());

// -------------For slider part-------------
  var brush = d3.brushX()
                .extent([0,0], [width, height2])
                .on("end", brushended);

  context.append("g")
         .attr("class", "x axis1")
         .attr("transform", "translate(0," + height2 + ")")
         .call(xAxis2);

  var contextArea = d3.area()
                      .curve(d3.curveMonotoneX)
                      .x( d => xScale(d.date))
                      .y0(height2)  // Bottom line begins at height2
                      .y1(0); // Top line of area

  // Plot the rect as the bar at the Bottom
  context.append("path")
         .attr("class", "area")
         .attr("d", contextArea(dataset[0].values))
         .attr("fill", "#F1F1F2");

  // Append the brush for the selection of subsection
  context.append("g")
         .attr("class", "x brush")
         .call(brush)
         .selectAll("rect")
         .attr("height", height2)
         .attr("fill", "#E6E7E8");
// -------------End slider part-------------

  //Draw line graph
  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis);

  svg.append("g")
     .attr("class", "y axis")
     .call(yAxis)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("x", -10)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("GDP growth (annual %)");

  var country = svg.selectAll(".country")
                 .data(dataset)
                 .enter()
                 .append("g")
                 .attr("class", "country");

  country.append("path")
         .attr("class", "line")
         .style("pointer-events", "none")
         .attr("id", d => "line-" + d.name.replace(" ", ""))
         .attr("d", d => d.visible? line(d.values) : null)
         .attr("clip-path", "url(#clip)")
         .style("stroke", d => color(d.name));

  // Draw legend
  var legendSpace = height/dataset.length;

  country.append("rect")
         .attr("width", 10)
         .attr("height", 10)
         .attr("x", width + (margin.right/3) - 25)
         .attr("y", (d, i) => (i + 1/2)* legendSpace - 8 )
         .attr("fill", d => d.visible? color(d.name) : "#F1F1F2")
         .attr("class", "legend-box")
         .on("click", d => {
           d.visible = ! d.visible;
           maxY = findMaxY(dataset);
           minY = findMinY(dataset);
           yScale.domain([minY, maxY]);
           svg.select(".y.axis")
              .transition()
              .call(yAxis);

           country.select("path")
                  .transition()
                  .attr("d", d=> d.visible? line(d.values) : null);

           country.select("rect")
                  .transition()
                  .attr("fill", d => d.visible? color(d.name) : "#F1F1F2");
         })
         .on("mouseover", d => {
           d3.select(this)
             .transition()
             .attr("fill", d => color(d.name));
           d3.select("#line-" + d.name.replace(" ",""))
             .transition()
             .style("stroke-width", 1.5);
         })
         .on("mouseout", d => {
           d3.select(this)
             .transition()
             .attr("fill", d => d.visible? color(d.name) : "#F1F1F2");
           d3.select("#line-" + d.name.replace(" ",""))
             .transition()
             .style("stroke-width", 0.5);
         });

    country.append("text")
           .attr("x", width + (margin.right/3) - 10)
           .attr("y", (d, i) => (i + 1/2) * legendSpace)
           .text(d => d.name);

    //Hover line
    var hoverLineGroup = svg.append("g").attr("class", "hover-line");

    var hoverLine = hoverLineGroup.append("line")
                                  .attr("id", "hover-line")
                                  .attr("x1", 10).attr("x2", 10)
                                  .attr("y1", 0).attr("y2", height + 10)
                                  .style("pointer-events", "none")
                                  .style("opacity", 1e-6); // Set opacity to zero

    var hoverDate = hoverLineGroup.append("text")
                                  .attr("class", "hover-text")
                                  .attr("y", height - (height - 40))
                                  .attr("x", width - 150)
                                  .style("fill", "#E6E7E8");

    var columnNames = countries.concat(world);

    var focus = country.select("g")
                       .data(columnNames)
                       .enter()
                       .append("g")
                       .attr("class", "focus");

    focus.append("text")
         .attr("class", "tooltip")
         .attr("x", width + 20)
         .attr("y", (d, i) => legendSpace + i * legendSpace);

    //Add mouseover events for hover lines
    d3.select("#mouse-tracker")
      .on("mousemove", mousemove)
      .on("mouseout", () => {
        hoverDate.text(null);
        d3.select("#hover-line")
          .style("opacity", 1e-6);
      });

    function mousemove() {
      // To be done
    };

    //For brusher of the slider bar at the bottom
    function brushended() {
      // if( !d3.event.sourceEvent) return; // Only transition after input;
      // if( !d3.event.selection) return;// Ignore empty selection;
      // var d0 = d3.event.selection.map(x.invert),
      //     d1 = d0.map(d3.timeYear.round)


      xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());

      svg.select(".x.axis")
         .transition()
         .call(xAxis);

      maxY = findMaxY(dataset);
      minY = findMinY(dataset);
      yScale.domain([minY, maxY]);

      svg.select(".y.axis")
         .transition()
         .call(yAxis);

      country.select("path")
             .transition()
             .attr("d", d => d.visible ? line(d.values) : null);
    };
}); // End of read csv file.

function findMaxY(data) {
  var maxYValues = data.map( d => {
    if (d.visible) {
      return d3.max(d.values, value => value.rating)
    }
  });
  return d3.max(maxYValues);
};

function findMinY(data) {
  var minYValues = data.map( d => {
    if (d.visible) {
      return d3.min(d.values, value => value.rating)
    }
  });
  return d3.min(minYValues);
};
