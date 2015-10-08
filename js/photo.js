'use strict';

(function() {

  var pictureTemplate = document.getElementById('picture-template');

  var REQUEST_FAILURE_TIMEOUT = 10000;

  var Photo = function(data) {
    this._data = data;
    this._onClick = this._onClick.bind(this);
  };

  Photo.prototype.render = function(container) {
    var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);
    var firstImg = newPictureElement.querySelector('img');
    newPictureElement.querySelector('.picture-comments').textContent = this._data['comments'];
    newPictureElement.querySelector('.picture-likes').textContent = this._data['likes'];
    if (this._data['url']) {
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
      pictureBackground.src = this._data['url'];
      pictureBackground.onerror = function() {
        newPictureElement.classList.add('picture-load-failure');
      };
      newPictureElement.href = this._data['url'];
    }
    container.appendChild(newPictureElement);

    this._element = newPictureElement;
    this._element.addEventListener('click', this._onClick);
  };

  Photo.prototype.unrender = function() {
    this._element.parentNode.removeChild(this._element);
    this._element.removeEventListener('click', this._onClick);
    this._element = null;
  };

  Photo.prototype._onClick = function() {
    if (!this._element.classList.contains('picture-load-failure')) {
      var galleryEvent = new CustomEvent('galleryclick', { detail: { photoElement: this }});
      window.dispatchEvent(galleryEvent);
    }
  };

  window.Photo = Photo;
})();
