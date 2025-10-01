'use strict';
app.controller('DTDetailsTabCtrl', ['$scope', '$filter', '$state', 'URIService', '$rootScope',
    function ($scope, $filter, $state, URIService, $rootScope) {
        $scope.onload = function (filterType, requestDetails, tabName, showRefresh) {
            $scope.showHierarchy = false;
            $scope.selectedTabId = 0;
            switch (tabName) {
                case 'DTInformation': {
                    $scope.selectedTabId = 0;
                    break;
                }
                case 'Reports': {
                    $scope.selectedTabId = 1;
                    break;
                }
            }
            $scope.filterType = filterType;
            $scope.DTName = requestDetails.DeviceID;
            if (!$scope.isNotNullorUndefined($rootScope.DeviceID) || $rootScope.DeviceID != $scope.DTName) {
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
        $scope.selectedTabReportId;
        $scope.ReportsTabs = [
            {
                id: 0,
                title: $filter('translate')('Menu.HighestCurrent'),
                content: 'app.NetworkMetering.DT.HighestCurrentReport',
                active: false,
                color: "#95a2a9"
            },
            {
                id: 1,
                title: $filter('translate')('Menu.LoadCurve'),
                content: 'app.NetworkMetering.DT.LoadCurveReport',
                active: false,
                color: "#95a2a9"
            },
            {
                id: 2,
                title: $filter('translate')('Menu.PowerFactor'),
                content: 'app.NetworkMetering.DT.PowerFactorReport',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 3,
                title: $filter('translate')('Menu.PhaseVoltage'),
                content: 'app.NetworkMetering.DT.PhaseVoltageReport',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 4,
                title: $filter('translate')('Menu.CurrentUnbalance'),
                content: 'app.NetworkMetering.DT.CurrentUnbalance',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 5,
                title: $filter('translate')('Menu.VoltageUnbalance'),
                content: 'app.NetworkMetering.DT.VoltageUnbalance',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 6,
                title: $filter('translate')('Menu.NeutralCurrent'),
                content: 'app.NetworkMetering.DT.NeutralCurrentReport',
                active: false,
                color: "#95a2a9"
            }
        ];
        $scope.DTDetailsTabs = [
            {
                id: 0,
                title: $filter('translate')('Menu.DTInformation'),
                content: 'app.NetworkMetering.DTInformation',
                active: false,
                color: "#95a2a9"
            }
            ,
            {
                id: 1,
                title: $filter('translate')('Menu.Reports'),
                active: false,
                color: "#95a2a9"
            }
        ];
        $scope.tabClick = function (tabData, tabIndex) {
            $scope.selectedTabId = tabIndex;
            if (tabData.id == 1) {
                showHideReportDropDowns(false);
            }
            else {
                showHideReportDropDowns(true);
                $state.get(tabData.content)["tabIndex"] = tabIndex;
                $state.go(tabData.content, {
                    'name': $scope.DTName,
                });
            }

        }
        $scope.selectReportClick = function (tabData, tabIndex) {
            $rootScope.selectedTabReportId = tabIndex;
            showHideReportDropDowns(true);
            $state.get(tabData.content)["tabIndex"] = tabIndex;
            $state.go(tabData.content, {
                'name': $scope.DTName,
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
            $scope.requestDetails = { DTName: $scope.DTName };
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
            if ($scope.originalDeviceName == $scope.requestDetails.DTName) {
                $scope.$parent.getDTNameData($scope.requestDetails);
            }
            else {
                $state.go("app.NetworkMetering.DTInformation", {
                    'name': $scope.requestDetails.DTName,
                });
            }
        }

        window.addEventListener('click', function (event) {
            if (event.target.id != "reportDropDown"
                && event.target.id != "downArrow"
                && event.target.id != "upArrow"
            ) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                if (dropdowns.length > 0 && dropdowns[0].classList.contains('show')) {
                    showHideReportDropDowns(true)
                }
            }
        });
        function getDeviceNameByDeviceID(dtCode) {
            URIService.GetData(URIService.GetDeviceNameByDeviceID(dtCode, 'dt'))
                .success(function (response, status, headers, config) {
                    if (status === 200) {
                        $rootScope.originalDeviceNameRoot = response.Data;
                        $scope.originalDeviceName = $rootScope.originalDeviceNameRoot;
                    }
                }).error(function (data, status, headers, config) {
                    $scope.isProcessing = false;
                });
        }
        function getOfficialHierarchy(dtCode) {
            URIService.GetData(URIService.GetOfficialHierarchy(dtCode, 'dt'))
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