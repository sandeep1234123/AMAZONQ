'use strict'
app.controller('MainCtrl', ['$scope', '$http', '$translate', function($scope, $http, $translate) {

    $scope.main = {
        title: 'Home',
        settings: {
            navbarHeaderColor: 'scheme-drank',
            sidebarColor: 'scheme-drank',
            brandingColor: 'scheme-drank',
            activeColor: 'scheme-drank',
            headerFixed: true,
            asideFixed: true,
            rightbarShow: false
        }
    };
    $scope.currentLanguage = $translate.proposedLanguage() || $translate.use();
}]);