// Scatterplot for use of bars
// Can all information related to bars
class ScatterPlotPanels extends IPlot{
    // The class will need to know what type needs to be plottet at each axis
    xType = "area";
    yType = "planarity";
    title = "Panels"
    drawConvexHulls = true;
    

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
        if (this.xType=="area"){this.xLabel="Area [m2]"}
        if (this.yType=="area"){this.yLabel="Area [m2]"}
        if (this.xType=="planarity"){this.xLabel="planarity [m]"}
        if (this.yType=="planarity"){this.yLabel="planarity [m]"}


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
            .text(vis.title)
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

        if (this.xType == "area"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d3.min(d.panels,function(panel){return panel.area})}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d3.max(d.panels,function(panel){return panel.area})}}); 
        }

        if (this.yType == "area"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d3.min(d.panels,function(panel){return panel.area})}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d3.max(d.panels,function(panel){return panel.area})}}); 
        }



        // SHOULD ONLY GET SMALLEST VALUE OF ACTIVE DATA SETS
        if (this.xType == "planarity"){
            this.minX = d3.min(this.data,function(d){if (d.active == true){return d3.min(d.panels,function(panel){return panel.planarity})}});
            this.maxX = d3.max(this.data,function(d){if (d.active == true){return d3.max(d.panels,function(panel){return panel.planarity})}});
        }

        if (this.yType == "planarity"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d3.min(d.panels,function(panel){return panel.planarity})}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d3.max(d.panels,function(panel){return panel.planarity})}});  
        }

        
    }

    // Function to get the right data
    getCorrectData(dim,data){
        let vis = this;
        if (dim == "y"){
            if (vis.yType=="area"){
                return data.area
            }
            if (vis.yType=="planarity"){
                return data.planarity
            }
        }
        if (dim == "x"){
            if (vis.xType=="area"){
                return data.area
            }
            if (vis.xType=="planarity"){
                return data.planarity
            }
        }
    }

    // Function to update the data
    updateData(){

        let vis = this;

        if (vis.drawConvexHulls == true){
            vis.getConvexHull();
        }
        else{
            // Loop over each gridshell
            for (var i = 0; i < vis.data.length; i++) {

                // remove all polygons
                vis.chart.selectAll(".polygon"+i)
                    .remove()

                // If the current data set is active
                if (vis.data[i].active == true){
                    // Select all the circle with the corresponding class and update the values
                    this.circles = this.chart.selectAll(".circle"+i)
                        .data(this.data[i].panels,function(d){return d.ind;}) // Assign the data
                            //.sort((a,b)=>d3.descending(a.ind,b.ind))
                            .transition()
                            //.attr("cx",function(d){return vis.xScale(d.deformations[vis.loadCase][vis.xForce]);})
                            //.attr("cy",function(d){return vis.yScale(d.deformations[vis.loadCase][vis.yForce]);})
                            .attr("cx",function(d){return vis.xScale(vis.getCorrectData("x",d));})
                            .attr("cy",function(d){return vis.yScale(vis.getCorrectData("y",d));})
                            .attr("fill",colors[i])
                            .attr("r",function(d){return d.isSelected==true ? 4 : 2;})
                            .attr("stroke",function(d){return d.isSelected==true ? "black" : "none";})
                            

                    // Select all the circles with the corresponding values and update the circles entering
                    this.circles = this.chart.selectAll(".circle"+i)
                            .data(vis.data[i].panels,function(d){return d.ind;})
                            .enter()
                                .append("circle")
                                    .attr("class","circle"+i)
                                    .transition()
                                    //.attr("cx",function(d){return vis.xScale(d.deformations[vis.loadCase][vis.xForce]);})
                                    //.attr("cy",function(d){return vis.yScale(d.deformations[vis.loadCase][vis.yForce]);})
                                    .attr("cx",function(d){return vis.xScale(vis.getCorrectData("x",d));})
                                    .attr("cy",function(d){return vis.yScale(vis.getCorrectData("y",d));})
                                    .attr("r",function(d){return d.isSelected==true ? 4 : 2;})
                                    .attr("stroke",function(d){return d.isSelected==true ? "black" : "none";})
                                    .attr("fill",colors[i]);
                }
                // If the current data set i NOT active
                else{
                    this.circles = this.chart.selectAll(".circle"+i)
                        .data(this.data[i].panels,function(d){return d.ind;}) 
                            .transition()
                            .attr("r",0)
                            .remove();  
                }
            }
            

            // What to do with the removed data
            //this.circles = this.svg.selectAll("circle")
            //   .data(this.data.beams)
            //   .exit()
            //   .remove();
        }
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
                const brushedNodes = vis.data[i].panels.filter(d=>vis.xScale(vis.getCorrectData("x",d))>=x0 &&
                                                    vis.xScale(vis.getCorrectData("x",d))<=x1 &&
                                                    vis.yScale(vis.getCorrectData("y",d))>=y0 &&
                                                    vis.yScale(vis.getCorrectData("y",d))<=y1 );
                const notBrushedNodes = vis.data[i].panels.filter(d=>vis.xScale(vis.getCorrectData("x",d))<=x0 &&
                                                    vis.xScale(vis.getCorrectData("x",d))>=x1 &&
                                                    vis.yScale(vis.getCorrectData("y",d))<=y0 &&
                                                    vis.yScale(vis.getCorrectData("y",d))>=y1 );
                
                // First we assume that no data i selected (kinda a reset)
                vis.data[i].panels.forEach(function(entry){entry.isSelected=false});

                // Foreach selected node, set the object to selected
                brushedNodes.forEach(function(entry){entry.isSelected=true});
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

    // Experimental function that draws the convex hull of a data set
    getConvexHull(){
        let vis = this;

        // Loop over each gridshell
        for (var i = 0; i < vis.data.length; i++) {

            // remove all circles
            this.circles = this.chart.selectAll(".circle"+i)
                .data(this.data[i].panels,function(d){return d.ind;}) 
                .remove();  

            // If the current data set is active
            if (vis.data[i].active == true){

                var points = new Array(vis.data[i].panels.length);
                for (var k = 0; k < vis.data[i].panels.length; k++) {
                    points[k] = new Array(2);
                    points[k][0] = vis.xScale(vis.getCorrectData("x",vis.data[i].panels[k]))
                    points[k][1] = vis.yScale(vis.getCorrectData("y",vis.data[i].panels[k]))
                }

                var hull = d3.polygonHull(points);


                // If does exist
                vis.chart.selectAll(".polygon"+i)
                    .data([hull])
                    .transition()
                    .attr("points",function(d){return d.map(function(d){return [d[0],d[1]].join(",")})})
                    .attr("stroke",colors[i])
                    .attr("stroke-width",1)
                    .attr("fill","none")

                // If does not exist
                vis.chart.selectAll(".polygon"+i)
                    .data([hull])
                    .enter().append("polygon")
                    .attr("class","polygon"+i)
                    .attr("points",function(d){return d.map(function(d){return [d[0],d[1]].join(",")})})
                    .attr("stroke",colors[i])
                    .attr("stroke-width",1)
                    .attr("fill","none")
            }
            else{
                // remove
                vis.chart.selectAll(".polygon"+i)
                    .remove()
            }
        }

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
        xForceButton0.title = "area";
        xForceButton0.onclick = function(){vis.xType="area"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton0);
        const xForceButton1 = document.createElement("menu");
        xForceButton1.title = "planarity";
        xForceButton1.onclick = function(){vis.xType="planarity"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton1);
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(xForceMenu);

        ////////////////////////////////////
        // Create a new submenu for the yForce
        ////////////////////////////////////
        const yForceMenu = document.createElement("menu");
        yForceMenu.title = "yForce";
        const yForceButton0 = document.createElement("menu");
        yForceButton0.title = "area";
        yForceButton0.onclick = function(){vis.yType="area"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton0);
        const yForceButton1 = document.createElement("menu");
        yForceButton1.title = "planarity";
        yForceButton1.onclick = function(){vis.yForce=1; vis.yType="planarity"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton1);
        
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(yForceMenu);

         ////////////////////////////////////
        // Create a new submenu for drawing type
        ////////////////////////////////////
        const drawMenu = document.createElement("menu");
        drawMenu.title = "draw";
        const drawMenuConvexHull = document.createElement("menu");
        drawMenuConvexHull.title = "Hull";
        drawMenuConvexHull.onclick = function(){vis.drawConvexHulls=true; vis.updatePlot()};
        drawMenu.appendChild(drawMenuConvexHull);
        const drawMenuPoints = document.createElement("menu");
        drawMenuPoints.title = "Points";
        drawMenuPoints.onclick = function(){vis.drawConvexHulls=false; vis.updatePlot()};
        drawMenu.appendChild(drawMenuPoints);
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(drawMenu);


    }



    

}