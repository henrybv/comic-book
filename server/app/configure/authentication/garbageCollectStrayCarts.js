var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var Session = mongoose.model('Session', new mongoose.Schema({_id: String, session: String, expires: Date}), 'sessions');
var Promise = require('bluebird');

module.exports = function () {
    var cartsWithoutUsers;
    Order.find({user: undefined, status: 'cart'})
    .then(function(orders){
        console.log('orders:', orders);
        cartsWithoutUsers = orders;
        var promises = orders.map(function(order) {
            return Session.find({_id: order.sessionId});
        });
        return Promise.all(promises);
    })
    .then(function(sessions) {
        console.log('sessions:', sessions);
        var promises = cartsWithoutUsers.filter(function(cart, index){
            return sessions[index].length === 0;
        }).map(function(cartToDelete){
            return cartToDelete.remove();
        });
        return Promise.all(promises);
    });
};
