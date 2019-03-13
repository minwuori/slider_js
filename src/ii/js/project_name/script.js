
/* XSLIDER */
function XSlider(config) {

	this.selectors = {//селекторы слайдера
	    
        next: '.slider__right',
        prev: '.slider__left',
        container: '.container_cards',
        slide: '.product-card',
        viewport: '.slider__viewport',
        disable: '.slider__arrow_disable',
        image: '[data-original]',
        imageLoaded: 'data-loaded',
        imageAttr: 'data-original'
	       
	};

	this.slider = config.element;
	this.slider.setAttribute('data-slider', '');//установить аттрибут слайдеру на странице
    this.slider.slider = this;//передается в partners.js свойство slider

    this.next = this.slider.querySelector(this.selectors.next);//стрелка вперед
    this.prev = this.slider.querySelector(this.selectors.prev);//стрелка назад

    this.container = this.slider.querySelector(this.selectors.container);//контейнер
    this.container.style.left = 0;

    this.slides = this.slider.querySelectorAll(this.selectors.slide);//эл-ты слайдера

    Array.prototype.forEach.call(this.slides, function (slide, index){//установить каждому слайду атрибуты
        slide.setAttribute('data-slider-item', '');
        slide.setAttribute('data-index', index++);
    });

    this.itemsCount = this.slides.length;//кол-во слайдов
    
    this.itemWidth = this.countItemWidth();//ширина карточки
    this.itemWidthWillChange = config.itemWidthWillChange || false;

    this.viewedPercentage = config.viewedPercentage || 0.95;
    this.viewedAbsolute = this.itemWidth * this.viewedPercentage;


    this.viewport = this.slider.querySelector(this.selectors.viewport);//вьюпорт
    this.viewportWidth = this.countViewportWidth();//ширина вьюпорта

    this.onScrolled = false;

    this.minCountNotCheckControls = config.minCountNotCheckControls || 6;

    this.isControlsView = true;
    this.isControlsView = this.checkControlsView();

    this.initializeEvents();//инициализация событий 

    this.startX = null;//позиция клика
    this.diffX = null;//разница между начальным и новым положением курсора
    this.posContainer = parseInt(this.container.style.left);//новая позиция контейнера

    this.visibleItems = this.getVisibleItems();//карточки видимые во вьюпорте

    this.transitionSpeed = 600;//скорость анимации

    this.lazyItems = this.slider.querySelectorAll(this.selectors.image);//изображения для ленивой загрузки
    this.lazyLoadSlide(); //ленивая загрузка изображений
	
}

XSlider.prototype.countViewportWidth = function() {
	var styles = window.getComputedStyle(this.viewport);//получить значение свойства стиля карточки
	var margin = parseFloat(styles['marginLeft']) +
				 parseFloat(styles['marginRight']);//преобразовать в число полученное свойство

	var viewportWidth = Math.ceil(this.viewport.offsetWidth + margin);
	return viewportWidth;//вернуть значение ширины вьюпорта с внешними отступами
    //return this.viewport.outerWidth(false);
}

XSlider.prototype.countItemWidth = function() {
    if (!this.itemWidth || this.itemWidthWillChange) {
    	
		var styles = window.getComputedStyle(this.slides[0]);//получить значение свойства стиля карточки
		var margin = parseFloat(styles['marginLeft']) +
					 parseFloat(styles['marginRight']);//преобразовать в число полученное свойство
		var itemWidth = Math.ceil(this.slides[0].offsetWidth + margin);

		return itemWidth;//вернуть значение ширины слайда с внешними отступами
        //return this.slider.find(this.itemSelector).first().outerWidth(false);
    } else {
    	return this.itemWidth;
    }
}

XSlider.prototype.onEnvChange = function() {
    this.viewportWidth = this.countViewportWidth();
    if (this.itemWidthWillChange) {
        this.itemWidth = this.countItemWidth();
        this.viewedAbsolute = this.itemWidth * this.viewedPercentage;
    }
    this.isControlsView = this.checkControlsView();
}

XSlider.prototype.checkControlsView = function() {
    if (this.itemsCount >= this.minCountNotCheckControls) return true;
    //var lastItemLeft = this.slider.find(this.itemSelector).last().offset().left;
    var lastItem = this.slides[this.slides.length - 1];
    var lastItemLeft = parseFloat(this.getCoordsElement(lastItem).left);

    var sliderRight =  parseFloat(this.getCoordsElement(this.viewport).left) + this.viewportWidth;
    var diff = sliderRight - lastItemLeft;
    var isControlsView = diff < this.viewedAbsolute;
    if (this.isControlsView && !isControlsView) this.hideControls();
    else if (!this.isControlsView && isControlsView) this.showControls();
    return isControlsView;
};

XSlider.prototype.hideControls = function() {
    this.slider.setAttribute('data-hide-controls', '');
}

XSlider.prototype.showControls = function() {
    this.slider.removeAttribute('data-hide-controls');
}


XSlider.prototype.moveForward = function(evt) {
	
    if (this.onScrolled) return;
    
    if (this.next.classList.contains(this.selectors.disable.substring(1))) return;//если кнопка "вперед" задизейблена, то ничего не делать

    var that = this;
    this.onScrolled = true;
    var container = this.container;

	var lastSlide = this.itemWidth * this.slides.length - this.itemWidth * this.visibleItems.length // положение последнего слайда
	var newPosContainer = this.posContainer - this.itemWidth * this.visibleItems.length // новое положение контейнера

	
	if (newPosContainer <= -lastSlide){
    	this.next.classList.add(this.selectors.disable.substring(1)); //задизейблить кнопку вперед
		
		this.container.style.left = -lastSlide + 'px';
		this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';
    	
		this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера

	} else {

		this.prev.classList.remove(this.selectors.disable.substring(1));//удалить дизейбл с кнопки назад	

    	this.container.style.left = newPosContainer  + 'px';
		this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';

    	this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера
	}

	setTimeout(function(){

		that.lazyLoadSlide()

	}, this.transitionSpeed)

	that.endSlide();

};

XSlider.prototype.moveBack = function(evt) {

	var that = this;
   
    if (this.prev.classList.contains(this.selectors.disable.substring(1))) return;//если кнопка "назад" задизейблена, то ничего не делать

	if (-this.posContainer <= this.itemWidth * this.visibleItems.length ){

    	this.prev.classList.add(this.selectors.disable.substring(1));//задизейблить кнопку назад

    	this.container.style.left = 0 + 'px';
		this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';

    	this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера

	} else {
	
    	this.next.classList.remove(this.selectors.disable.substring(1));//удалить дизейбл с кнопки вперед

    	this.container.style.left = this.posContainer + this.itemWidth * this.visibleItems.length + 'px';
		this.container.style.transition = 'left ' + this.transitionSpeed + 'ms ease-in-out';

		this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера

	}

	that.endSlide();
};

XSlider.prototype.endSlide = function() {
    this.onScrolled = false;
    // this.slider.trigger(XSlider.events.slideEnd)

    var event = new CustomEvent('xslider.events.slideEnd', {bubbles: true, cancelable: true});
    this.slider.dispatchEvent(event);

    //viewer.checkSelector('.slider .product-card');
};

XSlider.prototype.getVisibleItems = function() {
	//var viewportStart = this.$viewport.offset().left;
    var viewportStart = parseFloat(this.getCoordsElement(this.viewport).left);
    var viewportFinish = viewportStart + this.viewportWidth;

    var visible = [];

    for (var i = 0; i < this.itemsCount; i++) {
        var slide = this.slides[i];
        var itemStart = parseFloat(this.getCoordsElement(this.slides[i]).left);

        var itemFinish = itemStart + this.itemWidth;
        if (itemStart < viewportFinish) {
            visible.push(slide);
        }
        if (itemFinish >= viewportFinish) {
            break;
        }
    }
    return visible;

};

XSlider.prototype.isSlideVisible = function(slide) {

	/* var viewportStart = this.$viewport.offset().left;
    var viewportFinish = viewportStart + this.viewportWidth;

    var itemStart = $(slide).offset().left;

    return itemStart < viewportFinish; */

    
    var viewportStart = parseFloat(this.getCoordsElement(this.viewport).left);
    var viewportFinish = viewportStart + this.viewportWidth;

    var itemStart = parseFloat(this.getCoordsElement(slide).left);

    if (itemStart >= viewportStart && itemStart < viewportFinish ) {
    	return itemStart;
    }
};



XSlider.prototype.getCoordsElement = function(element) {
	var box = element.getBoundingClientRect();
	return {
		top: box.top + pageYOffset, // возвратить полученные координаты верхней и левой границ, добавив к ним значения текущей прокрутки 
		left: box.left + pageXOffset // страницы .pageY(Х)Offset возвращает текущую вертикальную(горизонтальную) прокрутку.
	};
}

XSlider.prototype.initializeEvents = function() {

    window.addEventListener("resize", this.onEnvChange.bind(this));

	this.viewport.addEventListener('touchstart', this.swipeStart.bind(this));
	this.viewport.addEventListener('touchmove', this.swipeMove.bind(this));
	this.viewport.addEventListener('touchend', this.swipeEnd.bind(this));
	this.viewport.addEventListener('touchcancel', this.swipeEnd.bind(this));

	this.next.addEventListener("click", this.moveForward.bind(this));
	this.prev.addEventListener("click", this.moveBack.bind(this));
};

XSlider.prototype.swipeStart = function(evt) {
	
	this.container.style.transition = null;//сбросить анимацию
	
    this.startX = parseInt(evt.changedTouches[0].pageX);// получить координаты клика мыши по оси Х
};


XSlider.prototype.swipeMove = function(evt) {

   
    this.diffX = this.startX - parseInt(evt.changedTouches[0].pageX); //найти разницу между начальным и новым положением курсора
	
	if (this.posContainer < -this.itemWidth / 2){//прописать новую позицию контейнеру в зависимости от расстояния на которое он сдвинулся

		this.container.style.left = this.posContainer - this.diffX + 'px';

	} else {

		this.container.style.left = -this.diffX + 'px';
	}

    this.lazyLoadSlide(); //загружать изображения

};


XSlider.prototype.swipeEnd = function(event) {

	var that = this;
	var countCard = Math.ceil(this.diffX / this.itemWidth); //кол-во просвайпанных карточек 
	
	if (this.diffX > this.itemWidth / 3) {//если мышь ушла влево больше, чем на 1/3 ширины карточки
		

		var lastSlide = this.itemWidth * this.slides.length - this.itemWidth * this.visibleItems.length //положение последнего слайда
		var newPosContainer = -countCard * this.itemWidth + this.posContainer //новое положение контейнера

		
		if (newPosContainer <= -lastSlide){//если последний слайд

	    	this.next.classList.add(this.selectors.disable.substring(1)); //задизейблить кнопку вперед
			
			this.container.style.left = -lastSlide + 'px';
			this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';
	    	

		} else {

			this.prev.classList.remove(this.selectors.disable.substring(1)); //удалить дизейбл с кнопки назад	

	    	this.container.style.left = newPosContainer  + 'px';
			this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';

		}

		this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера
		that.endSlide();
		
	} else {//если мышь ушла вправо 

		if (-this.posContainer <= this.viewportWidth / 1.5){ //если первый слайд

	    	this.prev.classList.add(this.selectors.disable.substring(1)); //задизейблить кнопку назад

	    	this.container.style.left = 0 + 'px';
			this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';

		} else {

		  	this.next.classList.remove(this.selectors.disable.substring(1)); //убрать дизейбл кнопки вперед

			this.container.style.left = this.posContainer - countCard * this.itemWidth + 'px';
			this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';

		}

		this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера
		that.endSlide();
	}
};


XSlider.prototype.lazyLoadSlide = function () {

	for (var i = 0; i < this.lazyItems.length; i++){
		var isSlideVisible = this.isSlideVisible(this.slides[i]);
		if (isSlideVisible) { // проверка на видимость во viewport
			if (!this.lazyItems[i].hasAttribute(this.selectors.imageLoaded)) {
				var src = this.lazyItems[i].getAttribute(this.selectors.imageAttr);

				if (src) { // если атрибут data-original присутствует
					this.lazyItems[i].src = src;
					this.lazyItems[i].setAttribute(this.selectors.imageLoaded, "");
					this.lazyItems[i].removeAttribute(this.selectors.imageAttr);
				}
			}
		} 
	}
}

/* XSLIDER END */



    /* SLIDER */
    var carousels = document.querySelectorAll('[data-carousel]');
    Array.prototype.forEach.call(carousels, function(item, i){

        new XSlider({
            element: item
        });
    });
    /* END SLIDER */

