
class ViolinChart extends IPlot{

    loadCase = 0;
    yForce = 0;
    yType = "force";
    title ="Bars";

    // This function is only run once and this is when the plot is created
    initializePlot(){
        super.initializePlot();

        // Make a constant to hold the margins (makes the code more readable)
        const m = this.margin;

        // Assign that the plot is "this" class
        let vis = this;   

        // Initialize a x-scale
        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .domain(["0","1","2"])
            .padding(0.05);

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

        vis.curveType = d3.curveCatmullRom;
    }

    // Function to find the maximum value of y and also finds out how many datasets are active
    getDomains(){
        let vis = this;
        let lc = this.loadCase;
        let yVal = this.yForce;

       

        if (vis.yType=="force"){
            this.minY = d3.min(this.data,function(d){if (d.active == true){return d3.min(d.beams,function(beam){return beam.maxForces[lc][yVal]})}});
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d3.max(d.beams,function(beam){return beam.maxForces[lc][yVal]})}});
        }

        if (vis.yType=="axEnergy"){
            this.maxY = d3.max(vis.data,function(d) {if (d.active == true){return d3.max(d.beams,d=>d.axialDefEnergy[vis.loadCase])}})
            this.minY = d3.min(vis.data,function(d) {if (d.active == true){return d3.min(d.beams,d=>d.axialDefEnergy[vis.loadCase])}})
        }

        if (vis.yType=="beEnergy"){
            this.maxY = d3.max(vis.data,function(d) {if (d.active == true){return d3.max(d.beams,d=>d.bendingDefEnergy[vis.loadCase])}})
            this.minY = d3.min(vis.data,function(d) {if (d.active == true){return d3.min(d.beams,d=>d.bendingDefEnergy[vis.loadCase])}})
        }

        // Get the active models
        let xDomain = [];
        for (var i = 0; i<this.data.length;i++){
            if (this.data[i].active == true){
                xDomain.push(i);
            }
        }
        this.xDomain = xDomain;
    }

    updateScales(){
        let vis = this;
        // Get axis labels
        if (this.yForce==0){this.yLabel="Fx [kN]"}
        if (this.yForce==1){this.yLabel="Fy [kN]"}
        if (this.yForce==2){this.yLabel="Fz [kN]"}
        if (this.yForce==3){this.yLabel="Mx [kNm]"}
        if (this.yForce==4){this.yLabel="My [kNm]"}
        if (this.yForce==5){this.yLabel="Mz [kNm]"}
        if (this.yType=="axEnergy"){this.yLabel="Ax. Energy [kNm]"}
        if (this.yType=="beEnergy"){this.yLabel="Be. Energy [kNm]"}

        // Assign the new domains
        this.xScale.domain(this.xDomain);
        this.yScale.domain([this.minY,this.maxY]);
        this.xScale.range([0,this.width]);
        this.yScale.range([this.height,0]);

        // Select and call new axes
        this.chart.select(".yAxis")
                .transition()
                .duration(750)
                .call(d3.axisLeft(this.yScale));
        this.chart.select(".xAxis")
                .transition()
                .duration(750)
                .attr("transform", "translate(0," + this.height + ")")
                .call(d3.axisBottom(this.xScale));

        // Set the x-label to nothing or something else
        this.chart.select(".xLabel")
            .text("")
            .attr("x", this.width)
            .attr("y", this.height + this.margin.top + 20);
    
        // Make the y-scale label correspond to the data
        this.chart.select(".yLabel")
            .text(this.yLabel);

        this.chart.select(".title")
            .text(vis.title + " (Load case " + vis.loadCase + ")")
            .attr("x", this.width/2)
            .attr("y", 0);

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

    updateData(){
        // Make a reference to the class
        let vis = this;
        
        // Define a function for the histogram
        var histoChart = d3.histogram()
            .domain(vis.yScale.domain())
            .thresholds(vis.yScale.ticks(15))
            //.value(d=>d.maxForces[vis.loadCase][vis.yForce]);
            .value(d=>vis.getCorrectData(d));

        // Make a function for the lines
        var area = d3.area()
            .x0(d => xNum(-d.length)) 
            .x1(d => xNum(d.length))
            .y(d => vis.yScale(d.x0))
            .curve(vis.curveType)
            //.curve(d3.curveStep)
            //.curve(d3.curveLinear)

        // Get the maximum number in the bins
        //var maxNum = d3.max(vis.data,function(d){return d3.max(histoChart(d.beams),function(d){return d.length})});
        var maxNum = d3.max(vis.data,function(d){if (d.active == true){return d3.max(histoChart(d.beams),function(d){return d.length})}});

        // Define a new x-scale to make sure the violin charts does not exceed each other
        var xNum = d3.scaleLinear()
            .range([0,vis.xScale.bandwidth()])
            .domain([-maxNum,maxNum]);

        // This updates existing violines
        vis.chart.selectAll(".violins")
            .data(vis.data)
            .transition()
            .attr("transform",function(d,i){
                if (vis.data[i].active==true){
                    return("translate("+vis.xScale(i)+",0)")}
                else{
                    return("translate(-1000,0)")}})
            .select(".violinspath")
            .attr("d",function(d){return area(histoChart(d.beams))});
        
        // When the data enters, do this
        vis.chart.selectAll(".violins")
            .data(vis.data)
            .enter()
            .append("g")
                .attr("transform",function(d,i){
                    if (vis.data[i].active==true){
                        return("translate("+vis.xScale(i)+",0)")}
                    else{
                        return("translate(-1000,0)")}})
                .attr("class","violins")
            .append("path")
                .attr("class","violinspath")
                .style("stroke", "none")
                .style("fill", function(d,i) {return(colors[i])})
                .attr("d",function(d){return area(histoChart(d.beams))});
    }

    makeContextMenu(){
        let vis = this;

        super.makeContextMenu();

        /////////////////////////////////////
        ////   Curve type menu //////////////
        /////////////////////////////////////
        const curveTypeMenu = document.createElement("menu");
        curveTypeMenu.title = "curve";
        const curveButtonStep = document.createElement("menu");
        curveButtonStep.title = "step";
        curveButtonStep.onclick = function(){vis.curveType=d3.curveStep; vis.updatePlot()};
        curveTypeMenu.appendChild(curveButtonStep);
        const curveButtonCatmull = document.createElement("menu");
        curveButtonCatmull.title = "catmull";
        curveButtonCatmull.onclick = function(){vis.curveType=d3.curveCatmullRom; vis.updatePlot()};
        curveTypeMenu.appendChild(curveButtonCatmull);
        document.getElementById("cntx"+vis.elementId).appendChild(curveTypeMenu);

        /////////////////////////////////////
        ////   yForce menu     //////////////
        /////////////////////////////////////
        const yForceMenu = document.createElement("menu");
        yForceMenu.title = "yForce";
        const yForceButton0 = document.createElement("menu");
        yForceButton0.title = "N";
        yForceButton0.onclick = function(){vis.yType="force";  vis.yForce=0; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton0);
        const yForceButton1 = document.createElement("menu");
        yForceButton1.title = "Fy";
        yForceButton1.onclick = function(){vis.yType="force";  vis.yForce=1; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton1);
        const yForceButton2 = document.createElement("menu");
        yForceButton2.title = "Fz";
        yForceButton2.onclick = function(){vis.yType="force";  vis.yForce=2; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton2);
        const yForceButton3 = document.createElement("menu");
        yForceButton3.title = "Mx";
        yForceButton3.onclick = function(){vis.yType="force";  vis.yForce=3; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton3);
        const yForceButton4 = document.createElement("menu");
        yForceButton4.title = "My";
        yForceButton4.onclick = function(){vis.yType="force";  vis.yForce=4; vis.updatePlot()};
        yForceMenu.appendChild(yForceButton4);
        const yForceButton5 = document.createElement("menu");
        yForceButton5.title = "Mz";
        yForceButton5.onclick = function(){vis.yType="force";  vis.yForce=5; vis.updatePlot()};
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
        this.getDomains();
        this.updateScales();
        this.updateData();
    }

}