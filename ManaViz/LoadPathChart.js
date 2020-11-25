class LoadPathChart extends IPlot{
    loadCase = 0;
    yForce = 0;
    yType = "force";
    title = "Bars"


    initializePlot(){
        super.initializePlot();

        // Make a constant to hold the margins (makes the code more readable)
        const m = this.margin;

        // Assign that the plot is "this" class
        let vis = this;   

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // SETS INDEX FOR EACH MODEL
        // THIS SHOULD HAPPEN FROM THE C# SCRIPT
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //for (let i=0; i<this.data.length; i++){
        //    this.data[i].ind = i;
        //}
    

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
             .attr("x", -m.top)
             .text("y axis title"); 

         // Title
        vis.chart.append("text")
            .attr("class","title")
            .attr("text-anchor","middle")
            .attr("y",0)
            .attr("x",vis.width/2)
            .text("Plot title")

        // Experimental create context menu
        //vis.makeContextMenu();
    }

    getDomains(){
        let vis = this;
        // Finder maksimale længder
        this.maxX = d3.max(vis.data,function(d) {return d3.sum(d.beams,d=>d.length)}); 
        this.minX = 0;

        if (vis.yType=="force"){
            this.maxY = d3.max(vis.data,function(d) {if (d.active == true){return d3.max(d.beams,d=>d.maxForces[vis.loadCase][vis.yForce])}})
            this.minY = d3.min(vis.data,function(d) {if (d.active == true){return d3.min(d.beams,d=>d.maxForces[vis.loadCase][vis.yForce])}})
        }

        if (vis.yType=="axEnergy"){
            this.maxY = d3.max(vis.data,function(d) {if (d.active == true){return d3.max(d.beams,d=>d.axialDefEnergy[vis.loadCase])}})
            this.minY = d3.min(vis.data,function(d) {if (d.active == true){return d3.min(d.beams,d=>d.axialDefEnergy[vis.loadCase])}})
        }

        if (vis.yType=="beEnergy"){
            this.maxY = d3.max(vis.data,function(d) {if (d.active == true){return d3.max(d.beams,d=>d.bendingDefEnergy[vis.loadCase])}})
            this.minY = d3.min(vis.data,function(d) {if (d.active == true){return d3.min(d.beams,d=>d.bendingDefEnergy[vis.loadCase])}})
        }



        // this is how i sort the data
        //window.sorted = vis.data[0].beams.sort((a,b)=>d3.descending(a.maxForces[0][0], b.maxForces[0][0])
    }

    updateScales(){
        let vis = this;
        this.xLabel = "[m]"
        
        if (this.yForce==0){this.yLabel="Fx [kN]"}
        if (this.yForce==1){this.yLabel="Fy [kN]"}
        if (this.yForce==2){this.yLabel="Fz [kN]"}
        if (this.yForce==3){this.yLabel="Mx [kNm]"}
        if (this.yForce==4){this.yLabel="My [kNm]"}
        if (this.yForce==5){this.yLabel="Mz [kNm]"}
        if (this.yType=="axEnergy"){this.yLabel="Ax. Energy [kNm]"}
        if (this.yType=="beEnergy"){this.yLabel="Be. Energy [kNm]"}

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

    updateData(){
        let vis = this;
        //console.log(d3.cumsum(vis.data[0].beams,d=>d.length))

        const line = d3.line()
            //.x(function(d){return vis.xScale(d.length);})
            .x(function(d){return vis.xScale(d.cumlength);})
            //.y(function(d){return vis.yScale(d.maxForces[vis.loadCase][vis.yForce]);})
            .y(function(d){return vis.yScale(vis.getCorrectData(d));})
            .curve(d3.curveStepAfter);
            //.curve(d3.curveBasis);
            

        // This updates the exiting lines
        this.lines = vis.chart.selectAll(".lines")
            .data(vis.data)
                .transition()
                .attr("d",function(d){vis.SortAndCumsum(d); return line(d.beams)})
                .attr("stroke-width",function(d){if (d.active==false){return 0}else{return 1.5}})
        
        // This adds new lines
        this.lines = vis.chart.selectAll(".lines")
            .data(vis.data)
                .enter()
                    .append("path")
                        .attr("class","lines")
                        .transition()
                        .attr("fill","none")
                        .attr("stroke",function(d){return colors[d.ind]})
                        .attr("stroke-width",function(d){if (d.active==false){return 0}else{return 1.5}})
                        .attr("d",function(d){vis.SortAndCumsum(d); return line(d.beams)})



    }

    SortAndCumsum(data){
        let vis = this;
        //data.beams.sort((a,b)=>d3.descending(a.maxForces[vis.loadCase][vis.yForce], b.maxForces[vis.loadCase][vis.yForce]))
        data.beams.sort((a,b)=>d3.descending(vis.getCorrectData(a), vis.getCorrectData(b)))
        let test = d3.cumsum(data.beams,d=>d.length);
        for (let i=0; i<test.length;i++){
            data.beams[i].cumlength = test[i];
        }
    }

     // Function to get the right data
     getCorrectData(data){
        let vis = this;
        
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

    makeContextMenu(){
        // Make a reference to "this"
        let vis = this;

        // Create the standard context menu
        super.makeContextMenu();


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

  


    updatePlot(){
        super.updatePlot();
        //this.updateSVG();
        this.getDomains();
        this.updateScales();
        this.updateData();
        //this.updateBrush();
    }

}