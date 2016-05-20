describe('cut filter', function() {
  beforeEach(module('core'));
  var $filter;
  beforeEach(inject(function(_$filter_){
    $filter= _$filter_;
  }));
  it('cuts a long description', function() {
    var cut = $filter('cut');
    expect( cut('Hawaii is a destination dreamt by most of the people. If you like good weather, perfect setting, magnificent views', true, 10) ).to.be.equal( 'Hawaii is …' );
}); });






// describe('The Product Factory', function(){
//     beforeEach(module('core'));
//     var ProductFactory;
//     var $httpBackend;
//     beforeEach(inject(function($injector){
//         ProductFactory = $injector.get('ProductFactory');
//         $httpBackend = $injector.get('$httpBackend');
//     }));
