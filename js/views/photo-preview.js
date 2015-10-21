'use strict';

(function() {
  var GalleryPicture = Backbone.View.extend({
    initialize: function() {
      // Фиксирование контекста обработчика клика по лайку.
      this._onButtonClick = this._onButtonClick.bind(this);

      // Подписка на изменения лайка в модели.
      this.listenTo(this.model, 'change:liked', function() {
        this._updateLikeButton();
      }.bind(this));
    },

    render: function() {
      // Подстановка картинки.
      this.el.querySelector('.gallery-overlay-image').src = this.model.get('url');
      // Запись количества комментов в блоке под фотографией.
      this.el.querySelector('.comments-count').innerText = this.model.get('comments');

      // Сохранение кнопки лайка
      this._likeButton = this.el.querySelector('.likes-count');
      // Обработчик клика по кнопке лайка
      this._likeButton.addEventListener('click', this._onButtonClick);
      // Обновление статуса кнопки лайка — количества лайков и класса,
      // показывающего сердечко.
      this._updateLikeButton();
    },

    remove: function() {
      this._likeButton.removeEventListener('click', this._onButtonClick);
    },

    _updateLikeButton: function() {
      if (this._likeButton) {
        this._likeButton.classList.toggle('likes-count-liked', this.model.get('liked'));
        this._likeButton.innerText = this.model.get('likes');
      }
    },

    _onButtonClick: function() {
      var isLiked = this._likeButton.classList.contains('likes-count-liked');
      if (isLiked) {
        this.model.dislike();
      } else {
        this.model.like();
      }
    }
  });

  window.GalleryPicture = GalleryPicture;
})();