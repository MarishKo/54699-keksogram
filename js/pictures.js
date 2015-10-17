/* global Photo: true Gallery: true PhotosCollection: true PhotoView: true*/

'use strict';

(function() {

 /* var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
  };*/

  var filtersForm = document.querySelector('.filters');
  filtersForm.classList.add('hidden');

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var PAGE_SIZE = 12;

  var picturesContainer = document.querySelector('.pictures');

  var picturesData;
  var currentPictures;
  var currentPage = 0;
 // var renderedPictures = [];
  var gallery = new Gallery();

  /**
   * @type {PhotosCollection}
   */
  var photosCollection = new PhotosCollection();

  /**
   * @type {Array.<Object>}
   */
  var initiallyLoaded = [];
  /**
   * @type {Array.<PhotoView>}
   */
  var renderedViews = [];

  var picturesFragment = document.createDocumentFragment();
/*
  function renderPictures(picturesToRender, pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    if (replace) {
      var el;
      while ((el = renderedPictures.shift())) {
        el.unrender();
      }
      picturesContainer.classList.remove('pictures-failure');
    }
    var pictureFrom = pageNumber * PAGE_SIZE;
    var pictureTo = pictureFrom + PAGE_SIZE;
    picturesToRender = picturesToRender.slice(pictureFrom, pictureTo);

    picturesToRender.forEach(function(photoData) {
      var newPicturesElement = new Photo(photoData);
      newPicturesElement.render(picturesFragment);
      renderedPictures.push(newPicturesElement);
    });
    picturesContainer.appendChild(picturesFragment);
    filtersForm.classList.remove('hidden');
    gallery.setPhotos(currentPictures);
  }
*/

  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }
  /**
   * Выводит на страницу список фото постранично.
   * @param {number} pageNumber
   * @param {boolean=} replace
   */
  function renderPictures(pageNumber, replace) {
    var fragment = document.createDocumentFragment();
    var picturesFrom = pageNumber * PAGE_SIZE;
    var picturesTo = picturesFrom + PAGE_SIZE;

    if (replace) {
      while (renderedViews.length) {
        var viewToRemove = renderedViews.shift();
        picturesContainer.removeChild(viewToRemove.el);
        viewToRemove.off('galleryclick');
        viewToRemove.remove();
      }
    }

    photosCollection.slice(picturesFrom, picturesTo).forEach(function(model) {
      var view = new PhotoView({ model: model });
      view.render();
      fragment.appendChild(view.el);
      renderedViews.push(view);
      view.on('galleryclick', function() {
        //gallery.setPhotos(view.model);
        //gallery.setCurrentPhoto(currentPictures);
        //gallery.show();
      });
    });


    picturesContainer.appendChild(fragment);
    filtersForm.classList.remove('hidden');
  }

 /* function loadPictures(callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = REQUEST_FAILURE_TIMEOUT;
    xhr.open('get', 'data/pictures.json');
    xhr.send();

    xhr.onreadystatechange = function(evt) {
      var loadedXhr = evt.target;

      switch (loadedXhr.readyState) {
        case ReadyState.OPENED:
        case ReadyState.HEADERS_RECEIVED:
        case ReadyState.LOADING:
          picturesContainer.classList.add('pictures-loading');
          break;

        case ReadyState.DONE:
        default:
          if (loadedXhr.status === 200) {
            var data = loadedXhr.response.toString();
            picturesContainer.classList.remove('pictures-loading');
            return callback(JSON.parse(data));
          }

          if (loadedXhr.status > 400) {
            showLoadFailure();
          }
          break;
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    };
  } */

  function filterPictures(filterID) {
    var filteredPictures = initiallyLoaded.slice(0);
    switch (filterID) {

      case 'filter-new':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        break;

      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(c, d) {
          return parseInt(d.comments, 10) - parseInt(c.comments, 10);
        });
        break;

      case 'filter-popular':
        filteredPictures = initiallyLoaded.slice(0);
        break;
    }
    photosCollection.reset(filteredPictures);
    localStorage.setItem('filterID', filterID);
    //return filteredPictures;
  }

  function setActiveFilter(filterID) {

    filterPictures(filterID);
    currentPage = 0;
    renderPictures(currentPage, true);

    /*currentPictures = filterPictures(picturesData, filterID);

    currentPage = 0;
    renderPictures(currentPictures, currentPage, true);
    if ((picturesContainer.offsetHeight - 20) < window.innerHeight) {
      renderPictures(currentPictures, currentPage++, false);
    }*/
  }

  function isNextPageAvailable() {
    return currentPage < Math.ceil(picturesData.length / PAGE_SIZE);
  }

  function isAtTheBottom() {
    var GAP = 20;
    return picturesContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;

  }

  function checkNextPage() {
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  function initScroll() {
    var someTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(someTimeout);
      someTimeout = setTimeout(checkNextPage, 100);
    });
    window.addEventListener('loadneeded', function() {
      renderPictures(currentPictures, currentPage++, false);
    });
  }

  function initFilters() {
    document.querySelector('.filters').addEventListener('click', function(evt) {
      setActiveFilter(evt.target.id);
    });
  }

 /* function initGallery() {
    window.addEventListener('galleryclick', function(evt) {
      evt.preventDefault();
      galleryArrayUrl(evt, currentPictures);
    });
  }
  function galleryArrayUrl(evt, element) {
    var url = evt.detail.photoElement.getData().url;
    var photosLenght = element.length;
    for (var i = 0; i < photosLenght; i++) {
      if (element[i].url === url) {
        gallery.setCurrentPhoto(i);
      }
    }
  }*/

  /*initFilters();
  initScroll();
  initGallery();
  loadPictures(function(loadedPictures) {
    picturesData = loadedPictures;
    setActiveFilter(localStorage.getItem('filterID') || 'filter-popular');
    var checkedFilter = document.getElementById(localStorage.getItem('filterID'));
    checkedFilter.checked = true;
     });*/
  photosCollection.fetch({ timeout: REQUEST_FAILURE_TIMEOUT }).success(function(loaded, state, jqXHR) {
    initiallyLoaded = jqXHR.responseJSON;
    initFilters();
    initScroll();


    setActiveFilter(localStorage.getItem('filterID') || 'filter-popular');
    //var checkedFilter = document.getElementById(localStorage.getItem('filterID'));
    //checkedFilter.checked = true;
  }).fail(function() {
    showLoadFailure();
  });
})();
