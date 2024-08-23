(function (global) {
	"use strict";
	function Stitch(x, y, flags, color) {
		this.flags = flags;
		this.x = x;
		this.y = y;
		this.color = color;
	}

	function Color(r, g, b, description) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.description = description;
	}

	var stitchTypes = {
			normal: 0,
			jump: 1,
			trim: 2,
			stop: 4,
			end: 8
		};

	function Pattern() {
		this.colors = [];
		this.stitches = [];
		this.oldAbsStitches = [];
        this.hoop = {
			width: 100,
			height: 100
		};
		this.lastX = 0;
		this.lastY = 0;
		this.top = 0;
		this.bottom = 0;
		this.left = 0;
		this.right = 0;
		this.oldLeft = 0;
		this.oldTop = 0;
		this.currentColorIndex = 0;
		this.loadedFileName = "";
	}

	Pattern.prototype.addColorRgb = function (r, g, b, description) {
		this.colors[this.colors.length] = new Color(r, g, b, description);
	};

	Pattern.prototype.addColor = function (color) {
		this.colors[this.colors.length] = color;
	};

	Pattern.prototype.addStitchAbs = function (x, y, flags, isAutoColorIndex) {
		if ((flags & stitchTypes.end) === stitchTypes.end) {
			this.calculateBoundingBox();
			this.fixColorCount();
		}
		if (((flags & stitchTypes.stop) === stitchTypes.stop) && this.stitches.length === 0) {
			return;
		}
		if (((flags & stitchTypes.stop) === stitchTypes.stop) && isAutoColorIndex) {
			this.currentColorIndex += 1;
		}
		/*
		if(this.stitches.length === 0){ //&& x !== 0 && y !== 0){
			console.log("--- pattern.js: Adding jumps to first stitch");
			this.prepPatternWithFirstStitch(x, y);
		}*/
		
		if(x === 0 && y === 0) console.log("!!!! I am making an abs stitch at 0, 0...?");
		this.stitches[this.stitches.length] = new Stitch(x, y, flags, this.currentColorIndex);
	};

	Pattern.prototype.addStitchRel = function (dx, dy, flags, isAutoColorIndex) {
		if (this.stitches.length !== 0) {
			this.lastX = this.stitches[this.stitches.length-1].x;
			this.lastY = this.stitches[this.stitches.length-1].y;
			var nx = this.lastX + dx,
				ny = this.lastY + dy;
			this.lastX = nx;
			this.lastY = ny;
			if(nx === 0 && ny === 0) console.log("relative stitch at nx, ny === 0. This is okay.");
			this.addStitchAbs(nx, ny, flags, isAutoColorIndex);
		} else {
			this.addStitchAbs(dx, dy, flags, isAutoColorIndex);
			if(dx === 0 && dy === 0) console.log("!!!! relative stitch at dx, dy === 0. This is probably NOT okay.");
		}
	};
	
	Pattern.prototype.prepPatternWithFirstStitch = function(x, y){
		this.stitches[this.stitches.length] = new Stitch(0, 0, stitchTypes.trim, this.currentColorIndex);
		this.stitches[this.stitches.length] = new Stitch(x, y, stitchTypes.trim, this.currentColorIndex);
	};

	// Need to calculate the jump from 0,0 (center) to the first stitch
	// The first stitch is scaled to the canvas, so first we need to scale it to the size of the hoop
	// 		TODO: DO THIS EARLIER
	// Then we need to calculate the position from the upper left origin to the center origin
	// BEWARE: If players canvases are two seperate objects, this will need to be adjusted to share 1 hoop
	Pattern.prototype.calculateFirstStitch = function(canvasDimensions, stitch){
		if(canvasDimensions == undefined){
			console.log("Pattern.calculateFirstStitch cannot scale without canvas dimensions, aborting")
			return null;
		}
		// NOTE: X/Y scale factors should be the SAME. If they are not, this may need to be changed
		// Going off of Height for now
		let scaleFactor = this.hoop.height / canvasDimensions.y;
		if(stitch == undefined){
			console.log("Pattern.calculateFirstStitch cannot function with undefined stitch");
			return null;
		}
		//console.log("Pattern.calculateFirstStitch NAN? ", this.hoop.height, canvas))
		return new Stitch(Math.round(stitch.x * scaleFactor), Math.round(stitch.y * scaleFactor), stitch.flags, stitch.color);
	};
	
	Pattern.prototype.transformToRelStitches = function(canvasDimensions){
		console.log("transformToRelStitches OldStitches " + this.stringifyStitches());
		this.oldAbsStitches = [];
		// Is this purely precautionary?
		for(var i = 0; i < this.stitches.length; i++){
			var st = this.stitches[i];
			this.oldAbsStitches.push(new Stitch(st.x, st.y, st.flags, st.color));
		}
		
		if(this.stitches.length > 1){ // Safety first
			for(var i = this.stitches.length-1; i >= 1; i--){ // I hope this doesn't mess up the first stitch =X -- haha it does
				// compare this stitch's location to the previous'
				var currentStitch = this.stitches[i];
				var lastStitched = this.stitches[i-1];
				currentStitch.x = currentStitch.x - lastStitched.x;
				currentStitch.y = currentStitch.y - lastStitched.y;
			}

			// The first stitch (a jump to the first actual stitch) needs to be relative to a center 0,0 coordinate
			// So it needs to be overridden 
			// BEWARE: If we are ever reverting stitch back to non-relative, we need to scale and change their origin back
			let newFirstStitch = this.calculateFirstStitch(canvasDimensions, this.stitches[0]);
			if(newFirstStitch !== null){
				this.stitches[0] = newFirstStitch;
			}
			
		} else {
			console.log("Pattern.transformToRelStitches FAILED with an empty list of this.stitches")
		}
		console.log("transformToRelStitches New!!!!! " + this.stringifyStitches());
	};

	Pattern.prototype.calculateBoundingBox = function () {
		var i = 0,
			stitchCount = this.stitches.length,
			pt;
		// Why this? It just gives an inaccurate size
		//if (stitchCount === 0) {
		//	this.bottom = 1;
		//	this.right = 1;
		//	return;
		//}
		this.left = 99999;
		this.top = 99999;
		this.right = -99999;
		this.bottom = -99999;

		for (i = 0; i < stitchCount; i += 1) {
			pt = this.stitches[i];
			if (!(pt.flags & stitchTypes.trim)) {
				this.left = this.left < pt.x ? this.left : pt.x;
				this.top = this.top < pt.y ? this.top : pt.y;
				this.right = this.right > pt.x ? this.right : pt.x;
				this.bottom = this.bottom > pt.y ? this.bottom : pt.y;
			}
		}
	};
	
	// (April)
	// Undoes "moveToPositive"
	// NOTE: Beware order of operations with moveToPositive
	//		IE: do not do an "invertPatternVertical" in the middle 
	//			of calling moveToPositive and this function
	Pattern.prototype.moveToZeroFromPositive = function () {
		console.log("moveToZeroFromPositive OldStitches " + this.stringifyStitches());
		
		
		var i = 0,
			stitchCount = this.stitches.length;
		for (i = 0; i < stitchCount; i += 1) {
			this.stitches[i].x += this.left;
			this.stitches[i].y += this.top;
		}
		
		this.calculateBoundingBox();
		
		console.log("moveToZeroFromPositive New!!!!! " + this.stringifyStitches());
	};

	Pattern.prototype.moveToPositive = function () {
		var i = 0,
			stitchCount = this.stitches.length;
		for (i = 0; i < stitchCount; i += 1) {
			this.stitches[i].x -= this.left;
			this.stitches[i].y -= this.top;
		}
		// (April) Save dimensions to move back to
		this.oldLeft = this.left;
		this.oldTop = this.top;
		
		//this.right -= this.left;
		//this.left = 0;
		//this.bottom -= this.top;
		//this.top = 0;
		this.calculateBoundingBox();
	};
	
	// BEWARE USING THIS this.left/right will be wrong probably because flip/coordinate space
	Pattern.prototype.translate = function(x, y){
		for (var i = 0; i < this.stitches.length; i += 1) {
			this.stitches[i].x += x;
			this.stitches[i].y += y;
		}
		//this.right += x;
		//this.left += x;
		//this.top += y;
		//this.bottom += y;
		this.calculateBoundingBox();
	};
	
	// BEWARE USING THIS distance between stitches gets big
	Pattern.prototype.scale = function(val) {
		// No scaling down to zero!
		if (val !== 0){
			for (var i = 0; i < this.stitches.length; i++){
				// Make sure there are no decimals... those don't print well...
				this.stitches[i].x = Math.floor(this.stitches[i].x * val);
				this.stitches[i].y = Math.floor(this.stitches[i].y * val);
			}
			
			this.calculateBoundingBox();
		}
	};

	Pattern.prototype.invertPatternVertical = function () {
		var i = 0,
			stitchCount = this.stitches.length;
		for (i = 0; i < stitchCount; i += 1) {
			// This reflects along the x axis, which is (for sewsynth) at the top of the screen
			this.stitches[i].y = -this.stitches[i].y;
			// So we need to move the stitches back into place by moving them down
			// ALTERNATIVELY: Center the design on (0,0) before inverting <-- going to do this one
		}
		this.calculateBoundingBox();
	};

	Pattern.prototype.addColorRandom = function () {
		this.colors[this.colors.length] = new Color(Math.round(Math.random() * 256), Math.round(Math.random() * 256), Math.round(Math.random() * 256), "random");
	};

	Pattern.prototype.fixColorCount = function () {
		var maxColorIndex = 0,
			stitchCount = this.stitches.length,
			i;
		for (i = 0; i < stitchCount; i += 1) {
			maxColorIndex = Math.max(maxColorIndex, this.stitches[i].color);
		}
		while (this.colors.length <= maxColorIndex) {
			this.addColorRandom();
		}
        this.colors.splice(maxColorIndex + 1, this.colors.length - maxColorIndex - 1);
	};
	
	Pattern.prototype.drawShape = function(canvas) {
		canvas.width = this.right;
		canvas.height = this.bottom;
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			var color = this.colors[this.stitches[0].color];
			ctx.strokeStyle = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
			for(var i = 0; i < this.stitches.length; i++)
			{
				var currentStitch = this.stitches[i];
				if (currentStitch.flags === stitchTypes.jump || currentStitch.flags === stitchTypes.trim || currentStitch.flags === stitchTypes.stop) {
					//console.log("moving drawing location", currentStitch.flags);
					//console.log(stitchTypes);
					ctx.stroke(); // Draws the previously laid path
					var color = this.colors[currentStitch.color]; // Swaps color
					ctx.beginPath(); 
					ctx.strokeStyle = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
					ctx.moveTo(currentStitch.x, currentStitch.y); // Moves to point WITHOUT creating a line
				}
				ctx.lineTo(currentStitch.x, currentStitch.y); 
				// Adds a new point and creates a line from this point to the last
			}
			ctx.stroke(); 
		} else {
			global.alert('You need Safari or Firefox 1.5+ to see this demo.');
		}
	}
	
	Pattern.prototype.stringifyStitches = function(){
		var results = "";
		for(var i = 0; i < this.stitches.length; i++){
			results += i + ": (" + this.stitches[i].x + ", " + this.stitches[i].y + ")  ";
		}
		return results;
	}

	global.Color = Color.prototype.constructor;
	global.Pattern = Pattern.prototype.constructor;
	global.stitchTypes = stitchTypes;

}(this));