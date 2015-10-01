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

  var statClassName = {
    'comments': 'picture-comments',
    'likes': 'picture-likes'
  };

  var REQUEST_FAILURE_TIMEOUT = 10000;
  var PAGE_SIZE = 12;

  var picturesContainer = document.querySelector('.pictures');
  var pictureTemplate = document.getElementById('picture-template');
  var picturesData;
  var currentPictures;
  var currentPage = 0;


  var picturesFragment = document.createDocumentFragment();
  var templateChild = pictureTemplate.content.children[0];

  function renderPictures(picturesToRender, pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    if (replace) {
      picturesContainer.innerHTML = '';
    }
    var pictureFrom = pageNumber * PAGE_SIZE;
    var pictureTo = pictureFrom + PAGE_SIZE;
    picturesToRender = picturesToRender.slice(pictureFrom, pictureTo);

    picturesToRender.forEach(function(picture) {
      var newPictureElement = templateChild.cloneNode(true);
      var statsContainer = newPictureElement.querySelector('.picture-stats');
      var firstImg = newPictureElement.querySelector('img');


      var statElement = document.createElement('span');
      statElement.classList.add('picture-stat');
      statElement.classList.add(statClassName[picture]);
      statsContainer.appendChild(statElement);

      newPictureElement.querySelector('.picture-comments').textContent = picture['comments'];
      newPictureElement.querySelector('.picture-likes').textContent = picture['likes'];

      if (picture['url']) {

        var pictureBackground = new Image();

        var imageLoadTimeout = setTimeout(function() {
          newPictureElement.classList.add('picture-load-failure');
        }, REQUEST_FAILURE_TIMEOUT);

        pictureBackground.onload = function() {
          newPictureElement.replaceChild(pictureBackground, firstImg);
          pictureBackground.width = '182';
          pictureBackground.height = '182';
          clearTimeout(imageLoadTimeout);
        };
        pictureBackground.src = picture['url'];

        pictureBackground.onerror = function() {
          newPictureElement.classList.add('picture-load-failure');
        };
        newPictureElement.href = picture['url'];
      }
      picturesFragment.appendChild(newPictureElement);
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
          if (a.date > b.date) {
            return -1;
          }
          if (a.date < b.date) {
            return 1;
          }
          if (a.date === b.date) {
            return 0;
          }
        });
        break;

      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(c, d) {
          if (c.comments > d.comments || (d.comments && c.comments === 0)) {
            return -1;
          }
          if (c.comments < d.comments || (c.comments && d.comments === 0)) {
            return 1;
          }
          if (c.comments === d.comments) {
            return 0;
          }
        });
        break;
      case 'filter-popular':
        filteredPictures = picturesToFilter.slice(0);
        break;

      default:
        filteredPictures = picturesToFilter.slice(0);
        break;
    }
    localStorage.setItem('filterID', filterID);
    var activeFilterChecked = document.getElementById(filterID);
    activeFilterChecked.checked = true;
    localStorage.setItem('activeFilterChecked', activeFilterChecked.checked);
    return filteredPictures;
  }

  function setActiveFilter(filterID) {
    currentPictures = filterPictures(picturesData, filterID);
    currentPage = 0;
    renderPictures(currentPictures, currentPage, true);
  }
  function isNextPageAvailable() {
    return currentPage < Math.ceil(picturesData.length / PAGE_SIZE);
  }

  function isAtTheBottom() {
    var GAP = 100;
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
    var filterElements = document.querySelectorAll('.filters-radio');
    var filterChecked = document.querySelector('#' + localStorage.getItem('filterID')) ||
      document.querySelector('.filters-radio:checked');

    for (var i = 0, l = filterElements.length; i < l; i++) {
      filterElements[i].addEventListener('click', function(evt) {
        var clickedFilter = evt.currentTarget;
        if (filterChecked !== clickedFilter) {
          setActiveFilter(clickedFilter.id);
          filterChecked = clickedFilter;
        }
        clickedFilter.checked = true;
      });
    }
  }

  initFilters();
  initScroll();
  loadPictures(function(loadedPictures) {
    picturesData = loadedPictures;
    setActiveFilter(localStorage.getItem('filterID') || 'filter-popular');
  });
})();
