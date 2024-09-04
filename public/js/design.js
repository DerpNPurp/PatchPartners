// !!!!!! TODO: Most of this should be moved to designPath.js
// !!!!!!  So we can easily have multiple paths in one design...

var Design = function() {
	this.verbose = false;
	this.id = global.designCount++;
	this.pointCount = 0;
	this.dimensions = {smallX: 999999, bigX: -999999, 
					   smallY: 999999, bigY: -999999, 
					   width: -1, height: -1};
					
	// list of DesignPaths   
	this.paths = [];
	
	// types are the different styles the user selects
	this.type = null;
	
	this.currentAnchor = null;
	
	// activeness is set by "deleting" the item
	this.active = true;
	this.lastSelectedParams = null;
	
	return this;
}; // Design


////////////////////////////////////////////////////////////////////////
/////// ACCESSORS //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

Design.prototype.deactivate = function(){
	if(this.active == true){
		for(var i = 0; i < this.paths.length; i++){
			this.paths[i].deactivate();
			this.hideAndDeselectAllPaths();
		}
		
		this.active = false;
	} else {
		console.log("Cannot deactivate an already deactive design", this);
	}
};

// pre: hideAndDeselectAllPaths
// post: loaded showAndSelectPath, which was set last time visibility settings were used
Design.prototype.reactivate = function(){
	if(this.active == false){
		console.log("reactivating from design.js, what are our last selected params?", this.lastSelectedParams);
		
		for(var i = 0; i < this.paths.length; i++){
			this.paths[i].reactivate();
		}
		if(this.lastSelectedParams !== null){
			this.showAndSelectPath(this.lastSelectedParams);
		} else {
			console.log("CANNOT REACTIVATE A PATH THAT HAS NO SAVED SETTINGS");
		}
		this.active = true;
	} else {
		console.log("Cannot activate an already active design", this);
	}
};

////////////////////////////////////////////////////////////////////////
/////// GENERATE PATHS WITH DESIGNPATH.JS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// path should be a paper.js path
Design.prototype.makeNewPath = function(path){
	var newPath = null;
	try {
		if(path !== undefined && path !== null){
			newPath = new DesignPath(this, path);
		} else {
			newPath = new DesignPath(this);
		}
		this.paths.push(newPath);
	} catch (e) {
		global.mainErrorHandler.error(e);
	}
	console.log("makeNewPath", newPath);
	return newPath;
};

// TODO: search over current path to see if just new points need to be added
// TODO: Not re-making a DesignPath but instead adding points
// Post: designPath.paperPath is the newPath and all derivitive paths are marked as dirty
// regeneratePathsInDesign should be called afterwards which will fix this issue...
// WHAT HAPPENS IF THIS DESIGN HAS MORE THAN ONE PATH? WHICH ONE GETS UPDATED?
// Probably the most recent one?
Design.prototype.editPath = function(newPath){
	try {
		// should check that this.paths.length !== 0 and that newpath !== null & undefined...
		this.paths[this.paths.length-1].acceptNewJSPath(newPath);
		// console.log("From the design, editing to a WHOLE NEW DesignPath.");
	} catch (e) {
		global.mainErrorHandler.error(e);
	}
};

// Round PATHPOINTS positions to their next whole number...
Design.prototype.roundPathPoints = function(){
	// Loop through all DesignPaths to round their points (and possibly points of all derived paths? Only derived paths?)
};

Design.prototype.generateSewnPath = function(params){
	// plots sewn paths for specific input paths in params
};

// Called by designHandler 
// Should return a list of abs points ready for plotting
Design.prototype.getPointsForPrinting = function(){
	try {
		// Not sure why a design would have multiple paths
		// Not sure how to convert multiple paths into one list of points?
		
		let path = this.paths[0].generateGeneratedSewnPath();
		console.log("Design.getPointsForPrinting: Processing this path: " + path)
		let points = [];
		// Might need to convert from Path to list of points?
		for(let i = 0; i < path.segments.length; i++){
			points.push(path.segments[i].point.clone())
		}
		console.log("Design.getPointsForPrinting: Printing these points: " + points)
		return points;
		
	} catch (e) {
		global.mainErrorHandler.error(e);
	}
};

// Make sure to update/set visability after calling this function!
Design.prototype.regenerateAllDerivitivePaths = function(params){
	// Loops through all DesignPaths
	// re-generates all flattened & simplified derivitive paths
	// all paths should be clean & generatedPath should be ready to be overwritten
	
	//console.log("regenerateAllDerivitivePaths,", params, this.paths);
	try{
		for(var i = 0; i < this.paths.length; i++){
			this.paths[i].regenerateAllPaths(params);
			// TODO: this.testRelativeDesign() & this.testAsbSinDesign(0.3,4);
		}
	} catch (e) {
		global.mainErrorHandler.error(e);
	}
	/* Old:
	 * // By this point, the default path has been set one way or another, or we forgot to set it ;)
	this.generateSimplifiedPath(params);
	this.generateFlattenedPath(params);
	this.generateSewnFlattenedPath(params);
	this.testRelativeDesign();
	this.generateSewnDesignPath(params);
	
	//this.testAbsSinDesign(0.3, 4);
	 */
};

///////////////////////////////////////////////////////////////////////////////////////
//////////// Helpers for Path Translation /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// Returns: a new list of points that are based on the input path, with points placed
// the sewn distance by pixels apart as a max goal. May be shortened in order to
// conserve endpoints on the segments (every point on the path is a sewn position)
// TODO: relaxation settings should allow us to round off points based on an allowance
// 		Doesn't Paper.js do this? Should this be just done on the design path directly?
// 
/*
Design.prototype.plotPathPointsOnDistance = function(path){
	if(path == null){
		console.err("Cannot plotPathPointsOnDistance for a null path");
		return;
	}
	if(path.length <= 1){
		console.err("Cannot plotPathPointsOnDistance for a path of 0 or 1 points", path);
		return;
	}
	var plottedPoints = [];
	console.log("plotting", path);
	console.log("Path length // this.stitchLengthPixels", path.length, this.stitchLengthPixels);
	var numPoints = Math.ceil(path.length/this.stitchLengthPixels); // Makes sure all is <= stitchLengthPixels
	console.log("fits # of points (without endpoint)", numPoints);

	// loops for numPoints+1 for the endpoint, which should be at offset = path.length (i and numPoints cancel each other out)
	for(var i = 0; i <= numPoints; i++){
		var offset = (path.length/numPoints) * i;
		var point = path.getPointAt(offset);
		console.log("Plotted point 1 by offset", i, offset, point);
		plottedPoints.push(point);
	}

	
	console.log("plotted sewn points on disance", plottedPoints);
	return plottedPoints;
}*/

///////////////////////////////////////////////////////////////////////////////////////
//////////// UI on the Paths //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

Design.prototype.hideAndDeselectAllPaths = function(){
	// For each generatedPath, hide and deselect them
	for(var i = 0; i < this.paths.length; i++){
		this.paths[i].setAllPathsHidden();
		this.paths[i].setAllPathsDeselected();
		// TODO: this.testRelativeDesign() & this.testAsbSinDesign(0.3,4);
	}
};


// These strings are set in INDEX.HTML WHAT?!
Design.prototype.showAndSelectPath = function(selectedParams){
	// Find which paths in which generatedPaths need to be shown
	// based on the strings sent from index.html
	//console.log("selecting and showing paths", selectedParams);
	this.lastSelectedParams = selectedParams;
	
	for(var i = 0; i < this.paths.length; i++){
		//console.log("processing paths on path id", i, this.paths[i]);
		this.paths[i].selectAndShowPaths(selectedParams);
		// TODO: this.testRelativeDesign() & this.testAsbSinDesign(0.3,4);
	}
	
	/*if(selected === "path-complex"){
		this.defaultPath.selected = true;
		this.defaultPath.visible = true;
	} else if (selected === "path-simple"){
		this.simplifiedPath.selected = true;
		this.simplifiedPath.visible = true;
	} else if (selected === "path-segmented"){
		this.flattenedPath.selected = true;
		this.flattenedPath.visible = true;
	} else if (selected === "path-generated"){
		this.generatedPath.selected = true;
		this.generatedPath.visible = true;
	} else if (selected === "path-sew-segmented"){
		this.sewnFlattenedPath.selected = true
		this.sewnFlattenedPath.visible = true;
	} else if (selected === "path-sew-generated"){
		this.sewnDesignPath.selected = true;
		this.sewnDesignPath.visible = true;
	} else {
		// Haha! It's none of them!
		console.log("Called showAndSelectPath on a generated with selected", selected);
	}*/
};


/*
Design.prototype.generatePathPoints = function(path){
	this.parsePathToPoints(path);
	this.roundPathPoints();
	
};*/

////////////////////////////////////////////////////////////////////////
/////// DESIGN DIMENSIONS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// TO DO: BASED ON OTHER POINTS
Design.prototype.calcDimensionsBasedOnPathPoints = function(){
	/*
	this.dimensions = {smallX: 999999, bigX: -999999, 
					   smallY: 999999, bigY: -999999, 
					   width: -1, height: -1};
	
	for(var i = 0; i < this.pathPoints.length; i++){
		if(this.pathPoints.x < this.dimensions.smallX) this.dimensions.smallX = this.pathPoints.x;
		if(this.pathPoints.y < this.dimensions.smallY) this.dimensions.smallY = this.pathPoints.y;
		if(this.pathPoints.x > this.dimensions.bigX) this.dimensions.bigX = this.pathPoints.x;
		if(this.pathPoints.y > this.dimensions.bigY) this.dimensions.bigY = this.pathPoints.y;
	}
	
	this.dimensions.width = this.dimensions.bigX - this.dimensions.smallX;
	this.dimensions.height = this.dimensions.bigY - this.dimensions.smallY;*/
};

Design.prototype.toJSON = function() {
    return {
        id: this.id,
        pointCount: this.pointCount,
        dimensions: this.dimensions,
        paths: this.paths.map(path => path.toJSON()), // DesignPath to JSON
        type: this.type,
        currentAnchor: this.currentAnchor,
        active: this.active,
        lastSelectedParams: this.lastSelectedParams
    };
};


