function XSlider(config, settings){
	this.$ = config.element;

	this.default = {
		accessibility: true,
		autoplay: false,
		autoplaySpeed: 3000,
		appendArrows: this.el,
		appendDots: this.el,
		arrows: true,
		prevArrow: 'slider__left' || 'slider-main__arrow_left',
		nextArrow: 'slider__right' || 'slider-main__arrow_right',
		dots: false,
		dotsClass: '.slider-main__controls-item',
		draggable: true,
		infinite: true,
		initialSlade: 0,
		lazyLoad: 'ondemand',
		respondTo: 'window',
		responsive: null,
		rows: 1,
		slide: '',
		swipe: true,
		swipeToSlide: true,
		touchMove: true,
		touchThreshold: 5,
		verticalSwiping: true,

	};

	this.initials = {
		animating: false,
        dragging: false,
        autoPlayTimer: null,
        currentDirection: 0,
        currentLeft: null,
        currentSlide: 0,
        direction: 1,
        $dots: null,
        listWidth: null,
        loadIndex: 0,
        $nextArrow: null,
        $prevArrow: null,
        slideCount: null,
        slideWidth: null,
        $slideTrack: null,
        $slides: null,
        sliding: false,
        slideOffset: 0,
        swipeLeft: null,
        swiping: false,
        $list: null,
        touchObject: {},        
	};

	Object.assign(this, this.initials);

	this.activeBreakpoint = null;
    this.breakpoints = [];
    this.breakpointSettings = [];
	this.paused = true;
	this.focussed = false;
    this.interrupted = false;

	this.options = Object.assign({}, this.defaults, settings);
	this.currentSlide = this.options.initialSlide;
	this.originalSettings = this.options;

}

XSlider.events = {
	'sliderEnd': 'xslider.events.slideEnd'
}

XSlider.prototype.endSlide = function() {
    this.onScrolled = false;
    this.$.trigger(XSlider.events.slideEnd)

    //viewer.checkSelector('.slider .product-card');
};

XSlider.prototype.autoPlay = function() {

    var _ = this;

    _.autoPlayClear();

    if ( _.slideCount > _.options.slidesToShow ) {
        _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
    }

};

XSlider.prototype.autoPlayClear = function() {

    var _ = this;

    if (_.autoPlayTimer) {
        clearInterval(_.autoPlayTimer);
    }

};

XSlider.prototype.autoPlayIterator = function() {

    var _ = this,
        slideTo = _.currentSlide + _.options.slidesToScroll;

    if ( !_.paused && !_.interrupted && !_.focussed ) {

        if ( _.options.infinite === false ) {

            if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                _.direction = 0;
            }

            else if ( _.direction === 0 ) {

                slideTo = _.currentSlide - _.options.slidesToScroll;

                if ( _.currentSlide - 1 === 0 ) {
                    _.direction = 1;
                }

            }

        }

        _.slideHandler( slideTo );

    }

};

XSlider.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('XSlider-dotted');

            for (i = 0; i <= _.getDotCount(); i += 1) {
                _.options.dotsClass.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = _.options.dotsClass.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('XSlider-active');

        }

    };

    