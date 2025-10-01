'use strict';
app.controller('NetworkDashboardCtrl', ['$scope', 'URIService', '$timeout', '$location', '$state', '$http'
    , function ($scope, URIService, $timeout, $location, $state, $http) {
        var vm = this;
        initialize();
        $scope.onRefreshClick = function () {
            if ($scope.isLastMonth) {
                getLastMonthData();
            }
            else {
                getCurrentMonthDataTillDate();
            }
        }
        $scope.getCurrentMonth = function () {
            highlightButton("CurrentMonth", "PreviousMonth")
            $scope.isLastMonth = false;
            getCurrentMonthDataTillDate();
        }
        $scope.getPreviousMonth = function () {
            $scope.showFilterPanel = false;
            highlightButton("PreviousMonth", "CurrentMonth")
            $scope.isLastMonth = true;
            getLastMonthData();
        }
        $scope.formatStyle = function (availabilityPercentage) {
            return { 'width': Number(availabilityPercentage) + '%' };
        }
        $scope.activeDtFeeder = function (type) {
            if (type == 'dt') {
                $location.path('app/NetworkMetering/DTList');
            }
            else if (type == 'feeder') {
                $location.path('app/NetworkMetering/FeederList');
            }
        }
        $scope.unMappedDt = function (type) {
            if (type == 'dt') {
                $state.go("app.NetworkMetering.DTList", { 'unmappedDT': true });
            }
        }
        $scope.unmeteredDTFeeder = function (type) {
            if (type == 'dt') {
                $state.go("app.NetworkMetering.DTList", { 'unmapped': true });
            }
            else if (type == 'feeder') {
                $state.go("app.NetworkMetering.FeederList", { 'unmapped': true });
            }
        }
        $scope.isFeederLoss = function () {
            if ($scope.isLastMonth) {
                $state.go("app.NetworkMetering.DTMonthlyReport", { 'isFeederLoss': true });
            }
            else {
                $state.go("app.NetworkMetering.DTDailyReport", { 'isFeederLoss': true });
            }
        }
        $scope.isOutageCount = function () {
            if ($scope.isLastMonth) {
                $state.go("app.NetworkMetering.DTMonthlyReport", { 'isOutageCount': true });
            }
            else {
                $state.go("app.NetworkMetering.DTDailyReport", { 'isOutageCount': true });
            }
        }
        $scope.isOutageDuration = function () {
            if ($scope.isLastMonth) {
                $state.go("app.NetworkMetering.DTMonthlyReport", { 'isOutageDuration': true });
            }
            else {
                $state.go("app.NetworkMetering.DTDailyReport", { 'isOutageDuration': true });
            }
        }
        $scope.getUnderloadOverloadData = function (type) {
            if ($scope.isLastMonth) {
                if (type == 'overload') {
                    $state.go("app.NetworkMetering.DTMonthlyReport", { 'overload': true });
                }
                if (type == 'underload') {
                    $state.go("app.NetworkMetering.DTMonthlyReport", { 'underload': true });
                }
                if (type == 'unbalanced') {
                    $state.go("app.NetworkMetering.DTMonthlyReport", { 'unbalanced': true });
                }
            }
            else {
                if (type == 'overload') {
                    $state.go("app.NetworkMetering.DTDailyReport", { 'overload': true });
                }
                if (type == 'underload') {
                    $state.go("app.NetworkMetering.DTDailyReport", { 'underload': true });
                }
                if (type == 'unbalanced') {
                    $state.go("app.NetworkMetering.DTDailyReport", { 'unbalanced': true });
                }
            }
        }
        function highlightButton(active, inactive) {
            document.getElementById(active).style.backgroundColor = "#337ab7"
            document.getElementById(active).style.color = "white"

            document.getElementById(inactive).style.backgroundColor = "#E1ECF4"
            document.getElementById(inactive).style.color = "#337ab7"
        }
        function getLastMonthData() {
            disableAllGraphs();
            URIService.GetData(URIService.GetFeederLossUrl($scope.isLastMonth))
                .success(function (data, status, headers, config) {
                    if (data.Data.Data != null) {
                        showFeederLoss(data.Data);
                        $scope.Range = data.RequestDetails.Range;
                    }
                })
            URIService.GetData(URIService.GetOutageCountUrl($scope.isLastMonth))
                .success(function (data, status, headers, config) {
                    if (data.Data.Data != null) {
                        showDTOutageCount(data.Data);
                        $scope.Range = data.RequestDetails.Range;
                    }
                })
            URIService.GetData(URIService.GetOutageDurationUrl($scope.isLastMonth))
                .success(function (data, status, headers, config) {
                    if (data.Data.Data != null) {
                        showDTOutageDuration(data.Data);
                        $scope.Range = data.RequestDetails.Range;
                    }
                })
            URIService.GetData(URIService.GetDTOverloadUnderloadUnbalancedUrl($scope.isLastMonth))
                .success(function (data, status, headers, config) {
                    if (data.Data != null) {
                        showUnderOverLoad(data.Data[0]);
                    }
                })
        }
        function getCurrentMonthData(isLastMonth) {
            if (!$scope.isNotNullorUndefined($scope.currentMonthData.feederLoss)) {
                URIService.GetData(URIService.GetFeederLossUrl(isLastMonth))
                    .success(function (data, status, headers, config) {
                        if (data.Data.Data != null) {
                            $scope.currentMonthData.feederLoss = data.Data;
                        }
                    })
            }
            if (!$scope.isNotNullorUndefined($scope.currentMonthData.outageCount)) {
                URIService.GetData(URIService.GetOutageCountUrl(isLastMonth))
                    .success(function (data, status, headers, config) {
                        if (data.Data.Data != null) {
                            $scope.currentMonthData.outageCount = data.Data;
                        }
                    })
            }
            if (!$scope.isNotNullorUndefined($scope.currentMonthData.outageDuration)) {
                URIService.GetData(URIService.GetOutageDurationUrl(isLastMonth))
                    .success(function (data, status, headers, config) {
                        if (data.Data.Data != null) {
                            $scope.currentMonthData.outageDuration = data.Data;
                        }
                    })
            }
            if (!$scope.isNotNullorUndefined($scope.currentMonthData.underOverLoadUnbalanced)) {
                URIService.GetData(URIService.GetDTOverloadUnderloadUnbalancedUrl(isLastMonth))
                    .success(function (data, status, headers, config) {
                        if (data.Data != null) {
                            $scope.currentMonthData.underOverLoadUnbalanced = data.Data;
                        }
                    })
            }
        }
        function showFeederLoss(rawData) {
            $timeout(function () {
                $scope.showGraph.feederLoss = false;
            }, 1);
            var data = modifyGraphData(rawData.Data, "FeederLoss");
            vm.totalThresholdCountForFeederLoss = data.totalThresholdCount;
            vm.thresholdValueForFeederLoss = data.thresholdValue;
            vm.feederLossUnit = data.unit;
            vm.feederLossData = setGraphData(rawData.GraphSettings, data.grapghData, data.thresholdValue, vm.feederLossUnit, false, true)

            $timeout(function () {
                $scope.showGraph.feederLoss = true;
            }, 2);

        }
        function showDTOutageCount(rawData) {
            $timeout(function () {
                $scope.showGraph.outageCount = false;
            }, 1);
            var data = modifyGraphData(rawData.Data, "DtOutageCount");
            vm.totalThresholdCountForOutage = data.totalThresholdCount;
            vm.thresholdValueForOutage = data.thresholdValue;
            vm.outageCountData = setGraphData(rawData.GraphSettings, data.grapghData, data.thresholdValue)

            $timeout(function () {
                $scope.showGraph.outageCount = true;
            }, 2);
        }
        function showDTOutageDuration(rawData) {
            $timeout(function () {
                $scope.showGraph.outageDuration = false;
            }, 1);
            var data = modifyGraphData(rawData.Data, "DtOutageDuration");
            vm.totalThresholdCountForOutageDuration = data.totalThresholdCount;
            vm.thresholdValueForOutageDuration = data.thresholdValue;
            vm.outageDurationUnit = data.unit;
            vm.outageDurationData = setGraphData(rawData.GraphSettings, data.grapghData, data.thresholdValue, vm.outageDurationUnit, true)
            $timeout(function () {
                $scope.showGraph.outageDuration = true;
            }, 2);
        }
        function showUnderOverLoad(rawData) {
            $scope.underloadOverloadData = rawData;
        }
        function setGraphData(graphSettings, graphData, thresholdValue, unit, isDateTime = false, isPercentage = false) {
            var graph = graphSettings;
            var seriesCount = graph.Series.length;
            var categoryProperty = graph.Category;
            var seriesProperties = [];
            var categories = []
            var series = [];

            for (let categoryIndexer = 0; categoryIndexer < graphData.length; categoryIndexer++) {
                categories[categoryIndexer] = graphData[categoryIndexer][categoryProperty];
            }

            for (let index = 0; index < seriesCount; index++) {
                series[index] = {
                    name: graph.Series[index]["Label"],
                    data: [],
                    color: graph.Series[index]["Color"]
                };
                seriesProperties[index] = graph.Series[index].Property;
            }
            var filteredData = $scope.graphColor.filter(function (item) {
                return item.GraphTitle === graphSettings.Title;
            });

            for (let seriesIndexer = 0; seriesIndexer < seriesCount; seriesIndexer++) {
                for (let dataIndexer = 0; dataIndexer < graphData.length; dataIndexer++) {
                    var dataObject = graphData[dataIndexer];
                    var y = dataObject[seriesProperties[seriesIndexer]];
                    var borderColor = dataObject[categoryProperty] == thresholdValue ? '#daa520' : filteredData[0].Color;
                    var borderWidth = dataObject[categoryProperty] == thresholdValue ? '2' : 1;
                    series[seriesIndexer].data.push({ y: y, color: filteredData[0].Color, borderColor: borderColor, borderWidth: borderWidth })
                }
            }

            var chartTitle = "";
            var xAxisLabel = "";
            var yAxisLabel = "";
            var subtitle = "";//$scope.isLastMonth ? graph.SubTitle : $scope.FormatData(moment($scope.selectedDate), 'date');
            var xAxisFormatting = graph.xAxisFormatting
            var xAxisFormat = 'timeinseconds'
            return {
                chartTitle,
                xAxisLabel,
                yAxisLabel,
                subtitle,
                categories,
                series,
                xAxisFormatting,
                xAxisFormat,
                isDateTime,
                thresholdValue,
                isPercentage,
                unit
            };
        }
        function modifyGraphData(originalGraphData, graphType) {
            var filteredData = {};
            if ($scope.isLastMonth) {
                filteredData = $scope.jsonMonthly.filter(function (item) {
                    return item.GraphTitle === graphType;
                });
            }
            else {
                filteredData = $scope.jsonDaily.filter(function (item) {
                    return item.GraphTitle === graphType;
                });
            }
            var modifiedGraphData = [];
            var startIndex = filteredData[0].Values[0]['Min'];
            var endIndex = filteredData[0].Values[0]['Max'];
            var step = filteredData[0].Values[0]['Step'];

            for (var indexer = startIndex; indexer <= endIndex; indexer = indexer + step) {
                modifiedGraphData.push({ 'Count': null, 'Value': indexer })
            }

            angular.forEach(originalGraphData, function (value, key) {
                var matchingRows = modifiedGraphData.filter(function (item) {
                    if (value.Value >= item.Value && value.Value < item.Value + Number(step)) {
                        return item.Value
                    }
                });

                if (matchingRows.length > 0) {
                    matchingRows[0]['Count'] = matchingRows[0]['Count'] + value.Count;
                }
            });

            var totalThresholdCount = 0;
            angular.forEach(modifiedGraphData, function (value, key) {
                if (value.Value >= filteredData[0].Values[0]['Threshold']) {
                    totalThresholdCount += value.Count;
                }
            });
            return {
                grapghData: modifiedGraphData,
                thresholdValue: filteredData[0].Values[0]['Threshold'],
                unit: filteredData[0].Values[0]['Unit'],
                totalThresholdCount
            };
        }
        function getCurrentMonthDataTillDate() {
            showFeederLoss($scope.currentMonthData.feederLoss);
            showDTOutageCount($scope.currentMonthData.outageCount);
            showDTOutageDuration($scope.currentMonthData.outageDuration);
            showUnderOverLoad($scope.currentMonthData.underOverLoadUnbalanced[0]);
        }
        function disableAllGraphs() {
            $scope.showGraph = {
                feederLoss: false,
                outageDuration: false,
                outageCount: false,
            };
        }
        function getPreviousMonthMetaData() {
            // $http.get('/Angular1x/App/Components/NetworkMetering/Controller/previousMonthDashboardMetaData.json')
            //     .then(function (response) {
            //         $scope.jsonMonthly = response.data;
            //     }, function (error) {
            //     });
            $scope.jsonMonthly = [
                {
                    "GraphTitle": "FeederLoss",
                    "Values": [
                        {
                            "Threshold": 50,
                            "Step": 5,
                            "Min": 25,
                            "Max": 75,
                            "Unit": "%"
                        }
                    ]
                },
                {
                    "GraphTitle": "DtOutageCount",
                    "Values": [
                        {
                            "Threshold": 35,
                            "Step": 5,
                            "Min": 5,
                            "Max": 60
                        }
                    ]
                },
                {
                    "GraphTitle": "DtOutageDuration",
                    "Values": [
                        {
                            "Threshold": 1440,
                            "Step": 50,
                            "Min": 1190,
                            "Max": 1690,
                            "Unit": "min"
                        }
                    ]
                }
            ]
        }
        function getCurrentMonthMetaData() {
            // $http.get('/Angular1x/App/Components/NetworkMetering/Controller/currentMonthDashboardMetaData.json')
            //     .then(function (response) {
            //         $scope.jsonDaily = response.data;
            //     }, function (error) {
            //     });
            $scope.jsonDaily = [
                {
                    "GraphTitle": "FeederLoss",
                    "Values": [
                        {
                            "Threshold": 50,
                            "Step": 5,
                            "Min": 25,
                            "Max": 75,
                            "Unit": "%"
                        }
                    ]
                },
                {
                    "GraphTitle": "DtOutageCount",
                    "Values": [
                        {
                            "Threshold": 35,
                            "Step": 5,
                            "Min": 5,
                            "Max": 60
                        }
                    ]
                },
                {
                    "GraphTitle": "DtOutageDuration",
                    "Values": [
                        {
                            "Threshold": 1440,
                            "Step": 50,
                            "Min": 1190,
                            "Max": 1690,
                            "Unit": "min"
                        }
                    ]
                }
            ]
        }
        function setPercentageTo100(value) {
            var newValue = Number(value);
            if (Number(value) > 100) {
                newValue = 100;
            }
            return newValue
        }
        function initialize() {
            $scope.showGraph = {};
            $scope.isLastMonth = true;
            $scope.previousMonthDateText = $scope.FormatData(moment().subtract(1, 'month'), 'yearmonth')
            $scope.currentMonthDateText = $scope.FormatData(moment(), 'yearmonth')

            $scope.currentMonthData = {};

            getLastMonthData(true);
            getCurrentMonthData(false);
            getPreviousMonthMetaData();
            getCurrentMonthMetaData();

            URIService.GetData(URIService.GetNetworkDashboardUrl())
                .success(function (data, status, headers, config) {
                    if (data.Data != null) {
                        $scope.dashboardTitles = data.Data;
                        $scope.dashboardTitles.activeDtPercent = setPercentageTo100(Math.trunc(($scope.dashboardTitles.ActiveDT * 100) / $scope.dashboardTitles.TotalDT))
                        $scope.dashboardTitles.activeFeederPercent = setPercentageTo100(Math.trunc(($scope.dashboardTitles.ActiveFeeder * 100) / $scope.dashboardTitles.TotalFeeder))
                        $scope.dashboardTitles.dTWithMeterPercent = setPercentageTo100($scope.dashboardTitles.ActiveDT > 0 ? Math.trunc(($scope.dashboardTitles.DTWithMeter * 100) / $scope.dashboardTitles.ActiveDT) : 0)
                        $scope.dashboardTitles.feederWithMeterPercent = setPercentageTo100($scope.dashboardTitles.ActiveFeeder > 0 ? Math.trunc(($scope.dashboardTitles.FeederWithMeter * 100) / $scope.dashboardTitles.ActiveFeeder) : 0)
                        $scope.dashboardTitles.mappedDTPercent = setPercentageTo100($scope.dashboardTitles.ActiveDT > 0 ? Math.trunc(($scope.dashboardTitles.MappedDT * 100) / $scope.dashboardTitles.ActiveDT) : 0)
                    }
                })
            $scope.graphColor = [
                {
                    "GraphTitle": "Feeder Loss",
                    "Color": "#4f6aa3",
                },
                {
                    "GraphTitle": "Outage Count",
                    "Color": "#4f6aa3",
                },
                {
                    "GraphTitle": "Outage Duration",
                    "Color": "#4f6aa3",
                }
            ]
        }
    }])
