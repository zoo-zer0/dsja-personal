d3.json("data.json").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d.perWomen = d['per women'] == null ? null : +d['per women'];
  });

  const margin = {top: 50, right: 20, bottom: 50, left: 60},
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

  const svgContainer = d3.select("#stacked-bar-chart").append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const svg = svgContainer.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


  const grouped = d3.group(data, d => d.Year);
  const years = Array.from(grouped.keys()).sort(d3.ascending);
  const maxStack = d3.max(grouped, g => g[1].length);

  const x = d3.scaleBand().domain(years).range([0, width]).padding(0.3);
  const barHeight = 18;
  const y = d3.scaleLinear()
                    .domain([0, 25])
                    .range([height, height-(25*barHeight)]);

  const colorScale = d3.scaleLinear().domain([0,100]).range(["#b3bfe0","#b80090"]);
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  // Draw bars
  const rects = [];
  years.forEach(year => {
    const studies = grouped.get(year)
                        .sort((a, b) => {
                            const aVal = a.perWomen == null ? -1 : a.perWomen;
                            const bVal = b.perWomen == null ? -1 : b.perWomen;
                            return aVal - bVal;
                        });
    //const studies = grouped.get(year).sort((a,b) => (a.perWomen||-1)-(b.perWomen||-1));
    let stackPos = 0;
    studies.forEach(study => {
        const barGap=2;
      const color = study.perWomen == null ? "#757474" : colorScale(study.perWomen);
      const rect = svg.append("rect")
        .attr("x", x(year))
        .attr("y", height - (stackPos*(barHeight+barGap))-18)
        .attr("width", x.bandwidth()+2)
        .attr("height", 18)
        .attr("fill", color)
    //    .attr("stroke","#fff")
      //  .attr("stroke-width",1.5)
        .attr("class", `bar year-${year}`)
        .on("mouseover", function(event) {
                            d3.select(this)
                                //.attr("stroke", "#000")      // black border on hover
                                //.attr("stroke-width", 1.5)    // make border thicker
                                .attr("fill", d3.color(color).copy({opacity: 0.5})); // lighter color on hover
                        })
                        .on("mousemove", (event) => {
                              const tooltipHeight = tooltip.node().offsetHeight;
  const tooltipWidth = tooltip.node().offsetWidth;
  const pageHeight = window.innerHeight;
  const pageWidth = window.innerWidth;

  const mouseX = event.pageX;
  const mouseY = event.pageY;

  const mouseClientY=event.clientY;

  let topPosition = mouseY - 28; // default: show below
  let leftPosition = mouseX +15;

  // If tooltip would go below viewport, flip it above
  if (mouseClientY+tooltipHeight+20> pageHeight) {
    topPosition = mouseY - tooltipHeight - 5;
    tooltip.html('RAHHHHH');
  }

  // If tooltip would overflow right side, adjust left
  if (mouseX + tooltipWidth + 20 > pageWidth) {
    leftPosition = mouseX - tooltipWidth - 15;
  }
                            tooltip
                            .style("opacity", 1)
                            .html(`
                                <b>${study.Title}</b>(${study.Year})<br>
                                <br><b>Demographic:</b> ${study.Demographic}<br>
                                <b>Female Participation:</b> ${study.perWomen != null ? study.perWomen + '%' : 'Missing'}<br>
                                <b>Summary:</b> ${study.summary}

                            `)
                            .style("left", `${leftPosition}px`)
                            .style("top", `${topPosition}px`);
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                //.attr("stroke", "#fff")       // reset to original border color
                                //.attr("stroke-width", 1.5)   // reset border thickness
                                .attr("fill", color);
                            tooltip.style("opacity", 0);
                        })
                        .on("click", function(){
                            if(study.link){
                                window.open(study.link, "_blank");
                            }
                        });
      rects.push({el: rect, data: study});
      stackPos++;
    });
  });

  // Axes
  //svg.append("g").attr("transform",`translate(0,${height})`).call(d3.axisBottom(x));
  
  const xAxis = d3.axisBottom(x).tickValues([1989, 1995, 2000, 2005, 2010, 2015, 2020, 2025]);
  svg.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(xAxis);

  
  svg.append("g").call(d3.axisLeft(d3.scaleLinear().domain([0,25]).range([height,height-(25*barHeight)]))
    .tickValues([5,10,15,20,25]));

  svg.append("text")
    .attr("x", width/2).attr("y",-20)
    .attr("text-anchor","middle")
    .style("font-size","18px");

  // ✅ Scrollytelling
  const scroller = scrollama();
  scroller
    .setup({
      step: "#scrolly-bar .bar-step",
      offset: 0.6,
      debug: false
    })
    .onStepEnter(response => {
      d3.selectAll("#scrolly-bar .bar-step").classed("active", (d,i) => i === response.index);
      handleStep(response.index);
    });

  function handleStep(stepIndex){
    svg.selectAll(".highlight-box").remove();
    let targets = [];
     if (stepIndex === 1) {
    targets = rects.filter(r => r.data.Year < 2000);
  } else if (stepIndex === 2) {
    targets = rects.filter(r => r.data.Year >= 2018 && r.data.Year <= 2022);
  } else if (stepIndex === 3) {
    targets = rects.filter(r => r.data.Title && r.data.Title.includes("2019"));
  }
  // Add highlight boxes behind the selected rects
  targets.forEach(r => {
    const bbox = r.el.node().getBBox();
    svg.insert("rect", ":first-child") // Insert behind all bars
      .attr("x", bbox.x - 3)  // extra padding
      .attr("y", bbox.y - 3)
      .attr("width", bbox.width + 6)
      .attr("height", bbox.height + 6)
      .attr("fill", "#fff88f")
     // .attr("stroke", "#fff88f")  // highlight color
     // .attr("stroke-width", 4)
     // .attr("rx", 2)  // rounded corners (optional)
      .attr("class", "highlight-box");
  });
}


  function highlightRect(rect) {
  const bbox = rect.node().getBBox();
  svg.insert("rect", ":first-child") // insert behind
    .attr("x", bbox.x - 3)
    .attr("y", bbox.y - 3)
    .attr("width", bbox.width + 6)
    .attr("height", bbox.height + 6)
    .attr("fill", "none")
    .attr("stroke", "#fff88f")
    .attr("stroke-width", 4)
    .attr("class", "highlight-box");
    }

});