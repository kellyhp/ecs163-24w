// Overall dimension of the canvas
const width = window.innerWidth;
const height = window.innerHeight;
let pieRadius = 0;

// Dimensions for each individual plot
// Dimensions for the parallel coordinates plot
let parallelLeft = 0, parallelTop = 400;
let parallelMargin = {top: 10, right: 30, bottom: 30, left: 60},
    parallelWidth = width - parallelMargin.left - parallelMargin.right,
    parallelHeight = height - 450 - parallelMargin.top - parallelMargin.bottom;

// Dimensions for the heat map
let heatlLeft = 0, heatTop = 400;
let heatMargin = {top: 10, right: 30, bottom: 30, left: 60},
    heatWidth = 400 - heatMargin.left - heatMargin.right,
    heatHeight = 350 - heatMargin.top - heatMargin.bottom;

// Dimensions for the pie chart
let pieLeft = 100, pieTop = 0;
let pieMargin = {top: 60, right: 30, bottom: 30, left: 80},
    pieWidth = 400 - pieMargin.left - pieMargin.right,
    pieHeight = 350 - pieMargin.top - pieMargin.bottom;

function processingData(rawData) {
    // Data Processing
    allTypeOne = []
    // Transform data to number, string, and boolean values
    rawData.forEach(function(d) {  
        d.Number = Number(d.Number);
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
        d.Speed = Number(d.Speed);
        d.isLegendary = d.isLegendary == "TRUE" ? true : false;
        d.hasGender = d.hasGender == "TRUE" ? true : false;
        d.Pr_Male = Number(d.Pr_Male);
        d.hasMegaEvolution = d.hasMegaEvolution == "TRUE" ? true : false;
        d.Height_m = Number(d.Height_m);
        d.Weight_kg = Number(d.Weight_kg);
        d.Catch_Rate = Number(d.Catch_Rate);
        if (!(allTypeOne.includes(d.Type_1))) {
            allTypeOne.push(d.Type_1);
        }
    });

    // Drop two types that have incomplete and trivial attributes
    rawData.forEach(d => {
        delete d.Type_2;
        delete d.Egg_Group_2;
    });

    return [allTypeOne, rawData];
}

// Plot 1: Parallel Coordinates Graph
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {

    // Data Processing
    allTypeOne = [];
    [allTypeOne, rawData] = processingData(rawData);

    // Select svg
    const svg = d3.select("svg")

    const g1 = svg.append("g")
                .attr("width", parallelWidth + parallelMargin.left + parallelMargin.right)
                .attr("height", parallelHeight + parallelMargin.top + parallelMargin.bottom)
                .attr("transform", `translate(${parallelMargin.left}, ${height - (parallelHeight + parallelMargin.top + parallelMargin.bottom)})`)

    // For plot 1, we only care about these attributes
    let dimensions = ["Total", "HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];

    const color = d3.scaleOrdinal()
        .range(d3.schemeSet2);

    // store y objects
    const y = {};
    for (let i in dimensions) {
        let name = dimensions[i];
        y[name] = d3.scaleLinear()
        .domain( d3.extent(rawData, function(d) { return +d[name]; }))
        .range([parallelHeight, 0]);
    }

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
        .range([0, parallelWidth])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw paths
    g1.selectAll("myPath")
        .data(rawData)
        .join("path")
        .attr("class", function (d) { return "line " + d.Type_1 } )
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d.Type_1))} )
        .style("opacity", 0.5)

    // Set up axis
    g1.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")

    // Add a title to g1
    g1.append("text")
        .attr("x", parallelWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("All Pokemon's Attributes Parallel Coordinates Graph");

    // Add a legend to the side of the parallel coordinates plot
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, ${height - (parallelHeight + parallelMargin.top + parallelMargin.bottom)})`);

    const legendRectSize = 18;
    const legendSpacing = 4;

    // Create legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(allTypeOne)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function (d, i) { return `translate(0, ${i * (legendRectSize + legendSpacing)})`; });

    // Append rectangles to the legend items
    legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", function (d) { return color(d); });

    // Append text to the legend items
    legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(function (d) { return d; });

}).catch(function(error){
    console.log(error);
});

// Plot 2: Pie Chart Interms of each Pokemon's Type_1
d3.csv("../data/pokemon_alopez247.csv").then(rawData => {
    // Data Processing
    allTypeOne = [];
    [allTypeOne, rawData] = processingData(rawData);
    processedData = {}
    rawData.forEach(d => {
        if (d.Type_1 in processedData) {
            processedData[d.Type_1] += 1;
        } else {
            processedData[d.Type_1] = 1;
        }
    })

    // Select svg
    const svg = d3.select("svg");

    const radius = Math.min(pieWidth + pieMargin.left + pieMargin.right, pieHeight + pieMargin.top + pieMargin.bottom) / 2 - pieMargin.right;
    pieRadius = radius;

    const g2 = svg.append("g")
                .attr("width", pieWidth + pieMargin.left + pieMargin.right)
                .attr("height", pieHeight + pieMargin.top + pieMargin.bottom)
                .attr("transform", `translate(${pieMargin.left + radius + pieLeft}, ${pieMargin.top + radius})`);

    // set the color scale
    const color = d3.scaleOrdinal()
    .range(d3.schemeSet2);

    // Compute the position of each group on the pie:
    const pie = d3.pie()
    .value(function(d) {return d[1]})
    const data_ready = pie(Object.entries(processedData))
    // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    const arcGenerator = d3.arc()
                            .innerRadius(0)
                            .outerRadius(radius)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    g2
        .selectAll('mySlices')
        .data(data_ready)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color(d.data[0])) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // Add a legend to the side of the parallel coordinates plot
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${pieMargin.left}, ${pieMargin.top})`);

    const legendRectSize = 12;
    const legendSpacing = 4;

    // Create legend items
    const legendItems = legend.selectAll(".legend-item")
        .data(allTypeOne)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function (d, i) { return `translate(0, ${i * (legendRectSize + legendSpacing)})`; });

    // Append rectangles to the legend items
    legendItems.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", function (d) { return color(d); });

    // Append text to the legend items
    legendItems.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(function (d) { return d; });

    // Query the leftmost and rightmost position to location the title
    const legendLeftPosition = pieMargin.left;
    const pieRightPosition = pieMargin.left + radius * 2 + pieLeft;

    // Add title
    svg.append("text")
        .attr("x", (legendLeftPosition + pieRightPosition) / 2)
        .attr("y", pieMargin.top * 2 / 3)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Pokemon's Composition in the Whole Dataset");

}).catch(function(error){
    console.log(error);
});

d3.csv("../data/pokemon_alopez247.csv").then(rawData => {
    // Data Processing
    allTypeOne = [];
    [allTypeOne, rawData] = processingData(rawData);
    rawData = rawData.slice(-50);

    const svg = d3.select("svg")

    const g3 = svg.append("g")
        .attr("width", heatWidth + heatMargin.left + heatMargin.right)
        .attr("height", heatHeight + heatMargin.top + heatMargin.bottom)
        .attr("transform", `translate(${width - (pieMargin.left + pieRadius + pieLeft)}, ${pieMargin.top + pieRadius})`);

}).catch(function(error){
    console.log(error);
});