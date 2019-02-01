//API to fetch data
const api = 'http://api.worldbank.org/v2/country/chn/indicator/SP.RUR.TOTL.ZS?format=json';

//Loading data from API when DOM content has been loaded
document.addEventListener("DOMContentLoaded", event => {
  fetch(api)
    .then(response => response.json())
    .then(data => {
      parsedData = parseData(data);
      // console.log(parsedData);
      drawChart(parsedData);
    })
    .catch(err => console.log(err));
});

//Parse data into key-value pairs
function parseData(data) {
  var arr = [];
  for(var i in data[1]) {
    arr.push({
      date: data[1][i].date,
      value: +data[1][i].value
    });
  }
  return arr;
}

//Draw chart
function drawChart(data) {
  var margin = {top: 20, right:200, bottom:100, left:50},
      margin2 = {top: 430, right: 10, bottom:20, left:40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      height2 = 500 - margin2.top - margin2.bottom;
}
