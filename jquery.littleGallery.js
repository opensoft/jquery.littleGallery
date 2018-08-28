(function ($) {
    jQuery.fn.littleGallery = function (options) {
        var gallery = $('.littleGallery');
        var lastImageLoading = null;
        var flagResize = false;
        var hideOnClick = false;

        this.on('click', function () {
            if (!gallery.is(':visible')) {
                gallery.fadeIn(function () {
                    hideOnClick = true;
                });

                $('.littleGallery-blind').show();
                resize();
                gallery.find('.littleGallery-head .littleGallery-img:eq(0)').click();
            }
        });

        options = $.extend({
            data: {},
            marginWindow: {top: 50, left: 50},
            paddingImage: {top: 0, left: 0},
            circularShift: true,
            defaultMessageForEmptyData: 'Image not found'
        }, options);

        var arrayImages = [];
        var resize = function () {
            var windowHeight = $(window).innerHeight();
            var windowWidth = $(window).innerWidth();
            var galleryHeight = gallery.innerHeight();
            var galleryWidth = gallery.innerWidth();
            var img = gallery.find('.littleGallery-body .littleGallery-container .littleGallery-img');
            var heightElements = gallery.find('.littleGallery-head').innerHeight();

            gallery.css('height', windowHeight - options.marginWindow.top);
            gallery.css('max-height', windowHeight - options.marginWindow.top);

            if (gallery.innerWidth() > windowWidth - options.marginWindow.left) {
                gallery.css('max-width', windowWidth - options.marginWindow.left);
            }

            gallery.find('.littleGallery-body').height(galleryHeight - heightElements);

            var maxHeightImg = windowHeight - heightElements - options.marginWindow.top * 2 - options.paddingImage.top;
            var maxWidthImg = windowWidth - options.marginWindow.left * 2 - options.paddingImage.left;

            img.css('max-height', maxHeightImg);
            img.css('max-width', maxWidthImg);

            var top = parseInt(windowHeight / 2 - galleryHeight / 2);
            var left = parseInt(windowWidth / 2 - galleryWidth / 2);
            gallery.offset({left: left, top: top});

            setTimeout(function () {
                if (flagResize) {
                    resize();
                    flagResize = false;
                }
            }, 100);
        };

        var init = function () {
            var data = options.data;

            $('body').append('<div class="littleGallery">'
                + '<i class="littleGallery-img-close"></i>'
                + '<div class="littleGallery-head"></div>'
                + '<div class="littleGallery-body">   '
                + '<div class="littleGallery-container"></div>'
                + '</div></div>'
                + '<div class="littleGallery-blind"></div>');

            gallery = $('.littleGallery');

            if (!$.isEmptyObject(data)) {
                var headHtml = '';
                $.each(data, function(key, file) {
                    if (file.url !== undefined && file.name !== undefined) {
                        headHtml += '<span class="littleGallery-img" data="' + file.url + '">' + file.name + '</span>';
                    }
                });
                gallery.find('.littleGallery-head').html(headHtml);
            } else {
                gallery.find('.littleGallery-body .littleGallery-container').html(
                    '<i class="littleGallery-error">' + options.defaultMessageForEmptyData + '</i>'
                ).hide().fadeIn();
            }

            $(window).on('resize', function () {
                resize();
            });

            $(window).on('click', function (e) {
                if (gallery.is(':visible')) {
                    if (hideOnClick && $(e.target).closest(gallery.get(0)).length == 0) {
                        gallery.find('.littleGallery-img-close').click();
                    }
                }
            });

            $(window).on('keyup', function (e) {
                if (!$('.littleGallery').is(':visible')) return;

                var el = gallery.find('.littleGallery-head .littleGallery-img');

                if (e.keyCode == 27) {
                    gallery.find('.littleGallery-img-close').click();
                } else if (e.keyCode == 39) {

                    if (el.length == 1) {
                        return false;
                    }

                    el.each(function () {
                        if ($(this).hasClass('littleGallery-img-active')) {
                            if ($(this).next().length == 0) {
                                if (options.circularShift) {
                                    gallery.find('.littleGallery-head .littleGallery-img:eq(0)').click();
                                }
                            } else {
                                $(this).next().click();
                            }

                            return false;
                        }
                    });
                }  else if (e.keyCode == 37) {
                    if (el.length == 1) {
                        return false;
                    }

                    el.each(function () {
                        if ($(this).hasClass('littleGallery-img-active')) {
                            if ($(this).prev().length == 0) {
                                if (options.circularShift) {
                                    gallery.find('.littleGallery-head .littleGallery-img:last').click();
                                }
                            } else {
                                $(this).prev().click();
                            }

                            return false;
                        }
                    });
                }
            });

            gallery.find('.littleGallery-img-close').on('click', function () {
                gallery.fadeOut();
                $('.littleGallery-blind').fadeOut();
                hideOnClick = false;
            });

            gallery.find('.littleGallery-head .littleGallery-img').on('click', function () {
                var urlImg = $(this).attr('data');
                if (!urlImg) return;

                gallery.find('.littleGallery-head .littleGallery-img').removeClass('littleGallery-img-active');
                $(this).addClass('littleGallery-img-active');

                if (arrayImages[urlImg] && gallery.find('.littleGallery-head .littleGallery-img').length != 1) {
                    gallery.find('.littleGallery-body .littleGallery-container').empty();
                } else if (arrayImages[urlImg]){
                    return;
                }

                if (arrayImages[urlImg]) {
                    gallery.find('.littleGallery-body .littleGallery-container').html('<img class="littleGallery-img" src="' + urlImg + '">').hide().fadeIn();
                    flagResize = true;
                    resize();
                } else {
                    gallery.find('.littleGallery-body .littleGallery-container').html('<i class="littleGallery-imgloading"></i>').show();
                    flagResize = true;
                    resize();

                    var tmp = new Image();
                    lastImageLoading = urlImg;
                    tmp.src = urlImg;

                    $(tmp).on('load', function () {
                        arrayImages[urlImg] = true;

                        if (lastImageLoading == urlImg) {
                            gallery.find('.littleGallery-body .littleGallery-container').html('<img class="littleGallery-img" src="' + urlImg + '">').hide().fadeIn();
                            flagResize = true;
                            resize();
                        }
                    });

                    $(tmp).on('error', function () {
                        gallery.find('.littleGallery-body .littleGallery-container').html('<i class="littleGallery-error">Image not found</i>').hide().fadeIn();
                        flagResize = true;
                        resize();
                    });
                }
            });
        };

        return this.each(init);
    };
})(jQuery);
