'use strict';

(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];

  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];
  var resizeSize = resizeForm['resize-size'];

  resizeX.value = 0;
  resizeY.value = 0;
  resizeSize.value = 50;

  resizeX.min = 0;
  resizeY.min = 0;
  resizeSize.min = 1;

  function setResizeShift() {
    resizeX.max = Math.max( (parseInt(previewImage.naturalWidth, 10) - parseInt(resizeSize.value, 10)), 0);
    resizeY.max = Math.max( (parseInt(previewImage.naturalHeight, 10) - parseInt(resizeSize.value, 10)), 0);

    if (resizeX.value > resizeX.max) {
      resizeX.value = resizeX.max;
    }
    if (resizeY.value > resizeY.max) {
      resizeY.value = resizeY.max;
    }
  }
  function setSide() {
    if (previewImage.naturalWidth > previewImage.naturalHeight) {
      resizeSize.max = Math.min(previewImage.naturalHeight - parseInt(resizeX.value, 10), previewImage.naturalHeight - parseInt(resizeY.value, 10));
    }
    resizeSize.max = Math.min(previewImage.naturalWidth - parseInt(resizeX.value, 10), previewImage.naturalWidth - parseInt(resizeY.value, 10));

    if (resizeSize.value > resizeSize.max) {
      resizeSize.value = Math.max(resizeSize.max, resizeSize.min);
    }
  }

  function displacementIsValid() {
    if (!resizeX.max || !resizeY.max) {
      setResizeShift();
    }
    return resizeX.value <= resizeX.max && resizeY.value <= resizeY.max;
  }
  function sideIsValid() {
    if (!resizeSize.max) {
      setSide();
    }
    return resizeSize.value <= resizeSize.max;
  }
  resizeX.onchange = function() {
    setResizeShift();
  };
  resizeY.onchange = function() {
    setResizeShift();
  };
  resizeSize.onchange = function() {
    if (!resizeSize.max) {
      setSide();
    }
    setResizeShift();
  };
  prevButton.onclick = function(evt) {
    evt.preventDefault();

    resizeForm.reset();
    uploadForm.reset();
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();
    if (sideIsValid() && displacementIsValid()) {
      filterForm.elements['filter-image-src'].value = previewImage.src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };
})();

