angular.module('myApp').service('LoaderService', function () {
    var loaderVisible = false;

    this.showLoader = function () {
        loaderVisible = true;
    };

    this.hideLoader = function () {
        loaderVisible = false;
    };

    this.isLoading = function () {
        return loaderVisible;
    };
});