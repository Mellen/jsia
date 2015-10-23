jsia = (function()
	{
	    function jsai()
	    {
	    }

	    jsia.getImageDataFromImg = function(img)
	    {
		var tempCanvas = document.createElement('canvas');
		tempCanvas.width = img.width;
		tempCanvas.height = img.height;
		var tempContext = tempCanvas.getContext('2d');
		tempContext.drawImage(img, 0, 0);
		return tempContext.getImageData(0, 0, img.width, img.height).data;
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

	    return jsai;
	}
       )());