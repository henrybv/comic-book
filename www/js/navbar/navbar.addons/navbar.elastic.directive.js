core.directive('elastic', [
    '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, element) {
                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                var resize = function() {
                    element[0].style.height = $scope.initialHeight;
                    element[0].style.height = "" + element[0].scrollHeight + "px";
                    console.log("ELASTIC height then width", element[0].scrollHeight, element[0].scrollWidth)
                };
                element.on("input change", resize);
                $timeout(resize, 0);
            }
        };
    }
])