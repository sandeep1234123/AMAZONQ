'use strict';
app.controller('LoginCtrl', ['$scope', '$state', 'AuthService', '$rootScope',
    'ConfigService', 'ngAuthSettings', 'localStorageService', 'CommonDataFactory',
    'SecurityService', 'URIService', '$location',
    function ($scope, $state, AuthService, $rootScope,
        ConfigService, ngAuthSettings, localStorageService, CommonDataFactory, SecurityService, URIService, $location) {
        var redirectLocation = $location.search();
        $scope.homeLogoTitle = window.__env.homeLogoTitle;
        $scope.homeLogoPath = window.__env.homeLogoPath;
        var configInfo = null;
        
        $scope.user = {
            username: '',
            password: ''
        };

        ConfigService.setConfigInfo(function () {
            configInfo = ConfigService.getConfigInfo();
            $scope.appTitle = configInfo.APPINFO.APPTITLE;
        });

        $scope.onPasswordKeyPressed = function ($event) {
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13) {
                document.querySelector('#' + 'loginbtn').focus();
                $scope.login(loginform);
            }
        };

        $scope.login = function (form) {
            if (!form.$valid) {
                return false;
            }
            $scope.responseMsg = "";
            AuthService._isAccessToken = '';
            AuthService._isAuthenticated = false;
            localStorageService.remove('authorizationData');
            localStorageService.remove('authInfo');
            CommonDataFactory.clearfactoryData();
            URIService.GetData(URIService.GetNonceUrl($scope.user.username))
                .success(function (response, status, headers, config) {
                    if (status === 200) {
                        var authRequest = new AuthenticationRequest($scope.user.username);
                        authRequest.Realm = response.realm;
                        authRequest.Nonce = response.nonce;
                        authRequest.Uri = '/api/Authentication/Login';
                        authRequest.Response = SecurityService.ComputeHash($scope.user.username, authRequest.Realm, $scope.user.password, 'POST', authRequest.Uri, authRequest.Nonce)

                        URIService.SubmitNewRequest(URIService.GetTryAuthenticationUrl(), authRequest)
                            .success(function (response, status, headers, config) {
                                AuthService._isAuthenticated = true;
                                AuthService._isAccessToken = response.access_token;
                                AuthService._authInfo =
                                {
                                    "userName": $scope.user.username,
                                    "tenantId": response.tenantId,
                                    "roleId": response.RoleId,
                                    "dataLookBackDate": response.DataLookBackDate,
                                    "cultureInfo": response.CultureInfo,
                                    "realm": authRequest.Realm,
                                    "systemStartDate": response.SystemStartDate,
                                };

                                AuthService._authInfo.cultureInfo.DateTimeFormats = AdaptToAngularDateTimeFormat(AuthService._authInfo.cultureInfo.DateTimeFormats);
                                localStorageService.set('authInfo', AuthService._authInfo);

                                if (AuthService._isAccessToken) {
                                    localStorageService.set('authorizationData', { token: AuthService._isAccessToken, userName: $scope.user.username });
                                }

                                if (redirectLocation.Redirect != null && redirectLocation.Redirect != undefined && redirectLocation.Redirect != '') {
                                    $location.$$search = null;
                                    $location.path(redirectLocation.Redirect)
                                }
                                else {
                                    $state.go("app");
                                }


                            }).error(function (response, status, headers, config) {
                                if (response != null) {
                                    $scope.responseMsg = response;
                                }
                                else {
                                    $scope.responseMsg = "Service Unavailable. Please Try later !"
                                }

                            }).finally(function () {
                            });
                    }
                })
        };
        function AdaptToAngularDateTimeFormat(dateTimeFormats) {
            dateTimeFormats.FullDateTimePattern = ConvertDateTimeFormat(dateTimeFormats.FullDateTimePattern);
            dateTimeFormats.ShortDatePattern = ConvertDateTimeFormat(dateTimeFormats.ShortDatePattern);
            dateTimeFormats.YearMonthPattern = ConvertDateTimeFormat(dateTimeFormats.YearMonthPattern);

            return dateTimeFormats;
        }

        function ConvertDateTimeFormat(dateTimeFormat) {

            return dateTimeFormat.replace("dd", "DD").replace("yyyy", "YYYY").replace("yy", "YY");
        }

    }]);

class AuthenticationRequest {
    constructor(userName) {
        this.UserName = userName;
        this.Realm = null;
        this.Nonce = null;
        this.Uri = null;
        this.HttpMethod = null;
        this.Response = null;
    }
}
