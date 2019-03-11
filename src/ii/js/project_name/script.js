
/* XSLIDER */
function XSlider(config) {

	this.selectors = {//селекторы слайдера
	    
        next: '.slider__right',
        prev: '.slider__left',
        container: '.container_cards',
        slide: '.product-card',
        viewport: '.slider__viewport',
        disable: '.slider__arrow_disable',
        image: '[data-original]'
	       
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
    this.lazySlide(); //ленивая загрузка изображений
	
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
    var that = this;
    this.onScrolled = true;
    var container = this.container;

	var lastSlide = this.itemWidth * this.slides.length - this.itemWidth * this.visibleItems.length // положение последнего слайда
	var newPosContainer = this.posContainer - this.itemWidth * this.visibleItems.length // новое положение контейнера

	
	if (newPosContainer <= -lastSlide){
    	this.next.classList.add(this.selectors.disable.substring(1)); //задизейблить кнопку вперед
		
		this.container.style.left = -lastSlide + 'px';
		this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';
    	
		return this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера

	} else {

		this.prev.classList.remove(this.selectors.disable.substring(1));//удалить дизейбл с кнопки назад	

    	this.container.style.left = newPosContainer  + 'px';
		this.container.style.transition = 'left ' + this.transitionSpeed +'ms ease-in-out';

    	this.posContainer = parseInt(this.container.style.left);//запомнить новое значение позиции контейнера
	}
	// requestAnimationFrame(function(){
 //    	console.log(this.lazySlide.bind(this))
	// });
	this.lazySlide();
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

    this.lazySlide(); //загружать изображения

};


XSlider.prototype.swipeEnd = function(event) {

	var that = this;
	var countCard = Math.ceil(this.diffX / this.itemWidth); //кол-во просвайпанных карточек 
	
	if (this.diffX > this.itemWidth / 3) {//если мышь ушла влево больше, чем на 1/2 ширины карточки
		

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
		
	} else {//если мышь ушла вправо больше, чем на 1/2 ширины карточки

		if (-this.posContainer <= this.itemWidth){ //если первый слайд

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


XSlider.prototype.lazySlide = function () {

	for (var i = 0; i < this.lazyItems.length; i++){
		var isSlideVisible = this.isSlideVisible(this.slides[i]);
		if (isSlideVisible) { // проверка на видимость во viewport
			console.log(this.lazyItems[i], isSlideVisible, -this.posContainer, this.viewportWidth, isSlideVisible <= -this.posContainer + this.viewportWidth)
			if (!this.lazyItems[i].hasAttribute("data-loaded")) {
				//console.log(this.lazyItems[i])

				var src = this.lazyItems[i].getAttribute("data-original");
				if (src) { // если атрибут data-original присутствует
					this.lazyItems[i].src = src;
					this.lazyItems[i].setAttribute("data-loaded", "");
					this.lazyItems[i].removeAttribute("data-original");
					//console.log(src)
				}
				
			}

		} 
	}

	//Array.prototype.slice.call(this.lazyItems, 0).forEach(function(el) {
   // Array.prototype.forEach.call(this.lazyItems, function(el) {
		
		
		
	//});

	
}

/* XSLIDER END */


// /* HELPERS */
// function getNumEnding(number, endingArray) {
//     var number = number % 100;
//     if (number>=11 && number<=19) {
//         var ending=endingArray[2];
//     }
//     else {
//         var  i = number % 10;
//         switch (i)
//         {
//             case (1): ending = endingArray[0]; break;
//             case (2):
//             case (3):
//             case (4): ending = endingArray[1]; break;
//             default: ending=endingArray[2];
//         }
//     }
//     return ending;
// }
// /* END HELPERS */

/* LAZY LOAD */
// function lazy(){
//     if (lazy.lazyLoad) {
//         lazy.lazyLoad.update();
//     } else {
//         lazy.lazyLoad = $('.lazy').Lazy({
//             chainable: false,
//             attribute: 'data-original',
//             effect: 'fadeIn',
//             effectTime: 1500,
//             visibleOnly: true,
//             threshold: 100,
//             beforeLoad: function(element) {
//                 element[0].classList.remove('lazy');
//                 element[0].setAttribute('data-loaded', '');
//             }
//         });
//     }
// }

// lazy.add = function() {
//     if (lazy.lazyLoad) {

//         lazy.lazyLoad.addItems('.lazy');
//     }
//     lazy();
// }

//fix. пока ничего лучше нет
// function lazyUpdate()  {
//     lazy.lazyLoad = $('.lazy').Lazy({
//         chainable: false,
//         attribute: 'data-original',
//         effect: 'fadeIn',
//         effectTime: 1500,
//         visibleOnly: true,
//         threshold: 100,
//     });
// }
/* END LAZY LOAD */

// $(document).ready( function() {

//     $("[data-phone]").inputmask("+7(f99)999-99-99");
//     $("[data-birth]").inputmask("99.99.9999");

//     var preloader = $('.preloader-wrap');

//     /* scrollToTop */
//     var scrollToTopElement = $('.scrollToTop');
//     $(window).scroll(function() {
//         var range = $(this).scrollTop();
//         (range > 500) ? scrollToTopElement.fadeIn('1000') : scrollToTopElement.fadeOut('1000');
//     });

//     scrollToTopElement.on('click', function(event) {
//         $('body,html').animate({
//             scrollTop: 0
//         }, '600');
//     });
//     /* end scrollToTop */

//     $('.nav__item_popup').on('mouseenter', function() {
//         views.catalogMenu.setPopup(this);
//     })



//     //important for ajax throttle
//     var processOnTime = function ( next, delay ) {
//         var d = delay;
//         if (! next){throw new ReferenceError();}
//         if (! d || isNaN(d)) {d = 200;}
//         if ( this.timeoutID ) window.clearTimeout ( this.timeoutID );
//         this.timeoutID = setTimeout ( function () { next(); }, d );
//     };

//     /* SEARCH */
//     //TODO remove all this search section here
//     /*elastic = {};

//     // loading search config
//     search = {
//         config: false
//     };
//     $.ajax({
//         url: "/ii/data/search/config.active.json",
//         method: 'get',
//         cache: false,
//         dataType: 'text',
//         success: function (data) {
//             search.config=data;
//         },
//         error: function (jqXHR, exception) {
//             console.log('cant load search config',jqXHR,exception);
//         }
//     });*/

//     //search_config = false;
//     // var load_searchconfig_attemt = 0;
//     // var load_search_config = setTimeout(function() {
//     //     load_searchconfig_attemt++;
//     //     if(search_config){
//     //         console.log('loaded search config with '+load_searchconfig_attemt+' 25ms attempts');
//     //         clearTimeout(load_search_config);
//     //         new SearchTips({
//     //             elasticsearch: elastic,
//     //             searchconfig: search_config,
//     //             perPage:18
//     //         });
//     //     }
//     //     if(load_searchconfig_attemt>10){
//     //         console.log('cant load search config');
//     //         clearTimeout(load_search_config);
//     //     }
//     // },25);
//     /* END SEARCH */

//     /* INPUT TIPS */
//     $('.input-tips').parent('.input__validation-icon').find('input').keydown(function() {
//         var tips = $(this).parent('.input__validation-icon').find('.input-tips');
//         var target = {
//             'elem'     : $(this),
//             'width'    : $(this).outerWidth(),
//             'height'   : $(this).outerHeight(),
//             'position' : $(this).position()
//         }

//         tips.css({
//             'width' : target.width,
//             'top'   : target.position.top + target.height - 3,
//             'left'  : target.position.left
//         }).addClass('shown').removeClass('hidden');

//         tips.on('click','.input-tips__item', function() {
//             target.elem.val($(this).text());
//             tips.addClass('hidden').removeClass('shown');
//             return false;
//         });

//         $(document).mouseup(function (e) {
//             if (tips.has(e.target).length === 0) {
//                 tips.addClass('hidden').removeClass('shown');
//             }
//         });
//     });
//     /* END INPUT TIPS */

//     /* verifycation klp */
//     $('#klp-activation__form_step-1').validate({
//         rules: {
//             klpnum: {
//                 required: true,
//                 digits: true,
//                 minlength: '13',
//                 maxlength: '13'
//             },
//             firstname: {
//                 required: true,
//                 minlength: '2'
//             },
//             lastname: {
//                 required: true,
//                 minlength: '2'
//             }
//         },
//         messages: {
//             klpnum: {
//                 required: 'Это поле должно быть заполнено',
//                 minlength: 'Поле должно содержать 13 символов',
//                 maxlength: 'Поле должно содержать 13 символов',
//                 digits: 'Это поле может содержать только цифры'
//             },
//             firstname: {
//                 required: 'Это поле должно быть заполнено',
//                 minlength: 'Не менее 2-ух символов'
//             },
//             lastname: {
//                 required: 'Это поле должно быть заполнено',
//                 minlength: 'Не менее 2-ух символов'
//             }
//         },

//         errorClass: 'input__error',
//         errorElement: "p",

//         submitHandler: function(form) {
//             $('.klp-activation__progress').find('.klp-activation__progress-item').eq(0).removeClass('klp-activation__progress-item_active').addClass('klp-activation__progress-item_done');
//             $('.klp-activation__progress').find('.klp-activation__progress-item').eq(1).addClass('klp-activation__progress-item_active');
//             $('.klp-activation-steps').find('li[data-count="1"]').removeClass('klp-activation-step_current');
//             $('.klp-activation-steps').find('li[data-count="2"]').addClass('klp-activation-step_current');
//             $('#klp-activation__form_step-1').slideUp('400');
//             $('#klp-activation__form_step-2').slideDown('400');
//             return false;
//         }
//     });

//     $('#klp-activation__form_step-2').validate({
//         rules: {
//             telephone: {
//                 PhoneRU: true
//             }
//         },
//         messages: {
//             telephone: {
//                 required: 'Это поле обязательно для заполнения',
//                 PhoneRU: 'Введите корректный номер телефона'
//             }
//         },
//         errorClass: 'input__error',
//         errorElement: "p",
//         submitHandler: function(form) {
//             $('.klp-activation__progress').find('.klp-activation__progress-item').eq(1).removeClass('klp-activation__progress-item_active').addClass('klp-activation__progress-item_done');
//             $('.klp-activation__progress').find('.klp-activation__progress-item').eq(2).addClass('klp-activation__progress-item_active');
//             $('.klp-activation-steps').find('li[data-count="2"]').removeClass('klp-activation-step_current');
//             $('.klp-activation-steps').find('li[data-count="3"]').addClass('klp-activation-step_current');
//             $('#klp-activation__form_step-2').slideUp('400');
//             $('#klp-activation__form_step-3').slideDown('400');
//             return false;
//         }
//     });

//     $('.js-klp-telephone-submit').click(function(event) {
//         var validator = $('#klp-activation__form_step-2').validate();
//         if (validator.element("#js-klp-tel")) {
//             $('.klp-activation__telephone-auth').slideDown('200');
//             $('#js-klp-tel').prop('disabled', true);
//             $('.js-klp-telephone-submit').slideUp('200');
//             $('.js-klp-change-tel').fadeIn('200');
//         }
//     });

//     $('.js-klp-change-tel').click(function(event) {
//         $(this).fadeOut('200');
//         $('.klp-activation__telephone-auth').slideUp('200');
//         $('#js-klp-tel').prop('disabled', false);
//         $('.js-klp-telephone-submit').fadeIn('200');
//     });

//     //timer
//     function sec60(param) {
//         var n = 60;
//         var timer = setInterval(function() {
//             n = n-1;
//             $(param).find('.tryCode__sek').html(n);
//         }, 1000);
//         setTimeout(function() {
//             clearInterval(timer);
//             $(param).html(':&nbsp;<a href="" class="tryCode__send input__small-link">Повторить</a></span>');
//         }, 60000);
//     }

//     $('.tryCode').on('click', 'span', function(event) {
//         event.preventDefault();
//         $(this).html('&nbsp;можно через <span class="tryCode__sek">60</span> секунд');
//         sec60(this);
//     });

//     $('#klp-activation__form_step-3').validate({
//         rules: {
//             mail: {
//                 email: true,
//                 required: true
//             }
//         },
//         messages: {
//             mail: {
//                 email: 'Введите корректный адрес электронной почты',
//                 required: 'Это поле обязательно для заполнения'
//             }
//         },
//         errorClass: 'input__error',
//         errorElement: "p",
//         submitHandler: function(form) {
//             $('.klp-activation__progress').find('.klp-activation__progress-item').eq(2)
//                 .removeClass('klp-activation__progress-item_active')
//                 .addClass('klp-activation__progress-item_done');
//             $('.klp-activation__progress').find('.klp-activation__progress-item').eq(3)
//                 .addClass('klp-activation__progress-item_active');
//             $('.klp-activation-steps').find('li[data-count="3"]').removeClass('klp-activation-step_current');
//             $('.klp-activation-steps').find('li[data-count="4"]').addClass('klp-activation-step_current');
//             $('.klp-activation__message_mail').fadeIn('400');

//             $('#js-klp-mail').prop('disabled', true);
//             $('.js-klp-mail-submit').fadeOut('200');
//             $('.js-klp-change-mail').fadeIn('200');

//             return false;
//         }
//     });

//     $('.js-klp-change-mail').click(function(event) {
//         $(this).fadeOut('200');
//         $('.klp-activation__message_mail').fadeOut('200');
//         $('#js-klp-mail').prop('disabled', false);

//         $('.js-klp-mail-submit').fadeIn('200');
//     });
//     /* end verifycation klp */

//     /* shop-list in map */
//     function sizeShoplist(e) {
//         var map = $(e.target).parents('.map-body');
//         var shops = map.find('.shop');
//         var startShops = shops.first().offset().top - map.offset().top;
//         var mapSize = map.innerHeight() - 20;
//         var shopsMargin = (shops.length - 1) * 10;
//         var shopsSize = shops.innerHeight() * shops.length;
//         var total = mapSize - shopsMargin - shopsSize - startShops;
//         $('.shop-list').css('max-height', total + 'px');
//     }

//     $('.shop__title').click(function (e) {
//         sizeShoplist(e);
//         var allElements = $('.shop-list');
//         var allDropdowns = $('.shop__dropdown');
//         var currentElement = $(this).parents('.shop').find('.shop-list');
//         var dropdown = $(this).find('.shop__dropdown');
//         var activeClass = 'shop-list_active';
//         var activeClassDropdown = 'shop__dropdown_show';

//         if (currentElement.hasClass(activeClass)) {
//             dropdown.removeClass(activeClassDropdown);
//             currentElement.removeClass(activeClass).slideUp(300);
//         } else {
//             allDropdowns.removeClass(activeClassDropdown);
//             allElements.removeClass(activeClass).slideUp(300);
//             dropdown.addClass(activeClassDropdown);
//             currentElement.addClass(activeClass).slideDown(300);
//         }
//     });
//     /* end shop-list in map */

//     /* CARD-DESCRIPTION SHOW */
//     $(document).on('click', '.card__show-more', function(){
//         if ($(this).hasClass('card__show-more_active')) {
//             $(this).removeClass('card__show-more_active').text('Показать весь текст');
//             $(this).parent('.card__annotation').find('.short').show();
//             $(this).parent('.card__annotation').find('.full').hide();
//         } else {
//             $(this).addClass('card__show-more_active').text('Скрыть');
//             $(this).parent('.card__annotation').find('.short').hide();
//             $(this).parent('.card__annotation').find('.full').show();
//         }
//     });
//     /* END CARD-DESCRIPTION SHOW */



    /* SLIDER */
    var carousels = document.querySelectorAll('[data-carousel]');
    Array.prototype.forEach.call(carousels, function(item, i){

        new XSlider({
            element: item
        });
    });
    /* END SLIDER */

//     var msg = $(".js_subscribe_mess");

//     $('.subscribe-form').submit(function(e) {
//         e.preventDefault();

//         var form = $(this);
//         var input = form.find('.js__subscribe-email');

//         var email = input.val();
//         if (email.length <= 0) {
//             return false;
//         }

//         var re = /\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6}/;

//         if (!email.match(re)) {
//             msg.text('Введите корректный e-mail');
//             return false;
//         }

//         if (email.length > 0) {
//             api.subscribe.add({email:email}, function (res) {

//                 if(res.result){
//                     msg.text(res.result);
//                 } else {
//                     // console.log(res.warnings[0].message);
//                     msg.text(res.warnings[0].message);
//                 }

//                 form.children().slideUp(200);
//             });

//             /*$.ajax({
//                 type: 'get',
//                 url: 'https://www.chitai-gorod.ru/local/rest/subscribe/',
//                 data: {
//                     email: email
//                 },
//                 success: function(data) {
//                     //1 - if add new subscriber, 0 - false add
//                     var res = parseInt(data);
//                     var text = (res) ? 'На Ваш email отправлено письмо для подтверждения подписки' : 'Вы уже подписаны на рассылку';
//                     form.children().slideUp(200);
//                     msg.text(text);
//                     if (!msg.prop('insert')) {
//                         form.append(msg);
//                         msg.prop('insert', true)
//                     }
//                     input.val('');
//                 }
//             })*/
//         }
//     })
//     /* END SUBSCRIBE */



//     /* DIFFERENT SHOW-hIDE BLOCKS */
//     $(document).on('click', '.show-more', function(e){
//         var parent = $(this).closest('.full-short');
//         parent.toggleClass('full');
//     });

//     $('.info-msg__close').click( function () {
//         $(this).closest('.info-msg').hide();
//     });
//     /* END DIFFERENT SHOW-hIDE BLOCKS */


//     $('.x-label').click(function() {
//         $(this).toggleClass('opened')
//     });
// // });

// function toggleActiveClass(elem, normal, active) {
//     if (!elem) {
//         throw new Error('Не хватает аргументов');
//     }
//     if (!active) {
//         active = normal.substring(1) + '_active';
//     }
//     $(elem).parent().find(normal).removeClass(active);
//     $(elem).addClass(active);
// }

// //classList
// (function() {
//     // helpers
//     var regExp = function(name) {
//         return new RegExp('(^| )'+ name +'( |$)');
//     };
//     var forEach = function(list, fn, scope) {
//         for (var i = 0; i < list.length; i++) {
//             fn.call(scope, list[i]);
//         }
//     };

//     // class list object with basic methods
//     function ClassList(element) {
//         this.element = element;
//     }

//     ClassList.prototype = {
//         add: function() {
//             forEach(arguments, function(name) {
//                 if (!this.contains(name)) {
//                     this.element.className += ' '+ name;
//                 }
//             }, this);
//         },
//         remove: function() {
//             forEach(arguments, function(name) {
//                 this.element.className =
//                     this.element.className.replace(regExp(name), '');
//             }, this);
//         },
//         toggle: function(name) {
//             return this.contains(name)
//                 ? (this.remove(name), false) : (this.add(name), true);
//         },
//         contains: function(name) {
//             return regExp(name).test(this.element.className);
//         },
//         // bonus..
//         replace: function(oldName, newName) {
//             this.remove(oldName), this.add(newName);
//         }
//     };

//     // IE8/9, Safari
//     if (!('classList' in Element.prototype)) {
//         Object.defineProperty(Element.prototype, 'classList', {
//             get: function() {
//                 return new ClassList(this);
//             }
//         });
//     }

//     // replace() support for others
//     if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
//         DOMTokenList.prototype.replace = ClassList.prototype.replace;
//     }
// })();

// // closest
// if (window.Element && !Element.prototype.closest) {
//     Element.prototype.closest =
//         function(s) {
//             var matches = (this.document || this.ownerDocument).querySelectorAll(s),
//                 i,
//                 el = this;
//             do {
//                 i = matches.length;
//                 while (--i >= 0 && matches.item(i) !== el) {};
//             } while ((i < 0) && (el = el.parentElement));
//             return el;
//         };
// }

// // matches
// if (!Element.prototype.matches) {
//     Element.prototype.matches =
//         Element.prototype.matchesSelector ||
//         Element.prototype.mozMatchesSelector ||
//         Element.prototype.msMatchesSelector ||
//         Element.prototype.oMatchesSelector ||
//         Element.prototype.webkitMatchesSelector ||
//         function(s) {
//             var matches = (this.document || this.ownerDocument).querySelectorAll(s),
//                 i = matches.length;
//             while (--i >= 0 && matches.item(i) !== this) {}
//             return i > -1;
//         };
// }
// // append
// (function (arr) {
//     arr.forEach(function (item) {
//         if (item.hasOwnProperty('append')) {
//             return;
//         }
//         Object.defineProperty(item, 'append', {
//             configurable: true,
//             enumerable: true,
//             writable: true,
//             value: function append() {
//                 var argArr = Array.prototype.slice.call(arguments),
//                     docFrag = document.createDocumentFragment();
//                 argArr.forEach(function (argItem) {
//                     var isNode = argItem instanceof Node;
//                     docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
//                 });

//                 this.appendChild(docFrag);
//             }
//         });
//     });
// })([Element.prototype, Document.prototype, DocumentFragment.prototype]);