'use strict';

define(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];
  var selectedFilter = filterForm['upload-filter'];

  var filterMap;

  function restoreFormValueFromCookies(form) {
    var element;
    for (var i = 0; i < form.elements.length; i++) {
      element = form.elements[i];
      if (docCookies.hasItem(element.id)) {
        element.checked = docCookies.getItem(element.id);
      }
    }
  }

  function setFilter() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];
  }

  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function() {
      setFilter();
    };
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    filterForm.reset();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();
    var element;
    for (i = 0; i < filterForm.elements.length; i++) {
      element = filterForm.elements[i];
      if (element.name === 'upload-filter' && element.checked === true) {
        var dateDiff = new Date() - new Date('Thu, 05 Jan 1991 14:25:00 GMT');
        var expDate = new Date();

        expDate.setTime(Date.now() + dateDiff);
        docCookies.setItem(element.id, 'checked', expDate);
      } else {
        docCookies.setItem(element.id, '', -1);
      }
    }
    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');
    filterForm.submit();
  };


  restoreFormValueFromCookies(filterForm);
  setFilter();

});
