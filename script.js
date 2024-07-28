d3.select("#intro")
    .append("h1")
    .text("Exploring Car Data from 2017");

d3.select("#intro")
    .append("p")
    .text("This narrative visualization explores the relationship between the number of engine cylinders and fuel efficiencies");

d3.select("#intro")
    .append("h2")
    .text("Bar chart of cylinder numbers and average City MPG");

d3.select("#intro")
    .append("p")
    .text("X-axis represents the number of engine cylinders, Y-axis represents the average city MPGs of all car makes with the same number of engine cylinders");

d3.select("#intro")
    .append("p")
    .text("Hover mouse over each bar to see more details");

d3.select("#intro")
    .append("p")
    .text("Click on each bar to show makes with the cylinder number below");

const margin = {top: 20, right: 30, bottom: 40, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svgBar = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svgScatter = d3.select("#exploration")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

var cylinder_number = 0;

d3.csv("https://flunky.github.io/cars2017.csv").then(data => {
    const engineCylindersAvgMPG = d3.rollups(data, v => d3.mean(v, d => d.AverageCityMPG), d => +d.EngineCylinders)
        .map(([key, value]) => ({EngineCylinders: key, AvgMPG: value}))
        .sort((a, b) => a.EngineCylinders - b.EngineCylinders);

    const xExploration = d3.scaleBand()
        .domain(engineCylindersAvgMPG.map(d => d.EngineCylinders))
        .range([0, width])
        .padding(0.1);

    const yExploration = d3.scaleLinear()
        .domain([0, d3.max(engineCylindersAvgMPG, d => d.AvgMPG)])
        .range([height, 0]);

    svgBar.selectAll("*").remove();

    svgBar.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xExploration).ticks(12));

    svgBar.append("g")
        .call(d3.axisLeft(yExploration).ticks(12));

    svgBar.selectAll("rect")
        .data(engineCylindersAvgMPG)
        .enter()
        .append("rect")
        .attr("x", d => xExploration(d.EngineCylinders))
        .attr("y", d => yExploration(d.AvgMPG))
        .attr("width", xExploration.bandwidth())
        .attr("height", d => height - yExploration(d.AvgMPG))
        .style("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", "orange");

            svgBar.append("text")
                .attr("id", "tooltip")
                .attr("x", xExploration(d.EngineCylinders) + xExploration.bandwidth() / 2)
                .attr("y", yExploration(d.AvgMPG) - 10)
                .attr("text-anchor", "middle")
                .text(`Cylinders: ${d.EngineCylinders}, Avg MPG: ${d.AvgMPG.toFixed(2)}`)
                .style("font-size", "12px")
                .style("fill", "black");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("fill", "steelblue");

            d3.select("#tooltip").remove();
        })
        .on("click", function(event, d) {
            cylinder_number = d.EngineCylinders;
            updateScatterPlot(cylinder_number);
            d3.select("#bar-title")
                .select("h2")
                .remove();
            d3.select("#bar-title")
                .select("p")
                .remove();
            d3.select("#bar-title")
                .select("p")
                .remove();
            d3.select("#bar-title")
                .append("h2")
                .text(`Bar chart of top-10 car makes with ${cylinder_number} cylinders and average city MPG`);
            d3.select("#bar-title")
                .append("p")
                .text("X-axis represents car makes, Y-axis represents the average city MPG");
            d3.select("#bar-title")
                .append("p")
                .text("Hover mouse over each bar to see more details");
        });

    updateScatterPlot(cylinder_number);

    function updateScatterPlot(cylinders) {
        const filteredData = data.filter(d => +d.EngineCylinders === cylinders);

        const makeAvgCityMPG = d3.rollups(filteredData, v => d3.mean(v, d => d.AverageCityMPG), d => d.Make)
            .map(([key, value]) => ({Make: key, AvgCityMPG: value}))
            .sort((a, b) => b.AvgCityMPG - a.AvgCityMPG)
            .slice(0, 10);

        const x = d3.scaleBand()
            .domain(makeAvgCityMPG.map(d => d.Make))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(makeAvgCityMPG, d => d.AvgCityMPG)])
            .range([height, 0]);

        svgScatter.selectAll("*").remove();

        svgScatter.selectAll("rect")
            .data(makeAvgCityMPG)
            .enter()
            .append("rect")
            .attr("x", d => x(d.Make))
            .attr("y", d => y(d.AvgCityMPG))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.AvgCityMPG))
            .style("fill", "steelblue")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("fill", "orange");

                svgScatter.append("text")
                    .attr("id", "tooltip")
                    .attr("x", x(d.Make) + x.bandwidth() / 2)
                    .attr("y", y(d.AvgCityMPG) - 10)
                    .attr("text-anchor", "middle")
                    .text(`Make: ${d.Make}, Avg City MPG: ${d.AvgCityMPG.toFixed(2)}`)
                    .style("font-size", "12px")
                    .style("fill", "black");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("fill", "steelblue");

                d3.select("#tooltip").remove();
            });

        svgScatter.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(12));

        svgScatter.append("g")
            .call(d3.axisLeft(y).ticks(12));
    }
});

d3.select("#bar-title")
    .append("h2")
    .text(`Bar chart of top-10 car makes with ${cylinder_number} cylinders and average city MPG`);

d3.select("#bar-title")
    .append("p")
    .text("X-axis represents car makes, Y-axis represents the average city MPG");

d3.select("#bar-title")
    .append("p")
    .text("Hover mouse over each bar to see more details");
