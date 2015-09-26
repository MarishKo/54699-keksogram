/**
 * Created by Марина on 23.09.2015.
 */
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
  var picturesContainer = document.querySelector('.pictures');
  var pictureTemplate = document.getElementById('picture-template');
  var pictures;

  var picturesFragment = document.createDocumentFragment();

  function renderPictures(pictures) {

    picturesContainer.innerHTML = '';

    pictures.forEach(function (picture, i) {
      var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);
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

        var imageLoadTimeout = setTimeout(function () {
          newPictureElement.classList.add('picture-load-failure');
        }, REQUEST_FAILURE_TIMEOUT);

        pictureBackground.onload = function () {
          newPictureElement.replaceChild(pictureBackground, firstImg);
          pictureBackground.width = '182';
          pictureBackground.height = '182';
          clearTimeout(imageLoadTimeout);
        }
        pictureBackground.src = picture['url'];

        pictureBackground.onerror = function (evt) {
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
          if (loadedXhr.status == 200) {
            var data = loadedXhr.response;
            picturesContainer.classList.remove('pictures-loading');
            callback(JSON.parse(data));
          }

          if (loadedXhr.status > 400) {
            showLoadFailure();
          }
          break;
      }
    };

    xhr.ontimeout = function() {
      showLoadFailure();
    }
  }
  function filterPictures(pictures, filterID) {
    var filteredPictures = pictures.slice(0);
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
            return 1;
          }

          if (c.comments < d.comments || (c.comments && d.comments === 0)) {
            return -1;
          }

          if (c.comments === d.comments) {
            return 0;
          }
        });

        break;

      default:
        filteredPictures = pictures.slice(0);
        break;
    }
    return filteredPictures;
  }

  function initFilters() {
    var filterElements = document.querySelectorAll('.filters-radio');
    for (var i = 0, l = filterElements.length; i < l; i++) {
      filterElements[i].onclick = function(evt) {
        var clickedFilter = evt.currentTarget;
        setActiveFilter(clickedFilter.id);
        clickedFilter.setAttribute('checked', 'checked');
      }
    }
  }
  function setActiveFilter(filterID) {
    var filteredPictures = filterPictures(pictures, filterID);
    renderPictures(filteredPictures);
  }

  initFilters();
  loadPictures(function(loadedPictures){
    pictures = loadedPictures;
    setActiveFilter('filter-popular');
  });


})();
