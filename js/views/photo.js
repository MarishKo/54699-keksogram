/* global Backbone: true */

'use strict';

(function() {
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
      this._onModelLike = this._onModelLike.bind(this);
      this._onClick = this._onClick.bind(this);

      this.model.on('change:liked', this._onModelLike);
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
      this._updateLike();
    },

    /**
     * Обработчик кликов по элементу.
     * @param {MouseEvent} evt
     * @private
     */
    _onClick: function(evt) {
      evt.preventDefault();
      if (this.el.classList.contains('picture') && !this.el.classList.contains('picture-load-failure')) {
        this.trigger('galleryclick');
      }
      // Клик по иконке сердца, добавляет лайк к фото
      if (evt.target.classList.contains('picture-likes')) {
        if (this.model.get('liked')) {
          this.model.dislike();
        } else {
          this.model.like();
        }
      }
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
      //failedImage.src = 'failed.jpg';
      this.el.classList.add('picture-load-failure');
    },
    /**
     * @private
     */
    _onModelLike: function() {
      this._updateLike();
    },
    /**
     * @private
     */
    _updateLike: function() {
      var likeButton = this.el.querySelector('.picture-likes');
      if (likeButton) {
        likeButton.classList.toggle('picture-likes-liked', this.model.get('liked'));
      }
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
