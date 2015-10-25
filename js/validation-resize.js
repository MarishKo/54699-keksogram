/* global resizer: true */
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
//начальные значения полей
  resizeX.value = 0;
  resizeY.value = 0;
  resizeSize.value = 50;
//минимальные значения смещений и стороны квадрата
  resizeX.min = 0;
  resizeY.min = 0;
  resizeSize.min = 1;

// Установка максимального значения смещений
  function setResizeShift() {
    resizeX.max = Math.max( (parseInt(previewImage.naturalWidth, 10) - parseInt(resizeSize.value, 10)), 0);
    resizeY.max = Math.max( (parseInt(previewImage.naturalHeight, 10) - parseInt(resizeSize.value, 10)), 0);
    resizer.setConstraint(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10), parseInt(resizeSize.value, 10));
  }
  // Проверка, валидны ли значения смешений.
  function displacementIsValid() {
    if (!resizeX.max || !resizeY.max) {
      setResizeShift();
    }
    return resizeX.value <= resizeX.max && resizeY.value <= resizeY.max;
  }
  // Установка максимального значения стороны. Размер картинки минус смещение.
  function setSide() {
    //var resizeMaxWidth = Math.min(previewImage.naturalHeight - parseInt(resizeX.value, 10), previewImage.naturalHeight - parseInt(resizeY.value, 10));
    //var resizeMaxHeight = Math.min(previewImage.naturalWidth - parseInt(resizeX.value, 10), previewImage.naturalWidth - parseInt(resizeY.value, 10));
    //resizeSize.max = Math.min(resizeMaxWidth, resizeMaxHeight);

  }
  // Проверка, валиден ли размер стороны
  function sideIsValid() {
    if (!resizeSize.max) {
      setSide();
    }
    return resizeSize.value <= resizeSize.max;
  }
  // Обработчик изменения смещения по Х, устанавливает максимальное
  // значение стороны.
  resizeX.onchange = function() {
    if (!resizeX.max) {
      resizer.setPaddings(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10));
      setResizeShift();
    }
    setSide();
  };
  // Обработчик изменения смещения по Y, устанавливает максимальное
  // значение стороны.
  resizeY.onchange = function() {
    if (!resizeY.max) {
      resizer.setPaddings(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10));
      setResizeShift();
    }
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
    window.addEventListener('resizerchange', function() {
      //resizer.moveConstraint(parseInt(resizeX.value, 10), parseInt(resizeY.value, 10), parseInt(resizeSize.value, 10));
    });
  }
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();
    if (sideIsValid() && displacementIsValid()) {
      filterForm.elements['filter-image-src'].value = previewImage.src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };
})();

