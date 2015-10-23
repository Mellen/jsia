jsai = (function()
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

	    return jsai;
	}
       )());