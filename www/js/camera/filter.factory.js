core.factory('FilterFactory', function($http){
  var FilterFactory = {};

  FilterFactory.clearFilter = function(canvasId, img){
        console.log('in clear filter');
        Caman('#'+canvasId, img, function(){
            this.revert(false);
            this.render();
        })
    }

  FilterFactory.greyPosterFilter = function(canvasId, img){
        console.log('calling grey filter')
        Caman("#"+canvasId, img, function() {
            this.posterize(3);
            this.greyscale();
            this.render()
        });
    }

  FilterFactory.colorPosterFilter = function(canvasId, img){
        Caman("#"+canvasId, img, function() {
            this.posterize(3);
            this.noise(3);
            this.render()
        });
    }

  FilterFactory.brownPosterFilter = function(canvasId, img){
        Caman('#'+canvasId, img, function(){
            this.hazyDays(5);
            this.love(5);
            this.grungy(5);
            this.noise(5);
            this.render();
        })
    }

  FilterFactory.blackFilter = function(canvasId, img){
        Caman('#'+canvasId, img, function() {
            this.brightness(4);
            this.contrast(10);
            this.sinCity(2);
            this.noise(4);
            this.render()
        });
    }

  return FilterFactory;
})



