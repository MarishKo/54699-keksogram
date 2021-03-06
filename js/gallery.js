'use strict';

define([
  'views/photo-preview',
  'views/video-preview'
], function(GalleryPicture, GalleryVideo) {
  /**
   * Список констант кодов нажатых клавиш для обработки
   * клавиатурных событий.
   * @enum {number}
   */
  var Key = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };
  /**
   * Конструктор объекта фотогалереи. Создает свойства, хранящие ссылки на элементы
   * галереи, служебные данные (номер показанной фотографии и список фотографий)
   * и фиксирует контекст у обработчиков событий.
   * @constructor
   */
  var Gallery = function() {
    this._photos = new Backbone.Collection();

    this._element = document.body.querySelector('.gallery-overlay');
    this._closeButton = this._element.querySelector('.gallery-overlay-close');
    this._pictureElement = this._element.querySelector('.gallery-overlay-preview');

    this._currentPhoto = 0;
    this._renderedView = null;

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  };
  /**
   * Метод, "зажимающий" переданное значение value между значениями
   * min и max. Возвращает value которое будет не меньше min
   * и не больше max.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  Gallery.prototype._clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };
  /**
   * Показывает фотогалерею, убирая у контейнера класс hidden. Затем добавляет
   * обработчики событий.
   */
  Gallery.prototype.show = function() {
    this._element.classList.remove('invisible');
    this._closeButton.addEventListener('click', this._onCloseClick);
    document.body.addEventListener('keyup', this._onKeyUp);
  };
  /**
   * Убирает фотогалерею и обработчики событий. Очищает служебные свойства.
   */
  Gallery.prototype.hide = function() {
    this._element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    document.body.removeEventListener('keyup', this._onKeyUp);
    this._currentPhoto = 0;

    this.removeView();
  };


  Gallery.prototype.removeView = function() {
    if (this._renderedView) {
      this._renderedView.remove();
      this._renderedView = null;
    }
  };

  /**
   * Приватный метод, показывающий текущую фотографию. Убирает предыдущюю
   * отрисованную фотографию, создает объект Image с src указанным
   * в массиве photos_ под индексом currentPhoto_ и после загрузки показывает
   * его на странице.
   * @private
   */
  Gallery.prototype._showCurrentPhoto = function() {
    this.removeView();

    this._renderedView = new GalleryPicture({ model: this._photos.at(this._currentPhoto) });
    this._renderedView.setElement(this._pictureElement);
    this._renderedView.render();
  };
  /**
   * Приватный метод, показывающий текущее видео.
   * @private
   */
  Gallery.prototype._showCurrentVideo = function() {
    this.removeView();

    this._renderedView = new GalleryVideo({ model: this._photos.at(this._currentPhoto) });
    this._renderedView.setElement(this._pictureElement);
    this._renderedView.render();
  };
  /**
   * Обработчик события клика по крестику закрытия. Вызывает метод hide.
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onCloseClick = function(evt) {
    evt.preventDefault();
    this.hide();

  };
  /**
   * Записывает список фотографий.
   * @param {Backbone.Collection} photos
   */
  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos;
  };

  /**
   * Обработчик клавиатурных событий. Прячет галерею при нажатии Esc
   * и переключает фотографии при нажатии на стрелки.
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onKeyUp = function(evt) {
    switch (evt.keyCode) {
      case Key.ESC:
        this.hide();

        break;

      case Key.LEFT:
        this.setCurrentPhoto(this._currentPhoto - 1);
        break;

      case Key.RIGHT:
        this.setCurrentPhoto(this._currentPhoto + 1);
        break;
    }
  };
  /**
   * Устанавливает номер фотографии, которую нужно показать и показывает ее на странице.
   * @param {number} index
   */
  Gallery.prototype.setCurrentPhoto = function(index) {
    if (this._renderedView) {
      this._renderedView.remove();
    }
    this._currentPhoto = this._clamp(index, 0, this._photos.length - 1);

    if (this._photos.models[index]) {
      if (this._photos.models[index].attributes['preview']) {
        //вызов галереи для видео
        this._showCurrentVideo();
      } else {
        //вызов галлереи для фото
        this._showCurrentPhoto();
      }
    }
  };
  return Gallery;
});
