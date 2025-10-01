
'use strict';

app.controller('TabFeederEnergyAudit',
    ['$scope', 'URIService', '$stateParams', '$filter', 'AuthService', 'DataStructureFactory', '$moment', 'NetworkMeteringService',
        function ($scope, URIService, $stateParams, $filter, AuthService, DataStructureFactory, $moment, NetworkMeteringService) {
            var translateFilter = null;
            var userInfo = AuthService.getAuthInfo();
            var tenantDateFormat = userInfo.cultureInfo.DateTimeFormats;
            $scope.init = function () {
                $scope.FeederName = $stateParams.name;
                translateFilter = $filter('translate');

                $scope.showFilterPanel = false;
                $scope.showFilterIcon = true;
                $scope.filterApplied = false;

                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.FeederName;

                $scope.filterData = {
                    filter: {
                        minDate: userInfo.systemStartDate,
                        maxDate: new Date(),
                        showDateFilter: true
                    },
                    applyFilter: $scope.applyFilter,
                    clearFilter: $scope.clearFilter,
                    filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelIndividualFeeder.html',
                }

                getDeviceNameByDeviceID();

            }
            var setFilterColor = function () {
                if ($scope.showFilterPanel) {
                    document.getElementById("dateFilter").style.backgroundColor = "rgb(225, 236, 244)";

                } else {
                    document.getElementById("dateFilter").style.backgroundColor = "white";
                }
            }
            function SetPageFilters(appliedFilters) {
                $scope.filterData.filter.fromDate = $moment(appliedFilters.Start, tenantDateFormat.FullDateTimePattern);
                $scope.filterData.filter.toDate = $moment(appliedFilters.End, tenantDateFormat.FullDateTimePattern);
                $scope.filterData.filter.labelForDateFilter = "Menu.FilterforEnergyAudit";
                $scope.requestDetails.FromDate = appliedFilters.Start;
                $scope.requestDetails.ToDate = appliedFilters.End;
            }
            function setButtonColor(selectedButtonID, deselectButtonID) {
                document.getElementById(selectedButtonID).style.backgroundColor = "#337ab7"
                document.getElementById(selectedButtonID).style.color = "#FFFFFF"

                document.getElementById(deselectButtonID).style.backgroundColor = "#E1ECF4"
                document.getElementById(deselectButtonID).style.color = "#337ab7"
            }
            function getEnergyAuditGrid(dataFilter) {
                var fromDate = dataFilter != null ? dataFilter.fromDate : $moment($scope.installedOn, tenantDateFormat.FullDateTimePattern);
                var toDate = dataFilter != null ? dataFilter.toDate : $moment($scope.removalDate, tenantDateFormat.FullDateTimePattern);
                $scope.isDataAvailable = false;
                $scope.showPieChart = false;
                $scope.showValueChart = false;
                $scope.showPercentageChart = false;
                $scope.dailyGridData = {};
                $scope.isProcessing = false;
                $scope.chartData = {};
                $scope.loadingGridData = {};
                var rangeFilter = DataStructureFactory.GetRangeFilterInstance($moment(fromDate), $moment(toDate), null, null)
                URIService.GetData(URIService.GetEnergyAuditReportUrl($scope.FeederName, rangeFilter))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            if (response.Data != null) {
                                $scope.requestDetails = response.RequestDetails;
                            }
                            SetPageFilters(response.RequestDetails.Range);

                            var loadingTableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/energyAuditHead.html';
                            var loadingTableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/energyAuditBody.html';

                            $scope.loadingGridData = NetworkMeteringService.GetGridDataFromResponse(response.Data.PeriodicData.GridSettings,
                                response.Data.PeriodicData.Data, "EnergyAuditPerodicReport", translateFilter("Menu.EnergyAuditReport"), $scope.requestDetails, loadingTableHeaderTemplateURL, loadingTableBodyTemplateURL, 'Feeder')

                            $scope.dailyData = response.Data.DailyData.Data
                            $scope.gridSettingsDaily = response.Data.DailyData.GridSettings;
                            $scope.graphSettings = response.Data.DailyData.GraphSettings;
                            $scope.graphData = $scope.dailyData.slice(0, -1);
                            $scope.setGraph('value')

                            var dailyTableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/energyAuditDailyHead.html';
                            var dailyTableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/energyAuditDailyBody.html';
                            $scope.dailyGridData = NetworkMeteringService.GetGridDataFromResponse($scope.gridSettingsDaily,
                                $scope.dailyData, "EnergyAuditDailyReport", translateFilter("Menu.EnergyAuditDailyReport"), $scope.requestDetails, dailyTableHeaderTemplateURL, dailyTableBodyTemplateURL, 'Feeder')
                            $scope.dailyGridData.startIndex = 4;

                            $scope.dailyGridData.informationText = '*' + translateFilter('Menu.InformationForEnergyAudit');

                            $scope.SetChartData($scope.gridSettingsDaily, response.Data.DailyData.GraphSettings, $scope.dailyData);

                            var fromDate = $scope.FormatData($scope.requestDetails.Range.Start, "date");
                            var toDate = $scope.FormatData($scope.requestDetails.Range.End, "date");
                            $scope.pageSubtitle = fromDate + ' - ' + toDate;

                            $scope.isProcessing = false;

                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            $scope.setGraph = function (graphType) {
                $scope.showValueChart = false;
                $scope.showPercentageChart = false;
                if (graphType == 'value') {
                    $scope.graphSettings.Series[0].Property = "Loss";
                    $scope.graphSettings.Series[0].Label = "Loss";
                    $scope.graphSettings.yAxisLabel = "Loss(kWh)";

                    $scope.valueChartData = NetworkMeteringService.ConvertDataToGraph($scope.graphSettings, $scope.graphData)
                    $scope.showValueChart = true;
                    setButtonColor('valueButtonID', 'percentageCurveButtonID');
                }
                else if (graphType == 'percentage') {
                    $scope.graphSettings.Series[0].Property = "Loss%";
                    $scope.graphSettings.Series[0].Label = "Loss%";
                    $scope.graphSettings.yAxisLabel = "Loss(%)";

                    $scope.percentageChartData = NetworkMeteringService.ConvertDataToGraph($scope.graphSettings, $scope.graphData)
                    $scope.showPercentageChart = true;
                    setButtonColor('percentageCurveButtonID', 'valueButtonID');
                }
            }
            $scope.init();
            $scope.onFilterClick = function () {
                $scope.showFilterPanel = !$scope.showFilterPanel;
                setFilterColor();
            }
            $scope.filterData.applyFilter = function (filterObj) {
                $scope.dataFilter = {
                    fromDate: filterObj.fromDate,
                    toDate: filterObj.toDate,

                };
                setFilterColor();
                getEnergyAuditGrid($scope.dataFilter);
            }
            $scope.filterData.clearFilter = function () {
                $scope.showFilterPanel = false;
                setFilterColor();
                if ($scope.dataFilter != undefined) {
                    $scope.filterData = {
                        filter: {},
                        applyFilter: $scope.applyFilter,
                        clearFilter: $scope.clearFilter,
                    }
                    $scope.dataFilter = null;
                    getEnergyAuditGrid();
                }
            }
            $scope.getFeederNameData = function () {
                getEnergyAuditGrid();
            }
            $scope.refresh = function () {
                getEnergyAuditGrid($scope.dataFilter);
            }
            $scope.FormatStyle = function (availabilityPercentage) {
                var style = { 'background-color': '#ccc' };
                if (availabilityPercentage <= 30) {
                    style = { 'width': availabilityPercentage + '%', 'background-color': 'red' };
                } else if (availabilityPercentage <= 50) {
                    style = { 'width': availabilityPercentage + '%', 'background-color': 'orange' };
                } else if (availabilityPercentage <= 70) {
                    style = { 'width': availabilityPercentage + '%', 'background-color': 'yellow' };
                }
                else {
                    style = { 'width': availabilityPercentage + '%', 'background-color': 'green' };
                }
                return style;
            }
            $scope.SetChartData = function (gridSettings, graphSettings, data) {
                var pieData = [];
                var totalDTConsumption = 0;
                angular.forEach(gridSettings.DataGrid.headingData, function (element, key) {
                    if (element.IsLink) {
                        var count = data[data.length - 1][element.name]
                        totalDTConsumption = totalDTConsumption + count;
                    }
                });

                var totalDTConsumptionSeries = { name: "Reported Energy", y: totalDTConsumption, color: 'green' }
                pieData.push(totalDTConsumptionSeries);

                var count = data[data.length - 1]["FeederConsumption"]
                var series = { name: "Unreported Energy", y: count - totalDTConsumption, color: 'red' }
                pieData.push(series);


                var pieSeries = [{ type: 'pie', data: pieData }]

                var graphData = {};
                graphData['series'] = pieSeries;
                graphData['chartTitle'] = graphSettings.SubTitle;
                graphData['subtitle'] = "";
                graphData['innerSize'] = 0;
                graphData['showInLegend'] = true;
                $scope.chartData = graphData;
                $scope.showPieChart = true;
            }
            function getDeviceNameByDeviceID() {
                URIService.GetData(URIService.GetDeviceNameByDeviceID($scope.FeederName, 'feeder'))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.installedOn = response.Data[0]['InstalledOn'];
                            $scope.removalDate = response.Data[0]['RemovalDate'];

                            getEnergyAuditGrid();
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
        }]);
