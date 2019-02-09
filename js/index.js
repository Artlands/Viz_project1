//This javascript is using D3.V5 library

// Width and height, height2 is for slider
var margin = {top:20, right:200, bottom: 100, left: 50},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

// Set up scales
var xScale = d3.scaleTime().range([0, width]),
    xScale2 = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom(xScale),
    xAxis2 = d3.axisBottom(xScale2),
    yAxis = d3.axisLeft(yScale);

// Define the line
var line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.rating))
    .curve(d3.curveLinear)
    .defined(d => d.rating);// Hiding line value defaults of 0 for missing data

// Define updated yAxis
var maxY;


// 11 Custom colors
var color = d3.scaleOrdinal().range(["#48A36D", "#80CEAA", "#7EC4CF",  "#809ECE", "#9E81CC", "#CE80B0", "#E05A6D", "#E37756", "#E2AA59","#DBC75F", "#F2DE8A"]);

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

  dataset = dataset.map(da => {
    dateArr = Object.keys(da)
              .filter( d => d !== "Country Name" && d !== "Series Name");
    return {
      name: da["Country Name"],
      values:dateArr.map( i => {
        return {
          date: i,
          rating: +da[i]
        };
      }),
      visible: (da["Country Name"] === "World" ? true : false)
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

  xScale.domain(d3.extent(dateArr));
  yScale.domain([yMin, yMax]);
  // Setting a duplicate xdomain for burshing reference
  xScale2.domain(xScale.domain());
}); // End of read csv file.
