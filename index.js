//API to fetch data
const urls = ['https://api.worldbank.org/v2/country/chn/indicator/NE.EXP.GNFS.ZS?format=json',
             'https://api.worldbank.org/v2/country/chn/indicator/NY.GDP.MKTP.KD.ZG?format=json',
             'https://api.worldbank.org/v2/country/chn/indicator/NV.IND.TOTL.ZS?format=json']

let rawdata = [];
let dataset = [];
let dict = [];

//Loading data from API when DOM content has been loaded
document.addEventListener("DOMContentLoaded", event => {
  Promise.all(urls.map(url =>
    fetch(url)
      .then(checkStatus)
      .then(parseJSON)
      .catch(err => console.log(err))
  ))
  .then(data => {
    data.map( d => {
      rawdata.push(d[1])
    });
    dataset = parseData(rawdata);
    console.log(dataset);
    drawChart(dataset);
  })
});

//--------------------------------
// HELPER FUNCTIONS
//--------------------------------

function checkStatus(response) {
  if(response.ok) {
    return Promise.resolve(response);
  }else {
    return Promise.reject(new Error(response.statusText));
  }
}

function parseJSON(response) {
  return response.json();
}

//Parse data
function parseData(data) {
  let temp = [], result = [];
  data.map(d => {
    let item = {};
    let date = [];
    let rating = [];
    let country = d[0].country.value;
    let id = d[0].indicator.id.replace(/\./g,'_');
    let indicator = d[0].indicator.value;
    for (let i in d) {
      date.push(d[i].date);
      rating.push(+d[i].value);
    }
    item.country = country;
    item.id = id;
    item.indicator = indicator;
    item.date = date;
    item.rating = rating;
    temp.push(item);
    //save id-indicator dict
    let id_indicator = {};
    id_indicator[id] = indicator;
    dict.push(id_indicator);
  });

  console.log(dict);
  //preprocessing data
  for (let i in temp[0].date) {
    let item = {};
    item.date = temp[0].date[i];
    for (let j in temp) {
      item[temp[j].id] = temp[j].rating[i]
    }
    result.push(item);
  }
  return result;
}

//Draw chart
function drawChart(data) {
  let margin = {top: 20, right:200, bottom:100, left:50},
      margin2 = {top: 430, right: 10, bottom:20, left:40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      height2 = 500 - margin2.top - margin2.bottom;

  let xScale = d3.scaleTime()
          .range([0, width]),

      xScale2 = d3.scaleTime()
          .range([0, width]);

  let yScale = d3.scaleLinear()
      .range([height, 0]);

  //Entries Colors
    let color = d3.scaleOrdinal()
        .range(["#48A36D", "#80CEAA", "#7EC4CF"]);
        // .range(["#48A36D", "#80CEAA", "#7EC4CF","#809ECE", "#9E81CC", "#CE80B0","#E05A6D", "#E37756","#E2AA59", "#DBC75F"]);

    let xAxis = d3.axisBottom(xScale),

        xAxis2 = d3.axisBottom(xScale2);//xAxis for brush slider



    let yAxis = d3.axisLeft(yScale);


    let line = d3.line()
        .curve(d3.curveBasis)
        .x( d => xScale(d.date))
        .y( d => yScale(d.value))
        .defined(d => d.value);// hiding line value defaults of 0 for missing data

    let maxY; // Defined later to update yAxis

    let svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create inivisble rect for mouse tracking
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0)
        .attr("id", "mouse-tracker")
        .style("fill", "white");

    //for slider part----------------
    let context = svg.append("g") // Brushing context box container
        .attr("transform", "translate(" + 0 + "," + 410 + ")")
        .attr("class", "context");

    //append clip path for lines plotted, hiding those part out bounds
    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    //end slider part----------------

    color.domain(dict.keys());
    let categories = color.domain().map( name => {
        return {
            name: name,
            values: data.map(d => {
              return {
                date: d.date,
                rating: +(d[name])
              }
            }),
            visible: (name === "NY_GDP_MKTP_KD_ZG" ? true : false)
        }
    });

    xScale.domain(d3.extent(data, d => d.date));

    yScale.domain([0,100]);

    xScale2.domain(xScale.domain());

    //for slider part ----------------
    let brush = d3.brush();
        // .x(xScale2)
        // .on("brush", brushed);

    context.append("g")
        .attr("class", "x axis1")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    // let contextArea = d3.area()
    //     .curve(d3.curveMonotoneX)
    //     .x(d => xScale2(d.date)
    //     .y0(height2)
    //     .y1(0);
}
