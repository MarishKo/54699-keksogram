/* global Backbone: true */

'use strict';

(function() {
  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;

  var statClassName = {
    'comments': 'picture-comments',
    'likes': 'picture-likes'
  };
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
     // this._onModelLike = this._onModelLike.bind(this);
      this._onClick = this._onClick.bind(this);

      //this.model.on('change:liked', this._onModelLike);
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
     * Тег, использующийся для элемента представления.
     * @type {string}
     * @override
     */
    //tagName: 'img',

    /**
     * Отрисовка фото
     * @override
     */
    render: function() {
      this.el = pictureTemplate.content.children[0].cloneNode(true);
      this.el.querySelector('.picture-comments').textContent = this.model.get('comments');
      this.el.querySelector('.picture-likes').textContent = this.model.get('likes');

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
      console.log(111);
      evt.preventDefault();
      var clickedElement = evt.target;

      if (clickedElement.classList.contains('picture') && !clickedElement.classList.contains('picture-load-failure')) {
        this.trigger('galleryclick');
      }
    },

    /**
     * @param {Event} evt
     * @private
     */
    _onImageLoad: function(evt) {
      clearTimeout(this._imageLoadTimeout);

      this.el.replaceChild(this._pictureBackground, this.el.querySelector('img'));

      this._cleanupImageListeners(evt.path[0]);
    },

    /**
     * @param {Event} evt
     * @private
     */
    _onImageFail: function(evt) {
      var failedImage = evt.path[0];
      this._cleanupImageListeners(failedImage);

      failedImage.src = 'failed.jpg';
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

  window.PhotoView = PhotoView;
})();
