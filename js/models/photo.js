'use strict';

(function() {
  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var PhotoModel = Backbone.Model.extend({
    /** @override */
    initialize: function() {
      this.set('liked', false);
    },

    like: function() {
      this.set('liked', true);
      this.set('likes', this.get('likes') + 1);
    },

    dislike: function() {
      this.set('liked', false);
      this.set('likes', this.get('likes') - 1);
    }
  });

  window.PhotoModel = PhotoModel;
})();
