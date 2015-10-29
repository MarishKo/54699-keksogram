/*global resizer: true*/
'use strict';

requirejs.config({
  baseUrl: 'js'
});

define([
  'gallery',
  'models/photos',
  'views/photo',
  'resize-form',
  'upload-form',
  'filter-form',
  'logo-background'
], function(Gallery, PhotosCollection, PhotoView) {
  var filtersForm = document.querySelector('.filters');
  filtersForm.classList.add('hidden');
  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;
  /**
   * @const
   * @type {number}
   */
  var PAGE_SIZE = 12;
  /**
   * Контейнер списка фотографий.
   * @type {Element}
   */
  var picturesContainer = document.querySelector('.pictures');
  /**
   * @type {number}
   */
  var currentPage = 0;
  /**
   * Объект типа фотогалерея.
   * @type {Gallery}
   */
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
  var renderedPictures = [];

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
      renderedPictures.push(view.model.get('url'));
      view.on('galleryclick', function() {
        gallery.setCurrentPhoto(photosCollection.models.indexOf(view.model));
        gallery.show();
      });
    });
    picturesContainer.appendChild(fragment);
    filtersForm.classList.remove('hidden');
  }

  /**
   * Добавляет класс ошибки контейнеру с фото. Используется в случае
   * если произошла ошибка загрузки фото или загрузка прервалась
   * по таймауту.
   */
  function showLoadFailure() {
    picturesContainer.classList.add('pictures-failure');
  }

  /**
   * Фильтрация списка фото. Принимает на вход список фото
   * и ID фильтра. В зависимости от переданного ID применяет
   * разные алгоритмы фильтрации. Возвращает отфильтрованный
   * список и записывает примененный фильтр в hash.
   * Не изменяет исходный массив.
   * @param {string} filterID
   * @return {Array.<Object>}
   */
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
    location.hash = 'filters/' + filterID;
  }

  function hashMatch() {
    return location.hash.match(/^#filters\/(\S+)$/);
  }
  /**
   * функция parseURL, которая с помощью регулярного выражения обрабатывает хэш адресной строки
   * и если он соответствует паттерну filters/символы,
   *запускает фильтрацию с аргументом находящимся в хэше после filters/
   */
  function parseURL() {
    var hashCompare = hashMatch();
    if (!hashCompare) {
      setActiveFilter('filter-popular');
    }
    if (hashCompare) {
      var arr = hashCompare;
      var filterID = arr[1];
      setActiveFilter(filterID);
      var checkedFilter = document.getElementById(filterID);
      checkedFilter.checked = true;
    }
  }
  /**
   * Вызывает функцию фильтрации на списке отелей с переданным fitlerID
   * @param {string} filterID
   */
  function setActiveFilter(filterID) {
    filterPictures(filterID);
    gallery.setPhotos(photosCollection);
    currentPage = 0;
    renderedPictures = [];
    renderPictures(currentPage, true);
    if ((picturesContainer.offsetHeight - 20) < window.innerHeight) {
      checkNextPage();
    }
  }
  /**
   * Проверяет можно ли отрисовать следующую страницу списка отелей.
   * @return {boolean}
   */
  function isNextPageAvailable() {
    return currentPage < Math.ceil(photosCollection.length / PAGE_SIZE);
  }
  /**
   * Проверяет, находится ли скролл внизу страницы.
   * @return {boolean}
   */
  function isAtTheBottom() {
    var GAP = 20;
    return picturesContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }
  /**
   * Испускает на объекте window событие loadneeded если скролл находится внизу
   * страницы и существует возможность показать еще одну страницу.
   */
  function checkNextPage() {
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  /**
   * Создает два обработчика событий: на прокручивание окна, который в оптимизированном
   * режиме (раз в 100 миллисекунд скролла) проверяет можно ли отрисовать следующую страницу;
   * и обработчик события loadneeded, который вызывает функцию отрисовки следующей страницы.
   */
  function initScroll() {
    var someTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(someTimeout);
      someTimeout = setTimeout(checkNextPage, 100);
    });
    window.addEventListener('loadneeded', function() {
      renderPictures(++currentPage, false);
    });
  }
  /**
   * Проверяет есть ли у переданного элемента или одного из его родителей
   * переданный CSS-класс.
   * @param {Element} element
   * @param {string} className
   * @return {boolean}
   */
  function doesHaveParent(element, className) {
    do {
      if (element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    }
    while (element);
    return false;
  }
  /**
   * Инициализация подписки на клики по кнопкам фильтра.
   * Используется делегирование событий: события обрабатываются на объекте,
   * содержащем все фильтры, и в момент наступления события, проверяется,
   * произошел ли клик по фильтру или нет и если да, то вызывается функция
   * установки фильтра.
   */
  function initFilters() {
    var filtersContainer = document.querySelector('.filters');
    if (hashMatch()) {
      var arr = hashMatch();
      var filterID = arr[1];
    }
    var filterChecked = document.querySelector('#' + filterID) ||
      document.querySelector('.filters-radio:checked');
    filtersContainer.addEventListener('click', function(evt) {
      var clickedFilter = evt.target;
      if (doesHaveParent(clickedFilter, 'filters-radio') && (filterChecked.id !== clickedFilter.id)) {
        setActiveFilter(clickedFilter.id);
        filterChecked = clickedFilter;
      }
    });
  }

  window.addEventListener('hashchange', parseURL());

  photosCollection.fetch({ timeout: REQUEST_FAILURE_TIMEOUT }).success(function(loaded, state, jqXHR) {
    initiallyLoaded = jqXHR.responseJSON;
    initFilters();
    initScroll();
    parseURL();

  }).fail(function() {
    showLoadFailure();
  });
});
