// - добавление партнеров
// - вызов по событиям
// - оповещение добавленных партнеров
var partners = {
    events: {
        // просмотры страниц
        page: {
            // главная
            // actionpay, criteo
            home: 'partners.events.page.home',
            // карточка товара ++
            // actionPay, расширенная коммерция, criteo
            // - product{id, name, price}
            // - category{id, name}
            product: 'partners.events.page.product',
            // страницы каталога, категории +
            // actionPay, criteo
            // - category{id, name, items}
            // - items - массив - айдишки трех первых товаров для criteo, если можно
            catalog: 'partners.events.page.catalog',
            // корзина ++
            // actionPay, расширенная коммерция (1 шаг оформления заказа), criteo
            // - products[ {id,name,price,quantity} ]
            basket: 'partners.events.page.basket',
            // оформление заказа +
            // actionPay, criteo (как просмотр корзины)
            // - products[ {id,name,price,quantity} ]
            order: 'partners.events.page.order',
            // спасибо за заказ +
            // ecommerce (6 шаг оформления заказа)
            // может вызываться многократно при рефреше страницы
            // - products[ {id,name,price,quantity} ]
            thankYou: 'partners.events.page.thankYou',
            // любая другая страница
            // actionpay
            // criteo - Обрабатывает информационные страницы как viewHome,
            // если конкретную страницу не надо считать информационной давайте передавать параметр { not_inform: true }
            other: 'partners.events.page.other',
        },
        // события корзины
        basket: {
            // добавление в корзину
            // actionpay, расширенная коммерция
            // - product{id, name, price, quantity}
            add: 'partners.events.basket.add',
            // удаление из корзины ++
            // actionpay, расширенная коммерция
            // - product{id, name, price, quantity}
            remove: 'partners.events.basket.remove',
            // добавление в закладки
            // actionpay
            // - product{id, name, price}
            bookmarkAdd: 'partners.events.basket.bookmarkAdd',
            // удаление из закладок
            // actionpay
            // - product{id, name, price}
            bookmarkRemove: 'partners.events.basket.bookmarkRemove',
        },
        // оформление заказа
        order: {
            // введение контактных данных
            // 2 шаг оформления расширенной коммерции
            // - option: a - Физ. лицо, b - Юр. лицо
            // - products [ {id, name, price, quantity} ]
            contacts: 'partners.events.order.contacts',
            // выбор способа доставки
            // 3 шаг оформления расширенной коммерции
            // - option: a - Самовывоз, b- Курьер, c - Почта
            // - products [ {id, name, price, quantity} ]
            deliveryType: 'partners.events.order.deliveryType',
            // выбор способа оплаты
            // 4 шаг оформления  расширенной коммерции
            // - option: a - При получении, b - онлайн, c - счет
            // - products [ {id, name, price, quantity} ]
            paymentType: 'partners.events.order.paymentType',
            // подтверждение
            // 5 шаг оформления расширенной коммерции
            confirm: 'partners.events.order.confirm',
            // показ страницы Спасибо за заказ
            // факт совершенной покупки
            // только один раз!!
            // actionpay, ecommerce, criteo
            // - orderData {id, totalPrice, revenue, shipping, coupon, deduplication}
            // - products [ {id, name, price, quantity} ]
            // - deduplication - 1 - покупка Criteo, 0 - нет
            purchase: 'partners.events.order.purchase',
            // полная отмена заказа
            // из личного кабинета
            // расширенная коммерция
            fullRefund: 'partners.events.order.fullRefund',
        },
        // просмотры товаров и баннеров (динамические)
        impression: {
            products: 'partners.events.impression.products',
            promo: 'partners.events.impression.promo',
        },
        // клики по товарам и баннерам
        click: {
            products: 'partners.events.click.products',
            promo: 'partners.events.click.promo',
        },
        // мне нравится - на карточке товара
        share: 'partners.events.share',
        // события пользователя
        user: {
            registration: 'partners.events.user.registration'
        }
    },

    // список всех партнеров
    list: {},

    // активность партнеров
    status: {},

    // список коллбэков для каждого события
    observers: {
        init: []
    },

    // данные по событиям
    data: {},

    // добавление партнера
    addPartner: function(partner) {
        if (!partner.name) return;

        // добавить партнера в список
        partners.list[partner.name] = partner;
        partners.status[partner.name] = true;

        // подписать на событие init
        partners.observers.init.push(partner.name);

        if (!partner.partnersEvents || !partner.partnersEvents.length) return;
        // подписать на нужные события
        partner.partnersEvents.forEach(function(event) {
            partners.observers[event] = partners.observers[event] || [];
            partners.observers[event].push(partner.name);
        });

    },

    // оповещение партнеров, подписанных на событие eventName
    notify: function(eventName) {

        // получить всех подписчиков на событие eventName
        var observers = partners.observers[eventName];

        if (!observers || !observers.length) return;

        observers.forEach(function(partnerName, ind) {

            var partner = partners.list[partnerName];
            // проверить активность партнера
            if (!partner || !partners.status[partnerName]) return;
            // вызвать метод с таким же названием у партнера
            if (partner[eventName]) partner[eventName]();

        });

    },

    // вызов события eventName
    trigger: function(eventName, data) {
        partners.data[eventName] = data;
        partners.notify(eventName);
    }

};

partners.dynamic = {
    selectors: {
        productCard: '.js_product, .js-analytics-product-page, .js_basket_item',
        promoView: '.js-analytic-promo',
        promoClick: '.js-analytic-promolink',
        productView: '.js_product',
        productPage: '.js-analytic-product-page',
        productClick: '.js-analytic-productlink',
        promoHideAttr: 'data-promo-hide',
    },

    screen: {
        width: $(window).width(),
        height: $(window).height()
    },

    promo: [], // массив всех рекламных баннеров на странице

    products: [], // массив всех продуктов на странице

    monitor: function() { // отслеживать ресайз окна
        $(window).resize(function() {
            partners.dynamic.screen.width = $(window).width();
            partners.dynamic.screen.height = $(window).height();
        });
    },

    isVisible: function(el) { // видим ли элемент
        if (el.style.display == "none" || el.style.visibility == "hidden") return false;

        var elCoords = el.getBoundingClientRect(); // координаты элемента относительно вьюпорта

        var elLeft = elCoords.left;
        var elRight = elLeft + elCoords.width;

        var elTop = elCoords.top;
        var elBottom = elTop + elCoords.height;

        var screenWidth = partners.dynamic.screen.width;
        var screenHeight = partners.dynamic.screen.height;

        // верх элемента выше низа экрана
        // низ элемента ниже верха экрана
        // левый край элемента правее правого края экрана
        // правый край элемент левее левого края экрана
        return elBottom > 0 && elTop <= screenHeight && elLeft < screenWidth && elRight > 0;
    },

    fetch: function() { // собрать все рекламные баннеры и продукты
        var promo = document.querySelectorAll(partners.dynamic.selectors.promoView);
        this.promo = [];
        for (var i = 0, count = promo.length; i < count; i++) {
            if (promo[i].hasAttribute(this.selectors.promoHideAttr)) continue;
            this.promo.push(promo[i]);
        }


        var products = Array.prototype.slice.call(document.querySelectorAll(partners.dynamic.selectors.productView));
        this.products = products;
    },

    checkItems: function(items) { // проверить видимость
        var shown = [];
        var hidden = [];

        items.forEach(function(item) {
            if (item.shown) return;
            var visible = false;

            // если карточка в слайдере
            if (item.hasAttribute('data-slider-item')) {
                // dom-элемент слайдера
                var $slider = item.closest('[data-slider]');

                // если слайдер видим, ничего не делать
                if (partners.dynamic.isVisible($slider)) {

                    var slider = $slider.slider;
                    // если элемент видим в слайдере
                    if (slider.isSlideVisible(item)) {
                        // если сам элемент видим на экране
                        if (partners.dynamic.isVisible(item)) visible = true;
                    }
                }
            } else if (item.hasAttribute('data-main-slider-item')) {
                // если главный слайдер виден
                if (partners.dynamic.isVisible(document.querySelector('.slider-main'))) {
                    visible = document.querySelector('.slider-main__viewport').children[0] == item;
                }
            } else {
                if (partners.dynamic.isVisible(item)) visible = true;
            }

            if (visible) {
                item.shown = true;
                shown.push(item);
            } else hidden.push(item);
        });


       return {
           hidden: hidden,
           shown: shown,
       }
    },

    updateItems: function(items) {
        var hidden = [];
        var shown = [];

        items.forEach(function(item) {
            if (!item.shown) hidden.push(item);
            else shown.push(item);
        });

        return {
            hidden: hidden,
            shown: shown
        };
    },

    checkProducts: function() {
        var items = this.checkItems(this.products);

        this.products = items.hidden;
        var products = this.formatProducts(items.shown);
        if (items.shown.length) partners.trigger(partners.events.impression.products, products);
    },

    checkPromo: function() {
        var items = this.checkItems(this.promo);

        this.promo = items.hidden;
        var promo = this.formatPromo(items.shown);
        if (items.shown.length) partners.trigger(partners.events.impression.promo, promo);
    },

    updateProducts: function() {
        var items = this.updateItems(this.products);

        this.products = items.hidden;
        var products = this.formatProducts(items.shown);
        if (items.shown.length) partners.trigger(partners.events.impression.products, products);
    },

    updatePromo: function() {
        var items = this.updateItems(this.promo);

        this.promo = items.hidden;
        var promo = this.formatPromo(items.shown);
        if (items.shown.length) partners.trigger(partners.events.impression.promo, promo);
    },

    formatProducts: function(els) {
        var products = [];
        els.forEach(function(el) {
            var title = el.querySelector('.js-analytic-product-title') || el.querySelector('[data-name]');

            var data = {
                'name': title ? title.textContent.trim() : '',
                'id': el.dataset.product,
                'price': el.dataset.productprice,
                'brand': el.dataset.productbrand,
                'category': el.dataset.productcategory,
                'list': el.dataset.productlist,
                'position': parseInt(el.dataset.index),
            };
            products.push(data);
        });
        return products;
    },

    formatPromo: function(els) {
        var promo = [];

        els.forEach(function(el) {
            var position = parseInt(el.dataset.index) + 1;
            var name = el.dataset.promogroup;
            var data = {
                'id': name + '_' + position,
                'name': name,
                'creative': el.dataset.promoname,
                'position': position,
            };
            promo.push(data);
        });
        return promo;
    },

    getProductCard: function(el) {
        if(!el) return false;
        return el.closest(partners.dynamic.selectors.productCard);
    },

    init: function() {
        // отслеживать события браузера
        this.monitor();

        // cобрать баннеры и продукты
        this.fetch();

        // собрать и отправить видимые продукты
        this.checkProducts();
        // собрать и отправить видимые промо
        this.checkPromo();

        // прокрутка слайдера
        $(document).on('xslider.events.slideEnd', function(e) {
            var $slider = e.target;
            var items = $slider.slider.getVisibleItems();
            items.forEach(function(item) {
                if (item.shown) return;
                if (partners.dynamic.isVisible(item)) item.shown = true;
            });
            partners.dynamic.updateProducts();
        });

        // прокрутка главного слайдера
        $(document).on('mainSlider.slide', function(e, slide) {
            if (slide.shown) return;
            if (!partners.dynamic.isVisible(slide)) return;
            slide.shown = true;
            partners.dynamic.updatePromo();
        });

        // прокрутка страницы
        $(document).on('scroll', function() {
            partners.dynamic.checkProducts();
            partners.dynamic.checkPromo();
        });

        // прокрутка страницы
        $(window).on('resize', function() {
            partners.dynamic.checkProducts();
            partners.dynamic.checkPromo();
        });

        // открытие попапов верхнего меню
        $(document).on('catalogMenu.showPopup', function(e, el) {
            if (!el) return;
            var banner = el.querySelector('.catalog__banner');
            if (!banner) return;
            if (banner.checked) return;
            banner.checked = true;
            var promo = partners.dynamic.formatPromo([banner]);
            partners.trigger(partners.events.impression.promo, promo)
        });


        $(document)
            .on('click', partners.dynamic.selectors.promoClick, function(e) {
                e.stopPropagation();
                var promoBlock = e.target.closest(partners.dynamic.selectors.promoView);
                if (!promoBlock) return;
                var promo = partners.dynamic.formatPromo([promoBlock]);
                partners.trigger(partners.events.click.promo, promo);
            })
            .on('click', partners.dynamic.selectors.productClick, function(e) {
                e.stopPropagation();
                var productBlock = partners.dynamic.getProductCard(e.target);
                if (!productBlock) return;
                var products = partners.dynamic.formatProducts([productBlock]);
                partners.trigger(partners.events.click.products, products);
            })
    }
};

// - просто коллекция партнеров
// - у каждого своя структура
// - name - имя партнера
// - init - функция инициализации
// - partnersEvents - события, на которые он подписывается
// - события вида partners.events.basket.add
// - данные лежат в partners.data[partners.events.basket.add]
var partnersData = {};

/* ActionPay */
partnersData.actionpay = {
    name: "actionpay",
    partnersEvents: [
        partners.events.basket.add,
        partners.events.basket.remove,
        partners.events.basket.bookmarkAdd,
        partners.events.basket.bookmarkRemove,
        partners.events.order.purchase,
        partners.events.share,
    ],

    pageTypes: {
        "other": 0,
        "main": 1,
        "productDetails": 2,
        "catalog": 3,
        "basket": 4,
        "order": 5,
        "purchase": 6,
        "fastView": 7,
        "addingToCart": 8,
        "removingFromCart": 9,
        "addingToBookmarks": 10,
        "removingFromBookmarks": 11,
        "share": 12,
        "registration": 13
    },
    sendPageView: function(data) {
        window.APRT_DATA = data;
    },
    sendEvent: function(data) {
        if (typeof window.APRT_SEND === 'function')
            window.APRT_SEND(data);
    },
    init: function() {

    },
};
partnersData.actionpay[partners.events.basket.add] = function() {
    var eventType = "addingToCart";
    var el = partners.data[partners.events.basket.add].el;
    var card = partners.dynamic.getProductCard(el);
    if (!card) return;
    var product = partners.dynamic.formatProducts([card])[0];
    partnersData.actionpay.sendEvent({
        pageType: partnersData.actionpay.pageTypes[eventType],
        currentProduct: {
            id: product.id,
            name: product.name,
            price: product.price
        }
    });
};
partnersData.actionpay[partners.events.basket.remove] = function() {
    var eventType = 'removingFromCart';

    var els = partners.data[partners.events.basket.remove].els || [];


    els.forEach(function(el) {
        if (!el.card) return;
        var card = partners.dynamic.getProductCard(el.card);
        if (!card) return;
        var product = partners.dynamic.formatProducts([card])[0];
        partnersData.actionpay.sendEvent({
            pageType: partnersData.actionpay.pageTypes[eventType],
            currentProduct: {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: el.count || 1
            }
        });
    });
};
partnersData.actionpay[partners.events.basket.bookmarkAdd] = function() {
    var eventType = 'addingToBookmarks';
    var product = partners.data[partners.events.basket.bookmarkAdd].product;
    partnersData.actionpay.sendEvent({
        pageType: partnersData.actionpay.pageTypes[eventType],
        currentProduct: {
            id: product.id,
            name: product.name,
            price: product.price
        }
    });
};
partnersData.actionpay[partners.events.basket.bookmarkRemove] = function() {
    var eventType = 'removingFromBookmarks';
    var product = partners.data[partners.events.basket.bookmarkRemove].product;
    partnersData.actionpay.sendEvent({
        pageType: partnersData.actionpay.pageTypes[eventType],
        currentProduct: {
            id: product.id,
            name: product.name,
            price: product.price
        }
    });
};
partnersData.actionpay[partners.events.order.purchase] = function() {
    var eventType = 'purchase';
    var order = partners.data[partners.events.order.purchase];
    partnersData.actionpay.sendEvent({
        pageType: partnersData.actionpay.pageTypes[eventType],
        purchasedProducts: order.products,
        orderInfo: {
            "id": order.orderData.id,
            "totalPrice": order.orderData.totalPrice
        }
    });
};
partnersData.actionpay[partners.events.share] = function() {
    // var product = partners.data[partners.events.basket.add]['product'];
    //
    // var data = {
    //     pageType: this.pageTypes["share"],
    //     currentProduct: {
    //         id: product.id,
    //         name: product.name,
    //         price: product.price
    //     }
    // };

};
/* end ActionPay */

/* ecommerce */
partnersData.ecommerce = {
    name: 'ecommerce',
    partnersEvents: [
        partners.events.click.products,
        partners.events.click.promo,
        partners.events.basket.add,
        partners.events.basket.remove,
        partners.events.order.contacts,
        partners.events.order.deliveryType,
        partners.events.order.paymentType,
        partners.events.order.confirm,
        partners.events.order.purchase,
        partners.events.order.fullRefund,
        partners.events.impression.products,
        partners.events.impression.promo,

    ],
    currencyCode: 'RUB',
    event: 'gtm-ee-event',
    eventCategory: 'Enhanced Ecommerce',
    eventsData: {
        productImpressions: {
            action: 'Product Impressions',
            nonInteraction: 'True'
        },
        productClick: {
            action: 'Product Clicks',
            nonInteraction: 'False'
        },
        productDetails: {
            action: 'Product Details',
            nonInteraction: 'True'
        },
        promotionClick: {
            action: 'Promotion Clicks',
            nonInteraction: 'False'
        },
        promotionImpressions: {
            action: 'Promotion Impressions',
            nonInteraction: 'True'
        },
        addingToCart: {
            action: 'Adding a Product to a Shopping Cart',
            nonInteraction: 'False'
        },
        removingFromCart: {
            action: 'Removing a Product from a Shopping Cart',
            nonInteraction: 'False'
        },
        checkoutStep: {
            action: 'Checkout Step ',
            nonInteraction: 'False'
        },
        purchase: {
            action: 'Purchase',
            nonInteraction: 'False'
        },
        fullRefund: {
            action: 'Full Refund',

            nonInteraction: 'False'
        }
    },
    sendEvent: function(config) {
        var eventData = partnersData.ecommerce.eventsData[config.name];
        var eventObj = {
            'ecommerce': config.ecommerce,
            'event': partnersData.ecommerce.event,
            'gtm-ee-event-category': partnersData.ecommerce.eventCategory,
            'gtm-ee-event-action': config.action || eventData.action,
            'gtm-ee-event-non-interaction': eventData.nonInteraction
        };

        if (config.callback) {
            eventObj.eventCallback = config.callback;
        }

        dataLayer.push(eventObj);
    },
    checkoutSteps: {
        '1': {
            'name': 'Переход в корзину',
            'options': {}
        },
        '2': {
            'name': 'Ввод контактных данных',
            'options': {
                'a':'Физическое лицо',
                'b':'Юр. Лицо'
            }
        },
        '3': {
            'name': 'Ввод способа доставки',
            'options': {
                'a':'Самовывоз',
                'b':'Курьер',
                'c':'Почта'
            }
        },
        '4': {
            'name': 'Ввод способа оплаты',
            'options': {
                'a':'При получении',
                'b':'Оплата онлайн',
                'c':'Счет'
            }
        },
        '5': {
            'name': 'Подтверждение заказа',
            'options': {}
        },
        '6': {
            'name': 'Thank You Page',
            'options': {}
        },
    },
    sendOrderEvent: function(step, option, productsArray) {
        var ecommerceData = {
            'currencyCode': partnersData.ecommerce.currencyCode,
            'checkout': {
                'actionField': {
                    'step': step,
                    'option': partnersData.ecommerce.checkoutSteps[step].options[option] || ''
                },
                'products': productsArray
            }
        };

        partnersData.ecommerce.sendEvent({
            name: 'checkoutStep',
            ecommerce: ecommerceData,
            action: partnersData.ecommerce.eventsData['checkoutStep']['action'] + step
        })
    },
    productListCookieName: '',
    // извлечение названия списка из куки
    // или из урла
    getListName: function() {
        return $.cookie(partnersData.ecommerce.productListCookieName) | "";
    },
    init: function() {
        window.dataLayer = window.dataLayer || [];

    }
};
partnersData.ecommerce[partners.events.basket.add] = function() {
    var el = partners.data[partners.events.basket.add].el;
    var count = partners.data[partners.events.basket.add].count || 1;
    var card = partners.dynamic.getProductCard(el);
    if (!card) return;
    var product = partners.dynamic.formatProducts([card])[0];

    var eventType = "addingToCart";
    var ecommerceData = {
        'currencyCode': partnersData.ecommerce.currencyCode,
        'add': {
            'products': [{
                name: product.name,
                id: product.id,
                price: product.price,
                quantity: count,
            }]
        }
    };
    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    });
};
partnersData.ecommerce[partners.events.basket.remove] = function() {
    var els = partners.data[partners.events.basket.remove].els || [];

    var products = [];

    els.forEach(function(el) {
        if (!el.card) return;
        var card = partners.dynamic.getProductCard(el.card);
        if (!card) return;
        var product = partners.dynamic.formatProducts([card])[0];
        product.quantity = el.count || 1;
        products.push(product);
    });


    var eventType = 'removingFromCart';
    var ecommerceData = {
        'currencyCode': partnersData.ecommerce.currencyCode,
        'remove': {
            'products': products
        }
    };

    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    })

};
partnersData.ecommerce[partners.events.order.contacts] = function() {
    var orderStep = 2;
    var orderData = partners.data[partners.events.order.contacts];
    partnersData.ecommerce.sendOrderEvent(orderStep, orderData.option, orderData.products);
};
partnersData.ecommerce[partners.events.order.deliveryType] = function() {
    var orderStep = 3;
    var orderData = partners.data[partners.events.order.deliveryType];
    partnersData.ecommerce.sendOrderEvent(orderStep, orderData.option, orderData.products);
};
partnersData.ecommerce[partners.events.order.paymentType] = function() {
    var orderStep = 4;
    var orderData = partners.data[partners.events.order.paymentType];
    partnersData.ecommerce.sendOrderEvent(orderStep, orderData.option, orderData.products);
};
partnersData.ecommerce[partners.events.order.confirm] = function() {
    var orderStep = 5;
    var orderData = partners.data[partners.events.order.confirm];
    partnersData.ecommerce.sendOrderEvent(orderStep, null, orderData.products);
};
partnersData.ecommerce[partners.events.order.purchase] = function() {
    var eventType = 'purchase';
    var order = partners.data[partners.events.order.purchase];
    var ecommerceData = {
        'currencyCode': partnersData.ecommerce.currencyCode,
        'purchase': {
            'actionField': {
                'id': order.orderData.id,
                'affiliation': 'Читай-город',
                'revenue': order.orderData.revenue,
                'tax': '0',
                'shipping': order.orderData.shipping,
                'coupon': order.orderData.coupon
            }
        },
        'products': order.products
    };
    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    });
};
partnersData.ecommerce[partners.events.order.fullRefund] = function() {
    var data = partners.data[partners.events.order.fullRefund];
    var ecommerceData = {
        'refund': {
            'actionField': {
                'id': data.orderId
            }
        }
    };

    var ecommerceObj = {
        name: 'fullRefund',
        ecommerce: ecommerceData
    };

    if (data.callback) ecommerceObj['callback'] = data.callback;

    partnersData.ecommerce.sendEvent(ecommerceObj);
};
partnersData.ecommerce[partners.events.impression.products] = function() {
    var products = partners.data[partners.events.impression.products];

    var eventType = 'productImpressions';
    var ecommerceData = {
        'currencyCode': partnersData.ecommerce.currencyCode,
        'impressions': products
    };
    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    });
};
partnersData.ecommerce[partners.events.impression.promo] = function() {
    var promo = partners.data[partners.events.impression.promo];

    var eventType = 'promotionImpressions';
    var ecommerceData = {
        'promoView': {
            'promotions' : promo
        }
    };
    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    });
};
partnersData.ecommerce[partners.events.click.products] = function() {
    var products = partners.data[partners.events.click.products];
    var eventType = 'productClick';
    var ecommerceData = {
        'currencyCode': partnersData.ecommerce.currencyCode,
        'click': {
            'actionField': {
                'list': products[0].list
            },
            'products': products
        }
    };
    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    });
};
partnersData.ecommerce[partners.events.click.promo] = function() {
    var promo = partners.data[partners.events.click.promo];
    var eventType = 'promotionClick';
    var ecommerceData = {
        'promoClick': {
            'promotions' : promo
        }
    };
    partnersData.ecommerce.sendEvent({
        name: eventType,
        ecommerce: ecommerceData
    });
}
/* end ecommerce */

partners.addPartner(partnersData.actionpay);
partners.addPartner(partnersData.ecommerce);


//инициализация партнёрок
partners.trigger('init');

partners.dynamic.init();