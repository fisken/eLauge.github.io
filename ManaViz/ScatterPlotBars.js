// Scatterplot for use of bars
// Can all information related to bars
class ScatterPlotBars extends IPlot{
    // The class will need to know what type needs to be plottet at each axis
    // force, axEnergy, beEnergy or kink angle
    xType = "force";
    yType = "force";
    title = "Bars";
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
        if (this.xType=="force"){
            if (this.xForce==0){this.xLabel="Fx [kN]"}
            if (this.xForce==1){this.xLabel="Fy [kN]"}
            if (this.xForce==2){this.xLabel="Fz [kN]"}
            if (this.xForce==3){this.xLabel="Mx [kNm]"}
            if (this.xForce==4){this.xLabel="My [kNm]"}
            if (this.xForce==5){this.xLabel="Mz [kNm]"}
        }
        if (this.yType=="force"){
            if (this.yForce==0){this.yLabel="Fx [kN]"}
            if (this.yForce==1){this.yLabel="Fy [kN]"}
            if (this.yForce==2){this.yLabel="Fz [kN]"}
            if (this.yForce==3){this.yLabel="Mx [kNm]"}
            if (this.yForce==4){this.yLabel="My [kNm]"}
            if (this.yForce==5){this.yLabel="Mz [kNm]"}
        }
        if (this.xType=="kinkAngle"){this.xLabel="kink angle"}
        if (this.yType=="kinkAngle"){this.yLabel="kink angle"}
        if (this.xType=="axEnergy"){this.xLabel="Ax. Energy [kNm]"}
        if (this.xType=="beEnergy"){this.xLabel="Be. Energy [kNm]"}



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
        let xforce = this.xForce;
        let yforce = this.yForce;

        if (this.xType == "kinkAngle"){
            this.minX = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.kinkAngle})});
            this.maxX = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.kinkAngle})}); 
        }
        if (this.yType == "kinkAngle"){
            this.minY = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.kinkAngle})});
        this.maxY = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.kinkAngle})});  
        }

        if (this.xType == "axEnergy"){
            this.minX = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.axialDefEnergy[lc]})});
            this.maxX = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.axialDefEnergy[lc]})}); 
        }
        if (this.yType == "axEnergy"){
            this.minY = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.axialDefEnergy[lc]})});
            this.maxY = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.axialDefEnergy[lc]})});  
        }

        if (this.xType == "beEnergy"){
            this.minX = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.bendingDefEnergy[lc]})});
            this.maxX = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.bendingDefEnergy[lc]})}); 
        }
        if (this.yType == "beEnergy"){
            this.minY = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.bendingDefEnergy[lc]})});
            this.maxY = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.bendingDefEnergy[lc]})});  
        }

        // SHOULD ONLY GET SMALLEST VALUE OF ACTIVE DATA SETS
        if (this.xType == "force"){
            this.minX = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.maxForces[lc][xforce]})});
            this.maxX = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.maxForces[lc][xforce]})});
        }
        if (this.yType == "force"){
            this.minY = d3.min(this.data,function(d){return d3.min(d.beams,function(beam){return beam.maxForces[lc][yforce]})});
            this.maxY = d3.max(this.data,function(d){return d3.max(d.beams,function(beam){return beam.maxForces[lc][yforce]})});  
        }

        
    }

    // Function to get the right data
    getCorrectData(dim,data){
        let vis = this;
        if (dim == "y"){
            if (vis.yType=="kinkAngle"){
                return data.kinkAngle
            }
            if (vis.yType=="force"){
                return data.maxForces[vis.loadCase][vis.yForce]
            }
            if (vis.yType=="axEnergy"){
                return data.axialDefEnergy[vis.loadCase]
            }
            if (vis.yType=="beEnergy"){
                return data.bendingDefEnergy[vis.loadCase]
            }
        }
        if (dim == "x"){
            if (vis.xType=="kinkAngle"){
                return data.kinkAngle
            }
            if (vis.xType=="force"){
                return data.maxForces[vis.loadCase][vis.xForce]
            }
            if (vis.xType=="axEnergy"){
                return data.axialDefEnergy[vis.loadCase]
            }
            if (vis.xType=="beEnergy"){
                return data.bendingDefEnergy[vis.loadCase]
            }
        }
    }

    // Function to update the data
    updateData(){
        let vis = this;

        // Loop over each gridshell
        for (var i = 0; i < vis.data.length; i++) {

            // If the current data set is active
            if (vis.data[i].active == true){
                // Select all the circle with the corresponding class and update the values
                this.circles = this.chart.selectAll(".circle"+i)
                    .data(this.data[i].beams,function(d){return d.ind;}) // Assign the data
                        //.sort((a,b)=>d3.descending(a.ind,b.ind))
                        .transition()
                        .attr("cx",function(d){return vis.xScale(vis.getCorrectData("x",d));})
                        .attr("cy",function(d){return vis.yScale(vis.getCorrectData("y",d));})
                        .attr("fill",colors[i])
                        .attr("r",function(d){return d.isSelected==true ? 4 : 2;})
                        

                // Select all the circles with the corresponding values and update the circles entering
                this.circles = this.chart.selectAll(".circle"+i)
                        .data(vis.data[i].beams,function(d){return d.ind;})
                        .enter()
                            .append("circle")
                                .attr("class","circle"+i)
                                .transition()
                                //.attr("cx",function(d){return vis.xScale(d.maxForces[vis.loadCase][vis.xForce]);})
                                .attr("cx",function(d){return vis.xScale(vis.getCorrectData("x",d));})
                                .attr("cy",function(d){return vis.yScale(vis.getCorrectData("y",d));})
                                .attr("r",function(d){return d.isSelected==true ? 4 : 2;})
                                .attr("fill",colors[i]);
            }
            // If the current data set i NOT active
            else{
                this.circles = this.chart.selectAll(".circle"+i)
                    .data(this.data[i].beams,function(d){return d.ind;}) 
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
                const brushedNodes = vis.data[i].beams.filter(d=>vis.xScale(vis.getCorrectData("x",d))>=x0 &&
                                                    vis.xScale(vis.getCorrectData("x",d))<=x1 &&
                                                    vis.yScale(vis.getCorrectData("y",d))>=y0 &&
                                                    vis.yScale(vis.getCorrectData("y",d))<=y1 );
                //const notBrushedNodes = vis.data[i].beams.filter(d=>vis.xScale(vis.getCorrectData("x",d))<=x0 &&
                //                                    vis.xScale(vis.getCorrectData("x",d))>=x1 &&
                //                                    vis.yScale(vis.getCorrectData("y",d))<=y0 &&
                //                                    vis.yScale(vis.getCorrectData("y",d))>=y1 );
                
                // First we assume that no data i selected (kinda a reset)
                vis.data[i].beams.forEach(function(entry){entry.isSelected=false});

                // Foreach selected node, set the object to selected
                if (vis.data[i].active == true){
                    brushedNodes.forEach(function(entry){entry.isSelected=true});
                }
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
        xForceButton0.title = "N";
        xForceButton0.onclick = function(){vis.xForce=0; vis.xType="force"; vis.updatePlot()};
        xForceMenu.appendChild(xForceButton0);
        const xForceButton1 = document.createElement("menu");
        xForceButton1.title = "Fy";
        xForceButton1.onclick = function(){vis.xForce=1; vis.xType="force";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton1);
        const xForceButton2 = document.createElement("menu");
        xForceButton2.title = "Fz";
        xForceButton2.onclick = function(){vis.xForce=2; vis.xType="force";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton2);
        const xForceButton3 = document.createElement("menu");
        xForceButton3.title = "Mx";
        xForceButton3.onclick = function(){vis.xForce=3; vis.xType="force";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton3);
        const xForceButton4 = document.createElement("menu");
        xForceButton4.title = "My";
        xForceButton4.onclick = function(){vis.xForce=4; vis.xType="force";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton4);
        const xForceButton5 = document.createElement("menu");
        xForceButton5.title = "My";
        xForceButton5.onclick = function(){vis.xForce=5; vis.xType="force";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton5);
        const xForceButton6 = document.createElement("menu");
        xForceButton6.title = "KinkAngle";
        xForceButton6.onclick = function(){vis.xType="kinkAngle";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton6);
        const xForceButton7 = document.createElement("menu");
        xForceButton7.title = "axialEnergy";
        xForceButton7.onclick = function(){vis.xType="axEnergy";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton7);
        const xForceButton8 = document.createElement("menu");
        xForceButton8.title = "bendingEnergy";
        xForceButton8.onclick = function(){vis.xType="beEnergy";  vis.updatePlot()};
        xForceMenu.appendChild(xForceButton8);
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(xForceMenu);

        ////////////////////////////////////
        // Create a new submenu for the yForce
        ////////////////////////////////////
        const yForceMenu = document.createElement("menu");
        yForceMenu.title = "yForce";
        const yForceButton0 = document.createElement("menu");
        yForceButton0.title = "N";
        yForceButton0.onclick = function(){vis.yForce=0; vis.yType="force"; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton0);
        const yForceButton1 = document.createElement("menu");
        yForceButton1.title = "Fy";
        yForceButton1.onclick = function(){vis.yForce=1; vis.yType="force";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton1);
        const yForceButton2 = document.createElement("menu");
        yForceButton2.title = "Fz";
        yForceButton2.onclick = function(){vis.yForce=2; vis.yType="force";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton2);
        const yForceButton3 = document.createElement("menu");
        yForceButton3.title = "Mx";
        yForceButton3.onclick = function(){vis.yForce=3; vis.yType="force";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton3);
        const yForceButton4 = document.createElement("menu");
        yForceButton4.title = "My";
        yForceButton4.onclick = function(){vis.yForce=4; vis.yType="force";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton4);
        const yForceButton5 = document.createElement("menu");
        yForceButton5.title = "Mz";
        yForceButton5.onclick = function(){vis.yForce=5; vis.yType="force";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton5);
        const yForceButton6 = document.createElement("menu");
        yForceButton6.title = "KinkAngle";
        yForceButton6.onclick = function(){vis.yType="kinkAngle";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton6);
        const yForceButton7 = document.createElement("menu");
        yForceButton7.title = "axialEnergy";
        yForceButton7.onclick = function(){vis.yType="axEnergy";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton7);
        const yForceButton8 = document.createElement("menu");
        yForceButton8.title = "bendingEnergy";
        yForceButton8.onclick = function(){vis.yType="beEnergy";  vis.updatePlot()};
        yForceMenu.appendChild(yForceButton8);
        // Append the new menu to the context menu
        document.getElementById("cntx"+vis.elementId).appendChild(yForceMenu);


    }



    

}