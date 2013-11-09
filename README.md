canvas2bmp
==========

Shim that enables you to do canvas.toDataURL("image/bmp") to retrieve a BMP data url


Usage
==========

As it proxies the regular toDataURL() function of the canvas, usage is similar to how one would get a data url for jpeg.

    var canvas = document.getElementById("your-canvas-id");
    var BMPData = canvas.toDataURL("image/bmp");
    //Do whatever with said bmp data, in this case we'll just console.log it
    console.log(BMPData);
