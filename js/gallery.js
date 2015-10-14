'use strict';

(function() {
  var Key = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };
  var Gallery = function() {
    this._element = document.body.querySelector('.gallery-overlay');
    this._closeButton = this._element.querySelector('.gallery-overlay-close');
    this._pictureElement = this._element.querySelector('.gallery-overlay-preview');

    this._currentPhoto = 0;
    this._photos = [];

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  };
  Gallery.prototype._clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  Gallery.prototype.show = function() {
    this._element.classList.remove('invisible');
    this._closeButton.addEventListener('click', this._onCloseClick);
    document.body.addEventListener('keyup', this._onKeyUp);
    this._showCurrentPhoto();
  };

  Gallery.prototype.hide = function() {
    this._element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    document.body.removeEventListener('keyup', this._onKeyUp);
    this._currentPhoto = 0;
  };


  Gallery.prototype._showCurrentPhoto = function() {
    this._pictureElement.innerHTML = '';
    var imageElement = new Image();

    imageElement.onload = function() {
      this._pictureElement.appendChild(imageElement);
    }.bind(this);


    imageElement.src = this._photos[this._currentPhoto];
  };

  Gallery.prototype._onCloseClick = function(evt) {
    evt.preventDefault();
    this.hide();
  };

  Gallery.prototype.setPhotos = function(photos) {
    this._photos = photos.map(function(item) {
      return item.url;
    });
  };
  Gallery.prototype._isPhotoInLimit = function(index) {
    return !(index < 0 || index > this._photos.length - 1);
  };
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
  Gallery.prototype.setCurrentPhoto = function(index) {
    if (this._isPhotoInLimit(index)) {
      this._clamp(index, 0, this._photos.length - 1);
      this._currentPhoto = index;
      this.show();
    }
  };

  window.Gallery = Gallery;
})();
