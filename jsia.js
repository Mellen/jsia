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
		var grey = new ImageData(image.data, image.width, image.height);

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

	    jsia.invertPixelColour = function(pixel, invertAlpha)
	    {
		var r = pixel[0];
		var g = pixel[1];
		var b = pixel[2];
		var a = pixel[3];
		
		if(invertAlpha)
		{
		    return [255 - r, 255 - g, 255 - b, 255 - a];
		}
		else
		{
		    return [255 - r, 255 - g, 255 - b, a];
		}
	    };

	    jsia.imageDataInvertedColour = function(image, invertAlpha)
	    {
		var inverted = new ImageData(image.data, image.width, image.height);

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

	    return jsia;
       }());
