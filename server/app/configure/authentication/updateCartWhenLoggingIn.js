// // This is a helper function to use on each of the passport strategies to handle the cart when a visitor transitions to a logged in user

// // Scenarios:
// // 1. If there is a sessionCart but no userCart, put the userId on the sessionCart
// // 2. If there is a userCart but not sessionCart, update the sessionId on the userCart
// // 3. If there is a userCart and a sessionCart, merge carts and use the sessionCart's sessionId

// var mongoose = require('mongoose');
// var Order = mongoose.model('Order');

// module.exports = function (user, session) {
//     var userCart;
//     var sessionCart;

//     return Order.findOne({user: user._id, status: 'cart'})
//     .then(function(oldUserCart) {
//         userCart = oldUserCart;
//         return Order.findOne({sessionId: session.id, status: 'cart'});
//     })
//     .then(function(thisSessionCart) {
//         sessionCart = thisSessionCart;
//         if (sessionCart !== null && userCart === null) {
//             sessionCart.user = user._id;
//             return sessionCart.save();
//         }
//         if (userCart !== null && sessionCart === null) {
//             userCart.sessionId = session.id;
//             return userCart.save();
//         }
//         if (userCart !== null && sessionCart !== null) {
//             userCart.sessionId = session.id;
//             // Need to copy products from sessionCart to the userCart;
//             sessionCart.products.forEach(function(product) {
//                 userCart.products.push(product);
//             });
//             return userCart.save();
//         }
//         return;
//     });

// };
