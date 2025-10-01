'use strict'
app.controller('ErrorCtrl', ['$scope', '$rootScope', '$timeout', '$location',
    function ($scope, $rootScope, $timeout, $location) {
        var stopped;
        $rootScope.ErrorDetails = JSON.parse(sessionStorage.ErrorDetails);
        sessionStorage['ErrorDetails'] = null;
        $scope.problem = {
            Status: $rootScope.ErrorDetails.Status,
            Title: $rootScope.ErrorDetails.Title,
            Detail: $rootScope.ErrorDetails.Detail,
        };

        if ($scope.problem.Status == 401) {
            $scope.counter = 15;
            $scope.countdown = function () {
                stopped = $timeout(function () {
                    $scope.counter--;
                    if ($scope.counter == 0) {
                        $scope.RedirectToLoginPage();
                    }
                    else {
                        $scope.countdown();
                    }
                }, 1000);
            };
            $scope.stop = function () {
                $timeout.cancel(stopped);
            }

            $scope.RedirectToLoginPage = function () {
                $timeout.cancel(stopped);
                var path = 'core/login';
                if ($rootScope.ErrorDetails.Refer != null && $rootScope.ErrorDetails.Refer != '' && $rootScope.ErrorDetails.Refer != undefined) {
                    $location.path(path).search({ Redirect: $rootScope.ErrorDetails.Refer })
                }
                else {
                    $location.path(path);
                }


            };
        }
    }]);