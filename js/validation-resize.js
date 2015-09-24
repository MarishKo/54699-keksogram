(function() {
var validateResize = document.forms['upload-resize'];
var resizeX = validateResize['resize-x'];
var resizeY = validateResize['resize-y'];
var resizeSize = validateResize['resize-size'];
var resizeImage = document.getElementsByClassName('resize-image-preview');

var MIN_SIZE = 50;
resizeX.value = 10;
resizeY.value = 10;
resizeSize.value = 50;

resizeSize.onchange = function(evt){
	resizeX.max = resizeImage[0].offsetWidth - parseInt(resizeSize.value);
	resizeY.max = resizeImage[0].offsetHeight - parseInt(resizeSize.value);
	resizeSize.max = parseInt(resizeImage[0].offsetWidth);
	resizeSize.min = parseInt(MIN_SIZE);
};
resizeX.onchange = function(evt){
	resizeX.max = resizeImage[0].offsetWidth - parseInt(resizeSize.value);
	resizeX.min = parseInt(0);
};
resizeY.onchange = function(evt){
	resizeY.max = resizeImage[0].offsetHeight - parseInt(resizeSize.value);
	resizeY.min = parseInt(0);
};
})();

