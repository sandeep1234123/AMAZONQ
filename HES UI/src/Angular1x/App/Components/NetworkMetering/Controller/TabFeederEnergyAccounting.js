'use strict';

app.controller('TabFeederEnergyAccounting',
    ['$scope', 'URIService', '$stateParams', '$filter',
        'NetworkMeteringService', '$state',
        function ($scope, URIService, $stateParams, $filter,
            NetworkMeteringService, $state) {
            var translateFilter = null;
            $scope.init = function () {

                $scope.DeviceName = $stateParams.name;
                translateFilter = $filter('translate');
                $scope.filterDetails = {};
                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.DeviceName;
                $scope.partialViewPath = $state.current.partialViewPath;

                var currentDate = new Date();
                $scope.filterData = {
                    filter: {
                        startDate: moment(currentDate.setDate(1)),
                        endDate: moment(new Date()),
                        date: {
                            startDate: moment(currentDate.setDate(1)),
                            endDate: moment(new Date()),
                        },

                        minimumDate : $scope.FormatData(moment(currentDate.setDate(-9)),'datetime')

                    },

                    applyFilter: applyFilter,
                    clearFilter: clearFilter,
                    enableTime: false,
                    minMaxValidation: true,
                    filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelForDTLoadReport.html',
                    flag: 'icon'
                }
                getData();
            }
            $scope.getFeederNameData = function (filterDetails) {
                $scope.filterDetails = filterDetails;
                getData();
            }
            $scope.onFilterClick = function () {
                var datefilter = document.getElementById("dateFilter")
                $scope.filterData.flag = 'icon';
                $scope.showFilterPanel = !$scope.showFilterPanel;

                if (!$scope.showFilterPanel) {
                    datefilter.style.backgroundColor = "white"
                }
            }
            $scope.refresh = function () {
                $scope.isRefreshedAppliedClicked = true;
                getGridData();
            }
            $scope.setGraph = function (graphType) {
                if ($scope.isNotNullorUndefined($scope.graphSettings)) {
                    angular.forEach($scope.graphSettings.Series, function (value, key) {
                        value.Type = 'column';
                    });

                    $scope.showDurationGraph = false;
                    $scope.showValueChart = false;
                    $scope.showPercentageChart = false;
                    $scope.graphSettings.Title = "EnergyAccountingProfile";

                    if (graphType == 'value') {
                        $scope.graphSettings.Series[0].Property = "MinLoss";
                        $scope.graphSettings.Series[0].Label = "Min Loss";
                        $scope.graphSettings.Series[1].Property = "AverageLoss";
                        $scope.graphSettings.Series[1].Label = "Average Loss";
                        $scope.graphSettings.Series[2].Property = "MaxLoss";
                        $scope.graphSettings.Series[2].Label = "Max Loss";
                        $scope.graphSettings.yAxisLabel = "Loss(kWh)";
                        $scope.graphSettings.tickInterval = 50;

                        $scope.valueChartData = NetworkMeteringService.ConvertDataToGraph($scope.graphSettings, $scope.graphData)
                        $scope.showValueChart = true;
                        setButtonColor('valueButtonID', ['percentageCurveButtonID', 'durationButtonID']);
                    }
                    else if (graphType == 'percentage') {
                        $scope.graphSettings.Series[0].Property = "MinLoss%";
                        $scope.graphSettings.Series[0].Label = "Min Loss %";
                        $scope.graphSettings.Series[1].Property = "AverageLoss%";
                        $scope.graphSettings.Series[1].Label = "Average Loss %";
                        $scope.graphSettings.Series[2].Property = "MaxLoss%";
                        $scope.graphSettings.Series[2].Label = "Max Loss %";
                        $scope.graphSettings.yAxisLabel = "Loss(%)";
                         $scope.graphSettings.tickInterval = 10;

                        $scope.percentageChartData = NetworkMeteringService.ConvertDataToGraph($scope.graphSettings, $scope.graphData)
                        $scope.showPercentageChart = true;
                        setButtonColor('percentageCurveButtonID', ['valueButtonID', 'durationButtonID']);
                    }
                }

            }
            $scope.showDurationCurve = function () {
                $scope.showDurationGraph = true;
                $scope.showValueChart = false;
                $scope.showPercentageChart = false;
                setButtonColor('durationButtonID', ['valueButtonID', 'percentageCurveButtonID']);
            }
            $scope.init();

            function getData() {
                getGridData();
            }
            function applyFilter(filterObj) {
                getGridData(filterObj);
            }
            function clearFilter() {
                $scope.init();
                $scope.onFilterClick();
                $scope.showFilterPanel = false;
                getData();
            }
            function setButtonColor(selectedButtonID, deselectButtonIDs) {
                document.getElementById(selectedButtonID).style.backgroundColor = "#337ab7"
                document.getElementById(selectedButtonID).style.color = "#FFFFFF"

                angular.forEach(deselectButtonIDs, function (id, key) {
                    document.getElementById(id).style.backgroundColor = "#E1ECF4"
                    document.getElementById(id).style.color = "#337ab7"
                });
            }
            function getGridData(dataFilter) {
                $scope.isDataAvailable = false;
                $scope.showValueChart = false;
                $scope.showPercentageChart = false;
                $scope.dailyGridData = {};
                $scope.isProcessing = false;
                $scope.chartData = {};

                var rangeFilter = NetworkMeteringService.GetDateFilter(dataFilter, $scope.filterData)
                URIService.GetData(URIService.GetEnergyAccountingReportUrl($scope.DeviceName, rangeFilter))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            if (response.Data != null) {
                                $scope.requestDetails = response.RequestDetails;
                            }
                            NetworkMeteringService.SetDateFilters($scope.requestDetails, $scope.filterData)
                            $scope.dailyData = response.Data.Data
                            $scope.gridSettingsDaily = response.Data.GridSettings;
                            $scope.graphSettings = response.Data.GraphSettings;
                            $scope.graphData = $scope.dailyData.slice(0, -1);
                            $scope.keyName = [];

                            if ($scope.isNotNullorUndefined($scope.graphSettings)) {
                                angular.forEach($scope.graphSettings.Series, function (value, key) {
                                    $scope.keyName.push(value.Property)
                                });
                                setDurationCurve($scope.graphSettings, $scope.graphData)


                                $scope.setGraph('value')
                            }

                            $scope.dailyGridData = NetworkMeteringService.GetGridDataFromResponse($scope.gridSettingsDaily,
                                $scope.dailyData, "EnergyAccounting", translateFilter("Menu.EnergyAccounting"), $scope.requestDetails, null, null, 'Feeder', $scope.requestDetails.Range.Start, $scope.requestDetails.Range.Start)
                            $scope.dailyGridData.startIndex = 4;

                            $scope.dailyGridData.informationText = '*' + translateFilter('Menu.InformationForEnergyAudit');

                            var fromDate = $scope.FormatData($scope.requestDetails.Range.Start, "date");
                            var toDate = $scope.FormatData($scope.requestDetails.Range.End, "date");
                            $scope.pageSubtitle = fromDate + ' - ' + toDate;

                            $scope.isProcessing = false;

                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            function setDurationCurve(graphSettings, graphData) {
                var durationCurveGraphSetting =
                {
                    Category: 'Duration',
                    Series: [],
                    SubTitle: graphSettings.SubTitle,
                    Title: "LossDurationCurve",
                    yAxisLabel: graphSettings.yAxisLabel,
                    xAxisLabel: "Duration(%)",
                    Crosshair: {},
                    LineWidth: 5,
                    xAxixTooltipLabel: "For: "
                }

                $scope.durtionCurveData = NetworkMeteringService.SetDurationCurve(durationCurveGraphSetting, graphSettings,
                    graphData, $scope.keyName);
            }

        }]);
