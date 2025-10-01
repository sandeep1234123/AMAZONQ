'use strict';
app.controller('FeederDetailsTabCtrl', ['$scope', '$filter', '$state', 'URIService', '$rootScope',
    function ($scope, $filter, $state, URIService, $rootScope) {
        $scope.onload = function (filterType, requestDetails, tabName, showRefresh) {
            $scope.selectedTabId = 0;
            $scope.showHierarchy = false;
            getDeviceNameByDeviceID(requestDetails.DeviceID);

            switch (tabName) {
                case 'FeederInformation': {
                    $scope.selectedTabId = 0;
                    break;
                }
                case 'DTmaster': {
                    $scope.selectedTabId = 1;
                    break;
                }
                case 'EnergyAudit': {
                    $scope.selectedTabId = 2;
                    break;
                }
                case 'Reports': {
                    $scope.selectedTabId = 3;
                    break;
                }
            }
            $scope.filterType = filterType;
            $scope.FeederName = requestDetails.DeviceID;

            if (!$scope.isNotNullorUndefined($rootScope.DeviceID) || $rootScope.DeviceID != $scope.FeederName) {
                $rootScope.DeviceID = requestDetails.DeviceID;
                getDeviceNameByDeviceID(requestDetails.DeviceID);
                if ($scope.showHierarchy) {
                    getOfficialHierarchy(requestDetails.DeviceID);
                }
            }
            else {
                $rootScope.DeviceID = requestDetails.DeviceID;
                $scope.originalDeviceName = $rootScope.originalDeviceNameRoot;
            }
            $scope.showRefresh = showRefresh;
        }
        $scope.ReportsTabs = [
            {
                id: 0,
                title: $filter('translate')('Menu.HighestCurrent'),
                content: 'app.NetworkMetering.Feeder.HighestCurrentReport',
                active: false,
                color: "#95a2a9"
            },
            {
                id: 1,
                title: $filter('translate')('Menu.LoadCurve'),
                content: 'app.NetworkMetering.Feeder.LoadCurveReport',
                active: false,
                color: "#95a2a9"
            },
            {
                id: 2,
                title: $filter('translate')('Menu.PowerFactor'),
                content: 'app.NetworkMetering.Feeder.PowerFactorReport',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 3,
                title: $filter('translate')('Menu.PhaseVoltage'),
                content: 'app.NetworkMetering.Feeder.PhaseVoltageReport',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 4,
                title: $filter('translate')('Menu.CurrentUnbalance'),
                content: 'app.NetworkMetering.Feeder.CurrentUnbalance',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 5,
                title: $filter('translate')('Menu.VoltageUnbalance'),
                content: 'app.NetworkMetering.Feeder.VoltageUnbalance',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 6,
                title: $filter('translate')('Menu.NeutralCurrent'),
                content: 'app.NetworkMetering.Feeder.NeutralCurrentReport',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 7,
                title: $filter('translate')('Menu.EnergyAccounting'),
                content: 'app.NetworkMetering.Feeder.EnergyAccountingReport',
                active: false,
                color: "#95a2a9"
            }
        ];
        $scope.FeederDetailsTabs = [
            {
                id: 0,
                title: $filter('translate')('Menu.FeederInformation'),
                content: 'app.NetworkMetering.FeederInformation',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 1,
                title: $filter('translate')('Menu.DTmaster'),
                content: 'app.NetworkMetering.DTAssociationInformation',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 2,
                title: $filter('translate')('Menu.EnergyAudit'),
                content: 'app.NetworkMetering.EnergyAudit',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 3,
                title: $filter('translate')('Menu.Reports'),
                active: false,
                color: "#95a2a9"
            }
        ];
        $scope.tabClick = function (tabData, tabIndex) {
            $scope.selectedTabId = tabIndex;
            if (tabData.id == 3) {
                showHideReportDropDowns(false);
            }
            else {
                showHideReportDropDowns(true);
                $state.get(tabData.content)["tabIndex"] = tabIndex;
                $state.go(tabData.content, {
                    'name': $scope.FeederName,
                    'code': $scope.FeederCode,
                });
            }

        }
        $scope.selectReportClick = function (tabData, tabIndex) {
            $rootScope.selectedTabReportId = tabIndex;
            showHideReportDropDowns(true);
            $state.get(tabData.content)["tabIndex"] = tabIndex;
            $state.go(tabData.content, {
                'name': $scope.FeederName,
            });

        }
        function showHideReportDropDowns(hide) {
            var dropdowns = document.getElementsByClassName("dropdown-content")[0];
            var downArrow = document.getElementById("downArrow");
            var upArrow = document.getElementById("upArrow");

            if (hide) {
                dropdowns.classList.remove('show');
            } else {
                if (dropdowns.classList.contains('show')) {
                    dropdowns.classList.remove('show');
                } else {
                    dropdowns.classList.add('show');
                }
            }

            downArrow.style.display = downArrow.style.display === "none" ? "inline-block" : "none";
            upArrow.style.display = upArrow.style.display === "none" ? "inline-block" : "none";
        }
        $scope.getDTData = function () {
            $scope.requestDetails = { FeederName: $scope.FeederName };
            switch ($scope.filterType) {
                case 2:
                    {
                        $scope.requestDetails.Date = { Start: $scope.fromDate, End: $scope.toDate };
                        break;
                    }
                default:
                    {
                        break;
                    }

            }
            if ($scope.originalDeviceName == $scope.requestDetails.FeederName) {
                $scope.$parent.getFeederNameData($scope.requestDetails);
            }
            else {
                $state.go("app.NetworkMetering.FeederInformation", {
                    'name': $scope.requestDetails.FeederName,
                });
            }
        }
        function getDeviceNameByDeviceID(feederCode) {
            URIService.GetData(URIService.GetDeviceNameByDeviceID(feederCode, 'feeder'))
                .success(function (response, status, headers, config) {
                    if (status === 200) {
                        $rootScope.originalDeviceNameRoot = response.Data[0]['FeederName'];
                        $scope.originalDeviceName = $rootScope.originalDeviceNameRoot;
                    }
                }).error(function (data, status, headers, config) {
                    $scope.isProcessing = false;
                });
        }
        function getOfficialHierarchy(feederCode) {
            URIService.GetData(URIService.GetOfficialHierarchy(feederCode, 'feeder'))
                .success(function (response, status, headers, config) {
                    if (status === 200) {
                        if ($scope.isNotNullorUndefined(response.Data) && response.Data.length > 0) {
                            $scope.showHierarchy = true;
                            $scope.hierarchyDetils = response.Data;
                        }
                    }
                }).error(function (data, status, headers, config) {
                    $scope.isProcessing = false;
                });
        }
    }]);