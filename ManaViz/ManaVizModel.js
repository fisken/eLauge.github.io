import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.122.0/examples/jsm/controls/OrbitControls.js';

// Initialize scene, camera, render, controls and such
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera( -1,1,1,-1,0.1,1000 );
camera.zoom = 0.03;
camera.position.z = 100;

// Define a new renderer
const canvas = document.getElementById("view3d");
var renderer = new THREE.WebGLRenderer({canvas, antialias:true});

// Set the backgroundcolor of the renderer
renderer.setClearColor("white");
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
//document.getElementById("view3d").appendChild( renderer.domElement );

// Only render when camera moves
controls.addEventListener( 'change', () => {renderer.render( scene, camera ); resizeCanvasToDisplaySize();} );

// Make the line material
const lineMat = new THREE.LineBasicMaterial({
	vertexColors: true
});

function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed

    const width = canvas.parentElement.offsetWidth;
    const height = canvas.parentElement.offsetHeight;

    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height);
        //camera.aspect = width / height; // This is used for perspective camera 
        camera.left = -width/height; // This is for orthographic camera
        camera.right = width/height; // This is for orthographic camera
        camera.updateProjectionMatrix();
    }
}

// Function to create the plot
window.initializePlot = function(){

    const groupLines = new THREE.Group();
    groupLines.name = "Lines";

    const groupPoints = new THREE.Group();
    groupPoints.name = "Points";

    const groupPanels = new THREE.Group();
    groupPanels.name = "Panels";

    // Loop over every model 
    for (let k=0; k<mydata.length;k++){

        // Get current color as RGB
        //let r = hexToRgb(colors[k]).r;
        //let g = hexToRgb(colors[k]).g;
        //let b = hexToRgb(colors[k]).b;


        const panelGeometry = new THREE.BufferGeometry();
        const panelPositions = [];
        const panelColors = [];

        // Loop over every panel
        for (let i=0; i<mydata[k].panels.length;i++){
            let x = mydata[k].panels[i].geo[0];
            let y = mydata[k].panels[i].geo[1];
            let z = mydata[k].panels[i].geo[2];

            panelPositions.push(x,y,z);

            let r = 0;
            let g = 0;
            let b = 0;
            panelColors.push(r,g,b);
        }

        panelGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( panelPositions, 3 ) );
        panelGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( panelColors, 3 ) );
        const panelMaterial = new THREE.PointsMaterial( { size: 4, vertexColors: true } );
        var panels = new THREE.Points( panelGeometry, panelMaterial );


        const ptGeometry = new THREE.BufferGeometry();
        const ptPositions = [];
        const ptColors = [];

        // Loop over every node
        for (let i=0; i<mydata[k].nodes.length;i++){
            //console.log(ManaVizData[0].nodes[i])
            let x = mydata[k].nodes[i].geo[0];
            let y = mydata[k].nodes[i].geo[1];
            let z = mydata[k].nodes[i].geo[2];

            ptPositions.push(x,y,z);

            let r = 0;
            let g = 0;
            let b = 0;
            ptColors.push(r,g,b);
        }

        ptGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( ptPositions, 3 ) );
		ptGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( ptColors, 3 ) );
        ptGeometry.computeBoundingSphere();
        const ptMaterial = new THREE.PointsMaterial( { size: 4, vertexColors: true } );

		var points = new THREE.Points( ptGeometry, ptMaterial );
        


        // Initialize buffer geometry for the lines
        const buffGeo = new THREE.BufferGeometry();
        // Initialize array for the positions
        const positions = [];
        // Initialize array for the colors
        const colors = [];
        // Loop over every beam
        for(let i=0; i<mydata[k].beams.length;i++){
            // Get the geometry of the current beam
            var x0 = mydata[k].beams[i].geo[0][0];
            var y0 = mydata[k].beams[i].geo[0][1];
            var z0 = mydata[k].beams[i].geo[0][2];
            var x1 = mydata[k].beams[i].geo[1][0];
            var y1 = mydata[k].beams[i].geo[1][1];
            var z1 = mydata[k].beams[i].geo[1][2];
            // add the geometry to the array holding the vertices
            positions.push(x0,y0,z0,x1,y1,z1);
            // Make the black color using rgb
            const x = 0;
            const y = 0;
            const z = 0;
            // Add the color to the array holding the colors
            colors.push( x,y,z,x,y,z );
        }
        // Set the attributes of the buffer geometry
        buffGeo.setAttribute("position",new THREE.Float32BufferAttribute( positions, 3 ) );
        buffGeo.setAttribute("color", new THREE.Float32BufferAttribute( colors, 3 ) );
        buffGeo.computeBoundingSphere();

        // add the buffer geometry to the scene
        var line = new THREE.LineSegments(buffGeo,lineMat);
        groupLines.add(line);
        groupPoints.add( points );
        groupPanels.add(panels);

    }
    scene.add(groupLines);
    scene.add(groupPoints);
    scene.add(groupPanels);
    renderer.render( scene, camera );
    //console.log(scene);

}


// function to update the plot
window.updatePlot = function(){
    // Loop over every model
    for (let k=0; k<mydata.length;k++){

        // Get current color as RGB
        let r = hexToRgb(colors[k]).r/255;
        let g = hexToRgb(colors[k]).g/255;
        let b = hexToRgb(colors[k]).b/255;

        
        // If model is not active, then hide
        // Possible to skip to next "k" here?
        if (mydata[k].active == false){
            scene.children.forEach(function(child){
                child.children[k].visible = false;
            })
        }
        // otherwise, show
        else{
            scene.children.forEach(function(child){
                child.children[k].visible = true;
            })
        }

        // Loop over every panel
        for (let i=0; i<mydata[k].panels.length;i++){
            if (mydata[k].panels[i].isSelected == true){
                scene.children.forEach(function(child){if (child.name=="Panels"){
                    child.children[k].geometry.attributes.color.array[i*3] = 0;
                    // If selected make sure that point is rendered the correct place
                    child.children[k].geometry.attributes.position.array[i*3] = mydata[k].panels[i].geo[0];
                }})
            }   
            else{
                scene.children.forEach(function(child){if (child.name=="Panels"){
                    child.children[k].geometry.attributes.color.array[i*3] = 0;
                    // If not selected make the vertex go out of the screen
                    child.children[k].geometry.attributes.position.array[i*3] = Infinity;
                }})
            }
        }

        // Loop over every node
        for (let i=0; i<mydata[k].nodes.length;i++){
            if (mydata[k].nodes[i].isSelected == true){
                scene.children.forEach(function(child){if (child.name=="Points"){
                    child.children[k].geometry.attributes.color.array[i*3] = 0;
                    // If selected make sure that point is rendered the correct place
                    child.children[k].geometry.attributes.position.array[i*3] = mydata[k].nodes[i].geo[0];
                }})
            }   
            else{
                scene.children.forEach(function(child){if (child.name=="Points"){
                    child.children[k].geometry.attributes.color.array[i*3] = 0;
                    // If not selected make the vertex go out of the screen
                    child.children[k].geometry.attributes.position.array[i*3] = Infinity;
                }})
            }
        }

        // Loop over every beam
        for(let i=0; i<mydata[k].beams.length;i++){
            // Get the actual beam index
            // ABSOLUTELY IMPORTANT THAT THE BEAMS ARE RENDERED IN THE CORRECT ORDER
            const beamInd = mydata[k].beams[i].ind;
            if (mydata[k].beams[i].isSelected == true){
                scene.children.forEach(function(child){if (child.name=="Lines"){
                    //console.log(beamInd)
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+0] = 0;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+1] = 0;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+2] = 0;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+3] = 0;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+4] = 0;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+5] = 0;
                }})
            }
            else{
                scene.children.forEach(function(child){if (child.name=="Lines"){
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+0] = r;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+1] = g;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+2] = b;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+3] = r;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+4] = g;
                    child.children[k].geometry.attributes.color.array[beamInd*2*3+5] = b;
                }})
            }
        }
    }

    // Makes sure everything needs update
    scene.children.forEach(function(group){
        group.children.forEach(function(child){child.geometry.attributes.color.needsUpdate = true})
        group.children.forEach(function(child){child.geometry.attributes.position.needsUpdate = true})
    })
    
    // Render the scene again
    resizeCanvasToDisplaySize()
    renderer.render( scene, camera );
}


function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }


//window.isInitializePlotReady = true;


