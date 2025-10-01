'use strict';
app.controller('NavCtrl', ['$scope', '$state', 'comCrudService', 'ngAuthSettings', '$window', '$rootScope', 'AuthService',
    function ($scope, $state, comCrudService, ngAuthSettings, $window, $rootScope, AuthService) {
        $scope.oneAtATime = false;
        $scope.windowWidth = $window.innerWidth;
        $scope.copyrightPosition = "© Genus Power Infrastructures Ltd.";
        $scope.status = {
            isFirstOpen: true,
            isSecondOpen: true,
            isThirdOpen: true
        };
        var userInfo = AuthService.getAuthInfo();
        var showItems = function (itemsSelected) {
            var items = [];
            if (itemsSelected) {
                items = _.filter(itemsSelected, {
                    isDisableClass: true
                });
                if (items.length != itemsSelected.length)
                    return true;
            }
            return false;
        };
        var url = ngAuthSettings.apiServiceBaseUri + "api/Menu";
        comCrudService.post(null, url)
            .success(function (data) {
                if (data.version != undefined) {
                    $scope.Version = "v" + data.version;
                }
                $scope.sideMenu = {};

                $scope.sideMenu.networkMeteringItem = data.networkMetering;

                if ($scope.sideMenu.networkMeteringItem != null && showItems($scope.sideMenu.networkMeteringItem)) {
                    $scope.isNetworkMeteringOptions = true;
                } else
                    $scope.isNetworkMeteringOptions = false;
                if ($state.current.name == 'app') {
                    $scope.landingPage = data.landingPage;
                    $state.go($scope.landingPage);
                }

            }).error(function (data) {
                $scope.responseMsg = data;
            }).finally(function () {
            });
    }]);