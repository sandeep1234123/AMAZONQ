'use strict'
app.directive('pageLoader', ['$timeout', '$rootScope',
    function ($timeout, $rootScope) {
        return {
            restrict: 'AE',
            template: '<div class="dot1"></div><div class="dot2"></div>',
            link: function (scope, element, AuthService) {
                element.addClass('hide');
                scope.$on('$stateChangeStart', function () {
                    if ($rootScope.IsPageLoaderDisable) { }
                    else { element.toggleClass('hide animate'); }
                });
                scope.$on('$stateChangeSuccess', function (event) {
                    event.targetScope.$watch('$viewContentLoaded', function () {
                        $timeout(function () {
                            element.toggleClass('hide animate');
                        }, 600);
                    });
                });
            }
        };
    }
]);
