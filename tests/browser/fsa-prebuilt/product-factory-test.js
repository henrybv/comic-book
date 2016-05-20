describe('The Product Factory', function(){
    beforeEach(module('core'));
    var ProductFactory;
    var $httpBackend;
    beforeEach(inject(function($injector){
        ProductFactory = $injector.get('ProductFactory');
        $httpBackend = $injector.get('$httpBackend');
    }));

    // afterEach(function() {
    //   $httpBackend.verifyNoOutstandingExpectation();
    //   $httpBackend.verifyNoOutstandingRequest();
    // });

    it('gets all products', function() {
      $httpBackend.whenGET('/api/product/') // when GET
        .respond(200, [{title: 'Product1', price: 100}, {title: 'Product2', price: 500}]); // give a canned response
      var product;
      ProductFactory.getAllProducts().then(function(gotProduct){
        product = gotProduct;
      }).catch(console.error);
      $httpBackend.flush();
      expect( product[0].price ).to.be.equal( 100 );
      expect( product[1].price ).to.be.equal( 500 );
    });

    it('gets one product', function() {
      $httpBackend.whenGET('/api/product/12345') // when GET
        .respond(200, {title: 'Product1', price: 100}); // give a canned response
      var product;
      ProductFactory.getOneProduct(12345).then(function(gotProduct){
        product = gotProduct;
      }).catch(console.error);
      $httpBackend.flush();
      expect( product.price ).to.be.equal( 100 );
    });


 });
