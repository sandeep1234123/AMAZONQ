'use strict';

var app = angular
    .module('myApp', [
        'ngNotificationsBar',
        'ngVis',
        'ngFileSaver',
        'ngAnimate',
        '720kb.datepicker',
        'ngCookies',
        'dnTimepicker',
        'ngResource',
        'ngSanitize',
        'ngMessages',
        'picardy.fontawesome',
        'ui.bootstrap',
        'ui.router',
        'ui.utils',
        'angular-loading-bar',
        'angular-momentjs',
        'FBAngular',
        'lazyModel',
        'toastr',
        'angularBootstrapNavTree',
        'oc.lazyLoad',
        'ui.select',
        'ui.tree',
        'textAngular',
        'colorpicker.module',
        'angularFileUpload',
        'ngImgCrop',
        'angular-flot',
        'angular-rickshaw',
        'easypiechart',
        'uiGmapgoogle-maps',
        'ui.calendar',
        'ngTagsInput',
        'pascalprecht.translate',
        'ngMaterial',
        'localytics.directives',
        'leaflet-directive',
        'wu.masonry',
        'ipsum',
        'angular-intro',
        'dragularModule',
        'tc.chartjs',
        'ui.bootstrap.datetimepicker',
        'ngBootstrap',
        'LocalStorageModule',
        'ui.toggle',
        'base64',
        'ng-fusioncharts',
        'angular-md5'
    ]);
app.run(['$rootScope', '$state', '$stateParams', 'AuthService', '$moment', function ($rootScope, $state, $stateParams, AuthService, $moment) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.IsPageLoaderDisable = false;
    $rootScope.activeState = '';
    $rootScope.previousState = '';
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        var userInfo = AuthService.getAuthInfo();
        var tenantDateFormat = userInfo && userInfo.cultureInfo ? userInfo.cultureInfo.DateTimeFormats : null;
        $rootScope.previousState = fromState.name;
        
        // Check if route requires authentication and user is not authenticated
        if (toState.authenticate && !AuthService._isAuthenticated) {
            $state.go("core.login");
            event.preventDefault();
            return;
        }
        
        $rootScope.activeState = toState.name;
        $rootScope.ToSerializedDate = function (dateTime, isFormattingRequired) {
            var newDateTime = '';
            if (tenantDateFormat && isFormattingRequired) {
                newDateTime = $moment(dateTime, tenantDateFormat.ShortDatePattern).format("YYYY-MM-DD")
            }
            else {
                newDateTime = $moment(dateTime).format("YYYY-MM-DD")
            }

            return newDateTime;
        };

        $rootScope.GetDate = function (date, dateFormat) {
            return tenantDateFormat ? $moment(date, tenantDateFormat.FullDateTimePattern) : $moment(date);
        }
        $rootScope.Base64EncodeUnicode = function (obj) {
            var str = JSON.stringify(obj)
            var utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode('0x' + p1);
            });
            return btoa(utf8Bytes);
        }
        $rootScope.isNotNullorUndefined = function (data) {
            var result = false;
            if (data != undefined && data != '' && data != null) {
                result = true;
            }
            return result;
        }
        $rootScope.isNotNullorUndefinedForNumber = function (data) {
            var result = false;
            if (data != undefined && data != '' && data != null) {
                result = true;
            }
            if (!isNaN(data)) {
                result = true;
            }
            return result;
        }
        $rootScope.FormatData = function (data, dataFormat) {
            var formattedString = data;
            if (data != null && dataFormat != null) {
                switch (dataFormat) {
                    case "date":
                        {
                            if (tenantDateFormat) {
                                formattedString = $moment(data, tenantDateFormat.FullDateTimePattern).format(tenantDateFormat.ShortDatePattern)
                            } else {
                                formattedString = $moment(data).format("YYYY-MM-DD")
                            }
                            break
                        }
                    case "datetime":
                        {
                            if (tenantDateFormat) {
                                formattedString = $moment(data, tenantDateFormat.FullDateTimePattern).format(tenantDateFormat.FullDateTimePattern)
                            } else {
                                formattedString = $moment(data).format("YYYY-MM-DD HH:mm:ss")
                            }
                            break
                        }
                    case "yearmonth":
                        {
                            if (tenantDateFormat) {
                                formattedString = $moment(data, tenantDateFormat.FullDateTimePattern).format(tenantDateFormat.YearMonthPattern)
                            } else {
                                formattedString = $moment(data).format("YYYY-MM")
                            }
                            break
                        }
                    case "time":
                        {
                            var days = Math.floor(data / (24 * 60 * 60))
                            var hours = Math.floor((data % (24 * 60 * 60)) / (60 * 60))
                            var minutes = Math.floor(data % (60 * 60) / 60)

                            formattedString = days < 10 ? '0' + days : days;
                            formattedString += "." + (hours < 10 ? '0' + hours : hours);
                            formattedString += ':' + (minutes < 10 ? '0' + minutes : minutes);
                            break
                        }
                    case "timeConvertfromminutes":
                        {
                            const totalSeconds = data * 60;

                            const days = Math.floor(totalSeconds / (24 * 3600));
                            const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            const seconds = totalSeconds % 60;

                            formattedString = days < 10 ? '0' + days : days;
                            formattedString += "." + (hours < 10 ? '0' + hours : hours);
                            formattedString += ':' + (minutes < 10 ? '0' + minutes : minutes);
                            formattedString += ':' + (seconds < 10 ? '0' + seconds : seconds);
                            break
                        }
                    case "timeinseconds":
                        {
                            var days = Math.floor(data / (24 * 60 * 60))
                            var hours = Math.floor((data % (24 * 60 * 60)) / (60 * 60))
                            var minutes = Math.floor(data % (60 * 60) / 60)
                            var seconds = Math.floor(data % 60);

                            formattedString = days < 10 ? '0' + days : days;
                            formattedString += "." + (hours < 10 ? '0' + hours : hours);
                            formattedString += ':' + (minutes < 10 ? '0' + minutes : minutes);
                            formattedString += ':' + (seconds < 10 ? '0' + seconds : seconds);
                            break
                        }
                    case "timeinhourandminutes":
                        {
                            const hours = Math.floor(data / 60);
                            const minutes = data % 60;

                            formattedString = "";
                            formattedString += (hours < 10 ? '0' + hours : hours);
                            formattedString += ':' + (minutes < 10 ? '0' + minutes : minutes);
                            break
                        }
                    case "timeinminuteseconds":
                        {
                            const minutes = Math.floor(data / 60);
                            const seconds = data % 60;

                            formattedString = "";
                            formattedString += (minutes < 10 ? '0' + minutes : minutes);
                            formattedString += ':' + (seconds < 10 ? '0' + seconds : seconds);
                            break
                        }
                    case "shorttime":
                        {
                            if (tenantDateFormat) {
                                formattedString = $moment(data, tenantDateFormat.FullDateTimePattern).format(tenantDateFormat.LongTimePattern)
                            } else {
                                formattedString = $moment(data).format("HH:mm:ss")
                            }
                            break
                        }
                    case "shortdate":
                        {
                            if (tenantDateFormat) {
                                formattedString = $moment(data, tenantDateFormat.FullDateTimePattern).format(tenantDateFormat.ShortDatePattern)
                            } else {
                                formattedString = $moment(data).format("YYYY-MM-DD")
                            }
                            break
                        }
                    case "abs":
                        {
                            formattedString = Math.abs(data);
                            break
                        }
                    default: {
                        if (dataFormat != '') {
                            if (dataFormat.includes('.')) {
                                var splitString = dataFormat.split('.');
                                if (splitString.length > 1) {
                                    var format = splitString[1];
                                    dataFormat = format.length;
                                }
                            }
                            formattedString = Number(data).toFixed(dataFormat)
                        }
                    }
                }

            }

            return formattedString;
        }
    });
    $rootScope.onclick = function (passwordField, showhideIcon) {
        var passwordSelector = angular.element(document.querySelector('#' + passwordField));
        var showorhideIcon = angular.element(document.querySelector('#' + showhideIcon));
        if (passwordSelector.attr('type') === 'password') {
            showorhideIcon.removeClass('fa fa-eye-slash');
            showorhideIcon.addClass('fa fa-eye');
            passwordSelector.attr('type', 'text');
        } else {
            showorhideIcon.removeClass('fa fa-eye');
            showorhideIcon.addClass('fa fa-eye-slash');
            passwordSelector.attr('type', 'password');
        }
    }
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        event.targetScope.$watch('$viewContentLoaded', function () {

            angular.element('html, body, #content').animate({
                scrollTop: 0
            }, 200);

            setTimeout(function () {
                angular.element('#wrap').css('visibility', 'visible');

                if (!angular.element('.dropdown').hasClass('open')) {
                    angular.element('.dropdown').find('>ul').slideUp();
                }
            }, 200);
        });
        $rootScope.containerClass = toState.containerClass;

        var setIntervalId = setInterval(function () {
            var flotTip = $('.flotTip');
            if (flotTip) {
                $('.flotTip').remove();
                clearInterval(setIntervalId);
            }
        }, 2000);
    });
}]);

app.config(['notificationsConfigProvider', function (notificationsConfigProvider) {
    notificationsConfigProvider.setHideDelay(2000);
    notificationsConfigProvider.setAutoHide(true);
    notificationsConfigProvider.setAcceptHTML(true);
}]);

app.config(['uiSelectConfig', function (uiSelectConfig) {
    uiSelectConfig.theme = 'bootstrap';
}]);

//angular-language
app.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'Angular1x/languages/',
        suffix: '.json'
    });
    $translateProvider.useLocalStorage();
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy(null);
}]);



app.constant('ngAuthSettings', {
    apiServiceBaseUri: window.__env.WEBSERVERURL,
    clientId: 'ngAuthApp',
});

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
}]);


'use strict';
app.factory('authInterceptorService',
    ['$q', '$rootScope', '$stateParams', '$location', 'localStorageService', 'ngAuthSettings',
        function ($q, $rootScope, $stateParams, $location, localStorageService, ngAuthSettings) {
            var authInterceptorServiceFactory = {};
            var _request = function (config) {
                config.headers = config.headers || {};
                var authData = localStorageService.get('authorizationData');
                if (authData) {
                    config.headers.Authorization = 'Bearer ' + authData.token;
                }

                return config;
            }


            authInterceptorServiceFactory.request = _request;


            return authInterceptorServiceFactory;
        }]);
app.filter('skip', function () {
    return function (input, start) {
        if (!input || !input.length) return [];
        start = parseInt(start, 10);
        return input.slice(start);
    };
});

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    //alert();
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode({
        enabled: false,
        requireBase: true
    });

    //$locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('core/login');
    var isAuthenticated = false;

    $stateProvider

        .state('app', {
            url: '/app',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Shared/app.html'
        })
        //dashboard
        .state('app.help', {
            url: '/help',
            controller: 'HelpCtrl',
            templateUrl: 'views/tmpl/help.html'
        })
        .state('app.error', {
            url: '/error',
            controller: 'ErrorCtrl',
            templateUrl: 'Angular1x/App/Shared/errorPage.html',
            authenticate: isAuthenticated
        })
        .state('app.UnauthorizedError', {
            url: '/Unauthorized',
            controller: 'ErrorCtrl',
            templateUrl: 'Angular1x/App/Shared/unAuthorizedError.html',
            authenticate: isAuthenticated
        })
        .state('app.ForbiddenError', {
            url: '/ForbiddenError',
            controller: 'ErrorCtrl',
            templateUrl: 'Angular1x/App/Shared/errorPage.html',
            authenticate: isAuthenticated
        })
        .state('app.NetworkMetering', {
            abstract: isAuthenticated,
            url: '/NetworkMetering',
            abstract: true,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/Container.html'
        })
        .state('app.NetworkMetering.DT', {
            abstract: isAuthenticated,
            url: '/NetworkMetering',
            abstract: true,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/Container.html'
        })

        .state('app.NetworkMetering.Feeder', {
            abstract: isAuthenticated,
            url: '/NetworkMetering',
            abstract: true,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/Container.html'
        })
        .state('app.NetworkMetering.DTForm', {
            url: '/DTForm',
            controller: 'DTFormCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTForm.html'
        })
        .state('app.NetworkMetering.EditDTForm', {
            url: '/DTForm/:dtCode',
            controller: 'DTFormCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTForm.html'
        })
        .state('app.NetworkMetering.DTList', {
            url: '/DTList',
            params: {
                unmapped: false,
                unmappedDT: false,
            },
            controller: 'DTListCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTList.html'
        })

        .state('app.NetworkMetering.DTInformation', {
            url: '/DT/:name/DTInformation',
            controller: 'TabDTInformation',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTTabInformation.html',
        })
        .state('app.NetworkMetering.DT.HighestCurrentReport', {
            url: '/DT/:name/HighestCurrentReport',
            controller: 'TabHighestCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTHighestCurrentReport.html',
            yAxisLabel: 'Current(A)',
            apiUrlKey: "HighestPhaseCurrent",
            pageTitle: 'Menu.HighestPhaseCurrent',
            gridID: "HighestCurrentReport",
            filterTitle: "HighestPhaseCurrentCriteria",
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/highestPhaseCurrentDT.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/highestPhaseCurrentDT.html',
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
        })
        .state('app.NetworkMetering.DT.LoadCurveReport', {
            url: '/DT/:name/LoadCurveReport',
            controller: 'TabLoadReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTLoadReport.html',
            durationCurveTitle: "LoadDurationCurve",
            yAxisLabel: 'Load(kVA)',
            apiUrlKey: "Load",
            pageTitle: 'Menu.Load',
            gridID: "kWLoadCurveReport",
            showLoadedUnloadedCurveOnUi: true,
            filterTitle: "VoltageLoadedorUnloaded",
            buttonTitle: "LoadingStats",
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
        })
        .state('app.NetworkMetering.DT.PowerFactorReport', {
            url: '/DT/:name/PowerFactorReport',
            controller: 'TabPFandNeturalCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPFandNeturalCurrentReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'PowerFactor',
            apiUrlKey: "PowerFactor",
            pageTitle: 'Menu.PowerFactor',
            gridID: "PowerFactorReport",
            tickInterval: 0.1,
            minTicks: 0,
            maxTicks: 1,
            excelFileName: 'PowerFactor',
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
        })
        .state('app.NetworkMetering.DT.PhaseVoltageReport', {
            url: '/DT/:name/PhaseVoltageReport',
            controller: 'TabPhaseVoltageReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPhaseVoltageReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'Voltage(V)',
            apiUrlKey: "PhaseVoltage",
            pageTitle: 'Menu.PhaseVoltageReport',
            gridID: "PhaseVoltageReport",
            filterTitle: "PhaseVoltageStudyCriteria",
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/phaseVoltage.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/phaseVoltage.html',
        })
        .state('app.NetworkMetering.DT.CurrentUnbalance', {
            url: '/DT/:name/CurrentUnbalance',
            controller: 'TabPFandNeturalCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPFandNeturalCurrentReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'Value(%)',
            apiUrlKey: "CurrentUnbalance",
            pageTitle: 'Menu.CurrentUnbalance',
            gridID: "CurrentUnbalance",
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/currentUnbalanceDT.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/currentUnbalanceDT.html',
            excelFileName: 'CurrentUnbalance',
            tickInterval: 1,
            minTicks: 0,
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
        })
        .state('app.NetworkMetering.DT.VoltageUnbalance', {
            url: '/DT/:name/VoltageUnbalance',
            controller: 'TabUnbalanceReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTUnbalanceReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'VoltageUnbalance(%)',
            apiUrlKey: "VoltageUnbalance",
            pageTitle: 'Menu.VoltageUnbalance',
            showUnbalancedCurveOnUi: true,
            gridID: "VoltageUnbalance",
            filterTitle: "VoltageUnbalancedStudyCriteria",
            buttonTitle: "UnbalancedStats",
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/voltageUnbalanceDT.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/voltageUnbalanceDT.html',
            excelFileName: 'VoltageUnbalance',
            tickInterval: 1,
            minTicks: 0,
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
        })
        .state('app.NetworkMetering.DT.NeutralCurrentReport', {
            url: '/DT/:name/NeutralCurrentReport',
            controller: 'TabPFandNeturalCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPFandNeturalCurrentReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'Current(A)',
            apiUrlKey: "NeutralCurrent",
            pageTitle: 'Menu.NeutralCurrentReport',
            gridID: "NeutralCurrentReport",
            excelFileName: 'NeutralCurrent',
            reportFor: 'DT',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/DTDetailsTabs.html',
        })

        .state('app.NetworkMetering.Feeder.HighestCurrentReport', {
            url: '/Feeder/:name/HighestCurrentReport',
            controller: 'TabHighestCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTHighestCurrentReport.html',
            yAxisLabel: 'Current(A)',
            apiUrlKey: "HighestPhaseCurrent",
            pageTitle: 'Menu.HighestPhaseCurrent',
            gridID: "HighestCurrentReport",
            filterTitle: "HighestPhaseCurrentCriteria",
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/highestPhaseCurrentDT.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/highestPhaseCurrentDT.html',
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
        })
        .state('app.NetworkMetering.Feeder.LoadCurveReport', {
            url: '/Feeder/:name/LoadCurveReport',
            controller: 'TabLoadReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTLoadReport.html',
            durationCurveTitle: "LoadDurationCurve",
            yAxisLabel: 'Load(kVA)',
            apiUrlKey: "Load",
            pageTitle: 'Menu.Load',
            gridID: "kWLoadCurveReport",
            showLoadedUnloadedCurveOnUi: true,
            filterTitle: "VoltageLoadedorUnloaded",
            buttonTitle: "LoadingStats",
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
        })
        .state('app.NetworkMetering.Feeder.PowerFactorReport', {
            url: '/Feeder/:name/PowerFactorReport',
            controller: 'TabPFandNeturalCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPFandNeturalCurrentReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'PowerFactor',
            apiUrlKey: "PowerFactor",
            pageTitle: 'Menu.PowerFactor',
            gridID: "PowerFactorReport",
            tickInterval: 0.1,
            minTicks: 0,
            maxTicks: 1,
            excelFileName: 'PowerFactor',
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
        })
        .state('app.NetworkMetering.Feeder.PhaseVoltageReport', {
            url: '/Feeder/:name/PhaseVoltageReport',
            controller: 'TabPhaseVoltageReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPhaseVoltageReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'Voltage(V)',
            apiUrlKey: "PhaseVoltage",
            pageTitle: 'Menu.PhaseVoltageReport',
            gridID: "PhaseVoltageReport",
            filterTitle: "PhaseVoltageStudyCriteria",
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/phaseVoltage.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/phaseVoltage.html',
        })
        .state('app.NetworkMetering.Feeder.CurrentUnbalance', {
            url: '/Feeder/:name/CurrentUnbalance',
            controller: 'TabPFandNeturalCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPFandNeturalCurrentReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'Value(%)',
            apiUrlKey: "CurrentUnbalance",
            pageTitle: 'Menu.CurrentUnbalance',
            gridID: "CurrentUnbalance",
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/currentUnbalanceDT.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/currentUnbalanceDT.html',
            excelFileName: 'CurrentUnbalance',
            tickInterval: 1,
            minTicks: 0,
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
        })
        .state('app.NetworkMetering.Feeder.VoltageUnbalance', {
            url: '/Feeder/:name/VoltageUnbalance',
            controller: 'TabUnbalanceReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTUnbalanceReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'VoltageUnbalance(%)',
            apiUrlKey: "VoltageUnbalance",
            pageTitle: 'Menu.VoltageUnbalance',
            showUnbalancedCurveOnUi: true,
            gridID: "VoltageUnbalance",
            filterTitle: "VoltageUnbalancedStudyCriteria",
            buttonTitle: "UnbalancedStats",
            tableHeaderTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/voltageUnbalanceDT.html',
            tableBodyTemplateURL: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/voltageUnbalanceDT.html',
            excelFileName: 'VoltageUnbalance',
            tickInterval: 20,
            minTicks: 0,
            maxTicks: 200,
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
        })
        .state('app.NetworkMetering.Feeder.NeutralCurrentReport', {
            url: '/Feeder/:name/NeutralCurrentReport',
            controller: 'TabPFandNeturalCurrentReport',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTPFandNeturalCurrentReport.html',
            durationCurveTitle: "DurationCurve",
            yAxisLabel: 'Current(A)',
            apiUrlKey: "NeutralCurrent",
            pageTitle: 'Menu.NeutralCurrentReport',
            gridID: "NeutralCurrentReport",
            excelFileName: 'NeutralCurrent',
            reportFor: 'Feeder',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',

        })
        .state('app.NetworkMetering.Feeder.EnergyAccountingReport', {
            url: '/Feeder/:name/EnergyAccountingReport',
            controller: 'TabFeederEnergyAccounting',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/FeederEnergyAccountingReport.html',
            partialViewPath: 'Angular1x/App/Components/NetworkMetering/View/FeederDetailsTabs.html',
        })

        .state('app.NetworkMetering.FeederList', {
            url: '/FeederList',
            params: {
                unmapped: false,
            },
            controller: 'FeederListCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/FeederList.html'
        })
        .state('app.NetworkMetering.FeederForm', {
            url: '/FeederForm',
            controller: 'FeederFormCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/FeederForm.html'
        })
        .state('app.NetworkMetering.EditFeederForm', {
            url: '/FeederForm/:feederCode',
            controller: 'FeederFormCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/FeederForm.html'
        })
        .state('app.NetworkMetering.ManageDTForm', {
            url: '/ManageDTForm/:feederInfo',
            controller: 'ManageDTFormCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/ManageDTForm.html'
        })
        .state('app.NetworkMetering.FeederInformation', {
            url: '/Feeder/:name/FeederInformation',
            controller: 'TabFeederInformation',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/FeederTabInformation.html',
        })
        .state('app.NetworkMetering.DTAssociationInformation', {
            url: '/Feeder/:name/DTAssociationInformation',
            controller: 'TabDTAssociationInformation',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/DTAssociationInformation.html',
        })
        .state('app.NetworkMetering.EnergyAudit', {
            url: '/Feeder/:name/EnergyAudit',
            controller: 'TabFeederEnergyAudit',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/FeederEnergyAuditTab.html',
        })
        .state('app.NetworkMetering.DTMonthlyReport', {
            url: '/DTMonthlyReport',
            params: {
                overload: false,
                underload: false,
                unbalanced: false,
                isFeederLoss: false,
                isOutageCount: false,
                isOutageDuration: false,
                isLastMonth: true
            },
            controller: 'NetworkMeteringReportsCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            reportFrequency: "Monthly",
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/NetworkMeteringReports.html',
        })

        // New State Added 
        .state('app.NetworkMetering.DTMonthlyConsumptionReport', {
            url: '/DTMonthlyConsumptionReport',
            controller: 'NetworkMeteringDTMonthlyConsumptionReportsCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            reportFrequency: "Monthly",
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/NetworkMeteringDTMonthlyConsumptionReports.html',
        })

        .state('app.NetworkMetering.FeederPowerOnOffReport', {
            url: '/FeederPowerOnOffReport',
            controller: 'NetworkMeteringFeederPowerOnOffReportsCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            reportFrequency: "Monthly",
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/NetworkMeteringFeederPowerOnOffReports.html',
        })

        .state('app.NetworkMetering.FeederSaifiSaidiReport', {
            url: '/FeederSaifiSaidiReport',
            controller: 'NetworkMeteringFeederSaifiSaidiReportCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            reportFrequency: "Monthly",
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/NetworkMeteringFeederSaifiSaidiReport.html',
        })

        // .state('app.NetworkMetering.FeederSaifiSaidiReport', {
        //     url: '/FeederSaifiSaidiReport',
        //     controller: 'NetworkMeteringFeederSaifiSaidiReportCtrl',
        //     controllerAs: 'vm',
        //     authenticate: isAuthenticated,
        //     reportFrequency: "Monthly",
        //     templateUrl: 'Angular1x/App/Components/NetworkMetering/View/NetworkMeteringFeederSaifiSaidiReport.html',
        // })




        .state('app.NetworkMetering.DTDailyReport', {
            url: '/DTDailyReport',
            params: {
                overload: false,
                underload: false,
                unbalanced: false,
                isFeederLoss: false,
                isOutageCount: false,
                isOutageDuration: false,
                isCurrentMonth: true
            },
            controller: 'NetworkMeteringReportsCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            reportFrequency: "Daily",
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/NetworkMeteringReports.html',
        })

        .state('app.NetworkMetering.PublishReport', {
            url: '/PublishReport/:reportType/:frequency',
            controller: 'PublishReportCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/PublishReport.html',
        })
        .state('app.NetworkMetering.Dashboard', {
            url: '/NetworkDashboard',
            controller: 'NetworkDashboardCtrl',
            controllerAs: 'vm',
            authenticate: isAuthenticated,
            templateUrl: 'Angular1x/App/Components/NetworkMetering/View/Dashboard.html',
        })
        .state('core', {
            abstract: isAuthenticated,
            url: '/core',
            template: '<div ui-view></div>'
        })
        //login
        .state('core.login', {
            url: '/login',
            controller: 'LoginCtrl',
            templateUrl: 'Angular1x/App/Shared/Login.html'
        })
        //forgot password
        .state('core.forgotpass', {
            url: '/forgotpass',
            controller: 'ForgotPasswordCtrl',
            templateUrl: 'Angular1x/App/Shared/forgotpass.html'
        })
        //page 404
        .state('core.page404', {
            url: '/page404',
            templateUrl: 'Angular1x/App/Shared/page404.html'
        })
        //page 500
        .state('core.page500', {
            url: '/page500',
            templateUrl: 'Angular1x/App/Shared/page500.html'
        })
}]);