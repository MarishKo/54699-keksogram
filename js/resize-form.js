/*global resizer: true*/
'use strict';

define(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = resizeForm.querySelector('.resize-image-preview');
  var prevButton = resizeForm['resize-prev'];
  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];
  var resizeSize = resizeForm['resize-size'];
//начальные значения полей
  resizeX.value = 0;
  resizeY.value = 0;
  resizeSize.value = 50;
//минимальные значения смещений и стороны квадрата
  resizeX.min = 0;
  resizeY.min = 0;
  resizeSize.min = 1;
  window.addEventListener('imageonload', function() {
    var resizeMaxWidth = Math.min(previewImage.height - parseInt(resizeX.value, 10), previewImage.height - parseInt(resizeY.value, 10));
    var resizeMaxHeight = Math.min(parseInt(previewImage.width, 10) - parseInt(resizeX.value, 10), previewImage.width - parseInt(resizeY.value, 10));
    resizeSize.max = Math.min(resizeMaxWidth, resizeMaxHeight);
  });
// Установка максимального значения смещений
  function setResizeShift() {
    resizeX.max = Math.max( (parseInt(previewImage.width, 10) - parseInt(resizeSize.value, 10)), 0);
    resizeY.max = Math.max( (parseInt(previewImage.height, 10) - parseInt(resizeSize.value, 10)), 0);
    resizer.setConstraint(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10), parseInt(resizeSize.value, 10));
  }
  function displacementIsValid() {
    if (!resizeX.max || !resizeY.max) {
      setResizeShift();
    }
    return parseInt(resizeX.value, 10) <= parseInt(resizeX.max, 10) && parseInt(resizeY.value, 10) <= parseInt(resizeY.max, 10);

  }
  // Установка максимального значения стороны. Размер картинки минус смещение.
  function setSide() {
    var resizeMaxWidth = Math.min(previewImage.height - parseInt(resizeX.value, 10), previewImage.height - parseInt(resizeY.value, 10));
    var resizeMaxHeight = Math.min(parseInt(previewImage.width, 10) - parseInt(resizeX.value, 10), previewImage.width - parseInt(resizeY.value, 10));
    resizeSize.max = Math.min(resizeMaxWidth, resizeMaxHeight);
  }
  // Проверка, валиден ли размер стороны
  function sideIsValid() {
    if (!resizeSize.max) {
      setSide();
    }
    return parseInt(resizeSize.value, 10) <= parseInt(resizeSize.max, 10);
  }
  // Обработчик изменения смещения по Х
  resizeX.onchange = function() {
    resizer.setPaddings(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10));
    setResizeShift();
    setSide();
  };
  // Обработчик изменения смещения по Y
  resizeY.onchange = function() {
    resizer.setPaddings(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10));
    setResizeShift();
    setSide();
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
  if (sideIsValid() && displacementIsValid()) {
    window.addEventListener('resizerchange', function() {});
  }
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();
    if (sideIsValid() && displacementIsValid()) {
      filterForm.elements['filter-image-src'].value = resizer.exportImage().src;
      document.querySelector('.filter-image-preview').src = resizer.exportImage().src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

});
