function replaceNewlines(obj) {
    for (let key in obj) {
        if (typeof obj[key] === "string") {
            obj[key] = obj[key].replace(/\n/g, "<br>");
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            replaceNewlines(obj[key]); // recursive
        }
    }
}
d3.json("citation_network.json").then(data => {
    console.log("Loaded hierarchical data:", data);

    // SVG setup
    

    // Your code for links, nodes, tooltips goes here

// SVG setup
const width = 1000;
const height = 2000;
const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(50,50)");

// Tree layout: Vertical orientation
const treeLayout = d3.tree().size([width - 200, height - 200]);
const root = d3.hierarchy(data);
treeLayout(root);

// Color scales
const sentimentColor = {
    positive: "#70a372ff",
    negative: "#c40d00ff",
    neutral: "#9E9E9E"
};

const femaleColorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["#a7e3ffff","#b80090"]);

// Tooltip div
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Links (adjust link generator for vertical layout)
const links = svg.selectAll(".edge")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "edge")
    .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
    .attr("stroke", d => sentimentColor[d.target.data.sentiment] || "#999")
    .attr("stroke-width",1)
    .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 5).attr("opacity",0.5);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`${d.target.data.quote || "No quote"}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function () {
        d3.select(this).attr("stroke-width",1);
        tooltip.transition().duration(300).style("opacity", 0);
    })
    .style("opacity",0);
/*const links = svg.selectAll(".edge")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "edge")
    .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
    .attr("stroke", d => sentimentColor[d.target.data.sentiment] || "#999")
    .attr("stroke-width", 2)
    .style("opacity", 0); // start hidden
*/
// Nodes
const nodes = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

// Node Shapes & Colors
nodes.append("circle")
    .attr("r", 10)
    .attr("fill", d => {
    if (d.data.type === "Pop Culture") return "#ffdd46ff";  // teal
    if (d.data.type === "Popular Health Article") return "#ffdd46ff"; // blue
    if (d.data.type === "Organization") return "#ffdd46ff";
    if (d.data.type === "Diagnostic and Treatment Guideline") return "#ffdd46ff"; // gold
    if (d.data.type === "Interview") return "#ffdd46ff"; // green
    if (d.data.type === "Review") return "#ffaf80ff"; // violet

    if (d.data.type === "Trial") {
    let femaleValue = 0;

    if (d.data.femaleParticipation !== undefined) {
        femaleValue = d.data.femaleParticipation;
    } else if (d.data["per women"] !== undefined) {
        femaleValue = d.data["per women"] / 100;  // normalize 0–100 to 0–1
    }

    return femaleColorScale(femaleValue);
    }

    return "#CCC"; // fallback
})

    .style("opacity", d => d.depth === 0 ? 1 : 0); // only root visible

// Node Labels

// Node Hover (screenshot and info)
nodes.on("mouseover", function (event, d) {
    d3.select(this).attr("stroke-width", 2).attr("stroke","#9E9E9E");
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.html(`
        
        <span class = "highlight">${d.data.type}</span><br>
        <strong>${d.data.citation || d.data.Title || "No title available"}</strong><br>
        ${
            d.data.femaleParticipation != null
                ? `Female Participation: ${(d.data.femaleParticipation * 100).toFixed(1)}%<br>`
                : d.data['per women'] != null
                    ? `Female Participation: ${d.data['per women']}%<br>`
                    : ""
        }
        ${d.data.doi ? `<a href="${d.data.doi}" target="_blank">DOI Link</a><br>` : ""}
        ${d.data.screenshot ? `<img src="${d.data.screenshot}" alt="screenshot" style="max-width:100%; height:auto; border-radius:8px;"/>` : ""}
    `)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY - 20) + "px");
})
.on("mouseout", function () {
    d3.select(this).attr("stroke-width", 0).attr("stroke","#32CD32");
    tooltip.transition().duration(300).style("opacity", 0);
});

nodes.style("cursor", d => d.data.link ? "pointer" : "default").on("click", function(event, d) {
    if (d.data.link) {
        window.open(d.data.link, "_blank");
    }
});


//coordinates
const nodeLayers = d3.group(root.descendants(), d => d.depth);
const layerN = Array.from(nodeLayers.values()).map(nodes =>
    nodes.map(d => ({ name: d.data.name, x: d.x, y: d.y }))
);
const layerE = root.links().map(link => ({
    source: link.source.data.name,
    target: link.target.data.name,
    midX: (link.source.x + link.target.x) / 2,
    midY: (link.source.y + link.target.y) / 2
}));
const steps = document.querySelectorAll("#tree-section .step");

// Align step 0 with root node
steps[0].style.top = layerN[0][0].y + "px"; 

// Align step 1 with first edge midpoint
steps[1].style.top = layerE[0].midY + "px";

// Align step 2 with first child node
steps[2].style.top = layerN[1][0].y + "px";

// Align step 3 with second edge midpoint
steps[3].style.top = (layerN[1][0].y+layerN[2][0].y)/2 + "px";

steps[4].style.top = layerN[2][0].y + "px";

steps[5].style.top = (layerN[2][0].y+layerN[3][0].y)/2 + "px";



const scroller = scrollama();

scroller
  .setup({
    step: "#tree-section .step",
    offset: 0.6
  })
  .onStepEnter(response => {
    console.log("Entered step:", response.index);
    d3.selectAll(".step").classed("active", (d, i, nodes) => nodes[i] === response.element);
    const stepIndex = +response.element.dataset.step;

    if (stepIndex === 0) {
      // Reset to only root
      nodes.select("circle").style("opacity", d => d.depth === 0 ? 1 : 0);
      links.style("opacity", 0);


      nodes.filter(d => d.data.id === 0).select("circle").attr("stroke-width", 2).attr("stroke", "#9E9E9E");
}
    if (stepIndex === 1) {
      // Show first edge + first child node
        links.filter(d => d.source.depth === 0) // edges from root to layer 1
        .transition().duration(500).style("opacity", 1);
        nodes.filter(d => d.depth === 1) // all layer 1 nodes
        .select("circle").transition().duration(500).style("opacity", 1);}

        //
        links.filter(d => d.target.data.id === 1).attr("stroke-width", 2.5).attr("opacity", 0.8);
        

        
    if (stepIndex === 2) {
      // Highlight first child node
      nodes.filter((d,i)=>i===1).select("circle");

        nodes.filter(d => d.data.id === 1).select("circle").attr("stroke-width", 2).attr("stroke", "#9E9E9E");

    }
    if (stepIndex === 3) {
      // Show edge to grandchild
      links.filter(d => d.source.depth === 1) // edges from root to layer 1
        .transition().duration(500).style("opacity", 1);
      links.filter((d,i)=>i===1).transition().duration(500).style("opacity",1);
      nodes.filter((d,i)=>i===2).select("circle").transition().duration(500).style("opacity",1);

        links.filter(d => d.target.data.id === 14).attr("stroke-width", 2.5).attr("opacity", 0.8);

    }
    if (stepIndex === 4) {
      // Reveal all leaf nodes
      nodes.filter(d=>d.depth===2).select("circle").transition().style("opacity",1);
      links.filter(d => d.source.depth === 1)
    .transition().style("opacity", 1);
    nodes.filter(d => d.data.id === 14).select("circle").attr("stroke-width", 2).attr("stroke", "#9E9E9E");

    }
    if (stepIndex === 5) {
      // Final state: everything visible
      nodes.select("circle").transition().style("opacity",1);
      links.transition().style("opacity",1);
    }
  });


});

