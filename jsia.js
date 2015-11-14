jsia = (function()
	{
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
			var other = jsia.xyToIndex(xy.x-1, xy.y, grey.width);
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
		
	    }

	    return jsia;
       }());
