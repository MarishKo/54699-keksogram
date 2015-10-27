'use strict';

define(function() {
  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;
  /**
   * @type {Element}
   */
  var pictureTemplate = document.getElementById('picture-template');

  /**
   * @constructor
   * @extends {Backbone.View}
   */
  var PhotoView = Backbone.View.extend({
    /**
     * @override
     */
    initialize: function() {
      this._onImageLoad = this._onImageLoad.bind(this);
      this._onImageFail = this._onImageFail.bind(this);
      this._onClick = this._onClick.bind(this);
    },

    /**
     * Маппинг событий происходящих на элементе на названия методов обработчиков
     * событий.
     * @type {Object.<string, string>}
     */
    events: {
      'click': '_onClick'
    },

    /**
     * Отрисовка фото
     * @override
     */
    render: function() {
      this._newElement = pictureTemplate.content.children[0].cloneNode(true);
      this._newElement.querySelector('.picture-comments').textContent = this.model.get('comments');
      this._newElement.querySelector('.picture-likes').textContent = this.model.get('likes');

      this.el.classList.add('picture');

      if (this.model.get('url')) {
        this._pictureBackground = new Image(182, 182);

        this._imageLoadTimeout = setTimeout(function() {
          this.el.classList.add('picture-load-failure');
        }.bind(this), REQUEST_FAILURE_TIMEOUT);

        this._pictureBackground.addEventListener('load', this._onImageLoad);
        this._pictureBackground.addEventListener('error', this._onImageFail);

        this._pictureBackground.src = this.model.get('url');
      }
    },

    /**
     * Обработчик кликов по элементу.
     * @param {MouseEvent} evt
     * @private
     */
    _onClick: function(evt) {
      evt.preventDefault();
      this.trigger('galleryclick');
    },

    /**
     * @private
     */
    _onImageLoad: function() {
      clearTimeout(this._imageLoadTimeout);
      this._newElement.replaceChild(this._pictureBackground, this._newElement.querySelector('img'));
      this.el.appendChild(this._newElement);
      this._cleanupImageListeners(this._pictureBackground);
    },

    /**
     * @private
     */
    _onImageFail: function() {
      this.el.classList.add('picture-load-failure');
    },

    /**
     * Удаление обработчиков событий на элементе.
     * @param {Image} image
     * @private
     */
    _cleanupImageListeners: function(image) {
      image.removeEventListener('load', this._onImageLoad);
      image.removeEventListener('error', this._onImageFail);
      image.removeEventListener('abort', this._onImageFail);
    }
  });
  return PhotoView;
});
