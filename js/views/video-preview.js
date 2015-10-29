'use strict';

define(function() {
  var GalleryVideo = Backbone.View.extend({
    initialize: function() {
      // Фиксирование контекста обработчика клика по лайку.
      this._onButtonClick = this._onButtonClick.bind(this);

      // Подписка на изменения лайка в модели.
      this.listenTo(this.model, 'change:liked', function() {
        this._updateLikeButton();
      }.bind(this));
      //Подписка на запуск видео по клику
      this._playVideo = this._playVideo.bind(this);
      //Подписка на паузу видео по клику после play
      this._pauseVideo = this._pauseVideo.bind(this);
    },

    createVideoElement: function() {
      this._thisVideo = document.createElement('video');
      //запись аттрибутов видео
      //thisVideo.setAttribute('autoplay', 'true');
      this._thisVideo.setAttribute('loop', 'true');
      this._thisVideo.setAttribute('poster', this.model.get('preview'));
      this._thisVideo.classList.add('video');

    },

    render: function() {
      if (!this.el.querySelector('.video')) {
        this.createVideoElement();
        this.el.appendChild(this._thisVideo);
      } else {
        this._thisVideo = this.el.querySelector('.video');
      }

      // Создание видео, запись src.
      this._thisVideo.src = this.model.get('url');
      //добавление элемента

      this.el.querySelector('.gallery-overlay-image').classList.add('invisible');
      this._thisVideo.classList.remove('invisible');
      // Запись количества комментов в блоке под видео.
      this.el.querySelector('.comments-count').innerText = this.model.get('comments');

      // Сохранение кнопки лайка
      this._likeButton = this.el.querySelector('.likes-count');
      // Обработчик клика по кнопке лайка
      this._likeButton.addEventListener('click', this._onButtonClick);
      //Обработчик клика на запуск видео по клику по видео
      this._thisVideo.addEventListener('click', this._playVideo);

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
    },
    _playVideo: function() {
      this._thisVideo.play();
      if (this._thisVideo.played) {
      //Обработчик клика на запуск видео по клику по видео
        this._thisVideo.addEventListener('click', this._pauseVideo);
        this._thisVideo.removeEventListener('click', this._playVideo);
      }

    },
    _pauseVideo: function() {
      this._thisVideo.pause();
      if (this._thisVideo.paused) {
        this._thisVideo.removeEventListener('click', this._pauseVideo);
        //Обработчик клика на запуск видео по клику по видео
        this._thisVideo.addEventListener('click', this._playVideo);
      }
    }
  });

  return GalleryVideo;
});
