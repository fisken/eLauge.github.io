class BarChartModel extends IPlot{
    title = "Models";
    loadCase = 0;
    yType = "AxialEnergy";

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
    }

    // Function to find the maximum value of y and also finds out how many datasets are active
    getDomains(){
        let vis = this;
        let lc = this.loadCase;
        //if (this.yType=="AxialEnergy"){yVal=this.yType}
        //if (this.yType=="BendingEnergy"){yVal=this.yType}
        //if (this.yType=="TotalEnergy"){yVal="Total [kNm] "}

        // Get the extreme values to the yscale
        //this.minY = d3.min(this.data,function(d){return d[vis.yType][lc]});
        this.minY = 0;
        if (vis.yType=="mass"){
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d[vis.yType]}});
        }
        else{
            this.maxY = d3.max(this.data,function(d){if (d.active == true){return d[vis.yType][lc]}});
        }

        
        if (this.maxY == undefined){this.maxY = 0};
    

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
        if (this.yType=="AxialEnergy"){this.yLabel="Axial [kNm]"}
        if (this.yType=="BendingEnergy"){this.yLabel="Bending [kNm] "}
        if (this.yType=="TotalEnergy"){this.yLabel="Total [kNm] "}
        if (this.yType=="gammastiff"){this.yLabel="gamma_stiff"}
        if (this.yType=="mass"){this.yLabel="mass"}


        // Assign the new domains
        this.xScale.domain(this.xDomain);
        this.yScale.domain([this.minY,this.maxY]);
        this.xScale.range([0,this.width]);
        this.yScale.range([this.height,0]);
        
        // Select and call new axes
        this.chart.select(".yAxis")
                .transition()
                .duration(750)
                .call(d3.axisLeft(this.yScale).ticks(5,d3.format(".1")));
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

    updateData(){
        let vis = this;

        vis.chart.selectAll(".bars")
            .data(vis.data)
            .transition()
            .attr("x",function(d,i){
                if (vis.data[i].active==true){
                    return(vis.xScale(i))}
                else{
                    return(-1000)}})
            .attr("y",function(d){
                if (vis.yType=="mass"){return vis.yScale(d[vis.yType])}
                else{return vis.yScale(d[vis.yType][vis.loadCase])}})
            .attr("width", vis.xScale.bandwidth())
            .attr("height", function(d){
                if (vis.yType=="mass"){return vis.height - vis.yScale(d[vis.yType])}
                else{return vis.height - vis.yScale(d[vis.yType][vis.loadCase])}})

        vis.chart.selectAll(".bars")
            .data(vis.data)
            .enter()
            .append("rect")
            .attr("class","bars")
            .attr("x",function(d,i){
                if (vis.data[i].active==true){
                    return(vis.xScale(i))}
                else{
                    return(-1000)}})
            .attr("y",function(d){
                if (vis.yType=="mass"){return vis.yScale(d[vis.yType])}
                else{return vis.yScale(d[vis.yType][vis.loadCase])}})
            .attr("width", vis.xScale.bandwidth())
            .attr("height", function(d){
                if (vis.yType=="mass"){return vis.height - vis.yScale(d[vis.yType])}
                else{return vis.height - vis.yScale(d[vis.yType][vis.loadCase])}})
            .attr("fill", function(d,i){return colors[i]})
    }

    makeContextMenu(){
        let vis = this;

        super.makeContextMenu();

        /////////////////////////////////////
        ////   yForce menu     //////////////
        /////////////////////////////////////
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


    updatePlot(){
        super.updatePlot();
        this.getDomains();
        this.updateScales();
        this.updateData();
    }



}