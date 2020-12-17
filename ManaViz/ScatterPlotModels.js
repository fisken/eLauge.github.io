// Scatterplot for use of bars
// Can all information related to bars
class ScatterPlotModels extends IPlot{
    // The class will need to know what type needs to be plottet at each axis
    // force, axEnergy, beEnergy or kink angle
    xType = "AxialEnergy";
    yType = "BendingEnergy";
    title = "Models";
    xForce = 0;
    yForce = 4;

    // The loadcase is needed in order to know which values to use
    loadCase = 0; 

    initializePlot(){
        super.initializePlot();

        // Make a constant to hold the margins (makes the code more readable)
        const m = this.margin;

        // Assign that the plot is "this" class
        let vis = this;   
    

        // Initialize a x-scale
        this.xScale = d3.scaleLinear()
            .range([0, this.width])
            .domain([0,1]);

        // Initialize a y-scale
        this.yScale = d3.scaleLinear()
            .range([this.height, 0])
            .domain([0,1]);

        // Place the x-scale on the svg
        vis.chart.append("g")
            .attr("class","xAxis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.xScale));

        // Place the y-scale on the svg
        vis.chart.append("g")
            .attr("class","yAxis")
            .call(d3.axisLeft(this.yScale));

        // Add X axis label
        vis.chart.append("text")
            .attr("class","xLabel")
            .attr("text-anchor", "end")
            .attr("x", this.width)
            .attr("y", this.height + m.top + 20)
            .text("X axis title"); 

        // Add y axis label
        vis.chart.append("text")
            .attr("class","yLabel")
             .attr("text-anchor", "end")
             .attr("transform","rotate(-90)")
             .attr("y", -m.left+10)
             .attr("x", -1*m.top)
             .text("y axis title"); 
        
        // Title
        vis.chart.append("text")
            .attr("class","title")
            .attr("text-anchor","middle")
            .attr("y",0)
            .attr("x",vis.width/2)
            .text("Plot title")



        this.makeBrush();

        
    }

    // Function to update the scales
    // Important to already have called to get the domains
    updateScales(){

        let vis = this;
        if (this.yType=="AxialEnergy"){this.yLabel="Axial [kNm]"}
        if (this.yType=="BendingEnergy"){this.yLabel="Bending [kNm] "}
        if (this.yType=="TotalEnergy"){this.yLabel="Total [kNm] "}
        if (this.yType=="gammastiff"){this.yLabel="gamma_stiff"}
        if (this.yType=="mass"){this.yLabel="mass"}

        if (this.xType=="AxialEnergy"){this.xLabel="Axial [kNm]"}
        if (this.xType=="BendingEnergy"){this.xLabel="Bending [kNm] "}
        if (this.xType=="TotalEnergy"){this.xLabel="Total [kNm] "}
        if (this.xType=="gammastiff"){this.xLabel="gamma_stiff"}
        if (this.xType=="mass"){this.xLabel="mass"}



        // Assign the new domains
        this.xScale.domain([this.minX,this.maxX]);
        this.yScale.domain([this.minY,this.maxY]);
        this.xScale.range([0,this.width]);
        this.yScale.range([this.height,0]);
        this.xScale.nice();
        this.yScale.nice();

        // Select and call new axes
        this.chart.select(".yAxis")
                .transition()
                .duration(750)
                .call(d3.axisLeft(this.yScale).ticks(5));
        this.chart.select(".xAxis")
                .transition()
                .duration(750)
                .attr("transform", "translate(0," + this.height + ")")
                .call(d3.axisBottom(this.xScale).ticks(5));

        this.chart.select(".xLabel")
            .text(this.xLabel)
            .attr("x", this.width)
            .attr("y", this.height + this.margin.top + 20);

        this.chart.select(".yLabel")
            .text(this.yLabel);

        this.chart.select(".title")
            .text(vis.title + " (Load case " + vis.loadCase + ")")
            .attr("x", this.width/2)
            .attr("y", 0);
    }

    updatePlot(){
        super.updatePlot();
        //this.updateSVG();
        this.getDomains();
        this.updateScales();
        this.updateData();
        this.updateBrush();
    }



    // Function to find the maximum values of the datalist
    // Uses to make the scales
    getDomains(){
        let lc = this.loadCase;
  

        if (this.xType == "AxialEnergy"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d.AxialEnergy[lc]}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d.AxialEnergy[lc]}});
        }
        if (this.yType == "AxialEnergy"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d.AxialEnergy[lc]}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d.AxialEnergy[lc]}});
        }

        if (this.xType == "BendingEnergy"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d.BendingEnergy[lc]}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d.BendingEnergy[lc]}});
        }
        if (this.yType == "BendingEnergy"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d.BendingEnergy[lc]}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d.BendingEnergy[lc]}});
        }
        if (this.xType == "gammastiff"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d.gammastiff[lc]}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d.gammastiff[lc]}});
        }
        if (this.yType == "gammastiff"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d.gammastiff[lc]}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d.gammastiff[lc]}});
        }
        if (this.xType == "TotalEnergy"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d.TotalEnergy[lc]}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d.TotalEnergy[lc]}});
        }
        if (this.yType == "TotalEnergy"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d.TotalEnergy[lc]}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d.TotalEnergy[lc]}});
        }
        if (this.xType == "mass"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d.mass}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d.mass}});
        }
        if (this.yType == "mass"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d.mass}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d.mass}});
        }

        if (this.minY == undefined){this.minY = 0};
        if (this.minX == undefined){this.minX = 0};
        if (this.maxY == undefined){this.maxY = 0};
        if (this.maxX == undefined){this.maxX = 0};

        
    }

    // Function to get the right data
    getCorrectData(dim,data){
        let vis = this;
        if (dim == "y"){
            if (vis.yType=="AxialEnergy"){
                return data.AxialEnergy[vis.loadCase];
            }
            if (vis.yType=="BendingEnergy"){
                return data.BendingEnergy[vis.loadCase];
            }
            if (vis.yType=="gammastiff"){
                return data.gammastiff[vis.loadCase];
            }
            if (vis.yType=="TotalEnergy"){
                return data.TotalEnergy[vis.loadCase];
            }
            if (vis.yType=="mass"){
                return data.mass;
            }
        }
        if (dim == "x"){
            if (vis.xType=="AxialEnergy"){
                return data.AxialEnergy[vis.loadCase];
            }
            if (vis.xType=="BendingEnergy"){
                return data.BendingEnergy[vis.loadCase];
            }
            if (vis.xType=="gammastiff"){
                return data.gammastiff[vis.loadCase];
            }
            if (vis.xType=="TotalEnergy"){
                return data.TotalEnergy[vis.loadCase];
            }
            if (vis.xType=="mass"){
                return data.mass;
            }
        }
    }

    // Function to update the data
    updateData(){
        let vis = this;


        this.circles = this.chart.selectAll(".circle")
            .data(this.data,function(d){return d.ind;})
                .transition()
                .attr("cx",function(d){return vis.xScale(vis.getCorrectData("x",d));})
                .attr("cy",function(d){return vis.yScale(vis.getCorrectData("y",d));})
                .attr("fill",function(d){return colors[d.ind]})
                .attr("r",function(d){return d.isSelected==true ? 6 : 4;})
                .attr("stroke",function(d){return d.isSelected==true ? "black" : "none";})
                .attr("display",function(d){return d.active==false ? "none" : "block" })
        
        this.circles = this.chart.selectAll(".circle")
            .data(this.data,function(d){return d.ind;})
                .enter()
                .append("circle")
                .attr("class", "circle")
                .attr("cx",function(d){return vis.xScale(vis.getCorrectData("x",d));})
                .attr("cy",function(d){return vis.yScale(vis.getCorrectData("y",d));})
                .attr("fill",function(d){return colors[d.ind]})
                .attr("r",function(d){return d.isSelected==true ? 6 : 4;})
                .attr("stroke",function(d){return d.isSelected==true ? "black" : "none";})
                .attr("display",function(d){return d.active==false ? "none" : "block" })
        
    }

    // Function to initialize the brush
    makeBrush(){
        let vis = this;
         // Ting vedr. brush
        vis.brush = d3.brush()
            .extent([[0,0],[vis.width,vis.height]])
            .on("start",brushstarted)
            .on("brush",brushing)
            .on("end",brushended);
        vis.chart.append("g")
            .attr("class","brush")
            .call(vis.brush);
        function brushstarted(){console.log("brush started")}
        function brushing(){console.log("brushing")}
        function brushended({selection}){
            console.log("brush ended")
            //extent = brush.event.selection;
            //console.log(selection);

            // Initialize the selection values
            var [[x0, y0], [x1, y1]] = [[,],[,]];

            // Set the actual selection values if the selection isn't null
            if (selection != null){
                [[x0, y0], [x1, y1]] = selection;
            }
            // Finder det data som jeg har berørt
            for (var i = 0; i < vis.data.length; i++) {
                const brushedNodes = vis.data.filter(d=>vis.xScale(vis.getCorrectData("x",d))>=x0 &&
                                                    vis.xScale(vis.getCorrectData("x",d))<=x1 &&
                                                    vis.yScale(vis.getCorrectData("y",d))>=y0 &&
                                                    vis.yScale(vis.getCorrectData("y",d))<=y1 );
                //const notBrushedNodes = vis.data[i].beams.filter(d=>vis.xScale(vis.getCorrectData("x",d))<=x0 &&
                //                                    vis.xScale(vis.getCorrectData("x",d))>=x1 &&
                //                                    vis.yScale(vis.getCorrectData("y",d))<=y0 &&
                //                                    vis.yScale(vis.getCorrectData("y",d))>=y1 );
                
                // First we assume that no data i selected (kinda a reset)
                vis.data.forEach(function(entry){entry.isSelected=false});

                // Foreach selected node, set the object to selected
                //if (vis.data[i].active == true){
                    brushedNodes.forEach(function(entry){entry.isSelected=true});
                //}
            }

            // Update all plots in the global array "plots"
            // IMPORTANT TO HAVE ALL PLOTS IN THIS ARRAY
            updateEverything();

            }
    }

    updateBrush(){
        // Set new brush extent
        this.brush.extent([[0,0],[this.width,this.height]]);

        // Change the brush
        this.chart.select(".brush").call(this.brush);
    }


    




    makeContextMenu(){
        // Make a reference to "this"
        let vis = this;

        // Create the standard context menu
        super.makeContextMenu();

        ////////////////////////////////////
        // Create a new submenu for the xForce
        ////////////////////////////////////
        const xForceMenu = document.createElement("menu");
        xForceMenu.title = "xForce";
        const xForceButton0 = document.createElement("menu");
        xForceButton0.title = "Axial";
        xForceButton0.onclick = function(){vis.xType="AxialEnergy"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton0);
        const xForceButton1 = document.createElement("menu");
        xForceButton1.title = "Bending";
        xForceButton1.onclick = function(){vis.xType="BendingEnergy"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton1);
        const xForceButton2 = document.createElement("menu");
        xForceButton2.title = "Total";
        xForceButton2.onclick = function(){vis.xType="TotalEnergy"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton2);
        const xForceButton3 = document.createElement("menu");
        xForceButton3.title = "Gamma";
        xForceButton3.onclick = function(){vis.xType="gammastiff"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton3);
        const xForceButton4 = document.createElement("menu");
        xForceButton4.title = "Mass";
        xForceButton4.onclick = function(){vis.xType="mass"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton4);
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(xForceMenu);

        ////////////////////////////////////
        // Create a new submenu for the yForce
        ////////////////////////////////////
        const yForceMenu = document.createElement("menu");
        yForceMenu.title = "yForce";
        const yForceButton0 = document.createElement("menu");
        yForceButton0.title = "Axial";
        yForceButton0.onclick = function(){vis.yType="AxialEnergy"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton0);
        const yForceButton1 = document.createElement("menu");
        yForceButton1.title = "Bending";
        yForceButton1.onclick = function(){vis.yType="BendingEnergy"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton1);
        const yForceButton2 = document.createElement("menu");
        yForceButton2.title = "Total";
        yForceButton2.onclick = function(){vis.yType="TotalEnergy"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton2);
        const yForceButton3 = document.createElement("menu");
        yForceButton3.title = "Gamma";
        yForceButton3.onclick = function(){vis.yType="gammastiff"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton3);
        const yForceButton4 = document.createElement("menu");
        yForceButton4.title = "Mass";
        yForceButton4.onclick = function(){vis.yType="mass"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton4);
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(yForceMenu);

    }



    

}