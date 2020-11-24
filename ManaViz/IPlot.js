class IPlot{
    // The constructor for a plot
    constructor(opts){
        // The id of the DOM element the plot i assigned to
        this.elementId = opts.elementId; 

        // Gets the actual element
        this.element = document.getElementById(this.elementId);

        // The margins of the plot
        this.margin = {top: 20, right: 20, bottom: 45, left: 50};

        // Assigns the dataset to the plot
        this.data = opts.dataset;

        // Initialize the plot
        this.initializePlot();
    }

    // This function calculates the dimensions of the plot
    calculateDimensions(){
        this.height = this.element.offsetHeight-this.margin.top-this.margin.bottom;
        this.width = this.element.offsetWidth-this.margin.left-this.margin.right;
    }

    // Function to initialize a plot
    // This should create the SVG, the brush, axes, scales and so on
    initializePlot(){
        this.calculateDimensions();

        // This just makes the code nicer
        let vis = this;
        let m = this.margin;
    
        // Create the svg element
        vis.svg = d3.select(vis.element)
                    .append("svg")
                    .attr("width",this.width  + m.left + m.right)
                    .attr("height",this.height + m.top + m.bottom)

        // Create the chart
        vis.chart = vis.svg.append("g")
                    .attr('transform',`translate(${m.left},${m.top})`);

        vis.makeContextMenu();
    }

    // Function to update a plot
    // This should not create anythin new but merely update the exiting axis, brush, scales and so on
    updatePlot(){
        this.calculateDimensions();
        this.updateSVG(); 
    }




    // Function to delete this plot
    deletePlot(){
        let vis = this;
        // Remove widget from the grid
        grid.removeWidget(vis.element.parentElement);
        // Remove the plot from the list of plots
        plots.splice(plots.findIndex(x=>x.elementId==vis.elementId),1);
    }

    // Function to update the size of the SVG
    updateSVG(){
        // Set the new size of the SVG
        this.svg.attr("width",this.width  + this.margin.left + this.margin.right)
            .attr("height",this.height + this.margin.top + this.margin.bottom);
    }

    changePlot(plottype){
        let vis = this;

        // Remove the svg
        document.getElementById("cntx"+vis.elementId).remove();
        vis.element.getElementsByTagName("svg")[0].remove();
        
        
        // Remove the plot from the list of plots
        plots.splice(plots.findIndex(x=>x.elementId==vis.elementId),1);

      

        // Add new plot
        var opts = {elementId: vis.elementId, dataset:mydata}

        if (plottype=="ScatterPlotBars"){plots.push(new ScatterPlotBars(opts));};
        if (plottype=="ScatterPlotNodes"){plots.push(new ScatterPlotNodes(opts));};
        if (plottype=="ScatterPlotPanels"){plots.push(new ScatterPlotPanels(opts));};
        if (plottype=="ViolinChart"){plots.push(new ViolinChart(opts));};
        if (plottype=="LoadPathChart"){plots.push(new LoadPathChart(opts));};
        if (plottype=="BarChartModel"){plots.push(new BarChartModel(opts));};
    
        // Update everything
        updateEverything();
        
    }

    makeContextMenu(){
        let vis = this;

        // Create the new context menu
        const newMenu = document.createElement("menu");

        // Set the id of the context menu
        // This should be unique
        newMenu.id = "cntx"+vis.elementId;

         // Do not show the menu
         newMenu.style.display = "none";

         // Set the layer placement
         newMenu.style.zIndex = "101";

        // Create a plot type button
        const typeButton = document.createElement("menu");
        typeButton.title = "Type";
        const plotType = document.createElement("menu");
        plotType.title = "ScatterPlotBars";
        plotType.onclick = function(){vis.changePlot("ScatterPlotBars")};

        // Button for scatterplot nodes chart
        const scatterPlotNodesButton = document.createElement("menu");
        scatterPlotNodesButton.title = "ScatterPlotNodes";
        scatterPlotNodesButton.onclick = function(){vis.changePlot("ScatterPlotNodes")};

         // Button for scatterplot panels chart
         const scatterPlotPanelsButton = document.createElement("menu");
         scatterPlotPanelsButton.title = "ScatterPlotPanels";
         scatterPlotPanelsButton.onclick = function(){vis.changePlot("ScatterPlotPanels")};

        // Button for violin chart
        const violinChartButton = document.createElement("menu");
        violinChartButton.title = "ViolinChart";
        violinChartButton.onclick = function(){vis.changePlot("ViolinChart")};

        // Button for loadpath chart
        const loadPathChartButton = document.createElement("menu");
        loadPathChartButton.title = "LoadPath";
        loadPathChartButton.onclick = function(){vis.changePlot("LoadPathChart")};

        // Button for barchartmodel chart
        const barModelChartButton = document.createElement("menu");
        barModelChartButton.title = "ModelBarChart";
        barModelChartButton.onclick = function(){vis.changePlot("BarChartModel")};


        typeButton.appendChild(plotType);
        typeButton.appendChild(scatterPlotNodesButton);
        typeButton.appendChild(scatterPlotPanelsButton);
        typeButton.appendChild(violinChartButton);
        typeButton.appendChild(loadPathChartButton);
        typeButton.appendChild(barModelChartButton);

        newMenu.appendChild(typeButton);


         // Create a new delete button
        const newButton = document.createElement("menu");
        newButton.title = "Delete";
        // when button is clicked, run the function "deletePlot" and remove the context menu
        newButton.onclick = function(){vis.deletePlot(); newMenu.remove()};
        // Append the button to the menu
        newMenu.appendChild(newButton);

        // Create a new loadcase button
        const loadCaseButton = document.createElement("menu");
        loadCaseButton.title="loadcase";

        // Create sub buttons for each loadcase
        for (let i = 0; i < mydata[0].AxialEnergy.length; i++)
        {
            const loadCase = document.createElement("menu");
            loadCase.title=i;
            loadCase.onclick = function(){vis.loadCase=i; vis.updatePlot()};
            loadCaseButton.appendChild(loadCase);

        }

        // Add the loadcase menu to the context menu
        newMenu.appendChild(loadCaseButton);

        // Append the menu to the body
        document.body.appendChild(newMenu);

         // This is the event that handles the context menu
         this.element.addEventListener("contextmenu",function(ev){
            ev.preventDefault();
            var ctxMenu = document.getElementById("cntx"+vis.elementId);
            ctxMenu.style.display = "block";
            ctxMenu.style.left = (ev.pageX - 10)+"px";
            ctxMenu.style.top = (ev.pageY - 10)+"px";
            clickedElement = vis;

        });
        // The event menu that handles the close of the menu
        this.element.addEventListener("click",function(ev){
            var ctxMenu = document.getElementById("cntx"+vis.elementId);
            ctxMenu.style.display = "none";
            ctxMenu.style.left = "";
            ctxMenu.style.top = "";
        });


    }


}