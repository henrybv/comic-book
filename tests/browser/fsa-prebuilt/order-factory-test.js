describe('The Order Factory', function(){
    beforeEach(module('core'));
    var OrderFactory;
    var $httpBackend;
    beforeEach(inject(function($injector){
        OrderFactory = $injector.get('OrderFactory');
        $httpBackend = $injector.get('$httpBackend');
    }));

    // afterEach(function() {
    //   $httpBackend.verifyNoOutstandingExpectation();
    //   $httpBackend.verifyNoOutstandingRequest();
    // });
    var testOrder = {sessionId: '123456789', products: [{product: {title: 'Product1', price: 100, _id: '12345'}, quantity: 3}]}
    var testOrder2 = {sessionId: '123456789', products: [
    {product:
      {title: 'Product1', price: 100, _id: '12345'}, quantity: 3},
    {product:
      {title: 'Product3', price: 600, _id: '2345'}, quantity: 2}
    ]}
    it('adds products to cart and updates cache cart', function() {
      $httpBackend.whenPUT('/api/orders/addToCart/' + 12345, {quantity:3})
        .respond(200, testOrder); // give a canned response
      OrderFactory.addToCart('12345', 3).catch(console.error);
      $httpBackend.flush();
      expect( OrderFactory.getCartCache().sessionId ).to.be.equal( '123456789' );
      expect( OrderFactory.getCartCache().products[0].quantity ).to.be.equal( 3 );
      OrderFactory.addToCart('12345', 3).catch(console.error);
    });
    it('adds different products to cart', function() {
      $httpBackend.whenPUT('/api/orders/addToCart/' + 12345, {quantity:3})
        .respond(200, testOrder); // give a canned response
      $httpBackend.whenPUT('/api/orders/addToCart/' + 2345, {quantity:2})
        .respond(200, testOrder2); // give a canned response
      OrderFactory.addToCart('12345', 3).catch(console.error);
      $httpBackend.flush();
      expect( OrderFactory.getCartCache().sessionId ).to.be.equal( '123456789' );
      expect( OrderFactory.getCartCache().products[0].quantity ).to.be.equal( 3 );
      expect( OrderFactory.getCartCache().cartTotal ).to.be.equal( 300 );
      OrderFactory.addToCart('2345', 2).catch(console.error);
      $httpBackend.flush();
      expect( OrderFactory.getCartCache().cartTotal ).to.be.equal( 1500 );
      expect( OrderFactory.getCartCache().products[1].quantity ).to.be.equal( 2 );
    });



 });
