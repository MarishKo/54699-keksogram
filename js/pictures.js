/**
 * Created by Марина on 23.09.2015.
 */
(function(){

    var filtersForm = document.querySelector('.filters');
    filtersForm.classList.add('hidden');

    var statClassName = {
        'comments': 'picture-comments',
        'likes': 'picture-likes'
    };

    var IMAGE_FAILURE_TIMEOUT = 10000;
    var picturesContainer = document.querySelector('.pictures');
    var pictureTemplate = document.getElementById('picture-template');

    var picturesFragment = document.createDocumentFragment();

    pictures.forEach(function (picture, i){
        var newPictureElement = pictureTemplate.content.children[0].cloneNode(true);
        var statsContainer = newPictureElement.querySelector('.picture-stats');
        var firstImg = newPictureElement.querySelector('img');

        var statElement = document.createElement('span');
        statElement.classList.add('picture-stat');
        statElement.classList.add(statClassName[picture]);
        statsContainer.appendChild(statElement);

        newPictureElement.querySelector('.picture-comments').textContent = picture['comments'];
        newPictureElement.querySelector('.picture-likes').textContent = picture['likes'];

        if (picture['url']) {

            var pictureBackground = new Image();
            pictureBackground.src = picture['url'];

            var imageLoadTimeout = setTimeout(function() {
                newPictureElement.classList.add('picture-load-failure');
            }, IMAGE_FAILURE_TIMEOUT);

            pictureBackground.onload = function() {
                newPictureElement.replaceChild(pictureBackground, firstImg);
                pictureBackground.width = '182';
                pictureBackground.height = '182';
                clearTimeout(imageLoadTimeout);
            }

            pictureBackground.onerror = function(evt) {
                newPictureElement.classList.add('picture-load-failure');
            };
        }
        picturesFragment.appendChild(newPictureElement);
    });

    picturesContainer.appendChild(picturesFragment);
    filtersForm.classList.remove('hidden');
})();
