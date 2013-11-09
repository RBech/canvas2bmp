(function() {

	"use strict";

	function encode(data) {
		if( typeof data === "string" ) {
			return btoa(data);
		}

		var i, l, strData = "";
		for( i = 0, l = data.length; i < l; i += 1) {
			strData += String.fromCharCode(data[i]);
		}

		return btoa(strData);
	}

	function createBMP(canvas) {
		var
		imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height),
		BMPHeader = [],
		imgWidth = imageData.width,
		imgHeight = imageData.height,
		fileSize = imgWidth * imgHeight * 4 + 138, //BMP File header (14 bytes) + BITMAPV5HEADER (124 bytes ) = 138 byte
		DIBHeader = [],
		bmpWidth = imgWidth,
		bmpHeight = imgHeight,
		dataSize = imgWidth * imgHeight * 4,
		imgData = imageData.data,
		pixelRow = "",
		pixelData = "",
		offsetY,
		offsetX,
		encodedBMP;

		//Magic number (BM)
		BMPHeader.push(0x42);
		BMPHeader.push(0x4D);

		//FIle size
		BMPHeader.push(fileSize % 256); fileSize = ~~(fileSize / 256);
		BMPHeader.push(fileSize % 256); fileSize = ~~(fileSize / 256);
		BMPHeader.push(fileSize % 256); fileSize = ~~(fileSize / 256);
		BMPHeader.push(fileSize % 256);

		//4 Application specific unused bytes
		BMPHeader.push(0);
		BMPHeader.push(0);
		BMPHeader.push(0);
		BMPHeader.push(0);

		//Offset where the bitmap data can be found
		BMPHeader.push(0x8A); //138
		BMPHeader.push(0);
		BMPHeader.push(0);
		BMPHeader.push(0);

		//DIB Header (BITMAPV5HEADER)
		DIBHeader.push(0x7C); //Number of bytes in the DIB header (124)
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Width of the bitmap in pixels
		DIBHeader.push(bmpWidth % 256); bmpWidth = ~~(bmpWidth / 256);
		DIBHeader.push(bmpWidth % 256); bmpWidth = ~~(bmpWidth / 256);
		DIBHeader.push(bmpWidth % 256); bmpWidth = ~~(bmpWidth / 256);
		DIBHeader.push(bmpWidth % 256);

		//Height of the bitmap in pixels
		DIBHeader.push(bmpHeight % 256); bmpHeight = ~~(bmpHeight / 256);
		DIBHeader.push(bmpHeight % 256); bmpHeight = ~~(bmpHeight / 256);
		DIBHeader.push(bmpHeight % 256); bmpHeight = ~~(bmpHeight / 256);
		DIBHeader.push(bmpHeight % 256);

		//Number of color planes (1)
		DIBHeader.push(1);
		DIBHeader.push(0);

		//Bits per pixel
		DIBHeader.push(0x20); //32 bit
		DIBHeader.push(0);

		//BI_BITFIELDS, no pixel array compression used
		DIBHeader.push(3);
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Size of the raw data in the pixel array
		DIBHeader.push(dataSize % 256); dataSize = ~~(dataSize / 256);
		DIBHeader.push(dataSize % 256); dataSize = ~~(dataSize / 256);
		DIBHeader.push(dataSize % 256); dataSize = ~~(dataSize / 256);
		DIBHeader.push(dataSize % 256); 

		//Horizontal physical resolution of the image (72 dpi)
		DIBHeader.push(0x13);
		DIBHeader.push(0x0B);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Vertical physical resolution of the image (72 dpi)
		DIBHeader.push(0x13);
		DIBHeader.push(0x0B);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Number of colors in the palette
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Number of important colors (0 = all are important)
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Red channel bit mask (valid because BI_BITFIELDS is specified)
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0xFF);

		//Green channel bit mask
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0xFF);
		DIBHeader.push(0);

		//Blue channel bit mask
		DIBHeader.push(0);
		DIBHeader.push(0xFF);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Alpha channel bit mask
		DIBHeader.push(0xFF);
		DIBHeader.push(0);
		DIBHeader.push(0);
		DIBHeader.push(0);

		//Type of Color Space (LCS_sRGB)
		DIBHeader.push(0x42);
		DIBHeader.push(0x47);
		DIBHeader.push(0x52);
		DIBHeader.push(0x73);

		for ( var i = 48; i > 0; i-- ) {
			//bV5Endpoints(24) + bV5GammaRed(4) + bV5GammaGreen(4) + bV5GammaBlue(4) as for the rest, I have no clue
			DIBHeader.push(0);
		}

		//LCS_GM_GRAPHICS
		DIBHeader.push(2);

		for ( var i = 15; i > 0; i-- ) {
			//bV5ProfileData, bV5ProfileSize, bV5Reserved
			DIBHeader.push(0);
		}

		//Create pixel data
		do {
			offsetY = imgWidth * (imgHeight - 1) * 4;
			pixelRow = "";
			for( var x = 0; x < imgWidth; x += 1 ) {
				offsetX = 4 * x;

				pixelRow += String.fromCharCode(imgData[offsetX+offsetY+3]);
				pixelRow += String.fromCharCode(imgData[offsetX+offsetY+2]);
				pixelRow += String.fromCharCode(imgData[offsetX+offsetY+1]);
				pixelRow += String.fromCharCode(imgData[offsetX+offsetY]);
			}

			pixelData += pixelRow;
		} while( imgHeight-- );

		encodedBMP = encode(BMPHeader.concat(DIBHeader)) + encode(pixelData);
		return encodedBMP;
	}

	var proxied = window.HTMLCanvasElement.prototype.toDataURL;
	window.HTMLCanvasElement.prototype.toDataURL = function() {
		if( typeof arguments[0] == "string" && arguments[0].toUpperCase() == "IMAGE/BMP" ) {
			return "data:image/bmp;base64," + createBMP(this);
		}
		
		return proxied.apply(this, arguments);
	};
})();
