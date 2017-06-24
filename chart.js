document.addEventListener('DOMContentLoaded', contentLoadedCb)

function contentLoadedCb(req) {
  const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
  req = new XMLHttpRequest()
  req.open('GET', url, true)
  req.send()
  req.onload = function () {
    json = JSON.parse(req.responseText)
    chartIt(json)
  };
}

function chartIt(json) {
  const dataset = json.data

  var w = 800;
  var h = 400;
  var padding = 60
  var barWidth = 1

  const myParser = str => str.split('-')

  // const dateMapper = date => {
  //   const num = date.getMonth() - 1
  //   const dec = num / 12
  //   return date.getFullYear() + dec
  // }

  const years = dataset.map(pair => new Date(...myParser(pair[0])))

  var xScale = d3.scaleTime()
    .domain([d3.min(years), d3.max(years)])
    .rangeRound([padding, w - padding])

  const gdp = dataset.map(d => d[1])
  const gdpMin = d3.min(gdp)
  const gdpMax = d3.max(gdp)

  const yScale = d3.scaleLinear()
    .domain([0, gdpMax])
    .range([h - padding, padding])

  const mungedDataset = years.map((e, i) => [e, gdp[i]]) // [Date, num]

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr('id', 'tooltip')

  const onMouseOverCB = (d, i) => {
    tooltip.text(d[0])
    tooltip.attr('data-date', dataset[i][0])
    return tooltip.style("visibility", "visible")
  }

  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "title")

  svg.selectAll("rect")
    .data(mungedDataset)
    .enter()
    .append("rect")
    .style("fill", "blue")
    .attr("x", d => xScale(d[0]))
    .attr("y", (d, i) => yScale(d[1]))
    .attr("width", (d, i) => barWidth)
    .attr("height", (d, i) => {
      return h - padding - yScale(d[1])
    })
    .attr('class', 'bar')
    .attr('data-date', (d, i) => dataset[i][0])
    .attr('data-gdp', d => d[1])
    .text((d, i) => dataset[i][0])
    .on("mouseover", onMouseOverCB)
    .on("mousemove", function () { return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })
    .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

  const xAxis = d3.axisBottom(xScale)

  svg.append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis)
    .attr("id", "x-axis")

  const yAxis = d3.axisLeft(yScale)

  svg.append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis)
    .attr("id", "y-axis")

  svg.append("text")
    .attr("x", (w / 2))
    .attr("y", padding)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("U.S. GDP")

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (h / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Billions of Dollars")
      .attr('id', 'y-axis-label')
}