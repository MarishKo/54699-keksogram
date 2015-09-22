(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];
  var selectedFilter = filterForm['upload-filter'];

  var filterMap;

  var restoreFormValueFromCookies = function(form) {
    if (docCookies.hasItem(form.id)) {
      form[form.id].value = docCookies.getItem(form.id);
    }
  };


  function setFilter() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];

  };

  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function(evt) {
      setFilter();
    }
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    filterForm.reset();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();
    var element = document.forms['upload-filter']['upload-filter'];
    docCookies.setItem(element[0].name, element.value);

    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');
    filterForm.submit();
  }


  restoreFormValueFromCookies(filterForm);
  setFilter();

})();
