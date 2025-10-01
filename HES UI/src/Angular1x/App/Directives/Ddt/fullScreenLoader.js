angular.module('myApp').directive('fullScreenLoader', ['LoaderService', function (LoaderService) {
    return {
        restrict: 'E',
        template: '<div class="full-screen-loader" ng-if="isLoading()"><div class="loader"></div></div>',
        link: function (scope) {
            scope.isLoading = function () {
                return LoaderService.isLoading();
            };
        }
    };
}]);