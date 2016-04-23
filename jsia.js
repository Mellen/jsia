jsia = (function()
	{
	    var RIGHT = 0;
	    var DOWN = 1;
	    var RIGHTDOWN = 2;	
	    
	    function jsia()
	    {
		this.RED = 0;
		this.GREEN = 1;
		this.BLUE = 2;
		this.ALPHA = 3;
		this.CYAN = 0;
		this.MAGENTA = 1;
		this.YELLOW = 2;
		this.BLACK = 3;
	    }

	    jsia.getImageDataFromImg = function(img)
	    {
		var tempCanvas = document.createElement('canvas');
		tempCanvas.width = img.width;
		tempCanvas.height = img.height;
		var tempContext = tempCanvas.getContext('2d');
		tempContext.drawImage(img, 0, 0);
		return tempContext.getImageData(0, 0, img.width, img.height);
	    };

	    jsia.setupVideoCallback = function(videoElement, callback, timeBetweenFrames)
	    {
		var localMediaStream = null;

		navigator.getUserMedia = ( navigator.getUserMedia ||
					   navigator.webkitGetUserMedia ||
					   navigator.mozGetUserMedia ||
					   navigator.msGetUserMedia);

		if(navigator.getUserMedia)
		{
		    var um = navigator.getUserMedia({video: true}, handleVid, vidErr);
		}

		function handleVid(stream)
		{
		    videoElement.src = window.URL.createObjectURL(stream);
		    localMediaStream = stream;
		}
		
		function vidErr(e)
		{
		    alert(e);
		}

		function capture()
		{
		    if(localMediaStream)
		    {
			callback();
		    }
		}

		setInterval(capture, timeBetweenFrames);
	    }

	    jsia.indexToXY = function(index, width)
	    {
		var point = {x:0, y:0};

		index = Math.floor(index / 4);

		point.x = index % width;
		point.y = Math.floor(index / width);

		return point;
	    };

	    jsia.xyToIndex = function(x, y, width)
	    {
		return (x + (y * width))*4;
	    };

	    jsia.imageDataToGreyScale = function(image, useBrightest)
	    {
		var greyData = new Uint8ClampedArray(image.data);

		var grey = new ImageData(greyData, image.width, image.height);

		for(var i = 0; i < grey.data.length; i+=4)
		{
		    var r = grey.data[i];
		    var g = grey.data[i+1];
		    var b = grey.data[i+2];

		    if(useBrightest)
		    {
			var value = Math.max(r, Math.max(g, b));
		    }
		    else
		    {
			var value = Math.min(r, Math.min(g, b));
		    }

		    grey.data[i] = value;
		    grey.data[i+1] = value;
		    grey.data[i+2] = value;
		}

		return grey;
	    };

	    jsia.invertPixelColour = function(r, g, b, a, invertAlpha)
	    {
		if(invertAlpha)
		{
		    return {'r':255 - r, 'g':255 - g, 'b':255 - b, 'a':255 - a};
		}
		else
		{
		    return {'r':255 - r, 'g':255 - g, 'b':255 - b, 'a':a};
		}
	    };

	    jsia.imageDataInvertedColour = function(image, invertAlpha)
	    {
		var invertedData = new Uint8ClampedArray(image.data);

		var inverted = new ImageData(invertedData, image.width, image.height);

		for(var i = 0; i < inverted.data.length; i += 4)
		{
		    inverted.data[i] = 255 - inverted.data[i];
		    inverted.data[i+1] = 255 - inverted.data[i+1];
		    inverted.data[i+2] = 255 - inverted.data[i+2];
		    if(invertAlpha)
		    {
			inverted.data[i+3] = 255 - inverted.data[i+3];
		    }
		}

		return inverted;
	    };

	    jsia.getAveragePixelChannelValue = function(image, channel)
	    {
		var sum = 0;
		var count = 0;

		for(var i = 0; i < image.data.length; i += 4)
		{
		    sum += image.data[i + channel];
		    count++;
		}

		return sum/count;
	    };

	    jsia.detectEdgePixels = function(image, minimumContrast)
	    {
		var edgesData = new Uint8ClampedArray(image.data);
		var edges = new ImageData(edgesData, image.width, image.height);
		
		var grey = jsia.imageDataToGreyScale(image, true);

		for(var i = 0; i < grey.data.length; i += 4)
		{
		    var xy = jsia.indexToXY(i, grey.width);
		    if(xy.x > 0)
		    {
			var other = jsia.xyToIndex(xy.x-1, xy.y, grey.width);
			if(Math.abs(grey.data[other] - grey.data[i]) < minimumContrast)
			{
			    edges.data[i] = 0;
			    edges.data[i+1] = 0;
			    edges.data[i+2] = 0;
			}
			else
			{
			    edges.data[i] = 255;
			    edges.data[i+1] = 255;
			    edges.data[i+2] = 255;
			    continue;
			}
		    }

		    if(xy.y > 0)
		    {
			var other = jsia.xyToIndex(xy.x, xy.y-1, grey.width);
			if(Math.abs(grey.data[i] - grey.data[other]) < minimumContrast)
			{
			    edges.data[i] = 0;
			    edges.data[i+1] = 0;
			    edges.data[i+2] = 0;
			}
			else
			{
			    edges.data[i] = 255;
			    edges.data[i+1] = 255;
			    edges.data[i+2] = 255;
			    continue;
			}
		    }

		    if(xy.y > 0 && xy.x > 0)
		    {
			var other = jsia.xyToIndex(xy.x-1, xy.y-1, grey.width);
			if(Math.abs(grey.data[i] - grey.data[other]) < minimumContrast)
			{
			    edges.data[i] = 0;
			    edges.data[i+1] = 0;
			    edges.data[i+2] = 0;
			}
			else
			{
			    edges.data[i] = 255;
			    edges.data[i+1] = 255;
			    edges.data[i+2] = 255;
			}			
		    }
		}

		return edges;
	    };

	    jsia.lineDetection = function(imageData, minimumContrast, minimumLineLength, tollerance)
	    {
		var edges = jsia.detectEdgePixels(imageData, minimumContrast);

		var completelines = [];
		var usedPoints = [];
		var lines = [];
		
		for(var index = 0; index < edges.length; index++)
		{
		    if((edges.data[index] === 255) && (usedPoints.indexOf(index) === -1))
		    {
			var result = findLines(edges, index, tollerance);

			var newLines = result.lines;

			for(var upi = 0; upi < result.usedPoints.length; upi++)
			{
			    usedPoints.push(result.usedPoints[upi]);
			}
			
			for(var nli = 0; nli < newLines.length; nli++)
			{
			    completelines.push(newLines[nli]);
			}
		    }
		}

		for(var i = 0; i < completelines.length; i++)
		{
		    var newLine = completelines[i];
		    var dx = (newLine.start.x - newLine.end.x) * (newLine.start.x - newLine.end.x);
		    var dy = (newLine.start.y - newLine.end.y) * (newLine.start.y - newLine.end.y)
		    if(Math.sqrt(dx + dy) > minimumLineLength)
		    {
			lines.push(newLine);
		    }
		}
	    
		return lines;
	    }

	    function findLines(edges, index, tollerance)
	    {
		var lines = [];
		var usedPoints = [];

		var start =  jsia.indexToXY(index, edges.width);
		var dir = -1;

		var nextSteps = generateNextSteps(start, edges, tollerance);

		for(var i = 0; i < nextSteps.length; i++)
		{
		    var index = jsia.xyToIndex(nextSteps[i].x, nextSteps[i].y, edges.width)
		    usedPoints.push(index);
		}		

		if(nextSteps.length > 0)
		{
		    while(nextSteps.length > 0)
		    {
			var step = nextSteps.pop();
			var moreSteps = generateNextSteps(step, edges, tollerance);
			if(moreSteps.length === 0)
			{
			    lines.push({start:start, end:step});
			}
			else
			{
			    for(var i = 0; i < moreSteps.length; i++)
			    {
				var index = jsia.xyToIndex(moreSteps[i].x, moreSteps[i].y, edges.width)
				usedPoints.push(index);
				nextSteps.push(moreSteps[i]);
			    }
			}
		    }
		}
		else
		{
		    lines = [{start:start, end:start}];
		}
		
		return {lines:lines, usedPoints:usedPoints};
	    }

	    function generateNextSteps(point, edges, tollerance)
	    {
		var nextPoints = []

		var right = null;
		var down = null;
		var rightdown = null;
		var leftdown = null;
		
		for(var i = 1; i <= tollerance; i++)
		{
		    var pointIndex = jsia.xyToIndex(point.x+i, point.y, edges.width);
		    if(edges.data[pointIndex] == 255)
		    {
			
			right = {x: point.x + i, y: point.y};
		    }
		    
		    pointIndex = jsia.xyToIndex(point.x, point.y+i, edges.width);
		    if(edges.data[pointIndex] == 255)
		    {
			down = {x: point.x, y: point.y+1};
		    }
		    
		    pointIndex = jsia.xyToIndex(point.x+i, point.y+i, edges.width);
		    if(edges.data[pointIndex] == 255)
		    {
			rightdown = {x: point.x+1, y: point.y+1};
		    }

		    pointIndex = jsia.xyToIndex(point.x-i, point.y+i, edges.width);
		    if(edges.data[pointIndex] == 255)
		    {
			leftdown = {x: point.x-1, y: point.y+1};
		    }		    

		}

		if(right !== null)
		{
		    nextPoints.push(right);
		}

		if(down !== null)
		{
		    nextPoints.push(down);
		}

		if(rightdown !== null)
		{
		    nextPoints.push(rightdown);
		}

		if(leftdown !== null)
		{
		    nextPoints.push(leftdown);
		}

		return nextPoints;
	    }
	    	    
	    return jsia;
       }());
