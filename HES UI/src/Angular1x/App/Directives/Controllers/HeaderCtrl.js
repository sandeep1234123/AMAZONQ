'use strict'
app.controller('HeaderCtrl', ['$scope', 'AuthService', '$state', 'localStorageService', 'CommonDataFactory', '$window', '$interval', '$location',
    function ($scope, AuthService, $state, localStorageService, CommonDataFactory, $window, $interval, $location) {
        $scope.headerLogo1Path = window.__env.headerLogo1Path;
        $scope.showHeaderLogo2 = window.__env.showHeaderLogo2;
        $scope.headerLogo2Path = window.__env.headerLogo2Path;
        $scope.headerLogo2Title = window.__env.headerLogo2Title;
        $scope.homeLogoPath = window.__env.homeLogoPath;

        var authInfo = AuthService.getAuthInfo();
        $scope.userName = authInfo.userName;
        $scope.roleId = authInfo.roleId;
        $scope.showHeader = true;
        $scope.windowWidth = $window.innerWidth;
        $scope.ProductName = "POWERGRID";
        $scope.logout = function () {
            AuthService._isAccessToken = '';
            AuthService._isAuthenticated = false;
            localStorageService.remove('authorizationData');
            CommonDataFactory.clearfactoryData();
            $state.go("core.login");
            $location.replace()
        }

        $scope.newNotifications = 0;
        $scope.notificationData = [];

        $scope.changePassword = function () {
            $state.go("app.Users.ChangePassword");
        }

        $scope.versionNumber = window.__env.VERSION;
        $scope.brandTitle = window.__env.brandTitle;
        $scope.UpdateNotificationViewTime = function () {
            CommonDataFactory.UpdateNotificationTime().then(function (data) {
                console.log(data);
            });
        }

    }
]);