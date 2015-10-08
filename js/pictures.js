/* global Photo: true */
'use strict';

(function() {

  var ReadyState = {
    'UNSENT': 0,
    'OPENED': 1,
    'HEADERS_RECEIVED': 2,
    'LOADING': 3,
    'DONE': 4
  };

  var filtersForm = document.querySelector('.filters');
  filtersForm.classList.add('hidden');

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var PAGE_SIZE = 12;

  var picturesContainer = document.querySelector('.pictures');
  var picturesData;
  var currentPictures;
  var currentPage = 0;
  var renderedPictures = [];

  var picturesFragment = document.createDocumentFragment();

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
  }

  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }

  function loadPictures(callback) {
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
  }
  function filterPictures(picturesToFilter, filterID) {
    var filteredPictures = picturesToFilter.slice(0);
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
        filteredPictures = picturesToFilter.slice(0);
        break;
    }
    localStorage.setItem('filterID', filterID);
    return filteredPictures;
  }

  function setActiveFilter(filterID) {
    currentPictures = filterPictures(picturesData, filterID);
    currentPage = 0;
    renderPictures(currentPictures, currentPage, true);
    if ((picturesContainer.offsetHeight - 20) < window.innerHeight) {
      renderPictures(currentPictures, currentPage++, false);
    }
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

  initFilters();
  initScroll();
  loadPictures(function(loadedPictures) {
    picturesData = loadedPictures;
    setActiveFilter(localStorage.getItem('filterID') || 'filter-popular');
    var checkedFilter = document.getElementById(localStorage.getItem('filterID'));
    checkedFilter.checked = true;
  });
})();
