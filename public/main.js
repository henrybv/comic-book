'use strict';

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngMaterial', 'ngAria', 'angularAwesomeSlider', 'core']);

var core = angular.module('core', ['fsaPreBuilt', 'ui.router']);

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // Trigger page refresh when accessing an OAuth route
    $urlRouterProvider.when('/auth/:provider', function () {
        window.location.reload();
    });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});

app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope, FullstackPics) {

    // Images of beautiful Fullstack people.
    $scope.images = _.shuffle(FullstackPics);
});
app.controller('AdminCtrl', function ($scope, $state, $mdSidenav, $mdMedia, ProductFactory, getAllProducts) {

    $scope.imagePath = 'assets/images/placeholder.jpg';

    $scope.products = getAllProducts;

    $scope.deleteProduct = function (product, index) {
        return ProductFactory.deleteProduct(product._id).then(function (response) {
            if (response.status === 204) {
                return $scope.products.splice(index, 1);
            }
        });
    };

    $scope.createProduct = function () {
        $state.go('adminCreateProduct');
    };

    $scope.editForm = function (product) {
        $state.go('adminEdit', { id: product._id });
    };

    // $scope.openLeftMenu = function() {
    //   $mdSidenav('left').toggle();
    // };
    // $scope.isOpen = true;
    // $scope.toolbar = {
    //       isOpen: true,
    //       count: 5,
    //       selectedDirection: 'left'
    // };
});

app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
});

core.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

app.filter('myCurrency', ['$filter', function ($filter) {
    return function (input) {
        input = parseFloat(input);

        if (input % 1 === 0) {
            input = input.toFixed(0);
        } else {
            input = input.toFixed(2);
        }

        return '$' + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
}]);

(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.

    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function () {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin).catch(function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();

app.controller('HomeCtrl', function ($scope, ProductFactory, allProducts, $state) {
    $scope.imagePath = 'assets/images/placeholder.jpg';

    $scope.products = allProducts;

    $scope.maxPrice = 10000;
    $scope.lessThan = function (product) {
        return product.price <= $scope.maxPrice;
    };

    $scope.minPrice = 1;
    $scope.greaterThan = function (product) {
        return product.price >= $scope.minPrice;
    };

    // PUTS ALL CATEGORIES FROM ALL PRODUCTS INTO CATS ARRAY
    var cats = [];
    (function getCategories() {
        allProducts.forEach(function (product) {
            product.categories.forEach(function (category) {
                cats.push(category);
            });
        });
    })();

    // MAKES SURE THERE ARE NO DUPLICATE CATEGORIES AND PUTS THEM INTO $SCOPE.CATEGORIES
    $scope.categories = [];
    (function cleanCategories() {
        cats.forEach(function (category) {
            if ($scope.categories.indexOf(category) === -1) {
                $scope.categories.push(category);
            }
        });
    })();
});

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
            allProducts: function allProducts(ProductFactory) {
                return ProductFactory.getAllProducts().then(function (products) {
                    products = products.filter(function (product) {
                        return product.seller === null;
                    });
                    return products;
                });
            }
        }
    });
});

app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function (user) {
            if (user.isAdmin) $state.go('admin');else if (user.passwordReset) $state.go('passwordReset', { id: user._id });else $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});

app.controller('PasswordResetCtrl', function ($scope, userToResetPassword, $state, UserFactory) {

    $scope.user = userToResetPassword;

    $scope.update = { passwordReset: false };

    $scope.updatePassword = function () {
        return UserFactory.updateUser($scope.user._id, $scope.update).then(function () {
            $state.go('home');
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('passwordReset', {
        url: '/user-profile/reset-password/:id',
        templateUrl: 'js/login/password.reset.template.html',
        controller: 'PasswordResetCtrl',
        resolve: {
            userToResetPassword: function userToResetPassword($stateParams, UserFactory) {
                return UserFactory.getUser($stateParams.id);
            }
        }
    });
});

app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state, $mdDialog) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }, { label: 'Documentation', state: 'docs' }];
            scope.adminItems = [{ label: 'Admin :: Products', state: 'admin', auth: true }, { label: 'Admin :: Users', state: 'adminUser', auth: true }, { label: 'Admin :: Orders', state: 'adminOrder', auth: true }, { label: 'Admin :: Add Product', state: 'adminCreateProduct', auth: true }];

            // scope.goToCreateStore = function() {
            //   console.log('FUNCTION RAN')
            //   $state.go('home');
            // };

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    console.log('user in navbar.js', user);
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            scope.goToStore = function () {
                $state.go('sellerHome', { sellerId: scope.user._id });
            };

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

            var originatorEv;
            scope.openMenu = function ($mdOpenMenu, ev) {
                originatorEv = ev;
                $mdOpenMenu(ev);
            };
            scope.announceClick = function (index) {
                $mdDialog.show($mdDialog.alert().title('You clicked!').textContent('You clicked the menu item at index ' + index).ok('Nice').targetEvent(originatorEv));
                originatorEv = null;
            };

            scope.demo = {
                showTooltip: false,
                tipDirection: ''
            };
            scope.demo.delayTooltip = undefined;
            scope.$watch('demo.delayTooltip', function (val) {
                scope.demo.delayTooltip = parseInt(val, 10) || 0;
            });
            scope.$watch('demo.tipDirection', function (val) {
                if (val && val.length) {
                    scope.demo.showTooltip = true;
                }
            });
        }

    };
});

app.controller('NavbarFilterCtrl', function ($scope) {});
app.directive('navbarFilter', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/navbarFilter/navbarFilter.html'
        // controller: 'NavbarFilterCtrl'
    };
});

'use strict';

app.directive('oauthButton', function () {
    return {
        scope: {
            providerName: '@',
            verb: '@'
        },
        restrict: 'E',
        templateUrl: '/js/oauth-button/oauth-button.html'
    };
});

app.controller('CartCtrl', function ($scope, $state, OrderFactory, $timeout, $q, $log) {

    $scope.cart = OrderFactory.getCartCache();

    $scope.checkCartEmpty = function () {
        if ($scope.cart.cartTotal === 0) return true;else return false;
    };

    $scope.checkout = function () {
        // if ($scope.cart.products.length > 0) $state.go('checkout');
        $state.go('checkout');
    };

    $scope.add = function (productId) {
        OrderFactory.addToCart(productId, 1).then(function (updatedCart) {}).catch($log.error);
    };

    $scope.subtract = function (productId) {
        console.log('productId', productId);
        console.log('cart.products[0].product._id', $scope.cart.products[0]);
        OrderFactory.removeOneFromCart(productId).then(function (updatedCart) {}).catch($log.error);
    };

    $scope.remove = function (productId) {
        OrderFactory.removeFromCart(productId).then(function (updatedCart) {
            if (updatedCart.cartTotal === 0) $scope.cart.cartTotal = 0;
            $scope.checkCartEmpty();
        }).catch($log.error);
    };
});

// checkout.controller.js

app.controller('CheckoutCtrl', function ($scope, $state, OrderFactory, $timeout, $q, $log) {

    $scope.cart = OrderFactory.getCartCache();

    $scope.editOrder = function () {
        $state.go('cart');
    };

    // $scope.confirm = function(){
    //   var cart = $scope.cart;
    //   var orderId = $scope.cart._id;
    //   return OrderFactory.changeStatus('complete', orderId)
    //   .then(function(order){
    //       $state.go('complete', {id: order._id});
    //   })   
    // }
});

app.controller('CompleteCtrl', function (recentOrder, $state, $scope, OrderFactory, $timeout, $q, $log, loggedInUser) {

    $scope.complete = recentOrder;
    $scope.loggedInUser = loggedInUser || null;
});
core.factory('OrderFactory', function ($http) {

    var OrderFactory = {};

    var cachedCart = {};

    OrderFactory.getCartCache = function () {
        console.log(cachedCart);
        return cachedCart;
    };

    OrderFactory.getCart = function () {
        return $http.get('/api/orders/getCart').then(function (cart) {
            var cart = cart.data;
            if (!cart.products || cart && cart.products.length < 1) {
                cachedCart.cartTotal = 0;
                return cachedCart;
            } else {
                var priceArr = cart.products.map(function (product) {
                    return product.quantity * product.product.price;
                });
                priceArr.forEach(function (price, index) {
                    cart.products[index]['productTotal'] = price;
                });
                cart.cartTotal = priceArr.reduce(function (p, c) {
                    return p + c;
                });
                angular.copy(cart, cachedCart);
                return cachedCart;
            }
        });
    };

    OrderFactory.getRecentComplete = function (orderId) {
        cachedCart = {};
        console.log('after cache cleared', cachedCart);
        return $http.get('/api/orders/getRecentComplete/' + orderId).then(function (recentComplete) {
            var order = recentComplete.data;
            var priceArr = order.products.map(function (product) {
                return product.quantity * product.finalPrice;
            });
            priceArr.forEach(function (price, index) {
                order.products[index]['productTotal'] = price;
            });
            order.orderTotal = priceArr.reduce(function (p, c) {
                return p + c;
            });
            return order;
        });
    };

    OrderFactory.getCompleteOrdersByUser = function (userId) {
        return $http.get('/api/orders/getComplete/' + userId).then(function (completeOrders) {
            return completeOrders.data;
        });
    };

    OrderFactory.getAllComplete = function () {
        return $http.get('/api/orders/getAllComplete/').then(function (allCompletes) {
            return allCompletes.data;
        });
    };

    OrderFactory.getPastOrders = function () {
        return $http.get('/api/orders/').then(function (order) {
            var orderArr = order.data;
            return orderArr.filter(function (order) {
                return order.status === 'complete' || order.status === 'cancelled';
            });
        }).then(function (filteredOrder) {
            return filteredOrder;
        });
    };

    function updateCache(productId, number) {
        cachedCart.products.forEach(function (elem, index) {
            cachedCart.products[index].productTotal = elem.quantity * elem.product.price;
        });
        // console.log('in update cache')
        // var arr = cachedCart.products.map(productChild => productChild.product._id);
        // var index = arr.indexOf(productId);
        // console.log("in cached cart.products", cachedCart.products, index, productId )
        // if (index === -1){
        //   angular.copy(cart.data, cachedCart)
        // }
        // else {
        // cachedCart.products[index].quantity+=number;
        // }
        // cachedCart.products[index].productTotal = cachedCart.products[index].quantity * cachedCart.products[index].product.price;
        var arr = cachedCart.products.map(function (product) {
            return product.quantity * product.product.price;
        });
        cachedCart.cartTotal = arr.reduce(function (p, c) {
            return p + c;
        });
    }

    //WILL ADD TO CART OR CREATE CART IF DOESN'T ALREADY EXIST
    OrderFactory.addToCart = function (productId, quantity) {
        return $http.put('/api/orders/addToCart/' + productId, { quantity: quantity }).then(function (cart) {
            // console.log("cached cart", cachedCart)
            // if(!cachedCart.products){
            //  angular.copy(cart.data, cachedCart)
            //  console.log("in angular copy", cachedCart)
            //  return cachedCart
            // }
            // else {
            angular.copy(cart.data, cachedCart);
            updateCache(productId, quantity);
            return cachedCart;
        });
    };

    OrderFactory.addToCartFromProduct = function (productId, quantity) {
        return $http.put('/api/orders/addToCart/' + productId, { quantity: quantity }).then(function (cart) {
            return cart.data;
        });
    };

    OrderFactory.removeOneFromCart = function (productId) {
        console.log('product id in remove one from car', productId);
        return $http.put('/api/orders/removeOneFromCart/' + productId).then(function (cart) {
            angular.copy(cart.data, cachedCart);
            updateCache(productId, -1);
            return cachedCart;
        });
    };

    OrderFactory.removeFromCart = function (productId) {
        console.log('cachedCart in removefrom cart factory', cachedCart);
        return $http.put('/api/orders/removeFromCart/' + productId).then(function (cart) {
            var index;
            for (var i = 0; i < cachedCart.products.length; i++) {
                console.log(cachedCart.products[i].product._id);
                if (cachedCart.products[i].product._id === productId) index = i;
            }
            console.log('index', index);
            cachedCart.cartTotal -= cachedCart.products[index].productTotal;
            cachedCart.products.splice(index, 1);
            return cachedCart;
        });
    };

    OrderFactory.changeStatus = function (newStatus, orderId) {
        cachedCart = {};
        return $http.put('/api/orders/changeStatus/' + orderId + '/' + newStatus).then(function (updatedOrder) {
            return updatedOrder.data;
        });
    };

    return OrderFactory;
});

app.config(function ($stateProvider) {
    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/orders/cart.template.html',
        resolve: {
            backEndCart: function backEndCart(OrderFactory) {
                return OrderFactory.getCart();
            }
        },
        controller: 'CartCtrl'
    });
});

app.config(function ($stateProvider) {
    $stateProvider.state('checkout', {
        url: '/checkout',
        templateUrl: 'js/orders/checkout.template.html',
        resolve: {
            cart: function cart(OrderFactory) {
                return OrderFactory.getCart();
            }
        },
        controller: 'CheckoutCtrl'
    });
});

app.config(function ($stateProvider) {
    $stateProvider.state('complete', {
        url: '/complete/:id',
        templateUrl: 'js/orders/complete.template.html',
        resolve: {
            recentOrder: function recentOrder(OrderFactory, $stateParams, $state) {
                return OrderFactory.getRecentComplete($stateParams.id);
            },
            loggedInUser: function loggedInUser(AuthService) {
                return AuthService.getLoggedInUser();
            }
        },
        controller: 'CompleteCtrl'
    });
});

app.controller('ProductCtrl', function ($scope, OrderFactory, $mdDialog, $state) {

    $scope.addToCart = function (productId) {
        OrderFactory.addToCartFromProduct(productId).then(function (cart) {
            console.log(cart);
        });
    };

    $scope.showConfirm = function (ev, product) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm().title('You just added ' + product.title + ' to your cart!').textContent('You are on your way to ' + product.location + '!').ariaLabel('Lucky day').targetEvent(ev).ok('Keep Shopping').cancel('Go to Cart');

        $mdDialog.show(confirm).then(function () {
            if (product.seller === null) var newState = 'home';else newState = 'seller';
            $state.go(newState, { sellerId: product.seller });
        }, function () {
            $state.go('cart');
        });
    };
});

app.directive('productCard', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/product/product.template.html',
        controller: 'ProductCtrl'
    };
});

core.factory('ProductFactory', function ($http) {
    return {
        getAllProducts: function getAllProducts(sellerId) {
            console.log('sellerID: ', sellerId);
            return $http.get('/api/product/').then(function (products) {
                if (!sellerId) return products.data;
                var products = products.data;
                console.log('products before filter: ', products);
                products = products.filter(function (product) {
                    return product.seller === sellerId;
                });
                console.log(products);
                return products;
            });
        },
        getOneProduct: function getOneProduct(productId) {
            return $http.get('/api/product/' + productId).then(function (product) {
                return product.data;
            });
        },
        updateProduct: function updateProduct(productId, update) {
            return $http({
                method: 'PUT',
                url: '/api/product/' + productId,
                data: update
            }).then(function (response) {
                return response.data;
            });
        },
        createProduct: function createProduct(create) {
            console.log('in product factory. create: ', create);
            return $http({
                method: 'POST',
                url: '/api/product',
                data: create
            }).then(function (response) {
                console.log('in product factory, created product: ', response.data);
                return response.data;
            });
        },
        deleteProduct: function deleteProduct(productId) {
            return $http({
                method: 'DELETE',
                url: '/api/product/' + productId
            }).then(function (response) {
                return response;
            });
        },
        // redundant paths
        getById: function getById(id) {
            console.log('id in getById', id);
            return $http.get('api/product/' + id).then(function (product) {
                console.log('product in getById', product);
                return product.data;
            });
        }
    };
});

// app.config(function ($stateProvider) {
//     $stateProvider.state('product', {
//         url: '/product',
//         template: '<product-dir ng-repeat="product in products"></product-dir>'
//     });
// });

app.controller('ProductDetail', function ($state, $scope, ProductFactory, $stateParams, ReviewFactory, UserFactory, singleProduct, OrderFactory, $mdDialog) {
    console.log('singleProduct', singleProduct);
    $scope.product = singleProduct;

    ReviewFactory.getProductReviews($stateParams.productId).then(function (reviews) {
        $scope.reviews = reviews;
        $scope.totalReviwRating = 0;
        reviews.forEach(function (elem) {
            $scope.totalReviwRating += elem.rating;
        });
        $scope.totalReviewRating = Math.round($scope.totalReviwRating / reviews.length);
        (function numReviews() {
            if (reviews.length === 1) $scope.numReviews = 'review';else $scope.numReviews = 'reviews';

            if (reviews.length === 0) $scope.reviewsPresent = false;else $scope.reviewsPresent = true;
        })();
    });

    $scope.bigImgSrc = $scope.product.images[0];
    $scope.setBigImg = function (img) {
        $scope.bigImgSrc = img;
    };

    $scope.addToCart = function (productID, quantity) {
        var quantity = quantity || 1;
        OrderFactory.addToCartFromProduct(productID, quantity).then(function (cart) {
            console.log('cart from Ctrl:', cart);
        });
    };

    function initialize_gmaps() {
        // initialize new google maps LatLng object

        // USE PRODUCT.COORDINATES IN THE FOLLOWING LINE FOR LAT/LONG
        var myLatlng = new google.maps.LatLng(singleProduct.coordinates[0], singleProduct.coordinates[1]);
        // set the map options hash
        var mapOptions = {
            center: myLatlng,
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        // get the maps div's HTML obj
        var map_canvas_obj = document.getElementById("map-canvas");
        console.log(map_canvas_obj);
        // initialize a new Google Map with the options
        var map = new google.maps.Map(map_canvas_obj, mapOptions);
        // Add the marker to the map
        var marker = new google.maps.Marker({
            position: myLatlng,
            title: "Hello World!"
        });
        // Add the marker to the map by calling setMap()
        marker.setMap(map);
    };

    $scope.runMap = initialize_gmaps;

    $scope.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    $scope.showConfirm = function (ev, product) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm().title('You just added ' + product.title + ' to your cart!').textContent('You are on your way to ' + product.location + '!').ariaLabel('Lucky day').targetEvent(ev).ok('Keep Shopping').cancel('Go to Cart');

        $mdDialog.show(confirm).then(function () {
            $state.go('productDetail', { productId: product._id, sellerId: product.seller });
        }, function () {
            $state.go('cart');
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('productDetail', {
        url: '/products/:productId',
        templateUrl: '/js/productDetail/productDetail.html',
        controller: 'ProductDetail',
        resolve: {
            singleProduct: function singleProduct(ProductFactory, $stateParams) {
                console.log('stateparams', $stateParams);
                return ProductFactory.getById($stateParams.productId);
            }
        }
    });
});

app.controller('NewReviewCtrl', function ($scope, user, product, $state, ReviewFactory, $log) {
    $scope.product = product;
    $scope.user = user;

    $scope.submitReview = function () {
        var newReview = {
            rating: $scope.review.rating,
            comment: $scope.review.comment,
            user: user._id,
            product: product._id
        };
        ReviewFactory.createReview(newReview).then(function () {
            $state.go('home');
        }).catch($log.error);
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('newReview', {
        url: '/newReview/:productId',
        templateUrl: '/js/reviews/newReview.template.html',
        controller: 'NewReviewCtrl',
        resolve: {
            user: function user(AuthService) {
                return AuthService.getLoggedInUser();
            },
            product: function product(ProductFactory, $stateParams) {
                return ProductFactory.getOneProduct($stateParams.productId);
            }
        }
    });
});

app.controller('ReviewCtrl', function () {});
app.directive('review', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/reviews/review.template.html',
        scope: {
            review: '='
        }
    };
});

app.factory('ReviewFactory', function ($http) {
    return {
        getProductReviews: function getProductReviews(productId) {
            return $http.get('/api/reviews/product/' + productId).then(function (reviews) {
                return reviews.data;
            });
        },
        getProductReviewsByUser: function getProductReviewsByUser(userId) {
            return $http.get('/api/reviews/user/' + userId).then(function (reviews) {
                return reviews.data;
            });
        },
        createReview: function createReview(newReview) {
            return $http.post('/api/reviews/', newReview).then(function (review) {
                return review.data;
            });
        }
    };
});

app.controller('SellerCtrl', function (currentUser, $scope, $state, $mdSidenav, $mdMedia, ProductFactory, getAllProducts) {

    $scope.imagePath = 'assets/images/placeholder.jpg';

    $scope.user = currentUser;

    $scope.products = getAllProducts;

    $scope.deleteProduct = function (product, index) {
        return ProductFactory.deleteProduct(product._id).then(function (response) {
            if (response.status === 204) {
                return $scope.products.splice(index, 1);
            }
        });
    };

    $scope.createProduct = function () {
        $state.go('sellerCreateProduct');
    };

    $scope.editForm = function (product) {
        $state.go('sellerEdit', { id: product._id });
    };

    // $scope.openLeftMenu = function() {
    //   $mdSidenav('left').toggle();
    // };
    // $scope.isOpen = true;
    // $scope.toolbar = {
    //       isOpen: true,
    //       count: 5,
    //       selectedDirection: 'left'
    // };
});

app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });
});

app.controller('SignupCtrl', function ($scope, AuthService, $state, UserFactory) {

    $scope.signup = {};
    $scope.error = null;

    $scope.sendSignup = function (signupInfo) {
        $scope.error = null;

        UserFactory.signup(signupInfo).then(function (newUser) {
            return AuthService.login(signupInfo);
        }).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid signup credentials provided.';
        });
    };

    $scope.style = function () {
        if ($scope.signupForm.email.$invlaid) {
            return { "color": "red" };
        }
    };
});

app.controller('AllStoresCtrl', function (getAllUsers, $scope, $state) {

    $scope.users = getAllUsers;
});

app.config(function ($stateProvider) {
    $stateProvider.state('createStore', {
        url: '/createStore',
        templateUrl: '/js/stores/createStore.template.html',
        resolve: {
            user: function user(AuthService) {
                return AuthService.getLoggedInUser();
            }
        },
        controller: function controller($scope, UserFactory, $state, user) {
            console.log('user in ctrl', user);
            $scope.user = user;

            $scope.makeUserStoreOwner = function () {
                return UserFactory.updateUser($scope.user._id, { isSeller: true, storeName: $scope.storeName }).then(function (user) {
                    $scope.user = user.data;
                    console.log('user in asdfadf', $scope.user._id);
                    // FIX THIS
                    $state.go('sellerHome', { sellerId: $scope.user._id });
                });
            };
        }
    });
});
app.config(function ($stateProvider) {
    $stateProvider.state('seller', {
        url: '/seller/:sellerId',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
            allProducts: function allProducts(ProductFactory, $stateParams) {
                return ProductFactory.getAllProducts($stateParams.sellerId);
            }
        }
    });
});

app.config(function ($stateProvider) {
    $stateProvider.state('allStores', {
        url: '/stores',
        templateUrl: 'js/stores/stores.template.html',
        // controller: 'AllStoresCtrl',
        resolve: {
            getAllUsers: function getAllUsers(UserFactory) {
                return UserFactory.getAllUsers().then(function (users) {
                    users = users.filter(function (user) {
                        return user.isSeller === true;
                    });
                    return users;
                });
            }
        },
        controller: function controller($scope, getAllUsers) {
            $scope.users = getAllUsers;
        }
    });
});
app.factory('UserFactory', function ($http) {

    var UserFactory = {};

    function getData(res) {
        return res.data;
    }

    UserFactory.getAllUsers = function () {
        return $http.get('/api/members/').then(function (users) {
            return users.data;
        });
    };

    UserFactory.signup = function (newUser) {
        return $http.post('api/members/', newUser).then(getData).then(function (createdUser) {
            return createdUser;
        });
    };

    UserFactory.getUser = function (userId) {
        return $http.get('api/members/' + userId).then(getData).then(function (user) {
            return user;
        });
    };

    UserFactory.deleteUser = function (userId) {
        return $http.delete('api/members/' + userId).then(getData).then(function (user) {
            return user;
        });
    };

    UserFactory.updateUser = function (userId, update) {
        console.log('in user factory update user function. userId: ', userId, ' update: ', update);
        return $http({
            method: 'PUT',
            url: '/api/members/' + userId,
            data: update
        }).then(function (response) {
            return response;
        });
    };

    return UserFactory;
});

app.config(function ($stateProvider) {

    $stateProvider.state('userProfile', {
        url: '/user-profile',
        templateUrl: 'js/userProfile/userProfile.html',
        controller: 'UserProfileCtrl',
        resolve: {
            user: function user(AuthService) {
                return AuthService.getLoggedInUser();
            },
            reviews: function reviews(AuthService, ReviewFactory) {
                return AuthService.getLoggedInUser().then(function (user) {
                    return ReviewFactory.getProductReviewsByUser(user._id);
                });
            },
            orders: function orders(AuthService, OrderFactory) {
                return AuthService.getLoggedInUser().then(function (user) {
                    return OrderFactory.getCompleteOrdersByUser(user._id);
                }).then(function (orders) {
                    return orders.map(function (order) {
                        var sum = 0;
                        order.products.forEach(function (product) {
                            sum += product.product.price * product.quantity;
                        });
                        order.totalPrice = sum;
                        return order;
                    });
                });
            }
        }
    });
});

app.controller('UserProfileCtrl', function ($scope, user, reviews, orders, $state) {
    $scope.user = user;
    $scope.reviews = reviews;
    $scope.orders = orders;
});

app.controller('AdminCreateCtrl', function ($scope, $state, ProductFactory) {

    $scope.create = { images: [], coordinates: [] };

    $scope.createProduct = function (create) {
        console.log("created", create);
        ProductFactory.createProduct(create).then(function () {
            $state.go('home');
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('adminCreateProduct', {
        url: '/admin/create',
        controller: 'AdminCreateCtrl',
        templateUrl: '/js/admin/admin.edit/admin.create.template.html',
        resolve: {
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isAdmin) $state.go('home');
                });
            }
        }
    });
});

app.controller('AdminEditCtrl', function ($scope, $state, ProductFactory, productToEdit) {

    $scope.productToEdit = productToEdit;

    $scope.update = {};

    $scope.updateProduct = function (productId, update) {
        ProductFactory.updateProduct(productId, update).then(function () {
            $state.go('productDetail', { "productId": productId });
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('adminEdit', {
        url: '/admin/edit/:id',
        controller: 'AdminEditCtrl',
        templateUrl: '/js/admin/admin.edit/admin.edit.template.html',
        resolve: {
            productToEdit: function productToEdit($stateParams, ProductFactory) {
                return ProductFactory.getOneProduct($stateParams.id);
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isAdmin) $state.go('home');
                });
            }
        }
    });
});

// app.directive('adminToolbar', function(){
//     return {
//         restrict: 'E',
//         templateUrl: '/js/admin/admin.home/admin.home.toolbar.template.html'
//     }
// })

app.directive('adminNav', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/admin/admin.home/admin.home.nav.template.html'
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: 'AdminCtrl',
        resolve: {
            getAllProducts: function getAllProducts(ProductFactory) {
                return ProductFactory.getAllProducts();
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isAdmin) $state.go('home');
                });
            }
        },
        templateUrl: '/js/admin/admin.home/admin.home.template.html'
    });
});

app.controller('AdminOrderCtrl', function ($scope, $state, AdminOrderFactory, allOrders) {

    //For Filtering
    $scope.statuses = ['all', 'cart', 'confirmed', 'processing', 'cancelled', 'complete'];

    //Update Object to send to Put Requests
    $scope.update = {};
    $scope.update.status = 'all';
    $scope.update.allOrders = allOrders;

    $scope.deleteOrder = function (orderId) {
        AdminOrderFactory.deleteOneOrder(orderId).then(function (order) {
            if (order.status === 200) {
                for (var i = 0; i < $scope.update.allOrders.length; i++) {
                    if ($scope.update.allOrders[i]._id === order.data._id) $scope.update.allOrders.splice(i, 1);
                }
            }
        }).then(null, function (err) {
            console.error(err);
        });
    };

    $scope.editOrderForm = function (order) {
        $state.go('adminEditOrder', { orderId: order._id });
    };
});

app.factory('AdminOrderFactory', function ($http) {
    return {
        getAllOrders: function getAllOrders() {

            return $http.get('/api/orders').then(function (order) {
                return order.data;
            });
        },
        getOneOrder: function getOneOrder(orderId) {

            return $http.get('/api/orders/findOneOrderById/' + orderId).then(function (products) {
                return products.data;
            });
        },
        updateOneOrder: function updateOneOrder(orderId, update) {

            return $http({
                method: 'PUT',
                url: '/api/orders/' + orderId,
                data: update
            }).then(function (response) {
                return response.data;
            });
        },
        deleteOneOrder: function deleteOneOrder(orderId) {

            return $http.delete('api/orders/' + orderId).then(function (order) {
                return order;
            });
        }
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('adminOrder', {
        url: '/admin/order',
        controller: 'AdminOrderCtrl',
        templateUrl: '/js/admin/admin.order/admin.order.templates/admin.order.template.html',
        resolve: {
            allOrders: function allOrders(AdminOrderFactory) {
                return AdminOrderFactory.getAllOrders();
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isAdmin) $state.go('home');
                });
            }
        }
    });
});

app.directive('adminSidebar', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/admin/admin.sidebar/admin.sidebar.html',
        controller: 'AdminCtrl'
    };
});

app.controller('AdminEditUserCtrl', function ($scope, $state, UserFactory, userToEdit) {

    $scope.userToEdit = userToEdit;

    $scope.update = {};

    $scope.roles = ['Admin', 'Seller', 'Customer'];

    $scope.updateUser = function (userId, update) {
        UserFactory.updateUser(userId, update).then(function () {
            $state.go('adminUser');
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('adminEditUser', {
        url: '/admin/edit/user/:id',
        controller: 'AdminEditUserCtrl',
        templateUrl: '/js/admin/admin.user/admin.edit.user.template.html',
        resolve: {
            userToEdit: function userToEdit($stateParams, UserFactory) {
                return UserFactory.getUser($stateParams.id);
            }
        }
    });
});

app.controller('AdminUserCtrl', function ($scope, $state, getAllUsers, UserFactory) {

    $scope.users = getAllUsers;

    $scope.editUser = function (user) {
        $state.go('adminEditUser', { id: user._id });
    };

    $scope.passwordReset = function (user) {
        return UserFactory.updateUser(user._id, { passwordReset: true }).then(function (response) {
            console.log(response);
        });
    };

    $scope.deleteUser = function (user, index) {
        return UserFactory.deleteUser(user._id).then(function (response) {
            if (response._id === user._id) {
                return $scope.users.splice(index, 1);
            }
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('adminUser', {
        url: '/admin/user',
        controller: 'AdminUserCtrl',
        templateUrl: '/js/admin/admin.user/admin.user.template.html',
        resolve: {
            getAllUsers: function getAllUsers(UserFactory) {
                return UserFactory.getAllUsers();
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isAdmin) $state.go('home');
                });
            }
        }
    });
});

app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});
app.controller('SellerCreateCtrl', function (currentUser, $scope, $state, ProductFactory) {
    console.log('in seller create controller');
    $scope.user = currentUser;

    $scope.create = { images: [], coordinates: [] };

    $scope.createProduct = function (create) {
        create.seller = $scope.user._id;
        console.log('create', create);
        ProductFactory.createProduct(create).then(function () {
            $state.go('sellerProducts', { sellerId: $scope.user._id });
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('sellerCreateProduct', {
        url: '/seller/create/:sellerId',
        controller: 'SellerCreateCtrl',
        templateUrl: '/js/seller/seller.edit/seller.create.template.html',
        resolve: {
            currentUser: function currentUser(AuthService) {
                return AuthService.getLoggedInUser().then(function (user) {
                    console.log('user', user);
                    return user;
                });
            }
        }
    });
});

app.controller('SellerEditCtrl', function ($scope, $state, ProductFactory, productToEdit) {

    $scope.productToEdit = productToEdit;

    $scope.update = {};

    $scope.updateProduct = function (productId, update) {
        ProductFactory.updateProduct(productId, update).then(function () {
            $state.go('productDetail', { "productId": productId });
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('sellerEdit', {
        url: '/seller/edit/:id',
        controller: 'SellerEditCtrl',
        templateUrl: '/js/seller/seller.edit/seller.edit.template.html',
        resolve: {
            productToEdit: function productToEdit($stateParams, ProductFactory) {
                return ProductFactory.getOneProduct($stateParams.id);
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isSeller) $state.go('home');
                });
            }
        }
    });
});

app.controller('SellerHomeCtrl', function (UserFactory, currentUser, $scope, $state, $mdSidenav, $mdMedia) {

    $scope.user = currentUser;
    $scope.newColor = { 'background-color': $scope.user.backgroundColor };
    $scope.storeName = $scope.user.storeName;

    $scope.setStoreName = function () {
        console.log('set store name called in controller');
        UserFactory.updateUser($scope.user._id, { storeName: $scope.name }).then(function (user) {
            console.log('updated user in controller: ', user);
            $scope.storeName = user.data.storeName;
            return user;
        });
    };

    $scope.setBackgroundColor = function () {
        UserFactory.updateUser($scope.user._id, { backgroundColor: $scope.color }).then(function (user) {
            $scope.newColor["background-color"] = user.data.backgroundColor;
            return user;
        });
    };
});

// app.directive('sellerToolbar', function(){
//     return {
//         restrict: 'E',
//         templateUrl: '/js/seller/seller.home/seller.home.toolbar.template.html'
//     }
// })

app.directive('sellerNav', function (AuthService) {
    return {
        restrict: 'E',
        templateUrl: '/js/seller/seller.home/seller.home.nav.template.html',
        // scope: {
        // 	storeName: '='
        // },
        link: function link(scope) {
            return AuthService.getLoggedInUser().then(function (user) {
                scope.storeName = user.storeName;
                return user;
            });
        }
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('sellerHome', {
        // SHOULD GO HERE
        url: '/sellerHome/:sellerId',
        controller: 'SellerHomeCtrl',
        resolve: {
            isSellerUser: function isSellerUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isSeller) $state.go('home');
                });
            },
            currentUser: function currentUser(AuthService) {
                return AuthService.getLoggedInUser().then(function (user) {
                    console.log('user', user);
                    return user;
                });
            }
        },
        templateUrl: '/js/seller/seller.home/seller.home.template.html'
    });
});

app.config(function ($stateProvider) {
    $stateProvider.state('sellerProducts', {
        url: '/sellerProducts/:sellerId',
        controller: 'SellerCtrl',
        resolve: {
            getAllProducts: function getAllProducts(ProductFactory, $stateParams) {
                console.log('in seller home state:', $stateParams.sellerId);
                return ProductFactory.getAllProducts($stateParams.sellerId);
            },
            isSellerUser: function isSellerUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isSeller) $state.go('home');
                });
            },
            currentUser: function currentUser(AuthService) {
                return AuthService.getLoggedInUser().then(function (user) {
                    console.log('user', user);
                    return user;
                });
            }
        },
        templateUrl: '/js/seller/seller.home/seller.products.template.html'
    });
});

// app.directive('sellerSidebar', function(){
//     return {
//         restrict: 'E',
//         templateUrl: '/js/seller/seller.sidebar/seller.sidebar.html',
//         controller: 'SellerCtrl'
//         // resolve: {
//         // 	currentUser: function(AuthService) {
//         // 		return AuthService.getLoggedInUser()
//         // 		.then(function(user){
//         // 			console.log('user', user)
//         // 			return user;
//         // 		})

//         // 	}
//         // }
//     // }
// 	}
// })
app.controller('SellerOrderCtrl', function ($scope, $state, SellerOrderFactory, allOrders) {

    //For Filtering
    $scope.statuses = ['all', 'cart', 'confirmed', 'processing', 'cancelled', 'complete'];

    //Update Object to send to Put Requests
    $scope.update = {};
    $scope.update.status = 'all';
    $scope.update.allOrders = allOrders;

    $scope.deleteOrder = function (orderId) {
        SellerOrderFactory.deleteOneOrder(orderId).then(function (order) {
            if (order.status === 200) {
                for (var i = 0; i < $scope.update.allOrders.length; i++) {
                    if ($scope.update.allOrders[i]._id === order.data._id) $scope.update.allOrders.splice(i, 1);
                }
            }
        }).then(null, function (err) {
            console.error(err);
        });
    };

    $scope.editOrderForm = function (order) {
        $state.go('sellerEditOrder', { orderId: order._id });
    };
});

app.factory('SellerOrderFactory', function ($http) {
    return {
        getAllOrders: function getAllOrders() {

            return $http.get('/api/orders').then(function (order) {
                return order.data;
            });
        },
        getOneOrder: function getOneOrder(orderId) {

            return $http.get('/api/orders/findOneOrderById/' + orderId).then(function (products) {
                return products.data;
            });
        },
        updateOneOrder: function updateOneOrder(orderId, update) {

            return $http({
                method: 'PUT',
                url: '/api/orders/' + orderId,
                data: update
            }).then(function (response) {
                return response.data;
            });
        },
        deleteOneOrder: function deleteOneOrder(orderId) {

            return $http.delete('api/orders/' + orderId).then(function (order) {
                return order;
            });
        }
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('sellerOrder', {
        url: '/seller/order',
        controller: 'SellerOrderCtrl',
        templateUrl: '/js/seller/seller.order/seller.order.templates/seller.order.template.html',
        resolve: {
            allOrders: function allOrders(SellerOrderFactory) {
                return SellerOrderFactory.getAllOrders();
            },
            isSellerUser: function isSellerUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isSeller) $state.go('home');
                });
            }
        }
    });
});

app.controller('AdminEditOrderCtrl', function ($scope, $state, AdminOrderFactory, orderToEdit) {

    $scope.orderToEdit = orderToEdit;

    console.log("$scope.orderToEdit", $scope.orderToEdit);

    $scope.update = {};

    $scope.statuses = ['cart', 'confirmed', 'processing', 'cancelled', 'complete'];

    // $scope.updateOrder = function(productId, update){
    //   console.log("Should have switched")
    //   AdminOrderFactory.updateOrder(productId, update)

    // }

    $scope.editProductForm = function (order) {
        $state.go('adminEdit', { id: order._id });
    };

    $scope.updateOrder = function (order, update) {
        AdminOrderFactory.updateOneOrder(order._id, update).then(function () {
            $state.go('adminOrder');
        });
    };

    $scope.removeProduct = function (product, order, update) {
        // $scope.updateOrder(order, update)
        console.log("romoveProduct:", update);

        //THE LOGIC HERE IS BACKWARDS!!! It should remove the product, and if successful
        //then it should remove from $scope.update.products like Laura did

        for (var i = 0; i < $scope.update.products.length; i++) {
            if ($scope.update.products[i]._id === product._id) $scope.update.products.splice(i, 1);
        }

        AdminOrderFactory.updateOneOrder(order._id, update).then(function () {});

        //This is closer but the $scope.update.products does not match the updatedOrder.data._id
        //Also, you must chang the factory funciton to return 'response' instead of 'response.data'
        // AdminOrderFactory.updateOneOrder(order._id, update)
        // .then(function(updatedOrder){
        //   console.log(updatedOrder)
        //   if(updatedOrder.status===200){
        //     for (var i = 0; i < $scope.update.products.length; i++) {
        //       if($scope.update.products[i]._id === updatedOrder.data._id){
        //         $scope.update.products.splice(i, 1);
        //         break;
        //       }
        //     }
        //   }
        // })
        // .catch(function(err){
        //   console.error(err);
        // });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('adminEditOrder', {
        url: '/edit/orders/:orderId',
        controller: 'AdminEditOrderCtrl',
        templateUrl: '/js/admin/admin.order/admin.edit.order/admin.edit.order.template.html',
        resolve: {
            orderToEdit: function orderToEdit($stateParams, AdminOrderFactory) {
                console.log($stateParams.orderId);
                return AdminOrderFactory.getOneOrder($stateParams.orderId);
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isAdmin) $state.go('home');
                });
            }
        }
    });
});

// '/js/admin/admin.order/admin.edit.order/admin.edit.order.template.html',

app.directive('adminOrderList', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/admin/admin.order/admin.order.templates/admin.order.list.template.html'
    };
});

app.directive('adminOrderHeader', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/admin/admin.order/admin.order.templates/admin.order.header.template.html'
    };
});

app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
app.controller('SellerEditOrderCtrl', function ($scope, $state, SellerOrderFactory, orderToEdit) {

    $scope.orderToEdit = orderToEdit;

    console.log("$scope.orderToEdit", $scope.orderToEdit);

    $scope.update = {};

    $scope.statuses = ['cart', 'confirmed', 'processing', 'cancelled', 'complete'];

    // $scope.updateOrder = function(productId, update){
    //   console.log("Should have switched")
    //   AdminOrderFactory.updateOrder(productId, update)

    // }

    $scope.editProductForm = function (order) {
        $state.go('sellerEdit', { id: order._id });
    };

    $scope.updateOrder = function (order, update) {
        SellerOrderFactory.updateOneOrder(order._id, update).then(function () {
            $state.go('sellerOrder');
        });
    };

    $scope.removeProduct = function (product, order, update) {
        // $scope.updateOrder(order, update)
        console.log("removeProduct:", update);

        //THE LOGIC HERE IS BACKWARDS!!! It should remove the product, and if successful
        //then it should remove from $scope.update.products like Laura did

        for (var i = 0; i < $scope.update.products.length; i++) {
            if ($scope.update.products[i]._id === product._id) $scope.update.products.splice(i, 1);
        }

        SellerOrderFactory.updateOneOrder(order._id, update).then(function () {});

        //This is closer but the $scope.update.products does not match the updatedOrder.data._id
        //Also, you must chang the factory funciton to return 'response' instead of 'response.data'
        // AdminOrderFactory.updateOneOrder(order._id, update)
        // .then(function(updatedOrder){
        //   console.log(updatedOrder)
        //   if(updatedOrder.status===200){
        //     for (var i = 0; i < $scope.update.products.length; i++) {
        //       if($scope.update.products[i]._id === updatedOrder.data._id){
        //         $scope.update.products.splice(i, 1);
        //         break;
        //       }
        //     }
        //   }
        // })
        // .catch(function(err){
        //   console.error(err);
        // });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('sellerEditOrder', {
        url: '/edit/orders/:orderId',
        controller: 'SellerEditOrderCtrl',
        templateUrl: '/js/seller/seller.order/seller.edit.order/seller.edit.order.template.html',
        resolve: {
            orderToEdit: function orderToEdit($stateParams, SellerOrderFactory) {
                console.log($stateParams.orderId);
                return SellerOrderFactory.getOneOrder($stateParams.orderId);
            },
            isAdminUser: function isAdminUser(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (!user.isSeller) $state.go('home');
                });
            }
        }
    });
});

// '/js/admin/admin.order/admin.edit.order/admin.edit.order.template.html',

app.directive('sellerOrderList', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/seller/seller.order/seller.order.templates/seller.order.list.template.html'
    };
});

app.directive('sellerOrderHeader', function () {
    return {
        restrict: 'E',
        templateUrl: '/js/seller/seller.order/seller.order.templates/seller.order.header.template.html'
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYWRtaW4vYWRtaW4uY29udHJvbGxlci5qcyIsImRvY3MvZG9jcy5qcyIsImZpbHRlcnMvZmlsdGVycy5qcyIsImZzYS9mc2EtcHJlLWJ1aWx0LmpzIiwiaG9tZS9ob21lLmNvbnRvbGxlci5qcyIsImhvbWUvaG9tZS5zdGF0ZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4vcGFzc3dvcmQucmVzZXQuY29udHJvbGxlci5qcyIsImxvZ2luL3Bhc3N3b3JkUmVzZXQuc3RhdGUuanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwibmF2YmFyL25hdmJhci5qcyIsIm5hdmJhckZpbHRlci9uYXZiYXJGaWx0ZXIuY29udHJvbGxlci5qcyIsIm5hdmJhckZpbHRlci9uYXZiYXJGaWx0ZXIuZGlyZWN0aXZlLmpzIiwib2F1dGgtYnV0dG9uL29hdXRoLWJ1dHRvbi5kaXJlY3RpdmUuanMiLCJvcmRlcnMvY2FydC5jb250cm9sbGVyLmpzIiwib3JkZXJzL2NoZWNrb3V0LmNvbnRyb2xsZXIuanMiLCJvcmRlcnMvY29tcGxldGUuY29udHJvbGxlci5qcyIsIm9yZGVycy9vcmRlci5mYWN0b3J5LmpzIiwib3JkZXJzL29yZGVyLnN0YXRlLmpzIiwicHJvZHVjdC9wcm9kdWN0LmNvbnRyb2xsZXIuanMiLCJwcm9kdWN0L3Byb2R1Y3QuZGlyZWN0aXZlLmpzIiwicHJvZHVjdC9wcm9kdWN0LmZhY3RvcnkuanMiLCJwcm9kdWN0RGV0YWlsL3Byb2R1Y3REZXRhaWwuY29udHJvbGxlci5qcyIsInByb2R1Y3REZXRhaWwvcHJvZHVjdERldGFpbC5zdGF0ZS5qcyIsInJldmlld3MvbmV3UmV2aWV3LmNvbnRyb2xsZXIuanMiLCJyZXZpZXdzL25ld1Jldmlldy5zdGF0ZS5qcyIsInJldmlld3MvcmV2aWV3LmNvbnRyb2xsZXIuanMiLCJyZXZpZXdzL3Jldmlldy5kaXJlY3RpdmUuanMiLCJyZXZpZXdzL3Jldmlldy5mYWN0b3J5LmpzIiwic2VsbGVyL3NlbGxlci5jb250cm9sbGVyLmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInN0b3Jlcy9hbGxTdG9yZXMuY29udHJvbGxlci5qcyIsInN0b3Jlcy9jcmVhdGVTdG9yZS5zdGF0ZS5qcyIsInN0b3Jlcy9zdG9yZXMuc3RhdGVzLmpzIiwidXNlci91c2VyLmZhY3RvcnkuanMiLCJ1c2VyUHJvZmlsZS91c2VyUHJvZmlsZS5qcyIsImFkbWluL2FkbWluLmVkaXQvYWRtaW4uY3JlYXRlLmNvbnRyb2xsZXIuanMiLCJhZG1pbi9hZG1pbi5lZGl0L2FkbWluLmNyZWF0ZS5zdGF0ZS5qcyIsImFkbWluL2FkbWluLmVkaXQvYWRtaW4uZWRpdC5jb250cm9sbGVyLmpzIiwiYWRtaW4vYWRtaW4uZWRpdC9hZG1pbi5lZGl0LnN0YXRlLmpzIiwiYWRtaW4vYWRtaW4uaG9tZS9hZG1pbi5ob21lLmRpcmVjdGl2ZS5qcyIsImFkbWluL2FkbWluLmhvbWUvYWRtaW4uaG9tZS5zdGF0ZS5qcyIsImFkbWluL2FkbWluLm9yZGVyL2FkbWluLm9yZGVyLmNvbnRyb2xsZXIuanMiLCJhZG1pbi9hZG1pbi5vcmRlci9hZG1pbi5vcmRlci5mYWN0b3J5LmpzIiwiYWRtaW4vYWRtaW4ub3JkZXIvYWRtaW4ub3JkZXIuc3RhdGUuanMiLCJhZG1pbi9hZG1pbi5zaWRlYmFyL2FkbWluLnNpZGViYXIuZGlyZWN0aXZlLmpzIiwiYWRtaW4vYWRtaW4udXNlci9hZG1pbi5lZGl0LnVzZXIuY29udHJvbGxlci5qcyIsImFkbWluL2FkbWluLnVzZXIvYWRtaW4uZWRpdC51c2VyLnN0YXRlLmpzIiwiYWRtaW4vYWRtaW4udXNlci9hZG1pbi51c2VyLmNvbnRyb2xsZXIuanMiLCJhZG1pbi9hZG1pbi51c2VyL2FkbWluLnVzZXIuc3RhdGUuanMiLCJjb21tb24vZmFjdG9yaWVzL0Z1bGxzdGFja1BpY3MuanMiLCJjb21tb24vZmFjdG9yaWVzL1JhbmRvbUdyZWV0aW5ncy5qcyIsImNvbW1vbi9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyIsInNlbGxlci9zZWxsZXIuZWRpdC9zZWxsZXIuY3JlYXRlLmNvbnRyb2xsZXIuanMiLCJzZWxsZXIvc2VsbGVyLmVkaXQvc2VsbGVyLmNyZWF0ZS5zdGF0ZS5qcyIsInNlbGxlci9zZWxsZXIuZWRpdC9zZWxsZXIuZWRpdC5jb250cm9sbGVyLmpzIiwic2VsbGVyL3NlbGxlci5lZGl0L3NlbGxlci5lZGl0LnN0YXRlLmpzIiwic2VsbGVyL3NlbGxlci5ob21lL3NlbGxlci5ob21lLmNvbnRyb2xsZXIuanMiLCJzZWxsZXIvc2VsbGVyLmhvbWUvc2VsbGVyLmhvbWUuZGlyZWN0aXZlLmpzIiwic2VsbGVyL3NlbGxlci5ob21lL3NlbGxlci5ob21lLnN0YXRlLmpzIiwic2VsbGVyL3NlbGxlci5ob21lL3NlbGxlci5wcm9kdWN0cy5zdGF0ZS5qcyIsInNlbGxlci9zZWxsZXIub3JkZXIvc2VsbGVyLm9yZGVyLmNvbnRyb2xsZXIuanMiLCJzZWxsZXIvc2VsbGVyLm9yZGVyL3NlbGxlci5vcmRlci5mYWN0b3J5LmpzIiwic2VsbGVyL3NlbGxlci5vcmRlci9zZWxsZXIub3JkZXIuc3RhdGUuanMiLCJhZG1pbi9hZG1pbi5vcmRlci9hZG1pbi5lZGl0Lm9yZGVyL2FkbWluLmVkaXQub3JkZXIuY29udHJvbGxlci5qcyIsImFkbWluL2FkbWluLm9yZGVyL2FkbWluLmVkaXQub3JkZXIvYWRtaW4uZWRpdC5vcmRlci5zdGF0ZS5qcyIsImFkbWluL2FkbWluLm9yZGVyL2FkbWluLm9yZGVyLmRpcmVjdGl2ZXMvYWRtaW4ub3JkZXIuZGlyZWN0aXZlLmpzIiwiYWRtaW4vYWRtaW4ub3JkZXIvYWRtaW4ub3JkZXIuZGlyZWN0aXZlcy9hZG1pbi5vcmRlci5oZWFkZXIuZGlyZWN0aXZlLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJzZWxsZXIvc2VsbGVyLm9yZGVyL3NlbGxlci5lZGl0Lm9yZGVyL3NlbGxlci5lZGl0Lm9yZGVyLmNvbnRyb2xsZXIuanMiLCJzZWxsZXIvc2VsbGVyLm9yZGVyL3NlbGxlci5lZGl0Lm9yZGVyL3NlbGxlci5lZGl0Lm9yZGVyLnN0YXRlLmpzIiwic2VsbGVyL3NlbGxlci5vcmRlci9zZWxsZXIub3JkZXIuZGlyZWN0aXZlcy9zZWxsZXIub3JkZXIuZGlyZWN0aXZlLmpzIiwic2VsbGVyL3NlbGxlci5vcmRlci9zZWxsZXIub3JkZXIuZGlyZWN0aXZlcy9zZWxsZXIub3JkZXIuaGVhZGVyLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUFDQSxPQUFBLEdBQUEsR0FBQSxRQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxRQUFBLEVBQUEsc0JBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxJQUFBLE9BQUEsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUdBLElBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHNCQUFBLFNBQUEsQ0FBQSxJQUFBOztBQUZBLHNCQUlBLENBQUEsU0FBQSxDQUFBLEdBQUE7O0FBSkEsc0JBTUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0EsZUFBQSxRQUFBLENBQUEsTUFBQSxHQURBO0tBQUEsQ0FBQSxDQU5BO0NBQUEsQ0FBQTs7O0FBWUEsSUFBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7O0FBR0EsUUFBQSwrQkFBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLElBQUEsSUFBQSxNQUFBLElBQUEsQ0FBQSxZQUFBLENBREE7S0FBQTs7OztBQUhBLGNBU0EsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSw2QkFBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBSEE7U0FBQTs7QUFNQSxZQUFBLFlBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLG1CQUhBO1NBQUE7OztBQVJBLGFBZUEsQ0FBQSxjQUFBLEdBZkE7O0FBaUJBLG9CQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsUUFBQSxJQUFBLEVBQUEsUUFBQSxFQURBO2FBQUEsTUFFQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxPQUFBLEVBREE7YUFGQTtTQUpBLENBQUEsQ0FqQkE7S0FBQSxDQUFBLENBVEE7Q0FBQSxDQUFBOztBQ2xCQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0EsbUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLG9CQUFBLGlCQUFBO0FBQ0EscUJBQUEscUJBQUE7S0FIQSxFQUhBO0NBQUEsQ0FBQTs7QUFXQSxJQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTs7O0FBR0EsV0FBQSxNQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsYUFBQSxDQUFBLENBSEE7Q0FBQSxDQUFBO0FDWEEsSUFBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLGNBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsV0FBQSxTQUFBLEdBQUEsK0JBQUEsQ0FGQTs7QUFJQSxXQUFBLFFBQUEsR0FBQSxjQUFBLENBSkE7O0FBTUEsV0FBQSxhQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxlQUFBLGFBQUEsQ0FBQSxRQUFBLEdBQUEsQ0FBQSxDQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLFNBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLHVCQUFBLE9BQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBREE7YUFBQTtTQURBLENBREEsQ0FEQTtLQUFBLENBTkE7O0FBZUEsV0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLG9CQUFBLEVBREE7S0FBQSxDQWZBOztBQW1CQSxXQUFBLFFBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxFQUFBLElBQUEsUUFBQSxHQUFBLEVBQUEsRUFEQTtLQUFBOzs7Ozs7Ozs7OztDQW5CQSxDQUFBO0FBQUE7QUNBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUE7QUFDQSxxQkFBQSxtQkFBQTtLQUZBLEVBREE7Q0FBQSxDQUFBOztBQ0FBLEtBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLENBQUE7O0FBRUEsY0FBQSxTQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLFlBQUEsQ0FBQSxHQUFBLEVBQUEsT0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLE1BQUEsTUFBQSxJQUFBLEdBQUEsRUFBQSxPQUFBLEtBQUEsQ0FBQTs7QUFFQSxnQkFBQSxNQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLENBUEE7QUFRQSxZQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLFlBQUEsTUFBQSxXQUFBLENBQUEsR0FBQSxDQUFBLENBREE7QUFFQSxnQkFBQSxhQUFBLENBQUEsQ0FBQSxFQUFBOztBQUVBLG9CQUFBLE1BQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLElBQUEsR0FBQSxFQUFBO0FBQ0EsZ0NBQUEsWUFBQSxDQUFBLENBREE7aUJBQUE7QUFHQSx3QkFBQSxNQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBTEE7YUFBQTtTQUZBOztBQVdBLGVBQUEsU0FBQSxRQUFBLElBQUEsQ0FBQSxDQW5CQTtLQUFBLENBREE7Q0FBQSxDQUFBOztBQTBCQSxJQUFBLE1BQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLENBQUEsQ0FEQTs7QUFHQSxZQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLE1BQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQURBO1NBQUEsTUFHQTtBQUNBLG9CQUFBLE1BQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQURBO1NBSEE7O0FBT0EsZUFBQSxNQUFBLE1BQUEsUUFBQSxHQUFBLE9BQUEsQ0FBQSx1QkFBQSxFQUFBLEdBQUEsQ0FBQSxDQVZBO0tBQUEsQ0FEQTtDQUFBLENBQUE7O0FDMUJBLENBQUEsWUFBQTs7QUFFQTs7O0FBRkE7QUFLQSxRQUFBLENBQUEsT0FBQSxPQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxNQUFBLFFBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FQQTs7QUFTQSxRQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxFQUFBLENBQUEsT0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBRkE7S0FBQSxDQUFBOzs7OztBQVRBLE9BaUJBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLHNCQUFBLG9CQUFB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QSxDQURBO1NBQUEsQ0FBQSxDQURBO0tBQUEsQ0FBQTs7O0FBbkJBLFVBNEJBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0E1QkE7QUE2QkEsS0FBQSxTQUFBLGVBQUEsR0FBQTtBQUNBLGFBQUEsT0FBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsT0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsTUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLHVCQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQURBO2FBQUE7U0FEQSxDQUFBLENBREE7S0FBQSxDQUFBLEdBN0JBO0NBQUEsQ0FBQTs7QUNBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLEdBQUE7QUFDQSxxQkFBQSxtQkFBQTtBQUNBLG9CQUFBLFVBQUE7QUFDQSxpQkFBQTtBQUNBLHlCQUFBLHFCQUFBLGNBQUEsRUFBQTtBQUNBLHVCQUFBLGVBQUEsY0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLCtCQUFBLFNBQUEsTUFBQSxDQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsK0JBQUEsUUFBQSxNQUFBLEtBQUEsSUFBQSxDQURBO3FCQUFBLENBQUEsQ0FEQTtBQUlBLDJCQUFBLFFBQUEsQ0FKQTtpQkFBQSxDQURBLENBREE7YUFBQTtTQURBO0tBSkEsRUFEQTtDQUFBLENBQUE7O0FDQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLHFCQUFBLHFCQUFBO0FBQ0Esb0JBQUEsV0FBQTtLQUhBLEVBRkE7Q0FBQSxDQUFBOztBQVVBLElBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFdBQUEsS0FBQSxHQUFBLEVBQUEsQ0FGQTtBQUdBLFdBQUEsS0FBQSxHQUFBLElB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QUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxlQUFBLElBQUEsQ0FEQTtBQUVBLGdCQUFBLFdBQUEsTUFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsT0FBQSxFQUFBO0FBQUEsdUJBQUEsUUFBQSxRQUFBLEdBQUEsUUFBQSxVQUFBLENBQUE7YUFBQSxDQUFBLENBRkE7QUFHQSxxQkFBQSxPQUFBLENBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBO0FBQUEsc0JBQUEsUUFBQSxDQUFBLEtBQUEsRUFBQSxjQUFBLElBQUEsS0FBQSxDQUFBO2FBQUEsQ0FBQSxDQUhBO0FBSUEsa0JBQUEsVUFBQSxHQUFBLFNBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUFBLHVCQUFBLElBQUEsQ0FBQSxDQUFBO2FBQUEsQ0FBQSxDQUpBO0FBS0EsbUJBQUEsS0FBQSxDQUxBO1NBQUEsQ0FEQSxDQUhBO0tBQUEsQ0E5QkE7O0FBNENBLGlCQUFBLHVCQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsR0FBQSxDQUFBLDZCQUFBLE1BQUEsQ0FBQSxDQUNBLElBREEsQ0FDQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLGVBQUEsSUFBQSxDQURBO1NBQUEsQ0FEQSxDQURBO0tBQUEsQ0E1Q0E7O0FBb0RBLGlCQUFBLGNBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSw2QkFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFlBQUEsRUFBQTtBQUNBLG1CQUFBLGFBQUEsSUFBQSxDQURBO1NBQUEsQ0FEQSxDQURBO0tBQUEsQ0FwREE7O0FBNERBLGlCQUFBLGFBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSxjQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsZ0JBQUEsV0FBQSxNQUFBLElBQUEsQ0FEQTtBQUVBLG1CQUFBLFNBQUEsTUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsdUJBQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxJQUFBLE1BQUEsTUFBQSxLQUFBLFdBQUEsQ0FEQTthQUFBLENBQUEsQ0FGQTtTQUFBLENBREEsQ0FPQSxJQVBBLENBT0EsVUFBQSxhQUFBLEVBQUE7QUFDQSxtQkFBQSxhQUFBLENBREE7U0FBQSxDQVBBLENBREE7S0FBQSxDQTVEQTs7QUF5RUEsYUFBQSxXQUFBLENBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLEtBQUEsRUFBQSxZQUFBLEdBQUEsS0FBQSxRQUFBLEdBQUEsS0FBQSxPQUFBLENBQUEsS0FBQSxDQURBO1NBQUEsQ0FBQTs7Ozs7Ozs7Ozs7O0FBREEsWUFlQSxNQUFBLFdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQTtBQUFBLG1CQUFBLFFBQUEsUUFBQSxHQUFBLFFBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtTQUFBLENBQUEsQ0FmQTtBQWdCQSxtQkFBQSxTQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQUEsbUJBQUEsSUFBQSxDQUFBLENBQUE7U0FBQSxDQUFBLENBaEJBO0tBQUE7OztBQXpFQSxnQkE2RkEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSwyQkFBQSxTQUFBLEVBQUEsRUFBQSxVQUFBLFFBQUEsRUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLElBQUEsRUFBQTs7Ozs7Ozs7QUFRQSxvQkFBQSxJQUFBLENBQUEsS0FBQSxJQUFBLEVBQUEsVUFBQSxFQVJBO0FBU0Esd0JBQUEsU0FBQSxFQUFBLFFBQUEsRUFUQTtBQVVBLG1CQUFBLFVBQUEsQ0FWQTtTQUFBLENBREEsQ0FEQTtLQUFBLENBN0ZBOztBQThHQSxpQkFBQSxvQkFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxHQUFBLENBQUEsMkJBQUEsU0FBQSxFQUFBLEVBQUEsVUFBQSxRQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLElBQUEsQ0FEQTtTQUFBLENBREEsQ0FEQTtLQUFBLENBOUdBOztBQXNIQSxpQkFBQSxpQkFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLG1DQUFBLEVBQUEsU0FBQSxFQURBO0FBRUEsZUFBQSxNQUFBLEdBQUEsQ0FBQSxtQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQURBLENBQ0EsVUFBQSxJQUFBLEVBQUE7QUFDQSxvQkFBQSxJQUFBLENBQUEsS0FBQSxJQUFBLEVBQUEsVUFBQSxFQURBO0FBRUEsd0JBQUEsU0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBRkE7QUFHQSxtQkFBQSxVQUFBLENBSEE7U0FBQSxDQURBLENBRkE7S0FBQSxDQXRIQTs7QUFnSUEsaUJBQUEsY0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLHVDQUFBLEVBQUEsVUFBQSxFQURBO0FBRUEsZUFBQSxNQUFBLEdBQUEsQ0FBQSxnQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQURBLENBQ0EsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBLENBREE7QUFFQSxpQkFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsV0FBQSxRQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxXQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQURBO0FBRUEsb0JBQUEsV0FBQSxRQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsQ0FBQSxHQUFBLEtBQUEsU0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO2FBRkE7QUFJQSxvQkFBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsRUFOQTtBQU9BLHVCQUFBLFNBQUEsSUFBQSxXQUFBLFFBQUEs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LFNBQUE7QUFDQSxxQkFBQSx1QkFBQTtBQUNBLG9CQUFBLFlBQUE7S0FIQSxFQUZBO0NBQUEsQ0FBQTs7QUFVQSxJQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsV0FBQSxNQUFBLEdBQUEsRUFBQSxDQUZBO0FBR0EsV0FBQSxLQUFBLEdBQUEsSUFBQSxDQUhBOztBQUtBLFdBQUEsVUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLEdBQUEsSUFBQSxDQURBOztBQUdBLG9CQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsbUJBQUEsWUFBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBREE7U0FBQSxDQURBLENBSUEsSUFKQSxDQUlBLFlBQUE7QUFDQSxtQkFBQSxFQUFBLENBQUEsTUFBQSxFQURBO1NBQUEsQ0FKQSxDQU9BLEtBUEEsQ0FPQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxHQUFBLHNDQUFBLENBREE7U0FBQSxDQVBBLENBSEE7S0FBQSxDQUxBOztBQXFCQSxXQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxPQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxTQUFBLEtBQUEsRUFBQSxDQURBO1NBQUE7S0FEQSxDQXJCQTtDQUFBLENBQUE7O0FDVkEsSUFBQSxVQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsV0FBQSxDQUZBO0NBQUEsQ0FBQTs7QUNBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxhQUFBLGNBQUE7QUFDQSxxQkFBQSxzQ0FBQTtBQUNBLGlCQUFBO0FBQ0Esa0JBQUEsY0FBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxZQUFBLGVBQUEsRUFBQSxDQURBO2FBQUE7U0FEQTtBQU1BLG9CQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxjQUFBLEVBQUEsSUFBQSxFQURBO0FBRUEsbUJBQUEsSUFBQSxHQUFBLElBQUEsQ0FGQTs7QUFJQSxtQkFBQSxrQkFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxZQUFBLFVBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxVQUFBLElBQUEsRUFBQSxXQUFBLE9BQUEsU0FBQSxFQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsMkJBQUEsSUFBQSxHQUFBLEtBQUEsSUFBQSxDQURBO0FBRUEsNEJBQUEsR0FBQSxDQUFBLGlCQUFBLEVBQUEsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBOztBQUZBLDBCQUlBLENBQUEsRUFBQSxDQUFBLFlBQUEsRUFBQSxFQUFBLFVBQUEsT0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLEVBSkE7aUJBQUEsQ0FEQSxDQURBO2FBQUEsQ0FKQTtTQUFBO0tBVEEsRUFEQTtDQUFBLENBQUE7QUNBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxhQUFBLG1CQUFBO0FBQ0EscUJBQUEsbUJBQUE7QUFDQSxvQkFBQSxVQUFBO0FBQ0EsaUJBQUE7QUFDQSx5QkFBQSxxQkFBQSxjQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsdUJBQUEsZUFBQSxjQUFBLENBQUEsYUFBQSxRQUFBLENBQUEsQ0FEQTthQUFBO1NBREE7S0FKQSxFQURBO0NBQUEsQ0FBQTs7QUFjQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUE7QUFDQSxxQkFBQSxnQ0FBQTs7QUFFQSxpQkFBQTtBQUNBLHlCQUFBLHFCQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLFlBQUEsV0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLEtBQUEsRUFBQTtBQUNBLDRCQUFBLE1BQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsK0JBQUEsS0FBQSxRQUFBLEtBQUEsSUFBQSxDQURBO3FCQUFBLENBQUEsQ0FEQTtBQUlBLDJCQUFBLEtBQUEsQ0FKQTtpQkFBQSxDQURBLENBREE7YUFBQTtTQURBO0FBV0Esb0JBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsR0FBQSxXQUFBLENBREE7U0FBQTtLQWZBLEVBREE7Q0FBQSxDQUFBO0FDZEEsSUFBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsY0FBQSxFQUFBLENBRkE7O0FBSUEsYUFBQSxPQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLElBQUEsQ0FEQTtLQUFBOztBQUlBLGdCQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsTUFBQSxJQUFBLENBREE7U0FBQSxDQURBLENBREE7S0FBQSxDQVJBOztBQWVBLGdCQUFBLE1BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxJQUFBLENBQUEsY0FBQSxFQUFBLE9BQUEsRUFDQSxJQURBLENBQ0EsT0FEQSxFQUVBLElBRkEsQ0FFQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLFdBQUEsQ0FEQTtTQUFBLENBRkEsQ0FEQTtLQUFBLENBZkE7O0FBdUJBLGdCQUFBLE9BQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxHQUFBLENBQUEsaUJBQUEsTUFBQSxDQUFBLENBQ0EsSUFEQSxDQUNBLE9BREEsRUFFQSxJQUZBLENBRUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBREE7U0FBQSxDQUZBLENBREE7S0FBQSxD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QSxNQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQTs7QUFFQSxXQUFBLFVBQUEsR0FBQSxVQUFBLENBRkE7O0FBSUEsV0FBQSxNQUFBLEdBQUEsRUFBQSxDQUpBOztBQU1BLFdBQUEsS0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxVQUFBLENBQUEsQ0FOQTs7QUFRQSxXQUFBLFVBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxVQUFBLENBQUEsTUFBQSxFQUFBLE1BQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLG1CQUFBLEVBQUEsQ0FBQSxXQUFBLEVBREE7U0FBQSxDQURBLENBREE7S0FBQSxDQVJBO0NBQUEsQ0FBQTs7QUNBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxhQUFBLHNCQUFBO0FBQ0Esb0JBQUEsbUJBQUE7QUFDQSxxQkFBQSxvREFBQTtBQUNBLGlCQUFBO0FBQ0Esd0JBQUEsb0JBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLFlBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLENBREE7YUFBQTtTQURBO0tBSkEsRUFEQTtDQUFBLENBQUE7O0FDQUEsSUFBQSxVQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFdBQUEsS0FBQSxHQUFBLFdBQUEsQ0FGQTs7QUFJQSxXQUFBLFFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLGVBQUEsRUFBQSxFQUFBLElBQUEsS0FBQSxHQUFBLEVBQUEsRUFEQTtLQUFBLENBSkE7O0FBUUEsV0FBQSxhQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLFlBQUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLEVBQUEsZUFBQSxJQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVB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QSxFQUFBLFNBQUEsRUFBQTs7O0FBR0EsV0FBQSxRQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQTs7O0FBSEEsVUFNQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBTkE7QUFPQSxXQUFBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsS0FBQSxDQVBBO0FBUUEsV0FBQSxNQUFBLENBQUEsU0FBQSxHQUFBLFNBQUEsQ0FSQTs7QUFXQSxXQUFBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLDJCQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsZ0JBQUEsTUFBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLE9BQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esd0JBQUEsT0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEtBQUEsTUFBQSxJQUFBLENBQUEsR0FBQSxFQUFBLE9BQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtpQkFEQTthQURBO1NBREEsQ0FEQSxDQVFBLElBUkEsQ0FRQSxJQVJBLEVBUUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsR0FBQSxFQURBO1NBQUEsQ0FSQSxDQURBO0tBQUEsQ0FYQTs7QUF5QkEsV0FBQSxhQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUFBLEVBQUEsU0FBQSxNQUFBLEdBQUEsRUFBQSxFQURBO0tBQUEsQ0F6QkE7Q0FBQSxDQUFBOztBQ0FBLElBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0Esc0JBQUEsd0JBQUE7O0FBRUEsbUJBQUEsTUFBQSxHQUFBLENB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QSxZQUFBLEVBQUEsQ0FEQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQVhBLENBM0JBO0FBMkJBLENBM0JBLENBQUE7O0FDQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsaUJBQUEsRUFBQTtBQUNBLGFBQUEsdUJBQUE7QUFDQSxvQkFBQSxxQkFBQTtBQUNBLHFCQUFBLDJFQUFBO0FBQ0EsaUJBQUE7QUFDQSx5QkFBQSxxQkFBQSxZQUFBLEVBQUEsa0JBQUEsRUFBQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxhQUFBLE9BQUEsQ0FBQSxDQURBO0FBRUEsdUJBQUEsbUJBQUEsV0FBQSxDQUFBLGFBQUEsT0FBQSxDQUFBLENBRkE7YUFBQTtBQUlBLHlCQUFBLHFCQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSw0QkFBQSxlQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esd0JBQUEsQ0FBQSxLQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7aUJBREEsQ0FEQSxDQURBO2FBQUE7U0FMQTtLQUpBLEVBREE7Q0FBQSxDQUFBOzs7O0FDQUEsSUFBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGtCQUFBLEdBQUE7QUFDQSxxQkFBQSxnRkFBQTtLQUZBLENBREE7Q0FBQSxDQUFBOztBQ0FBLElBQUEsU0FBQSxDQUFBLG1CQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxrQkFBQSxHQUFBO0FBQ0EscUJBQUEsa0ZBQUE7S0FGQSxDQURBO0NBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJywgJ25nTWF0ZXJpYWwnICwgJ25nQXJpYScsICdhbmd1bGFyQXdlc29tZVNsaWRlcicsICdjb3JlJyBdKTtcblxudmFyIGNvcmUgPSBhbmd1bGFyLm1vZHVsZSgnY29yZScsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJyBdKTtcblxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCJhcHAuY29udHJvbGxlcignQWRtaW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRtZFNpZGVuYXYsICRtZE1lZGlhLCBQcm9kdWN0RmFjdG9yeSwgZ2V0QWxsUHJvZHVjdHMpIHtcblxuICAkc2NvcGUuaW1hZ2VQYXRoID0gJ2Fzc2V0cy9pbWFnZXMvcGxhY2Vob2xkZXIuanBnJztcblxuICAkc2NvcGUucHJvZHVjdHMgPSBnZXRBbGxQcm9kdWN0c1xuXG4gICRzY29wZS5kZWxldGVQcm9kdWN0ID0gZnVuY3Rpb24ocHJvZHVjdCwgaW5kZXgpe1xuICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5kZWxldGVQcm9kdWN0KHByb2R1Y3QuX2lkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwNCl7XG4gICAgICAgIHJldHVybiAkc2NvcGUucHJvZHVjdHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuY3JlYXRlUHJvZHVjdCA9IGZ1bmN0aW9uKCl7XG4gICAgJHN0YXRlLmdvKCdhZG1pbkNyZWF0ZVByb2R1Y3QnKVxuICB9XG5cbiAgJHNjb3BlLmVkaXRGb3JtID0gZnVuY3Rpb24ocHJvZHVjdCl7XG4gICAgJHN0YXRlLmdvKCdhZG1pbkVkaXQnLCB7aWQ6IHByb2R1Y3QuX2lkfSlcbiAgfVxuXG4gIC8vICRzY29wZS5vcGVuTGVmdE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgLy8gICAkbWRTaWRlbmF2KCdsZWZ0JykudG9nZ2xlKCk7XG4gIC8vIH07XG4gIC8vICRzY29wZS5pc09wZW4gPSB0cnVlO1xuICAvLyAkc2NvcGUudG9vbGJhciA9IHtcbiAgLy8gICAgICAgaXNPcGVuOiB0cnVlLFxuICAvLyAgICAgICBjb3VudDogNSxcbiAgLy8gICAgICAgc2VsZWN0ZWREaXJlY3Rpb246ICdsZWZ0J1xuICAvLyB9O1xuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgIHVybDogJy9kb2NzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb2NzL2RvY3MuaHRtbCdcbiAgICB9KTtcbn0pO1xuIiwiY29yZS5maWx0ZXIoJ2N1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlLCB3b3Jkd2lzZSwgbWF4LCB0YWlsKSB7XG4gICAgICAgIGlmICghdmFsdWUpIHJldHVybiAnJztcblxuICAgICAgICBtYXggPSBwYXJzZUludChtYXgsIDEwKTtcbiAgICAgICAgaWYgKCFtYXgpIHJldHVybiB2YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8PSBtYXgpIHJldHVybiB2YWx1ZTtcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cigwLCBtYXgpO1xuICAgICAgICBpZiAod29yZHdpc2UpIHtcbiAgICAgICAgICAgIHZhciBsYXN0c3BhY2UgPSB2YWx1ZS5sYXN0SW5kZXhPZignICcpO1xuICAgICAgICAgICAgaWYgKGxhc3RzcGFjZSAhPSAtMSkge1xuICAgICAgICAgICAgICAvL0Fsc28gcmVtb3ZlIC4gYW5kICwgc28gaXRzIGdpdmVzIGEgY2xlYW5lciByZXN1bHQuXG4gICAgICAgICAgICAgIGlmICh2YWx1ZS5jaGFyQXQobGFzdHNwYWNlLTEpID09ICcuJyB8fCB2YWx1ZS5jaGFyQXQobGFzdHNwYWNlLTEpID09ICcsJykge1xuICAgICAgICAgICAgICAgIGxhc3RzcGFjZSA9IGxhc3RzcGFjZSAtIDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMCwgbGFzdHNwYWNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZSArICh0YWlsIHx8ICcg4oCmJyk7XG4gICAgfTtcbn0pO1xuXG5cblxuYXBwLmZpbHRlcignbXlDdXJyZW5jeScsIFsnJGZpbHRlcicsIGZ1bmN0aW9uICgkZmlsdGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgIGlucHV0ID0gcGFyc2VGbG9hdChpbnB1dCk7XG5cbiAgICBpZihpbnB1dCAlIDEgPT09IDApIHtcbiAgICAgIGlucHV0ID0gaW5wdXQudG9GaXhlZCgwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpbnB1dCA9IGlucHV0LnRvRml4ZWQoMik7XG4gICAgfVxuXG4gICAgcmV0dXJuICckJyArIGlucHV0LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpO1xuICB9O1xufV0pO1xuXG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG4iLCJhcHAuY29udHJvbGxlcignSG9tZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFByb2R1Y3RGYWN0b3J5LCBhbGxQcm9kdWN0cywgJHN0YXRlKSB7XG4gICRzY29wZS5pbWFnZVBhdGggPSAnYXNzZXRzL2ltYWdlcy9wbGFjZWhvbGRlci5qcGcnO1xuXG4gICRzY29wZS5wcm9kdWN0cyA9IGFsbFByb2R1Y3RzO1xuXG4gICRzY29wZS5tYXhQcmljZSA9IDEwMDAwO1xuICAkc2NvcGUubGVzc1RoYW4gPSBmdW5jdGlvbiAocHJvZHVjdCkge1xuICBcdHJldHVybiBwcm9kdWN0LnByaWNlIDw9ICRzY29wZS5tYXhQcmljZTtcbiAgfTtcblxuICAkc2NvcGUubWluUHJpY2UgPSAxO1xuICAkc2NvcGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiAocHJvZHVjdCkge1xuICBcdHJldHVybiBwcm9kdWN0LnByaWNlID49ICRzY29wZS5taW5QcmljZTtcbiAgfTtcblxuXG4gIFxuICAvLyBQVVRTIEFMTCBDQVRFR09SSUVTIEZST00gQUxMIFBST0RVQ1RTIElOVE8gQ0FUUyBBUlJBWVxuICB2YXIgY2F0cyA9IFtdO1xuICAoZnVuY3Rpb24gZ2V0Q2F0ZWdvcmllcygpIHtcbiAgXHRhbGxQcm9kdWN0cy5mb3JFYWNoKGZ1bmN0aW9uKHByb2R1Y3QpIHtcbiAgXHRcdHByb2R1Y3QuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gIFx0XHRcdGNhdHMucHVzaChjYXRlZ29yeSk7XG4gIFx0XHR9KVxuICBcdH0pO1xuICB9KSgpO1xuXG4gIC8vIE1BS0VTIFNVUkUgVEhFUkUgQVJFIE5PIERVUExJQ0FURSBDQVRFR09SSUVTIEFORCBQVVRTIFRIRU0gSU5UTyAkU0NPUEUuQ0FURUdPUklFU1xuICAkc2NvcGUuY2F0ZWdvcmllcyA9IFtdO1xuICAoZnVuY3Rpb24gY2xlYW5DYXRlZ29yaWVzKCkge1xuICBcdGNhdHMuZm9yRWFjaChmdW5jdGlvbihjYXRlZ29yeSkge1xuICBcdFx0aWYgKCRzY29wZS5jYXRlZ29yaWVzLmluZGV4T2YoY2F0ZWdvcnkpID09PSAtMSkge1xuICBcdFx0XHQkc2NvcGUuY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcbiAgXHRcdH1cbiAgXHR9KTtcbiAgfSkoKTtcblxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICBcdGFsbFByb2R1Y3RzOiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSkge1xuXHRcdFx0XHRyZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0QWxsUHJvZHVjdHMoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3RzKXtcbiAgICAgICAgICAgICAgICAgICAgcHJvZHVjdHMgPSBwcm9kdWN0cy5maWx0ZXIoZnVuY3Rpb24ocHJvZHVjdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHByb2R1Y3Quc2VsbGVyID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZHVjdHM7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgXHR9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGlmKHVzZXIuaXNBZG1pbikgJHN0YXRlLmdvKCdhZG1pbicpXG4gICAgICAgICAgICBlbHNlIGlmICh1c2VyLnBhc3N3b3JkUmVzZXQpICRzdGF0ZS5nbygncGFzc3dvcmRSZXNldCcsIHtpZDogdXNlci5faWR9KVxuICAgICAgICAgICAgZWxzZSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuY29udHJvbGxlcignUGFzc3dvcmRSZXNldEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIHVzZXJUb1Jlc2V0UGFzc3dvcmQsICRzdGF0ZSwgVXNlckZhY3RvcnkpIHtcblxuICAkc2NvcGUudXNlciA9IHVzZXJUb1Jlc2V0UGFzc3dvcmQ7XG5cbiAgJHNjb3BlLnVwZGF0ZSA9IHtwYXNzd29yZFJlc2V0OiBmYWxzZX07XG5cbiAgJHNjb3BlLnVwZGF0ZVBhc3N3b3JkID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gVXNlckZhY3RvcnkudXBkYXRlVXNlcigkc2NvcGUudXNlci5faWQsICRzY29wZS51cGRhdGUpXG4gICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgfSlcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Bhc3N3b3JkUmVzZXQnLCB7XG4gICAgICAgIHVybDogJy91c2VyLXByb2ZpbGUvcmVzZXQtcGFzc3dvcmQvOmlkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9wYXNzd29yZC5yZXNldC50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Bhc3N3b3JkUmVzZXRDdHJsJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgdXNlclRvUmVzZXRQYXNzd29yZDogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCBVc2VyRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVc2VyRmFjdG9yeS5nZXRVc2VyKCRzdGF0ZVBhcmFtcy5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSwgJG1kRGlhbG9nKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdhYm91dCcgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnRG9jdW1lbnRhdGlvbicsIHN0YXRlOiAnZG9jcycgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHNjb3BlLmFkbWluSXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0FkbWluIDo6IFByb2R1Y3RzJywgc3RhdGU6ICdhZG1pbicsIGF1dGg6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWRtaW4gOjogVXNlcnMnLCBzdGF0ZTogJ2FkbWluVXNlcicsIGF1dGg6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWRtaW4gOjogT3JkZXJzJywgc3RhdGU6ICdhZG1pbk9yZGVyJywgYXV0aDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBZG1pbiA6OiBBZGQgUHJvZHVjdCcsIHN0YXRlOiAnYWRtaW5DcmVhdGVQcm9kdWN0JywgYXV0aDogdHJ1ZSB9LFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8gc2NvcGUuZ29Ub0NyZWF0ZVN0b3JlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCdGVU5DVElPTiBSQU4nKVxuICAgICAgICAgICAgLy8gICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VzZXIgaW4gbmF2YmFyLmpzJywgdXNlcilcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICBzY29wZS5nb1RvU3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdzZWxsZXJIb21lJywge3NlbGxlcklkOiBzY29wZS51c2VyLl9pZH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgICAgICB2YXIgb3JpZ2luYXRvckV2O1xuICAgICAgICAgICAgc2NvcGUub3Blbk1lbnUgPSBmdW5jdGlvbigkbWRPcGVuTWVudSwgZXYpIHtcbiAgICAgICAgICAgICAgb3JpZ2luYXRvckV2ID0gZXY7XG4gICAgICAgICAgICAgICRtZE9wZW5NZW51KGV2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzY29wZS5hbm5vdW5jZUNsaWNrID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgJG1kRGlhbG9nLnNob3coXG4gICAgICAgICAgICAgICAgJG1kRGlhbG9nLmFsZXJ0KClcbiAgICAgICAgICAgICAgICAgIC50aXRsZSgnWW91IGNsaWNrZWQhJylcbiAgICAgICAgICAgICAgICAgIC50ZXh0Q29udGVudCgnWW91IGNsaWNrZWQgdGhlIG1lbnUgaXRlbSBhdCBpbmRleCAnICsgaW5kZXgpXG4gICAgICAgICAgICAgICAgICAub2soJ05pY2UnKVxuICAgICAgICAgICAgICAgICAgLnRhcmdldEV2ZW50KG9yaWdpbmF0b3JFdilcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgb3JpZ2luYXRvckV2ID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmRlbW8gPSB7XG4gICAgICAgICAgICAgICAgICBzaG93VG9vbHRpcCA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgdGlwRGlyZWN0aW9uIDogJydcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgc2NvcGUuZGVtby5kZWxheVRvb2x0aXAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGVtby5kZWxheVRvb2x0aXAnLGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmRlbW8uZGVsYXlUb29sdGlwID0gcGFyc2VJbnQodmFsLCAxMCkgfHwgMDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgnZGVtby50aXBEaXJlY3Rpb24nLGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIGlmICh2YWwgJiYgdmFsLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmRlbW8uc2hvd1Rvb2x0aXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTtcblxuIiwiYXBwLmNvbnRyb2xsZXIoJ05hdmJhckZpbHRlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyRmlsdGVyJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9uYXZiYXJGaWx0ZXIvbmF2YmFyRmlsdGVyLmh0bWwnXG4gICAgICAgIC8vIGNvbnRyb2xsZXI6ICdOYXZiYXJGaWx0ZXJDdHJsJ1xuICAgIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuZGlyZWN0aXZlKCdvYXV0aEJ1dHRvbicsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcblx0XHRzY29wZToge1xuXHRcdFx0cHJvdmlkZXJOYW1lOiAnQCcsXG4gICAgICAgICAgICB2ZXJiOiAnQCdcblx0XHR9LFxuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGVVcmw6ICcvanMvb2F1dGgtYnV0dG9uL29hdXRoLWJ1dHRvbi5odG1sJ1xuXHR9XG59KTtcbiIsImFwcC5jb250cm9sbGVyKCdDYXJ0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBPcmRlckZhY3RvcnksICR0aW1lb3V0LCAkcSwgJGxvZykge1xuXG4kc2NvcGUuY2FydCA9IE9yZGVyRmFjdG9yeS5nZXRDYXJ0Q2FjaGUoKTtcblxuJHNjb3BlLmNoZWNrQ2FydEVtcHR5ID0gZnVuY3Rpb24oKXtcbiAgaWYgKCRzY29wZS5jYXJ0LmNhcnRUb3RhbCA9PT0gMCkgcmV0dXJuIHRydWU7XG4gIGVsc2UgcmV0dXJuIGZhbHNlO1xufVxuXG4gJHNjb3BlLmNoZWNrb3V0ID0gZnVuY3Rpb24oKXtcbiAgICAvLyBpZiAoJHNjb3BlLmNhcnQucHJvZHVjdHMubGVuZ3RoID4gMCkgJHN0YXRlLmdvKCdjaGVja291dCcpO1xuICAgICRzdGF0ZS5nbygnY2hlY2tvdXQnKTtcbiAgfVxuXG4gICRzY29wZS5hZGQgPSBmdW5jdGlvbihwcm9kdWN0SWQpe1xuICAgIE9yZGVyRmFjdG9yeS5hZGRUb0NhcnQocHJvZHVjdElkLCAxKVxuICAgIC50aGVuKGZ1bmN0aW9uKHVwZGF0ZWRDYXJ0KXtcbiAgICB9KVxuICAgIC5jYXRjaCgkbG9nLmVycm9yKVxuICB9XG5cbiAgJHNjb3BlLnN1YnRyYWN0ID0gZnVuY3Rpb24ocHJvZHVjdElkKXtcbiAgICBjb25zb2xlLmxvZygncHJvZHVjdElkJywgcHJvZHVjdElkKTtcbiAgICBjb25zb2xlLmxvZygnY2FydC5wcm9kdWN0c1swXS5wcm9kdWN0Ll9pZCcsICRzY29wZS5jYXJ0LnByb2R1Y3RzWzBdKTtcbiAgICBPcmRlckZhY3RvcnkucmVtb3ZlT25lRnJvbUNhcnQocHJvZHVjdElkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHVwZGF0ZWRDYXJ0KXtcbiAgICB9KVxuICAgIC5jYXRjaCgkbG9nLmVycm9yKVxuICB9XG5cbiAgJHNjb3BlLnJlbW92ZSA9IGZ1bmN0aW9uKHByb2R1Y3RJZCl7XG4gICAgT3JkZXJGYWN0b3J5LnJlbW92ZUZyb21DYXJ0KHByb2R1Y3RJZClcbiAgICAudGhlbihmdW5jdGlvbih1cGRhdGVkQ2FydCl7XG4gICAgICBpZiAodXBkYXRlZENhcnQuY2FydFRvdGFsID09PSAwKSAkc2NvcGUuY2FydC5jYXJ0VG90YWwgPSAwO1xuICAgICAgJHNjb3BlLmNoZWNrQ2FydEVtcHR5KCk7XG4gICAgfSlcbiAgICAuY2F0Y2goJGxvZy5lcnJvcilcbiAgfVxuXG59KTtcbiIsIi8vIGNoZWNrb3V0LmNvbnRyb2xsZXIuanNcblxuYXBwLmNvbnRyb2xsZXIoJ0NoZWNrb3V0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBPcmRlckZhY3RvcnksICR0aW1lb3V0LCAkcSwgJGxvZykge1xuICBcbiAgJHNjb3BlLmNhcnQgPSBPcmRlckZhY3RvcnkuZ2V0Q2FydENhY2hlKCk7XG4gIFxuICAkc2NvcGUuZWRpdE9yZGVyID0gZnVuY3Rpb24oKXtcbiAgICAkc3RhdGUuZ28oJ2NhcnQnKTtcbiAgfVxuXG4gXG4gIC8vICRzY29wZS5jb25maXJtID0gZnVuY3Rpb24oKXtcbiAgLy8gICB2YXIgY2FydCA9ICRzY29wZS5jYXJ0O1xuICAvLyAgIHZhciBvcmRlcklkID0gJHNjb3BlLmNhcnQuX2lkO1xuICAvLyAgIHJldHVybiBPcmRlckZhY3RvcnkuY2hhbmdlU3RhdHVzKCdjb21wbGV0ZScsIG9yZGVySWQpXG4gIC8vICAgLnRoZW4oZnVuY3Rpb24ob3JkZXIpe1xuICAvLyAgICAgICAkc3RhdGUuZ28oJ2NvbXBsZXRlJywge2lkOiBvcmRlci5faWR9KTtcbiAgLy8gICB9KSAgICBcbiAgLy8gfVxuXG5cbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0NvbXBsZXRlQ3RybCcsIGZ1bmN0aW9uKHJlY2VudE9yZGVyLCAkc3RhdGUsICRzY29wZSwgT3JkZXJGYWN0b3J5LCAkdGltZW91dCwgJHEsICRsb2csIGxvZ2dlZEluVXNlcikge1xuXG5cdCRzY29wZS5jb21wbGV0ZSA9IHJlY2VudE9yZGVyO1xuXHQkc2NvcGUubG9nZ2VkSW5Vc2VyID0gbG9nZ2VkSW5Vc2VyIHx8IG51bGw7XG59KTsiLCJjb3JlLmZhY3RvcnkoJ09yZGVyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblxuICAgIHZhciBPcmRlckZhY3RvcnkgPSB7fTtcblxuICAgIHZhciBjYWNoZWRDYXJ0ID0ge307XG5cblxuICAgIE9yZGVyRmFjdG9yeS5nZXRDYXJ0Q2FjaGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZyhjYWNoZWRDYXJ0KTtcbiAgICAgICAgcmV0dXJuIGNhY2hlZENhcnQ7XG4gICAgfVxuXG4gICAgT3JkZXJGYWN0b3J5LmdldENhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy9nZXRDYXJ0JylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY2FydCl7XG4gICAgICAgICAgICB2YXIgY2FydCA9IGNhcnQuZGF0YTtcbiAgICAgICAgICAgIGlmICgoIWNhcnQucHJvZHVjdHMpIHx8IChjYXJ0ICYmIGNhcnQucHJvZHVjdHMubGVuZ3RoIDwgMSkpIHtcbiAgICAgICAgICAgICAgICBjYWNoZWRDYXJ0LmNhcnRUb3RhbCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENhcnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJpY2VBcnIgPSBjYXJ0LnByb2R1Y3RzLm1hcCgocHJvZHVjdCk9PntyZXR1cm4gcHJvZHVjdC5xdWFudGl0eSAqIHByb2R1Y3QucHJvZHVjdC5wcmljZX0pO1xuICAgICAgICAgICAgICAgIHByaWNlQXJyLmZvckVhY2goKHByaWNlLCBpbmRleCk9PntjYXJ0LnByb2R1Y3RzW2luZGV4XVsncHJvZHVjdFRvdGFsJ10gPSBwcmljZX0pO1xuICAgICAgICAgICAgICAgIGNhcnQuY2FydFRvdGFsID0gcHJpY2VBcnIucmVkdWNlKChwLGMpPT57cmV0dXJuIHArYzsgfSk7XG4gICAgICAgICAgICAgICAgYW5ndWxhci5jb3B5KGNhcnQsIGNhY2hlZENhcnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZWRDYXJ0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgT3JkZXJGYWN0b3J5LmdldFJlY2VudENvbXBsZXRlID0gZnVuY3Rpb24ob3JkZXJJZCl7XG4gICAgICAgIGNhY2hlZENhcnQgPSB7fTtcbiAgICAgICAgY29uc29sZS5sb2coJ2FmdGVyIGNhY2hlIGNsZWFyZWQnLCBjYWNoZWRDYXJ0KVxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy9nZXRSZWNlbnRDb21wbGV0ZS8nICsgb3JkZXJJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVjZW50Q29tcGxldGUpe1xuICAgICAgICAgICAgdmFyIG9yZGVyID0gcmVjZW50Q29tcGxldGUuZGF0YTtcbiAgICAgICAgICAgIHZhciBwcmljZUFyciA9IG9yZGVyLnByb2R1Y3RzLm1hcCgocHJvZHVjdCk9PntyZXR1cm4gcHJvZHVjdC5xdWFudGl0eSAqIHByb2R1Y3QuZmluYWxQcmljZX0pO1xuICAgICAgICAgICAgcHJpY2VBcnIuZm9yRWFjaCgocHJpY2UsIGluZGV4KT0+e29yZGVyLnByb2R1Y3RzW2luZGV4XVsncHJvZHVjdFRvdGFsJ10gPSBwcmljZX0pO1xuICAgICAgICAgICAgb3JkZXIub3JkZXJUb3RhbCA9IHByaWNlQXJyLnJlZHVjZSgocCxjKT0+e3JldHVybiBwK2M7IH0pO1xuICAgICAgICAgICAgcmV0dXJuIG9yZGVyO1xuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgT3JkZXJGYWN0b3J5LmdldENvbXBsZXRlT3JkZXJzQnlVc2VyID0gZnVuY3Rpb24odXNlcklkKXtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMvZ2V0Q29tcGxldGUvJyArIHVzZXJJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29tcGxldGVPcmRlcnMpe1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBsZXRlT3JkZXJzLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuICAgICBPcmRlckZhY3RvcnkuZ2V0QWxsQ29tcGxldGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy9nZXRBbGxDb21wbGV0ZS8nKVxuICAgICAgICAudGhlbihmdW5jdGlvbihhbGxDb21wbGV0ZXMpe1xuICAgICAgICAgICAgcmV0dXJuIGFsbENvbXBsZXRlcy5kYXRhO1xuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgT3JkZXJGYWN0b3J5LmdldFBhc3RPcmRlcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy8nKVxuICAgICAgICAudGhlbihmdW5jdGlvbihvcmRlcil7XG4gICAgICAgICAgICB2YXIgb3JkZXJBcnIgPSBvcmRlci5kYXRhO1xuICAgICAgICAgICAgcmV0dXJuIG9yZGVyQXJyLmZpbHRlcihmdW5jdGlvbihvcmRlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChvcmRlci5zdGF0dXMgPT09ICdjb21wbGV0ZScgfHwgb3JkZXIuc3RhdHVzID09PSAnY2FuY2VsbGVkJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbHRlcmVkT3JkZXIpe1xuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkT3JkZXI7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2FjaGUocHJvZHVjdElkLCBudW1iZXIpe1xuICAgICAgICBjYWNoZWRDYXJ0LnByb2R1Y3RzLmZvckVhY2goKGVsZW0sIGluZGV4KT0+e1xuICAgICAgICAgIGNhY2hlZENhcnQucHJvZHVjdHNbaW5kZXhdLnByb2R1Y3RUb3RhbCA9IGVsZW0ucXVhbnRpdHkgKiBlbGVtLnByb2R1Y3QucHJpY2VcbiAgICAgICAgfSlcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2luIHVwZGF0ZSBjYWNoZScpXG4gICAgICAgIC8vIHZhciBhcnIgPSBjYWNoZWRDYXJ0LnByb2R1Y3RzLm1hcChwcm9kdWN0Q2hpbGQgPT4gcHJvZHVjdENoaWxkLnByb2R1Y3QuX2lkKTtcbiAgICAgICAgLy8gdmFyIGluZGV4ID0gYXJyLmluZGV4T2YocHJvZHVjdElkKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJpbiBjYWNoZWQgY2FydC5wcm9kdWN0c1wiLCBjYWNoZWRDYXJ0LnByb2R1Y3RzLCBpbmRleCwgcHJvZHVjdElkIClcbiAgICAgICAgLy8gaWYgKGluZGV4ID09PSAtMSl7XG4gICAgICAgIC8vICAgYW5ndWxhci5jb3B5KGNhcnQuZGF0YSwgY2FjaGVkQ2FydClcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBlbHNlIHtcbiAgICAgICAgLy8gY2FjaGVkQ2FydC5wcm9kdWN0c1tpbmRleF0ucXVhbnRpdHkrPW51bWJlcjtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBjYWNoZWRDYXJ0LnByb2R1Y3RzW2luZGV4XS5wcm9kdWN0VG90YWwgPSBjYWNoZWRDYXJ0LnByb2R1Y3RzW2luZGV4XS5xdWFudGl0eSAqIGNhY2hlZENhcnQucHJvZHVjdHNbaW5kZXhdLnByb2R1Y3QucHJpY2U7XG4gICAgICAgIHZhciBhcnIgPSBjYWNoZWRDYXJ0LnByb2R1Y3RzLm1hcChmdW5jdGlvbihwcm9kdWN0KXtyZXR1cm4gcHJvZHVjdC5xdWFudGl0eSAqIHByb2R1Y3QucHJvZHVjdC5wcmljZX0pO1xuICAgICAgICBjYWNoZWRDYXJ0LmNhcnRUb3RhbCA9IGFyci5yZWR1Y2UoZnVuY3Rpb24ocCxjKXtyZXR1cm4gcCtjfSk7XG4gICAgfVxuXG4gICAgLy9XSUxMIEFERCBUTyBDQVJUIE9SIENSRUFURSBDQVJUIElGIERPRVNOJ1QgQUxSRUFEWSBFWElTVFxuICAgIE9yZGVyRmFjdG9yeS5hZGRUb0NhcnQgPSBmdW5jdGlvbihwcm9kdWN0SWQsIHF1YW50aXR5KXtcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9vcmRlcnMvYWRkVG9DYXJ0LycgKyBwcm9kdWN0SWQsIHtxdWFudGl0eTogcXVhbnRpdHl9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihjYXJ0KXtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2FjaGVkIGNhcnRcIiwgY2FjaGVkQ2FydClcbiAgICAgICAgICAgIC8vIGlmKCFjYWNoZWRDYXJ0LnByb2R1Y3RzKXtcbiAgICAgICAgICAgIC8vICBhbmd1bGFyLmNvcHkoY2FydC5kYXRhLCBjYWNoZWRDYXJ0KVxuICAgICAgICAgICAgLy8gIGNvbnNvbGUubG9nKFwiaW4gYW5ndWxhciBjb3B5XCIsIGNhY2hlZENhcnQpXG4gICAgICAgICAgICAvLyAgcmV0dXJuIGNhY2hlZENhcnRcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGVsc2Uge1xuICAgICAgICAgICAgICBhbmd1bGFyLmNvcHkoY2FydC5kYXRhLCBjYWNoZWRDYXJ0KVxuICAgICAgICAgICAgICB1cGRhdGVDYWNoZShwcm9kdWN0SWQsIHF1YW50aXR5KTtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENhcnQ7XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIE9yZGVyRmFjdG9yeS5hZGRUb0NhcnRGcm9tUHJvZHVjdCA9IGZ1bmN0aW9uKHByb2R1Y3RJZCwgcXVhbnRpdHkpe1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy9hZGRUb0NhcnQvJyArIHByb2R1Y3RJZCwge3F1YW50aXR5OiBxdWFudGl0eX0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNhcnQpe1xuICAgICAgICAgICAgcmV0dXJuIGNhcnQuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgT3JkZXJGYWN0b3J5LnJlbW92ZU9uZUZyb21DYXJ0ID0gZnVuY3Rpb24ocHJvZHVjdElkKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3Byb2R1Y3QgaWQgaW4gcmVtb3ZlIG9uZSBmcm9tIGNhcicsIHByb2R1Y3RJZClcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9vcmRlcnMvcmVtb3ZlT25lRnJvbUNhcnQvJyArIHByb2R1Y3RJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY2FydCl7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuY29weShjYXJ0LmRhdGEsIGNhY2hlZENhcnQpXG4gICAgICAgICAgICB1cGRhdGVDYWNoZShwcm9kdWN0SWQsIC0xKTtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDYXJ0O1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIE9yZGVyRmFjdG9yeS5yZW1vdmVGcm9tQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3RJZCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYWNoZWRDYXJ0IGluIHJlbW92ZWZyb20gY2FydCBmYWN0b3J5JywgY2FjaGVkQ2FydCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvb3JkZXJzL3JlbW92ZUZyb21DYXJ0LycgKyBwcm9kdWN0SWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNhcnQpe1xuICAgICAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPCBjYWNoZWRDYXJ0LnByb2R1Y3RzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjYWNoZWRDYXJ0LnByb2R1Y3RzW2ldLnByb2R1Y3QuX2lkKVxuICAgICAgICAgICAgICAgIGlmIChjYWNoZWRDYXJ0LnByb2R1Y3RzW2ldLnByb2R1Y3QuX2lkID09PSBwcm9kdWN0SWQpIGluZGV4ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbmRleCcsIGluZGV4KVxuICAgICAgICAgICAgY2FjaGVkQ2FydC5jYXJ0VG90YWwgLT0gY2FjaGVkQ2FydC5wcm9kdWN0c1tpbmRleF0ucHJvZHVjdFRvdGFsO1xuICAgICAgICAgICAgY2FjaGVkQ2FydC5wcm9kdWN0cy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2FydDtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBPcmRlckZhY3RvcnkuY2hhbmdlU3RhdHVzID0gZnVuY3Rpb24obmV3U3RhdHVzLCBvcmRlcklkKXtcbiAgICAgICAgY2FjaGVkQ2FydCA9IHt9O1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy9jaGFuZ2VTdGF0dXMvJyArIG9yZGVySWQgKyAnLycgKyBuZXdTdGF0dXMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVwZGF0ZWRPcmRlcil7XG4gICAgICAgICAgICByZXR1cm4gdXBkYXRlZE9yZGVyLmRhdGE7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIE9yZGVyRmFjdG9yeTtcbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjYXJ0Jywge1xuICAgICAgICB1cmw6ICcvY2FydCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvb3JkZXJzL2NhcnQudGVtcGxhdGUuaHRtbCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGJhY2tFbmRDYXJ0OiBmdW5jdGlvbihPcmRlckZhY3Rvcnkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZ2V0Q2FydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FydEN0cmwnXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2hlY2tvdXQnLCB7XG4gICAgICAgIHVybDogJy9jaGVja291dCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvb3JkZXJzL2NoZWNrb3V0LnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBjYXJ0OiBmdW5jdGlvbihPcmRlckZhY3Rvcnkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZ2V0Q2FydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hlY2tvdXRDdHJsJ1xuICAgIH0pO1xufSk7XG5cblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY29tcGxldGUnLCB7XG4gICAgICAgIHVybDogJy9jb21wbGV0ZS86aWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL29yZGVycy9jb21wbGV0ZS50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgcmVjZW50T3JkZXI6IGZ1bmN0aW9uKE9yZGVyRmFjdG9yeSwgJHN0YXRlUGFyYW1zLCAkc3RhdGUpe1xuICAgICAgICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZ2V0UmVjZW50Q29tcGxldGUoJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2dnZWRJblVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDb21wbGV0ZUN0cmwnXG4gICAgfSk7XG59KTtcblxuIiwiYXBwLmNvbnRyb2xsZXIoJ1Byb2R1Y3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBPcmRlckZhY3RvcnksICRtZERpYWxvZywgJHN0YXRlKSB7XG5cblx0JHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3RJZCkge1xuXHRcdE9yZGVyRmFjdG9yeS5hZGRUb0NhcnRGcm9tUHJvZHVjdChwcm9kdWN0SWQpXG5cdFx0LnRoZW4oZnVuY3Rpb24oY2FydCkge1xuXHRcdFx0Y29uc29sZS5sb2coY2FydCk7XG5cdFx0fSk7XG5cdH07XG5cblxuICAgICRzY29wZS5zaG93Q29uZmlybSA9IGZ1bmN0aW9uKGV2LCBwcm9kdWN0KSB7XG4gICAgLy8gQXBwZW5kaW5nIGRpYWxvZyB0byBkb2N1bWVudC5ib2R5IHRvIGNvdmVyIHNpZGVuYXYgaW4gZG9jcyBhcHBcbiAgICB2YXIgY29uZmlybSA9ICRtZERpYWxvZy5jb25maXJtKClcbiAgICAgICAgICAudGl0bGUoJ1lvdSBqdXN0IGFkZGVkICcgKyBwcm9kdWN0LnRpdGxlICsgJyB0byB5b3VyIGNhcnQhJylcbiAgICAgICAgICAudGV4dENvbnRlbnQoJ1lvdSBhcmUgb24geW91ciB3YXkgdG8gJyArIHByb2R1Y3QubG9jYXRpb24gKyAnIScpXG4gICAgICAgICAgLmFyaWFMYWJlbCgnTHVja3kgZGF5JylcbiAgICAgICAgICAudGFyZ2V0RXZlbnQoZXYpXG4gICAgICAgICAgLm9rKCdLZWVwIFNob3BwaW5nJylcbiAgICAgICAgICAuY2FuY2VsKCdHbyB0byBDYXJ0Jyk7XG5cbiAgICAkbWREaWFsb2cuc2hvdyhjb25maXJtKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocHJvZHVjdC5zZWxsZXIgPT09IG51bGwpIHZhciBuZXdTdGF0ZSA9ICdob21lJztcbiAgICAgICAgZWxzZSBuZXdTdGF0ZSA9ICdzZWxsZXInXG4gICAgICAkc3RhdGUuZ28obmV3U3RhdGUsIHtzZWxsZXJJZDogcHJvZHVjdC5zZWxsZXJ9KTtcbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICRzdGF0ZS5nbygnY2FydCcpO1xuICAgIH0pO1xuICB9O1xuXG5cblxuXG59KVxuXG4iLCJhcHAuZGlyZWN0aXZlKCdwcm9kdWN0Q2FyZCcsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvcHJvZHVjdC9wcm9kdWN0LnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUHJvZHVjdEN0cmwnXG4gICAgfVxufSk7XG4iLCJjb3JlLmZhY3RvcnkoJ1Byb2R1Y3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuICAgIHJldHVybiB7XG4gICAgICAgIGdldEFsbFByb2R1Y3RzOiBmdW5jdGlvbihzZWxsZXJJZCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2VsbGVySUQ6ICcsIHNlbGxlcklkKVxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9kdWN0LycpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihwcm9kdWN0cyl7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxsZXJJZCkgcmV0dXJuIHByb2R1Y3RzLmRhdGE7XG4gICAgICAgICAgICAgICAgdmFyIHByb2R1Y3RzID0gcHJvZHVjdHMuZGF0YTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHJvZHVjdHMgYmVmb3JlIGZpbHRlcjogJywgcHJvZHVjdHMpO1xuICAgICAgICAgICAgICAgIHByb2R1Y3RzID0gcHJvZHVjdHMuZmlsdGVyKGZ1bmN0aW9uKHByb2R1Y3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChwcm9kdWN0LnNlbGxlciA9PT0gc2VsbGVySWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHByb2R1Y3RzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZHVjdHM7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICBnZXRPbmVQcm9kdWN0OiBmdW5jdGlvbihwcm9kdWN0SWQpe1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9kdWN0LycgKyBwcm9kdWN0SWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihwcm9kdWN0KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZHVjdC5kYXRhXG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZVByb2R1Y3Q6IGZ1bmN0aW9uKHByb2R1Y3RJZCwgdXBkYXRlKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3QvJyArIHByb2R1Y3RJZCxcbiAgICAgICAgICAgICAgICBkYXRhOiB1cGRhdGVcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlUHJvZHVjdDogZnVuY3Rpb24oY3JlYXRlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbiBwcm9kdWN0IGZhY3RvcnkuIGNyZWF0ZTogJywgY3JlYXRlKVxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3QnLFxuICAgICAgICAgICAgICAgIGRhdGE6IGNyZWF0ZVxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2luIHByb2R1Y3QgZmFjdG9yeSwgY3JlYXRlZCBwcm9kdWN0OiAnLCByZXNwb25zZS5kYXRhKVxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlUHJvZHVjdDogZnVuY3Rpb24ocHJvZHVjdElkKXtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL3Byb2R1Y3QvJysgcHJvZHVjdElkXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICAvLyByZWR1bmRhbnQgcGF0aHNcbiAgICAgICAgZ2V0QnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpZCBpbiBnZXRCeUlkJyxpZCk7XG4gICAgICAgIFx0cmV0dXJuICRodHRwLmdldCgnYXBpL3Byb2R1Y3QvJyArIGlkKVxuICAgICAgICBcdC50aGVuKGZ1bmN0aW9uKHByb2R1Y3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHJvZHVjdCBpbiBnZXRCeUlkJywgcHJvZHVjdClcbiAgICAgICAgXHRcdHJldHVybiBwcm9kdWN0LmRhdGE7XG4gICAgICAgIFx0fSk7XG5cbiAgICAgICAgfVxuICAgIH1cbn0pXG4iLCJhcHAuY29udHJvbGxlcignUHJvZHVjdERldGFpbCcsIGZ1bmN0aW9uKCRzdGF0ZSwgJHNjb3BlLCBQcm9kdWN0RmFjdG9yeSwgJHN0YXRlUGFyYW1zLCBSZXZpZXdGYWN0b3J5LCBVc2VyRmFjdG9yeSwgc2luZ2xlUHJvZHVjdCwgT3JkZXJGYWN0b3J5LCAkbWREaWFsb2cpIHtcblx0Y29uc29sZS5sb2coJ3NpbmdsZVByb2R1Y3QnLHNpbmdsZVByb2R1Y3QpXG5cdCRzY29wZS5wcm9kdWN0ID0gc2luZ2xlUHJvZHVjdDtcblxuXHRSZXZpZXdGYWN0b3J5LmdldFByb2R1Y3RSZXZpZXdzKCRzdGF0ZVBhcmFtcy5wcm9kdWN0SWQpXG5cdC50aGVuKGZ1bmN0aW9uKHJldmlld3MpIHtcblx0XHQkc2NvcGUucmV2aWV3cyA9IHJldmlld3M7XG5cdFx0JHNjb3BlLnRvdGFsUmV2aXdSYXRpbmcgPSAwOyBcblx0XHRyZXZpZXdzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xuXHRcdFx0JHNjb3BlLnRvdGFsUmV2aXdSYXRpbmcgKz0gZWxlbS5yYXRpbmc7XG5cdFx0fSk7XG5cdFx0JHNjb3BlLnRvdGFsUmV2aWV3UmF0aW5nID0gTWF0aC5yb3VuZCgkc2NvcGUudG90YWxSZXZpd1JhdGluZy9yZXZpZXdzLmxlbmd0aCk7XG5cdFx0KGZ1bmN0aW9uIG51bVJldmlld3MoKSB7XG5cdFx0XHRpZiAocmV2aWV3cy5sZW5ndGggPT09IDEpICRzY29wZS5udW1SZXZpZXdzID0gJ3Jldmlldydcblx0XHRcdGVsc2UgJHNjb3BlLm51bVJldmlld3MgPSAncmV2aWV3cyc7XG5cblx0XHRcdGlmIChyZXZpZXdzLmxlbmd0aCA9PT0gMCkgJHNjb3BlLnJldmlld3NQcmVzZW50ID0gZmFsc2Vcblx0XHRcdGVsc2UgJHNjb3BlLnJldmlld3NQcmVzZW50ID0gdHJ1ZTtcblx0XHR9KSgpO1xuXHR9KTsgXG5cblx0JHNjb3BlLmJpZ0ltZ1NyYyA9ICRzY29wZS5wcm9kdWN0LmltYWdlc1swXTtcblx0JHNjb3BlLnNldEJpZ0ltZyA9IGZ1bmN0aW9uKGltZykge1xuXHRcdCRzY29wZS5iaWdJbWdTcmMgPSBpbWc7XG5cdH07XG5cblx0JHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3RJRCwgcXVhbnRpdHkpIHtcblx0XHR2YXIgcXVhbnRpdHkgPSBxdWFudGl0eSB8fCAxO1xuXHRcdE9yZGVyRmFjdG9yeS5hZGRUb0NhcnRGcm9tUHJvZHVjdChwcm9kdWN0SUQsIHF1YW50aXR5KVxuXHRcdC50aGVuKGZ1bmN0aW9uKGNhcnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdjYXJ0IGZyb20gQ3RybDonLCBjYXJ0KTtcblx0XHR9KTtcblx0fTtcblxuXG5cdGZ1bmN0aW9uIGluaXRpYWxpemVfZ21hcHMoKSB7XG5cdCAgICAvLyBpbml0aWFsaXplIG5ldyBnb29nbGUgbWFwcyBMYXRMbmcgb2JqZWN0XG5cblx0ICAgIC8vIFVTRSBQUk9EVUNULkNPT1JESU5BVEVTIElOIFRIRSBGT0xMT1dJTkcgTElORSBGT1IgTEFUL0xPTkdcblx0ICAgIHZhciBteUxhdGxuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc2luZ2xlUHJvZHVjdC5jb29yZGluYXRlc1swXSxzaW5nbGVQcm9kdWN0LmNvb3JkaW5hdGVzWzFdKTtcblx0ICAgIC8vIHNldCB0aGUgbWFwIG9wdGlvbnMgaGFzaFxuXHQgICAgdmFyIG1hcE9wdGlvbnMgPSB7XG5cdCAgICAgICAgY2VudGVyOiBteUxhdGxuZyxcblx0ICAgICAgICB6b29tOiA1LFxuXHQgICAgICAgIG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVBcblx0ICAgIH07XG5cdCAgICAvLyBnZXQgdGhlIG1hcHMgZGl2J3MgSFRNTCBvYmpcblx0ICAgIHZhciBtYXBfY2FudmFzX29iaiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFwLWNhbnZhc1wiKTtcblx0ICAgIGNvbnNvbGUubG9nKG1hcF9jYW52YXNfb2JqKTtcblx0ICAgIC8vIGluaXRpYWxpemUgYSBuZXcgR29vZ2xlIE1hcCB3aXRoIHRoZSBvcHRpb25zXG5cdCAgICB2YXIgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBfY2FudmFzX29iaiwgbWFwT3B0aW9ucyk7XG5cdCAgICAvLyBBZGQgdGhlIG1hcmtlciB0byB0aGUgbWFwXG5cdCAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG5cdCAgICAgICAgcG9zaXRpb246IG15TGF0bG5nLFxuXHQgICAgICAgIHRpdGxlOlwiSGVsbG8gV29ybGQhXCJcblx0ICAgIH0pO1xuXHQgICAgLy8gQWRkIHRoZSBtYXJrZXIgdG8gdGhlIG1hcCBieSBjYWxsaW5nIHNldE1hcCgpXG5cdCAgICBtYXJrZXIuc2V0TWFwKG1hcCk7XG5cdH07XG5cbiAgICAkc2NvcGUucnVuTWFwID0gaW5pdGlhbGl6ZV9nbWFwcztcblxuICAgICRzY29wZS5udW1iZXJzID0gWzEsMiwzLDQsNSw2LDcsOCw5LDEwXTtcblxuXG4gICAgJHNjb3BlLnNob3dDb25maXJtID0gZnVuY3Rpb24oZXYsIHByb2R1Y3QpIHtcbiAgICAvLyBBcHBlbmRpbmcgZGlhbG9nIHRvIGRvY3VtZW50LmJvZHkgdG8gY292ZXIgc2lkZW5hdiBpbiBkb2NzIGFwcFxuICAgIHZhciBjb25maXJtID0gJG1kRGlhbG9nLmNvbmZpcm0oKVxuICAgICAgICAgIC50aXRsZSgnWW91IGp1c3QgYWRkZWQgJyArIHByb2R1Y3QudGl0bGUgKyAnIHRvIHlvdXIgY2FydCEnKVxuICAgICAgICAgIC50ZXh0Q29udGVudCgnWW91IGFyZSBvbiB5b3VyIHdheSB0byAnICsgcHJvZHVjdC5sb2NhdGlvbiArICchJylcbiAgICAgICAgICAuYXJpYUxhYmVsKCdMdWNreSBkYXknKVxuICAgICAgICAgIC50YXJnZXRFdmVudChldilcbiAgICAgICAgICAub2soJ0tlZXAgU2hvcHBpbmcnKVxuICAgICAgICAgIC5jYW5jZWwoJ0dvIHRvIENhcnQnKTtcblxuXHQgICAgJG1kRGlhbG9nLnNob3coY29uZmlybSkudGhlbihmdW5jdGlvbigpIHtcblx0ICBcdFx0JHN0YXRlLmdvKCdwcm9kdWN0RGV0YWlsJywge3Byb2R1Y3RJZDogcHJvZHVjdC5faWQsIHNlbGxlcklkOiBwcm9kdWN0LnNlbGxlcn0pO1xuXHQgICAgfSwgZnVuY3Rpb24oKSB7XG5cdCAgICAgICRzdGF0ZS5nbygnY2FydCcpO1xuXHQgICAgfSk7XG4gIH07XG5cblxuXG59KTtcblxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdERldGFpbCcsIHtcbiAgICAgICAgdXJsOiAnL3Byb2R1Y3RzLzpwcm9kdWN0SWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9wcm9kdWN0RGV0YWlsL3Byb2R1Y3REZXRhaWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0RGV0YWlsJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICBcdHNpbmdsZVByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhdGVwYXJhbXMnLCAkc3RhdGVQYXJhbXMpXG4gICAgICAgIFx0XHRyZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0QnlJZCgkc3RhdGVQYXJhbXMucHJvZHVjdElkKTtcbiAgICAgICAgXHR9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ05ld1Jldmlld0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIHVzZXIsIHByb2R1Y3QsICRzdGF0ZSwgUmV2aWV3RmFjdG9yeSwgJGxvZykge1xuICAgICRzY29wZS5wcm9kdWN0ID0gcHJvZHVjdDtcbiAgICAkc2NvcGUudXNlciA9IHVzZXI7XG5cbiAgICAkc2NvcGUuc3VibWl0UmV2aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXdSZXZpZXcgPSB7XG4gICAgICAgICAgICByYXRpbmc6ICRzY29wZS5yZXZpZXcucmF0aW5nLFxuICAgICAgICAgICAgY29tbWVudDogJHNjb3BlLnJldmlldy5jb21tZW50LFxuICAgICAgICAgICAgdXNlcjogdXNlci5faWQsXG4gICAgICAgICAgICBwcm9kdWN0OiBwcm9kdWN0Ll9pZFxuICAgICAgICB9O1xuICAgICAgICBSZXZpZXdGYWN0b3J5LmNyZWF0ZVJldmlldyhuZXdSZXZpZXcpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgkbG9nLmVycm9yKTtcbiAgICB9O1xufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCduZXdSZXZpZXcnLCB7XG4gICAgICAgIHVybDogJy9uZXdSZXZpZXcvOnByb2R1Y3RJZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL3Jldmlld3MvbmV3UmV2aWV3LnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTmV3UmV2aWV3Q3RybCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2R1Y3Q6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0T25lUHJvZHVjdCgkc3RhdGVQYXJhbXMucHJvZHVjdElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbiIsImFwcC5jb250cm9sbGVyKCdSZXZpZXdDdHJsJywgZnVuY3Rpb24oKSB7XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdyZXZpZXcnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL3Jldmlld3MvcmV2aWV3LnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgcmV2aWV3OiAnPSdcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1Jldmlld0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGdldFByb2R1Y3RSZXZpZXdzOiBmdW5jdGlvbihwcm9kdWN0SWQpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcmV2aWV3cy9wcm9kdWN0LycgKyBwcm9kdWN0SWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXZpZXdzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldmlld3MuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRQcm9kdWN0UmV2aWV3c0J5VXNlcjogZnVuY3Rpb24odXNlcklkKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Jldmlld3MvdXNlci8nICsgdXNlcklkKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmV2aWV3cykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXZpZXdzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlUmV2aWV3OiBmdW5jdGlvbihuZXdSZXZpZXcpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Jldmlld3MvJywgbmV3UmV2aWV3KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldmlldy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4iLCJhcHAuY29udHJvbGxlcignU2VsbGVyQ3RybCcsIGZ1bmN0aW9uKGN1cnJlbnRVc2VyLCAkc2NvcGUsICRzdGF0ZSwgJG1kU2lkZW5hdiwgJG1kTWVkaWEsIFByb2R1Y3RGYWN0b3J5LCBnZXRBbGxQcm9kdWN0cykge1xuXG4gICRzY29wZS5pbWFnZVBhdGggPSAnYXNzZXRzL2ltYWdlcy9wbGFjZWhvbGRlci5qcGcnO1xuXG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXI7XG5cbiAgJHNjb3BlLnByb2R1Y3RzID0gZ2V0QWxsUHJvZHVjdHNcblxuICAkc2NvcGUuZGVsZXRlUHJvZHVjdCA9IGZ1bmN0aW9uKHByb2R1Y3QsIGluZGV4KXtcbiAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZGVsZXRlUHJvZHVjdChwcm9kdWN0Ll9pZClcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpe1xuICAgICAgICByZXR1cm4gJHNjb3BlLnByb2R1Y3RzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVByb2R1Y3QgPSBmdW5jdGlvbigpe1xuICAgICRzdGF0ZS5nbygnc2VsbGVyQ3JlYXRlUHJvZHVjdCcpXG4gIH1cblxuICAkc2NvcGUuZWRpdEZvcm0gPSBmdW5jdGlvbihwcm9kdWN0KXtcbiAgICAkc3RhdGUuZ28oJ3NlbGxlckVkaXQnLCB7aWQ6IHByb2R1Y3QuX2lkfSlcbiAgfVxuXG4gIC8vICRzY29wZS5vcGVuTGVmdE1lbnUgPSBmdW5jdGlvbigpIHtcbiAgLy8gICAkbWRTaWRlbmF2KCdsZWZ0JykudG9nZ2xlKCk7XG4gIC8vIH07XG4gIC8vICRzY29wZS5pc09wZW4gPSB0cnVlO1xuICAvLyAkc2NvcGUudG9vbGJhciA9IHtcbiAgLy8gICAgICAgaXNPcGVuOiB0cnVlLFxuICAvLyAgICAgICBjb3VudDogNSxcbiAgLy8gICAgICAgc2VsZWN0ZWREaXJlY3Rpb246ICdsZWZ0J1xuICAvLyB9O1xuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zaWdudXAvc2lnbnVwLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2lnbnVwQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTaWdudXBDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSwgVXNlckZhY3RvcnkpIHtcblxuICAgICRzY29wZS5zaWdudXAgPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRTaWdudXAgPSBmdW5jdGlvbiAoc2lnbnVwSW5mbykge1xuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIFVzZXJGYWN0b3J5LnNpZ251cChzaWdudXBJbmZvKVxuICAgICAgICAudGhlbihmdW5jdGlvbihuZXdVc2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UubG9naW4oc2lnbnVwSW5mbyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgc2lnbnVwIGNyZWRlbnRpYWxzIHByb3ZpZGVkLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgICRzY29wZS5zdHlsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoJHNjb3BlLnNpZ251cEZvcm0uZW1haWwuJGludmxhaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XCJjb2xvclwiOiBcInJlZFwifTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG4iLCJhcHAuY29udHJvbGxlcignQWxsU3RvcmVzQ3RybCcsIGZ1bmN0aW9uKGdldEFsbFVzZXJzLCAkc2NvcGUsICRzdGF0ZSkge1xuXG4gICRzY29wZS51c2VycyA9IGdldEFsbFVzZXJzO1xuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NyZWF0ZVN0b3JlJywge1xuICAgICAgICB1cmw6ICcvY3JlYXRlU3RvcmUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9zdG9yZXMvY3JlYXRlU3RvcmUudGVtcGxhdGUuaHRtbCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgXHR1c2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSkge1xuXHRcdCAgICAgICAgXHRyZXR1cm4gQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKClcbiAgICAgICAgXHRcdFxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBVc2VyRmFjdG9yeSwgJHN0YXRlLCB1c2VyKSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2coJ3VzZXIgaW4gY3RybCcsdXNlcik7XG4gICAgICAgIFx0JHNjb3BlLnVzZXIgPSB1c2VyO1xuXG4gICAgICAgIFx0JHNjb3BlLm1ha2VVc2VyU3RvcmVPd25lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBcdFx0cmV0dXJuIFVzZXJGYWN0b3J5LnVwZGF0ZVVzZXIoJHNjb3BlLnVzZXIuX2lkLCB7aXNTZWxsZXI6IHRydWUsIHN0b3JlTmFtZTogJHNjb3BlLnN0b3JlTmFtZX0pXG4gICAgICAgIFx0XHQudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgIFx0XHRcdCRzY29wZS51c2VyID0gdXNlci5kYXRhO1xuICAgICAgICBcdFx0XHRjb25zb2xlLmxvZygndXNlciBpbiBhc2RmYWRmJywgJHNjb3BlLnVzZXIuX2lkKVxuICAgICAgICAgICAgICAgICAgICAvLyBGSVggVEhJU1xuICAgICAgICBcdFx0XHQkc3RhdGUuZ28oJ3NlbGxlckhvbWUnLCB7c2VsbGVySWQ6ICRzY29wZS51c2VyLl9pZH0pO1xuICAgICAgICBcdFx0fSlcbiAgICAgICAgXHR9O1xuICAgICAgICB9XG4gICAgfSk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZWxsZXInLCB7XG4gICAgICAgIHVybDogJy9zZWxsZXIvOnNlbGxlcklkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGFsbFByb2R1Y3RzOiBmdW5jdGlvbihQcm9kdWN0RmFjdG9yeSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldEFsbFByb2R1Y3RzKCRzdGF0ZVBhcmFtcy5zZWxsZXJJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FsbFN0b3JlcycsIHtcbiAgICAgICAgdXJsOiAnL3N0b3JlcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc3RvcmVzL3N0b3Jlcy50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgLy8gY29udHJvbGxlcjogJ0FsbFN0b3Jlc0N0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBnZXRBbGxVc2VyczogZnVuY3Rpb24oVXNlckZhY3Rvcnkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBVc2VyRmFjdG9yeS5nZXRBbGxVc2VycygpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcnMpe1xuICAgICAgICAgICAgICAgICAgICB1c2VycyA9IHVzZXJzLmZpbHRlcihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodXNlci5pc1NlbGxlciA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJzO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgZ2V0QWxsVXNlcnMpe1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJzID0gZ2V0QWxsVXNlcnM7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pOyIsImFwcC5mYWN0b3J5KCdVc2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG5cbiAgICB2YXIgVXNlckZhY3RvcnkgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGdldERhdGEocmVzKSB7XG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICB9XG5cbiAgICBVc2VyRmFjdG9yeS5nZXRBbGxVc2VycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy8nKVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2Vycyl7XG4gICAgICAgICAgICByZXR1cm4gdXNlcnMuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFVzZXJGYWN0b3J5LnNpZ251cCA9IGZ1bmN0aW9uKG5ld1VzZXIpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJ2FwaS9tZW1iZXJzLycsIG5ld1VzZXIpXG4gICAgICAgIC50aGVuKGdldERhdGEpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNyZWF0ZWRVc2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlZFVzZXI7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBVc2VyRmFjdG9yeS5nZXRVc2VyID0gZnVuY3Rpb24odXNlcklkKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2FwaS9tZW1iZXJzLycgKyB1c2VySWQpXG4gICAgICAgIC50aGVuKGdldERhdGEpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgVXNlckZhY3RvcnkuZGVsZXRlVXNlciA9IGZ1bmN0aW9uKHVzZXJJZCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCdhcGkvbWVtYmVycy8nICsgdXNlcklkKVxuICAgICAgICAudGhlbihnZXREYXRhKVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFVzZXJGYWN0b3J5LnVwZGF0ZVVzZXIgPSBmdW5jdGlvbih1c2VySWQsIHVwZGF0ZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdpbiB1c2VyIGZhY3RvcnkgdXBkYXRlIHVzZXIgZnVuY3Rpb24uIHVzZXJJZDogJywgdXNlcklkLCAnIHVwZGF0ZTogJywgdXBkYXRlKVxuICAgICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgIHVybDogJy9hcGkvbWVtYmVycy8nICsgdXNlcklkLFxuICAgICAgICAgICAgZGF0YTogdXBkYXRlXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KVxuICAgIH07XG5cblxuXG4gICAgcmV0dXJuIFVzZXJGYWN0b3J5O1xufSk7XG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd1c2VyUHJvZmlsZScsIHtcbiAgICAgICAgdXJsOiAnL3VzZXItcHJvZmlsZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdXNlclByb2ZpbGUvdXNlclByb2ZpbGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyUHJvZmlsZUN0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICB1c2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXZpZXdzOiBmdW5jdGlvbihBdXRoU2VydmljZSwgUmV2aWV3RmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS5cbiAgICAgICAgICAgICAgICB0aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJldmlld0ZhY3RvcnkuZ2V0UHJvZHVjdFJldmlld3NCeVVzZXIodXNlci5faWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9yZGVyczogZnVuY3Rpb24oQXV0aFNlcnZpY2UsIE9yZGVyRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS5cbiAgICAgICAgICAgICAgICB0aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBPcmRlckZhY3RvcnkuZ2V0Q29tcGxldGVPcmRlcnNCeVVzZXIodXNlci5faWQpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcmRlcnMubWFwKGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXIucHJvZHVjdHMuZm9yRWFjaChmdW5jdGlvbihwcm9kdWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1bSArPSBwcm9kdWN0LnByb2R1Y3QucHJpY2UgKiBwcm9kdWN0LnF1YW50aXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyLnRvdGFsUHJpY2UgPSBzdW07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1VzZXJQcm9maWxlQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgdXNlciwgcmV2aWV3cywgb3JkZXJzLCAkc3RhdGUpIHtcbiAgICAkc2NvcGUudXNlciA9IHVzZXI7XG4gICAgJHNjb3BlLnJldmlld3MgPSByZXZpZXdzO1xuICAgICRzY29wZS5vcmRlcnMgPSBvcmRlcnM7XG59KTtcbiIsImFwcC5jb250cm9sbGVyKCdBZG1pbkNyZWF0ZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgUHJvZHVjdEZhY3RvcnkpIHtcblxuICAkc2NvcGUuY3JlYXRlID0ge2ltYWdlczogW10sIGNvb3JkaW5hdGVzOiBbXX07XG5cbiAgJHNjb3BlLmNyZWF0ZVByb2R1Y3QgPSBmdW5jdGlvbihjcmVhdGUpe1xuICBcdGNvbnNvbGUubG9nKFwiY3JlYXRlZFwiLCBjcmVhdGUpXG4gICAgUHJvZHVjdEZhY3RvcnkuY3JlYXRlUHJvZHVjdChjcmVhdGUpXG4gICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzdGF0ZS5nbygnaG9tZScpXG4gICAgfSlcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluQ3JlYXRlUHJvZHVjdCcsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL2NyZWF0ZScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbkNyZWF0ZUN0cmwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5lZGl0L2FkbWluLmNyZWF0ZS50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXNBZG1pblVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUpe1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF1c2VyLmlzQWRtaW4pICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xufSk7XG4iLCJhcHAuY29udHJvbGxlcignQWRtaW5FZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBQcm9kdWN0RmFjdG9yeSwgcHJvZHVjdFRvRWRpdCkge1xuXG4gICRzY29wZS5wcm9kdWN0VG9FZGl0ID0gcHJvZHVjdFRvRWRpdDtcblxuICAkc2NvcGUudXBkYXRlID0ge307XG5cbiAgJHNjb3BlLnVwZGF0ZVByb2R1Y3QgPSBmdW5jdGlvbihwcm9kdWN0SWQsIHVwZGF0ZSl7XG4gICAgUHJvZHVjdEZhY3RvcnkudXBkYXRlUHJvZHVjdChwcm9kdWN0SWQsIHVwZGF0ZSlcbiAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHN0YXRlLmdvKCdwcm9kdWN0RGV0YWlsJywge1wicHJvZHVjdElkXCI6IHByb2R1Y3RJZH0pXG4gICAgfSlcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluRWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL2VkaXQvOmlkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FkbWluRWRpdEN0cmwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5lZGl0L2FkbWluLmVkaXQudGVtcGxhdGUuaHRtbCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHByb2R1Y3RUb0VkaXQ6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgUHJvZHVjdEZhY3Rvcnkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRPbmVQcm9kdWN0KCRzdGF0ZVBhcmFtcy5pZClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc0FkbWluVXNlcjogZnVuY3Rpb24oQXV0aFNlcnZpY2UsICRzdGF0ZSl7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXVzZXIuaXNBZG1pbikgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiLy8gYXBwLmRpcmVjdGl2ZSgnYWRtaW5Ub29sYmFyJywgZnVuY3Rpb24oKXtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgICByZXN0cmljdDogJ0UnLFxuLy8gICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5ob21lL2FkbWluLmhvbWUudG9vbGJhci50ZW1wbGF0ZS5odG1sJ1xuLy8gICAgIH1cbi8vIH0pXG5cbmFwcC5kaXJlY3RpdmUoJ2FkbWluTmF2JywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5ob21lL2FkbWluLmhvbWUubmF2LnRlbXBsYXRlLmh0bWwnXG4gICAgfVxufSlcblxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbkN0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBnZXRBbGxQcm9kdWN0czogZnVuY3Rpb24oUHJvZHVjdEZhY3Rvcnkpe1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9kdWN0RmFjdG9yeS5nZXRBbGxQcm9kdWN0cygpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNBZG1pblVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUpe1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdXNlci5pc0FkbWluKSAkc3RhdGUuZ28oJ2hvbWUnKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLmhvbWUvYWRtaW4uaG9tZS50ZW1wbGF0ZS5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCJhcHAuY29udHJvbGxlcignQWRtaW5PcmRlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgQWRtaW5PcmRlckZhY3RvcnksIGFsbE9yZGVycykge1xuXG4gIC8vRm9yIEZpbHRlcmluZ1xuICAkc2NvcGUuc3RhdHVzZXMgPSBbJ2FsbCcsICdjYXJ0JywgJ2NvbmZpcm1lZCcsICdwcm9jZXNzaW5nJywgJ2NhbmNlbGxlZCcsICdjb21wbGV0ZSddXG5cbiAgLy9VcGRhdGUgT2JqZWN0IHRvIHNlbmQgdG8gUHV0IFJlcXVlc3RzXG4gICRzY29wZS51cGRhdGUgPSB7fTtcbiAgJHNjb3BlLnVwZGF0ZS5zdGF0dXMgPSAnYWxsJztcbiAgJHNjb3BlLnVwZGF0ZS5hbGxPcmRlcnMgPSBhbGxPcmRlcnM7XG5cblxuICAkc2NvcGUuZGVsZXRlT3JkZXIgPSBmdW5jdGlvbihvcmRlcklkKXtcbiAgICBBZG1pbk9yZGVyRmFjdG9yeS5kZWxldGVPbmVPcmRlcihvcmRlcklkKVxuICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVyKXtcbiAgICAgIGlmKG9yZGVyLnN0YXR1cz09PTIwMCl7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnVwZGF0ZS5hbGxPcmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLnVwZGF0ZS5hbGxPcmRlcnNbaV0uX2lkID09PSBvcmRlci5kYXRhLl9pZCkgJHNjb3BlLnVwZGF0ZS5hbGxPcmRlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpe1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5lZGl0T3JkZXJGb3JtID0gZnVuY3Rpb24ob3JkZXIpe1xuICAgICRzdGF0ZS5nbygnYWRtaW5FZGl0T3JkZXInLCB7b3JkZXJJZDogb3JkZXIuX2lkfSk7XG4gIH07XG5cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ0FkbWluT3JkZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuICAgIHJldHVybiB7XG4gICAgICAgIGdldEFsbE9yZGVyczogZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMnKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ob3JkZXIpe1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmRlci5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldE9uZU9yZGVyOiBmdW5jdGlvbihvcmRlcklkKXtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9vcmRlcnMvZmluZE9uZU9yZGVyQnlJZC8nICsgb3JkZXJJZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHByb2R1Y3RzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZHVjdHMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZU9uZU9yZGVyOiBmdW5jdGlvbihvcmRlcklkLCB1cGRhdGUpe1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgdXJsOiAnL2FwaS9vcmRlcnMvJyArIG9yZGVySWQsXG4gICAgICAgICAgICAgICAgZGF0YTogdXBkYXRlXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZU9uZU9yZGVyOiBmdW5jdGlvbihvcmRlcklkKXtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnYXBpL29yZGVycy8nICsgb3JkZXJJZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVyKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXI7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluT3JkZXInLCB7XG4gICAgICAgIHVybDogJy9hZG1pbi9vcmRlcicsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk9yZGVyQ3RybCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLm9yZGVyL2FkbWluLm9yZGVyLnRlbXBsYXRlcy9hZG1pbi5vcmRlci50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgYWxsT3JkZXJzOiBmdW5jdGlvbihBZG1pbk9yZGVyRmFjdG9yeSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFkbWluT3JkZXJGYWN0b3J5LmdldEFsbE9yZGVycygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzQWRtaW5Vc2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSwgJHN0YXRlKXtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICAgICAgICAgICBpZighdXNlci5pc0FkbWluKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdhZG1pblNpZGViYXInLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnNpZGViYXIvYWRtaW4uc2lkZWJhci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FkbWluQ3RybCdcbiAgICB9XG59KVxuIiwiYXBwLmNvbnRyb2xsZXIoJ0FkbWluRWRpdFVzZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIFVzZXJGYWN0b3J5LCB1c2VyVG9FZGl0KSB7XG5cbiAgJHNjb3BlLnVzZXJUb0VkaXQgPSB1c2VyVG9FZGl0O1xuXG4gICRzY29wZS51cGRhdGUgPSB7fTtcblxuICAkc2NvcGUucm9sZXMgPSBbJ0FkbWluJywgJ1NlbGxlcicsICdDdXN0b21lciddXG5cbiAgJHNjb3BlLnVwZGF0ZVVzZXIgPSBmdW5jdGlvbih1c2VySWQsIHVwZGF0ZSl7XG4gICAgVXNlckZhY3RvcnkudXBkYXRlVXNlcih1c2VySWQsIHVwZGF0ZSlcbiAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHN0YXRlLmdvKCdhZG1pblVzZXInKVxuICAgIH0pXG4gIH1cblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbkVkaXRVc2VyJywge1xuICAgICAgICB1cmw6ICcvYWRtaW4vZWRpdC91c2VyLzppZCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbkVkaXRVc2VyQ3RybCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnVzZXIvYWRtaW4uZWRpdC51c2VyLnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICB1c2VyVG9FZGl0OiBmdW5jdGlvbigkc3RhdGVQYXJhbXMsIFVzZXJGYWN0b3J5KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlckZhY3RvcnkuZ2V0VXNlcigkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0FkbWluVXNlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgZ2V0QWxsVXNlcnMsIFVzZXJGYWN0b3J5KSB7XG5cbiAgJHNjb3BlLnVzZXJzID0gZ2V0QWxsVXNlcnM7XG5cbiAgJHNjb3BlLmVkaXRVc2VyID0gZnVuY3Rpb24odXNlcil7XG4gICAgJHN0YXRlLmdvKCdhZG1pbkVkaXRVc2VyJywge2lkOiB1c2VyLl9pZH0pXG4gIH1cblxuICAkc2NvcGUucGFzc3dvcmRSZXNldCA9IGZ1bmN0aW9uKHVzZXIpe1xuICAgIHJldHVybiBVc2VyRmFjdG9yeS51cGRhdGVVc2VyKHVzZXIuX2lkLCB7cGFzc3dvcmRSZXNldDogdHJ1ZX0pXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpXG4gICAgfSlcbiAgfVxuXG4gICRzY29wZS5kZWxldGVVc2VyID0gZnVuY3Rpb24odXNlciwgaW5kZXgpe1xuICAgIHJldHVybiBVc2VyRmFjdG9yeS5kZWxldGVVc2VyKHVzZXIuX2lkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIGlmIChyZXNwb25zZS5faWQgPT09IHVzZXIuX2lkKXtcbiAgICAgICAgcmV0dXJuICRzY29wZS51c2Vycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluVXNlcicsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL3VzZXInLFxuICAgICAgICBjb250cm9sbGVyOiAnQWRtaW5Vc2VyQ3RybCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLnVzZXIvYWRtaW4udXNlci50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgZ2V0QWxsVXNlcnM6IGZ1bmN0aW9uKFVzZXJGYWN0b3J5KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gVXNlckZhY3RvcnkuZ2V0QWxsVXNlcnMoKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzQWRtaW5Vc2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSwgJHN0YXRlKXtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICAgICAgICAgICBpZighdXNlci5pc0FkbWluKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXG4gICAgICAgICfjgZPjgpPjgavjgaHjga/jgIHjg6bjg7zjgrbjg7zmp5jjgIInLFxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcbiAgICAgICAgJzpEJyxcbiAgICAgICAgJ1llcywgSSB0aGluayB3ZVxcJ3ZlIG1ldCBiZWZvcmUuJyxcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1NlbGxlckNyZWF0ZUN0cmwnLCBmdW5jdGlvbihjdXJyZW50VXNlciwgJHNjb3BlLCAkc3RhdGUsIFByb2R1Y3RGYWN0b3J5KSB7XG5cdGNvbnNvbGUubG9nKCdpbiBzZWxsZXIgY3JlYXRlIGNvbnRyb2xsZXInKTtcblx0JHNjb3BlLnVzZXIgPSBjdXJyZW50VXNlcjtcblxuICBcdCRzY29wZS5jcmVhdGUgPSB7aW1hZ2VzOiBbXSwgY29vcmRpbmF0ZXM6IFtdfTtcblxuICAkc2NvcGUuY3JlYXRlUHJvZHVjdCA9IGZ1bmN0aW9uKGNyZWF0ZSl7XG4gIFx0Y3JlYXRlLnNlbGxlciA9ICRzY29wZS51c2VyLl9pZDtcbiAgXHRjb25zb2xlLmxvZygnY3JlYXRlJywgY3JlYXRlKTtcbiAgICBQcm9kdWN0RmFjdG9yeS5jcmVhdGVQcm9kdWN0KGNyZWF0ZSlcbiAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHN0YXRlLmdvKCdzZWxsZXJQcm9kdWN0cycsIHtzZWxsZXJJZDogJHNjb3BlLnVzZXIuX2lkfSlcbiAgICB9KVxuICB9XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2VsbGVyQ3JlYXRlUHJvZHVjdCcsIHtcbiAgICAgICAgdXJsOiAnL3NlbGxlci9jcmVhdGUvOnNlbGxlcklkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NlbGxlckNyZWF0ZUN0cmwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9zZWxsZXIvc2VsbGVyLmVkaXQvc2VsbGVyLmNyZWF0ZS50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1c2VyJywgdXNlcilcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCJhcHAuY29udHJvbGxlcignU2VsbGVyRWRpdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgUHJvZHVjdEZhY3RvcnksIHByb2R1Y3RUb0VkaXQpIHtcblxuICAkc2NvcGUucHJvZHVjdFRvRWRpdCA9IHByb2R1Y3RUb0VkaXQ7XG5cbiAgJHNjb3BlLnVwZGF0ZSA9IHt9O1xuXG4gICRzY29wZS51cGRhdGVQcm9kdWN0ID0gZnVuY3Rpb24ocHJvZHVjdElkLCB1cGRhdGUpe1xuICAgIFByb2R1Y3RGYWN0b3J5LnVwZGF0ZVByb2R1Y3QocHJvZHVjdElkLCB1cGRhdGUpXG4gICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzdGF0ZS5nbygncHJvZHVjdERldGFpbCcsIHtcInByb2R1Y3RJZFwiOiBwcm9kdWN0SWR9KVxuICAgIH0pXG4gIH1cblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZWxsZXJFZGl0Jywge1xuICAgICAgICB1cmw6ICcvc2VsbGVyL2VkaXQvOmlkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NlbGxlckVkaXRDdHJsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvc2VsbGVyL3NlbGxlci5lZGl0L3NlbGxlci5lZGl0LnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBwcm9kdWN0VG9FZGl0OiBmdW5jdGlvbigkc3RhdGVQYXJhbXMsIFByb2R1Y3RGYWN0b3J5KXtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvZHVjdEZhY3RvcnkuZ2V0T25lUHJvZHVjdCgkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNBZG1pblVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUpe1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF1c2VyLmlzU2VsbGVyKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCJhcHAuY29udHJvbGxlcignU2VsbGVySG9tZUN0cmwnLCBmdW5jdGlvbihVc2VyRmFjdG9yeSwgY3VycmVudFVzZXIsICRzY29wZSwgJHN0YXRlLCAkbWRTaWRlbmF2LCAkbWRNZWRpYSkge1xuXG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXI7XG4gICRzY29wZS5uZXdDb2xvciA9IHsnYmFja2dyb3VuZC1jb2xvcic6ICRzY29wZS51c2VyLmJhY2tncm91bmRDb2xvcn07XG4gICRzY29wZS5zdG9yZU5hbWUgPSAkc2NvcGUudXNlci5zdG9yZU5hbWU7XG5cbiAgJHNjb3BlLnNldFN0b3JlTmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coJ3NldCBzdG9yZSBuYW1lIGNhbGxlZCBpbiBjb250cm9sbGVyJylcbiAgICBVc2VyRmFjdG9yeS51cGRhdGVVc2VyKCRzY29wZS51c2VyLl9pZCwge3N0b3JlTmFtZTogJHNjb3BlLm5hbWV9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZWQgdXNlciBpbiBjb250cm9sbGVyOiAnLCB1c2VyKVxuICAgICAgJHNjb3BlLnN0b3JlTmFtZSA9IHVzZXIuZGF0YS5zdG9yZU5hbWU7XG4gICAgICByZXR1cm4gdXNlcjtcbiAgICB9KVxuICB9XG5cblxuICAkc2NvcGUuc2V0QmFja2dyb3VuZENvbG9yID0gZnVuY3Rpb24oKXtcbiAgICBVc2VyRmFjdG9yeS51cGRhdGVVc2VyKCRzY29wZS51c2VyLl9pZCwge2JhY2tncm91bmRDb2xvcjogJHNjb3BlLmNvbG9yfSlcbiAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICRzY29wZS5uZXdDb2xvcltcImJhY2tncm91bmQtY29sb3JcIl0gPSB1c2VyLmRhdGEuYmFja2dyb3VuZENvbG9yO1xuICAgICAgcmV0dXJuIHVzZXI7XG4gICAgfSlcbiAgfVxuXG59KTtcbiIsIi8vIGFwcC5kaXJlY3RpdmUoJ3NlbGxlclRvb2xiYXInLCBmdW5jdGlvbigpe1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4vLyAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL3NlbGxlci9zZWxsZXIuaG9tZS9zZWxsZXIuaG9tZS50b29sYmFyLnRlbXBsYXRlLmh0bWwnXG4vLyAgICAgfVxuLy8gfSlcblxuYXBwLmRpcmVjdGl2ZSgnc2VsbGVyTmF2JywgZnVuY3Rpb24oQXV0aFNlcnZpY2Upe1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL3NlbGxlci9zZWxsZXIuaG9tZS9zZWxsZXIuaG9tZS5uYXYudGVtcGxhdGUuaHRtbCcsXG4gICAgICAgIC8vIHNjb3BlOiB7XG4gICAgICAgIC8vIFx0c3RvcmVOYW1lOiAnPSdcbiAgICAgICAgLy8gfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUpe1xuICAgICAgICBcdHJldHVybiBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKVxuICAgICAgICBcdC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICBcdFx0c2NvcGUuc3RvcmVOYW1lID0gdXNlci5zdG9yZU5hbWU7XG4gICAgICAgIFx0XHRyZXR1cm4gdXNlcjtcbiAgICAgICAgXHR9KVxuICAgICAgICB9XG4gICAgfVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZWxsZXJIb21lJywge1xuICAgICAgICAvLyBTSE9VTEQgR08gSEVSRVxuICAgICAgICB1cmw6ICcvc2VsbGVySG9tZS86c2VsbGVySWQnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2VsbGVySG9tZUN0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBpc1NlbGxlclVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUpe1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdXNlci5pc1NlbGxlcikgJHN0YXRlLmdvKCdob21lJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGN1cnJlbnRVc2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKVxuICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXNlcicsIHVzZXIpXG4gICAgICAgICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL3NlbGxlci9zZWxsZXIuaG9tZS9zZWxsZXIuaG9tZS50ZW1wbGF0ZS5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZWxsZXJQcm9kdWN0cycsIHtcbiAgICAgICAgdXJsOiAnL3NlbGxlclByb2R1Y3RzLzpzZWxsZXJJZCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTZWxsZXJDdHJsJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgZ2V0QWxsUHJvZHVjdHM6IGZ1bmN0aW9uKFByb2R1Y3RGYWN0b3J5LCAkc3RhdGVQYXJhbXMpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbiBzZWxsZXIgaG9tZSBzdGF0ZTonLCAkc3RhdGVQYXJhbXMuc2VsbGVySWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb2R1Y3RGYWN0b3J5LmdldEFsbFByb2R1Y3RzKCRzdGF0ZVBhcmFtcy5zZWxsZXJJZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNTZWxsZXJVc2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSwgJHN0YXRlKXtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXIuaXNTZWxsZXIpICRzdGF0ZS5nbygnaG9tZScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjdXJyZW50VXNlcjogZnVuY3Rpb24oQXV0aFNlcnZpY2UpIHtcbiAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKClcbiAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VzZXInLCB1c2VyKVxuICAgICAgICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9zZWxsZXIvc2VsbGVyLmhvbWUvc2VsbGVyLnByb2R1Y3RzLnRlbXBsYXRlLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsImFwcC5jb250cm9sbGVyKCdTZWxsZXJPcmRlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgU2VsbGVyT3JkZXJGYWN0b3J5LCBhbGxPcmRlcnMpIHtcblxuICAvL0ZvciBGaWx0ZXJpbmdcbiAgJHNjb3BlLnN0YXR1c2VzID0gWydhbGwnLCAnY2FydCcsICdjb25maXJtZWQnLCAncHJvY2Vzc2luZycsICdjYW5jZWxsZWQnLCAnY29tcGxldGUnXVxuXG4gIC8vVXBkYXRlIE9iamVjdCB0byBzZW5kIHRvIFB1dCBSZXF1ZXN0c1xuICAkc2NvcGUudXBkYXRlID0ge307XG4gICRzY29wZS51cGRhdGUuc3RhdHVzID0gJ2FsbCc7XG4gICRzY29wZS51cGRhdGUuYWxsT3JkZXJzID0gYWxsT3JkZXJzO1xuXG5cbiAgJHNjb3BlLmRlbGV0ZU9yZGVyID0gZnVuY3Rpb24ob3JkZXJJZCl7XG4gICAgU2VsbGVyT3JkZXJGYWN0b3J5LmRlbGV0ZU9uZU9yZGVyKG9yZGVySWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ob3JkZXIpe1xuICAgICAgaWYob3JkZXIuc3RhdHVzPT09MjAwKXtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUudXBkYXRlLmFsbE9yZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICgkc2NvcGUudXBkYXRlLmFsbE9yZGVyc1tpXS5faWQgPT09IG9yZGVyLmRhdGEuX2lkKSAkc2NvcGUudXBkYXRlLmFsbE9yZGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycil7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmVkaXRPcmRlckZvcm0gPSBmdW5jdGlvbihvcmRlcil7XG4gICAgJHN0YXRlLmdvKCdzZWxsZXJFZGl0T3JkZXInLCB7b3JkZXJJZDogb3JkZXIuX2lkfSk7XG4gIH07XG5cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1NlbGxlck9yZGVyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRBbGxPcmRlcnM6IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzJylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVyKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXIuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRPbmVPcmRlcjogZnVuY3Rpb24ob3JkZXJJZCl7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvb3JkZXJzL2ZpbmRPbmVPcmRlckJ5SWQvJyArIG9yZGVySWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihwcm9kdWN0cyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2R1Y3RzLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVPbmVPcmRlcjogZnVuY3Rpb24ob3JkZXJJZCwgdXBkYXRlKXtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgICAgIHVybDogJy9hcGkvb3JkZXJzLycgKyBvcmRlcklkLFxuICAgICAgICAgICAgICAgIGRhdGE6IHVwZGF0ZVxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICBkZWxldGVPbmVPcmRlcjogZnVuY3Rpb24ob3JkZXJJZCl7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJ2FwaS9vcmRlcnMvJyArIG9yZGVySWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihvcmRlcil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZWxsZXJPcmRlcicsIHtcbiAgICAgICAgdXJsOiAnL3NlbGxlci9vcmRlcicsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTZWxsZXJPcmRlckN0cmwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9zZWxsZXIvc2VsbGVyLm9yZGVyL3NlbGxlci5vcmRlci50ZW1wbGF0ZXMvc2VsbGVyLm9yZGVyLnRlbXBsYXRlLmh0bWwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGxPcmRlcnM6IGZ1bmN0aW9uKFNlbGxlck9yZGVyRmFjdG9yeSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFNlbGxlck9yZGVyRmFjdG9yeS5nZXRBbGxPcmRlcnMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc1NlbGxlclVzZXI6IGZ1bmN0aW9uKEF1dGhTZXJ2aWNlLCAkc3RhdGUpe1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF1c2VyLmlzU2VsbGVyKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG4iLCJhcHAuY29udHJvbGxlcignQWRtaW5FZGl0T3JkZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIEFkbWluT3JkZXJGYWN0b3J5LCBvcmRlclRvRWRpdCkge1xuXG4gICRzY29wZS5vcmRlclRvRWRpdCA9IG9yZGVyVG9FZGl0O1xuXG4gIGNvbnNvbGUubG9nKFwiJHNjb3BlLm9yZGVyVG9FZGl0XCIsICRzY29wZS5vcmRlclRvRWRpdClcblxuICAkc2NvcGUudXBkYXRlID0ge307XG5cbiAgJHNjb3BlLnN0YXR1c2VzID0gWydjYXJ0JywgJ2NvbmZpcm1lZCcsICdwcm9jZXNzaW5nJywgJ2NhbmNlbGxlZCcsICdjb21wbGV0ZSddXG5cbiAgLy8gJHNjb3BlLnVwZGF0ZU9yZGVyID0gZnVuY3Rpb24ocHJvZHVjdElkLCB1cGRhdGUpe1xuICAvLyAgIGNvbnNvbGUubG9nKFwiU2hvdWxkIGhhdmUgc3dpdGNoZWRcIilcbiAgLy8gICBBZG1pbk9yZGVyRmFjdG9yeS51cGRhdGVPcmRlcihwcm9kdWN0SWQsIHVwZGF0ZSlcblxuICAvLyB9XG5cbiAgJHNjb3BlLmVkaXRQcm9kdWN0Rm9ybSA9IGZ1bmN0aW9uKG9yZGVyKXtcbiAgICAkc3RhdGUuZ28oJ2FkbWluRWRpdCcsIHtpZDogb3JkZXIuX2lkfSlcbiAgfTtcblxuICAkc2NvcGUudXBkYXRlT3JkZXIgPSBmdW5jdGlvbihvcmRlciwgdXBkYXRlKXtcbiAgICBBZG1pbk9yZGVyRmFjdG9yeS51cGRhdGVPbmVPcmRlcihvcmRlci5faWQsIHVwZGF0ZSlcbiAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHN0YXRlLmdvKCdhZG1pbk9yZGVyJylcbiAgICB9KVxuICB9O1xuXG4gICRzY29wZS5yZW1vdmVQcm9kdWN0ID0gZnVuY3Rpb24ocHJvZHVjdCwgb3JkZXIsIHVwZGF0ZSl7XG4gICAgLy8gJHNjb3BlLnVwZGF0ZU9yZGVyKG9yZGVyLCB1cGRhdGUpXG4gICAgY29uc29sZS5sb2coXCJyb21vdmVQcm9kdWN0OlwiLCB1cGRhdGUpO1xuXG4gICAgLy9USEUgTE9HSUMgSEVSRSBJUyBCQUNLV0FSRFMhISEgSXQgc2hvdWxkIHJlbW92ZSB0aGUgcHJvZHVjdCwgYW5kIGlmIHN1Y2Nlc3NmdWxcbiAgICAvL3RoZW4gaXQgc2hvdWxkIHJlbW92ZSBmcm9tICRzY29wZS51cGRhdGUucHJvZHVjdHMgbGlrZSBMYXVyYSBkaWRcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnVwZGF0ZS5wcm9kdWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYoJHNjb3BlLnVwZGF0ZS5wcm9kdWN0c1tpXS5faWQgPT09IHByb2R1Y3QuX2lkKSAkc2NvcGUudXBkYXRlLnByb2R1Y3RzLnNwbGljZShpLCAxKVxuICAgIH1cblxuICAgIEFkbWluT3JkZXJGYWN0b3J5LnVwZGF0ZU9uZU9yZGVyKG9yZGVyLl9pZCwgdXBkYXRlKVxuICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgfSk7XG5cbiAgICAvL1RoaXMgaXMgY2xvc2VyIGJ1dCB0aGUgJHNjb3BlLnVwZGF0ZS5wcm9kdWN0cyBkb2VzIG5vdCBtYXRjaCB0aGUgdXBkYXRlZE9yZGVyLmRhdGEuX2lkXG4gICAgLy9BbHNvLCB5b3UgbXVzdCBjaGFuZyB0aGUgZmFjdG9yeSBmdW5jaXRvbiB0byByZXR1cm4gJ3Jlc3BvbnNlJyBpbnN0ZWFkIG9mICdyZXNwb25zZS5kYXRhJ1xuICAgIC8vIEFkbWluT3JkZXJGYWN0b3J5LnVwZGF0ZU9uZU9yZGVyKG9yZGVyLl9pZCwgdXBkYXRlKVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uKHVwZGF0ZWRPcmRlcil7XG4gICAgLy8gICBjb25zb2xlLmxvZyh1cGRhdGVkT3JkZXIpXG4gICAgLy8gICBpZih1cGRhdGVkT3JkZXIuc3RhdHVzPT09MjAwKXtcbiAgICAvLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUudXBkYXRlLnByb2R1Y3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gICAgICAgaWYoJHNjb3BlLnVwZGF0ZS5wcm9kdWN0c1tpXS5faWQgPT09IHVwZGF0ZWRPcmRlci5kYXRhLl9pZCl7XG4gICAgLy8gICAgICAgICAkc2NvcGUudXBkYXRlLnByb2R1Y3RzLnNwbGljZShpLCAxKTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gICAgLy8gLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgLy8gICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgLy8gfSk7XG5cbiAgfTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbkVkaXRPcmRlcicsIHtcbiAgICAgICAgdXJsOiAnL2VkaXQvb3JkZXJzLzpvcmRlcklkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FkbWluRWRpdE9yZGVyQ3RybCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2FkbWluL2FkbWluLm9yZGVyL2FkbWluLmVkaXQub3JkZXIvYWRtaW4uZWRpdC5vcmRlci50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgb3JkZXJUb0VkaXQ6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgQWRtaW5PcmRlckZhY3Rvcnkpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcy5vcmRlcklkKVxuICAgICAgICAgICAgICAgIHJldHVybiBBZG1pbk9yZGVyRmFjdG9yeS5nZXRPbmVPcmRlcigkc3RhdGVQYXJhbXMub3JkZXJJZClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc0FkbWluVXNlcjogZnVuY3Rpb24oQXV0aFNlcnZpY2UsICRzdGF0ZSl7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXVzZXIuaXNBZG1pbikgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG4vLyAnL2pzL2FkbWluL2FkbWluLm9yZGVyL2FkbWluLmVkaXQub3JkZXIvYWRtaW4uZWRpdC5vcmRlci50ZW1wbGF0ZS5odG1sJyxcbiIsImFwcC5kaXJlY3RpdmUoJ2FkbWluT3JkZXJMaXN0JywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5vcmRlci9hZG1pbi5vcmRlci50ZW1wbGF0ZXMvYWRtaW4ub3JkZXIubGlzdC50ZW1wbGF0ZS5odG1sJ1xuICAgIH1cbn0pXG4iLCJhcHAuZGlyZWN0aXZlKCdhZG1pbk9yZGVySGVhZGVyJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9hZG1pbi9hZG1pbi5vcmRlci9hZG1pbi5vcmRlci50ZW1wbGF0ZXMvYWRtaW4ub3JkZXIuaGVhZGVyLnRlbXBsYXRlLmh0bWwnXG4gICAgfVxufSlcbiIsImFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCJhcHAuY29udHJvbGxlcignU2VsbGVyRWRpdE9yZGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBTZWxsZXJPcmRlckZhY3RvcnksIG9yZGVyVG9FZGl0KSB7XG5cbiAgJHNjb3BlLm9yZGVyVG9FZGl0ID0gb3JkZXJUb0VkaXQ7XG5cbiAgY29uc29sZS5sb2coXCIkc2NvcGUub3JkZXJUb0VkaXRcIiwgJHNjb3BlLm9yZGVyVG9FZGl0KVxuXG4gICRzY29wZS51cGRhdGUgPSB7fTtcblxuICAkc2NvcGUuc3RhdHVzZXMgPSBbJ2NhcnQnLCAnY29uZmlybWVkJywgJ3Byb2Nlc3NpbmcnLCAnY2FuY2VsbGVkJywgJ2NvbXBsZXRlJ11cblxuICAvLyAkc2NvcGUudXBkYXRlT3JkZXIgPSBmdW5jdGlvbihwcm9kdWN0SWQsIHVwZGF0ZSl7XG4gIC8vICAgY29uc29sZS5sb2coXCJTaG91bGQgaGF2ZSBzd2l0Y2hlZFwiKVxuICAvLyAgIEFkbWluT3JkZXJGYWN0b3J5LnVwZGF0ZU9yZGVyKHByb2R1Y3RJZCwgdXBkYXRlKVxuXG4gIC8vIH1cblxuICAkc2NvcGUuZWRpdFByb2R1Y3RGb3JtID0gZnVuY3Rpb24ob3JkZXIpe1xuICAgICRzdGF0ZS5nbygnc2VsbGVyRWRpdCcsIHtpZDogb3JkZXIuX2lkfSlcbiAgfTtcblxuICAkc2NvcGUudXBkYXRlT3JkZXIgPSBmdW5jdGlvbihvcmRlciwgdXBkYXRlKXtcbiAgICBTZWxsZXJPcmRlckZhY3RvcnkudXBkYXRlT25lT3JkZXIob3JkZXIuX2lkLCB1cGRhdGUpXG4gICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICRzdGF0ZS5nbygnc2VsbGVyT3JkZXInKVxuICAgIH0pXG4gIH07XG5cbiAgJHNjb3BlLnJlbW92ZVByb2R1Y3QgPSBmdW5jdGlvbihwcm9kdWN0LCBvcmRlciwgdXBkYXRlKXtcbiAgICAvLyAkc2NvcGUudXBkYXRlT3JkZXIob3JkZXIsIHVwZGF0ZSlcbiAgICBjb25zb2xlLmxvZyhcInJlbW92ZVByb2R1Y3Q6XCIsIHVwZGF0ZSk7XG5cbiAgICAvL1RIRSBMT0dJQyBIRVJFIElTIEJBQ0tXQVJEUyEhISBJdCBzaG91bGQgcmVtb3ZlIHRoZSBwcm9kdWN0LCBhbmQgaWYgc3VjY2Vzc2Z1bFxuICAgIC8vdGhlbiBpdCBzaG91bGQgcmVtb3ZlIGZyb20gJHNjb3BlLnVwZGF0ZS5wcm9kdWN0cyBsaWtlIExhdXJhIGRpZFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUudXBkYXRlLnByb2R1Y3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZigkc2NvcGUudXBkYXRlLnByb2R1Y3RzW2ldLl9pZCA9PT0gcHJvZHVjdC5faWQpICRzY29wZS51cGRhdGUucHJvZHVjdHMuc3BsaWNlKGksIDEpXG4gICAgfVxuXG4gICAgU2VsbGVyT3JkZXJGYWN0b3J5LnVwZGF0ZU9uZU9yZGVyKG9yZGVyLl9pZCwgdXBkYXRlKVxuICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgfSk7XG5cbiAgICAvL1RoaXMgaXMgY2xvc2VyIGJ1dCB0aGUgJHNjb3BlLnVwZGF0ZS5wcm9kdWN0cyBkb2VzIG5vdCBtYXRjaCB0aGUgdXBkYXRlZE9yZGVyLmRhdGEuX2lkXG4gICAgLy9BbHNvLCB5b3UgbXVzdCBjaGFuZyB0aGUgZmFjdG9yeSBmdW5jaXRvbiB0byByZXR1cm4gJ3Jlc3BvbnNlJyBpbnN0ZWFkIG9mICdyZXNwb25zZS5kYXRhJ1xuICAgIC8vIEFkbWluT3JkZXJGYWN0b3J5LnVwZGF0ZU9uZU9yZGVyKG9yZGVyLl9pZCwgdXBkYXRlKVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uKHVwZGF0ZWRPcmRlcil7XG4gICAgLy8gICBjb25zb2xlLmxvZyh1cGRhdGVkT3JkZXIpXG4gICAgLy8gICBpZih1cGRhdGVkT3JkZXIuc3RhdHVzPT09MjAwKXtcbiAgICAvLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUudXBkYXRlLnByb2R1Y3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gICAgICAgaWYoJHNjb3BlLnVwZGF0ZS5wcm9kdWN0c1tpXS5faWQgPT09IHVwZGF0ZWRPcmRlci5kYXRhLl9pZCl7XG4gICAgLy8gICAgICAgICAkc2NvcGUudXBkYXRlLnByb2R1Y3RzLnNwbGljZShpLCAxKTtcbiAgICAvLyAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gICAgLy8gLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgLy8gICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgLy8gfSk7XG5cbiAgfTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZWxsZXJFZGl0T3JkZXInLCB7XG4gICAgICAgIHVybDogJy9lZGl0L29yZGVycy86b3JkZXJJZCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTZWxsZXJFZGl0T3JkZXJDdHJsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvc2VsbGVyL3NlbGxlci5vcmRlci9zZWxsZXIuZWRpdC5vcmRlci9zZWxsZXIuZWRpdC5vcmRlci50ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgb3JkZXJUb0VkaXQ6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgU2VsbGVyT3JkZXJGYWN0b3J5KXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc3RhdGVQYXJhbXMub3JkZXJJZClcbiAgICAgICAgICAgICAgICByZXR1cm4gU2VsbGVyT3JkZXJGYWN0b3J5LmdldE9uZU9yZGVyKCRzdGF0ZVBhcmFtcy5vcmRlcklkKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzQWRtaW5Vc2VyOiBmdW5jdGlvbihBdXRoU2VydmljZSwgJHN0YXRlKXtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICAgICAgICAgICBpZighdXNlci5pc1NlbGxlcikgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG4vLyAnL2pzL2FkbWluL2FkbWluLm9yZGVyL2FkbWluLmVkaXQub3JkZXIvYWRtaW4uZWRpdC5vcmRlci50ZW1wbGF0ZS5odG1sJyxcbiIsImFwcC5kaXJlY3RpdmUoJ3NlbGxlck9yZGVyTGlzdCcsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvc2VsbGVyL3NlbGxlci5vcmRlci9zZWxsZXIub3JkZXIudGVtcGxhdGVzL3NlbGxlci5vcmRlci5saXN0LnRlbXBsYXRlLmh0bWwnXG4gICAgfVxufSlcbiIsImFwcC5kaXJlY3RpdmUoJ3NlbGxlck9yZGVySGVhZGVyJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9zZWxsZXIvc2VsbGVyLm9yZGVyL3NlbGxlci5vcmRlci50ZW1wbGF0ZXMvc2VsbGVyLm9yZGVyLmhlYWRlci50ZW1wbGF0ZS5odG1sJ1xuICAgIH1cbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
