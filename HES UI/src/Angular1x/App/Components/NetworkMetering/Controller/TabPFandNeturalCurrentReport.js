'use strict';

app.controller('TabPFandNeturalCurrentReport',
    ['$scope', 'URIService', '$stateParams', '$filter',
        '$moment', 'NetworkMeteringService', '$state',
        function ($scope, URIService, $stateParams, $filter,
            $moment, NetworkMeteringService, $state) {
            var translateFilter = null;
            $scope.init = function () {
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "isGraphAvailable": false,
                    "showValueGraph": false,
                    "showDurationGraph": false,
                    "showSegments": false,
                }

                $scope.DeviceName = $stateParams.name;
                translateFilter = $filter('translate');
                $scope.filterDetails = {};
                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.DeviceName;
                $scope.reportView = "daily"
                $scope.partialViewPath = $state.current.partialViewPath;
                $scope.controllerName = $state.current.controllerName;

                $scope.yAxisLabel = $state.current.yAxisLabel;
                $scope.ApiUrlKey = $state.current.apiUrlKey;
                $scope.reportFor = $state.current.reportFor;
                $scope.mainTitle = translateFilter("Menu." + $scope.reportFor);
                $scope.pageTitle = $state.current.pageTitle;
                $scope.DurationCurveTitle = $state.current.durationCurveTitle;
                $scope.filterTitle = $state.current.filterTitle != undefined ? $state.current.filterTitle : "Value";
                $scope.buttonTitle = $state.current.buttonTitle != undefined ? $state.current.buttonTitle : "Curve";
                $scope.gridID = $state.current.gridID;

                $scope.filterData = {
                    filter: {
                        startDate: moment().subtract(90, 'days'),
                        endDate: $moment(new Date()),
                        date: {
                            startDate: moment().subtract(90, 'days'),
                            endDate: $moment(new Date()),
                        },
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
            $scope.getDTNameData = function (filterDetails) {
                $scope.filterDetails = filterDetails;
                getData();
            }
            $scope.onFilterClick = function () {
                var dayFilter = document.getElementById("dayFilter")
                var monthFilter = document.getElementById("monthFilter")
                var datefilter = document.getElementById("dateFilter")

                dayFilter.style.backgroundColor = "white";
                monthFilter.style.backgroundColor = "white";

                datefilter.style.backgroundColor = "rgb(225, 236, 244)"
                $scope.filterData.flag = 'icon';

                $scope.showFilterPanel = !$scope.showFilterPanel;

                if (!$scope.showFilterPanel) {
                    dayFilter.style.backgroundColor = "white";
                    monthFilter.style.backgroundColor = "white";
                    datefilter.style.backgroundColor = "white"
                }
            }
            $scope.refresh = function () {
                $scope.isRefreshedAppliedClicked = true;
                $scope.oldHideShowValue = $scope.hideShowValue
                getGridData();
            }
            $scope.hideShowSegments = function () {
                if ($scope.lineChartData != undefined && $scope.lineChartData.series.length > 0) {
                    var valueOfButton = document.getElementById("showSegmentsID").value;
                    if (valueOfButton == "false") {
                        document.getElementById("showSegmentsID").value = true;
                        showCombinationChart()
                    }
                    else {
                        document.getElementById("showSegmentsID").value = false;
                        hideCombinationChart()
                    }
                }
            }
            $scope.showDurationCurve = function () {
                setCurveType("durationButtonID", ["valueButtonID"], false, true);
            }
            $scope.showValueCurve = function () {
                setCurveType("valueButtonID", ["durationButtonID"], true, false);
            }
            $scope.onReportViewType = function (reportView) {
                $scope.reportView = reportView;
                setReportView($scope.reportView)
                getData();
            }
            $scope.init();

            function setCurveType(selectedButtonID, deselectButtonIDs, isValueCurve, isDurationCurve) {
                if (!$scope.isRefreshedAppliedClicked) {
                    angular.forEach(deselectButtonIDs, function (id, key) {
                        document.getElementById(id).style.backgroundColor = "#E1ECF4"
                        document.getElementById(id).style.color = "#337ab7"
                    });

                    document.getElementById(selectedButtonID).style.backgroundColor = "#337ab7"
                    document.getElementById(selectedButtonID).style.color = "#FFFFFF"

                    if (isValueCurve) {
                        $scope.PageTitle = translateFilter("Menu.LoadCurveValue")
                        if ($scope.isDataAvailable) {
                            $scope.hideShowValue =
                            {
                                "isProcessing": false,
                                "isValueCurve": true,
                                "isGraphAvailable": true,
                                "showValueGraph": true,
                                "showDurationGraph": false,
                                "showSegments": false,
                            }
                        }
                    }
                    else if (isDurationCurve) {
                        $scope.PageTitle = translateFilter("Menu.LoadCurveDuration")
                        if ($scope.isDataAvailable) {
                            $scope.hideShowValue =
                            {
                                "isProcessing": false,
                                "isValueCurve": false,
                                "isGraphAvailable": true,
                                "showValueGraph": false,
                                "showDurationGraph": true,
                                "showSegments": false,
                            }
                        }
                    }
                }
            }
            function showCombinationChart() {
                $scope.chartData = $scope.lineChartData;

                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": false,
                    "isGraphAvailable": true,
                    "showValueGraph": false,
                    "showDurationGraph": true,
                    "showSegments": true,
                }
            }
            function hideCombinationChart() {
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": false,
                    "isGraphAvailable": true,
                    "showValueGraph": true,
                    "showDurationGraph": false,
                    "showSegments": false,
                }
            }
            function getData() {
                getGridData();
            }

            function applyFilter(filterObj) {
                $scope.isRefreshedAppliedClicked = true;
                $scope.oldHideShowValue = $scope.hideShowValue
                setReportView($scope.reportView);
                getGridData(filterObj);
            }
            function clearFilter() {
                $scope.init();
                $scope.onFilterClick();
                $scope.reportView = "daily"
                setReportView($scope.reportView);
                $scope.showFilterPanel = false;
                getData();
            }
            function getGridData(filterObj) {
                $scope.gridData = {};
                $scope.studyCrieteriaGraph = {};
                $scope.durtionCurveData = {};
                $scope.lineChartData = {};
                $scope.combinationChartData = {};
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "isGraphAvailable": false,
                    "showValueGraph": true,
                    "showDurationGraph": true,
                    "showSegments": false,
                }

                var filter = NetworkMeteringService.GetFilter(filterObj, $scope.filterData, $scope.reportView);
                URIService.GetData(URIService.GetReportUrl($scope.DeviceName, $scope.ApiUrlKey, filter,$scope.reportFor))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;
                            NetworkMeteringService.SetPageFilters($scope.requestDetails, $scope.filterData)

                            if (response.Data != null && response.Data != undefined &&
                                response.Data.Data.length > 0) {
                                $scope.graphSettings = response.Data.GraphSettings;
                                $scope.gridSettings = response.Data.GridSettings;
                                $scope.hideShowValue =
                                {
                                    "isProcessing": false,
                                    "isValueCurve": true,
                                    "isGraphAvailable": true,
                                    "showValueGraph": false,
                                    "showDurationGraph": false,
                                    "showSegments": false,
                                }

                                $scope.data = response.Data.Data
                                $scope.keyName = [];
                                if ($scope.isNotNullorUndefined($scope.graphSettings)) {
                                    angular.forEach($scope.graphSettings.Series, function (value, key) {
                                        $scope.keyName.push(value.Property)
                                    });
                                    setGraph($scope.graphSettings, $scope.data)
                                    setDurationCurve($scope.graphSettings, $scope.data)

                                    $scope.hideShowValue =
                                    {
                                        "isProcessing": false,
                                        "isValueCurve": false,
                                        "isGraphAvailable": true,
                                        "showValueGraph": true,
                                        "showDurationGraph": false,
                                        "showSegments": false,
                                        "showCombineGraph": false
                                    }
                                    if ($scope.hideShowValue.showSegments) {
                                        showCombinationChart()
                                    }
                                    else {
                                        hideCombinationChart()
                                    }
                                    if ($scope.hideShowValue.showDurationGraph) {
                                        $scope.showDurationCurve();
                                    }
                                    else if (!$scope.hideShowValue.showSegments && $scope.hideShowValue.showValueGraph) {
                                        $scope.showValueCurve();
                                    }
                                }
                                $scope.gridData = NetworkMeteringService.GetGridDataFromResponse($scope.gridSettings,
                                    $scope.data, $scope.gridID, translateFilter("Menu." + $state.current.excelFileName), $scope.requestDetails, $state.current.tableHeaderTemplateURL, $state.current.tableBodyTemplateURL,$scope.reportFor)
                                if (response.Data.Data[0]['Message'] != undefined) {
                                    $scope.isDataAvailable = false;
                                }
                                else {
                                    $scope.isDataAvailable = true;
                                }

                            }
                            else {
                                $scope.gridData = {};
                                $scope.loadingGridData = {};
                            }
                            if ($scope.isRefreshedAppliedClicked) {
                                $scope.isRefreshedAppliedClicked = false;
                                $scope.hideShowValue = $scope.oldHideShowValue
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.hideShowValue =
                        {
                            "isProcessing": false,
                            "isValueCurve": true,
                            "isGraphAvailable": false,
                            "showValueGraph": true,
                            "showDurationGraph": false,
                            "showSegments": false,
                        }
                        $scope.isLoading = false;
                    });
            }
            function setReportView(reportViewType) {
                var selectedColor = "rgb(225, 236, 244)";

                monthFilter.style.backgroundColor = "white";
                dayFilter.style.backgroundColor = "white";

                monthFilter.style.border = "white";
                dayFilter.style.border = "white";
                switch (reportViewType) {
                    case "daily": {
                        dayFilter.style.backgroundColor = selectedColor;
                        dayFilter.style.border = selectedColor;
                        break;
                    }
                    case "monthly": {
                        monthFilter.style.backgroundColor = selectedColor;
                        monthFilter.style.border = selectedColor;
                        break;
                    }
                }
            }
            function setGraph(graphSettings, graphData) {
                graphSettings.xAxixTooltipLabel = "At: ";
                graphSettings.tickInterval = $state.current.tickInterval
                graphSettings.minTicks = $state.current.minTicks;
                graphSettings.maxTicks = $state.current.maxTicks;

                $scope.lineChartData = NetworkMeteringService.ConvertDataToGraph(graphSettings, graphData);
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "isGraphAvailable": true,
                    "showValueGraph": true,
                    "showDurationGraph": false,
                    "showSegments": false,
                }
            }
            function setDurationCurve(graphSettings, graphData) {
                var durationCurveGraphSetting =
                {
                    Category: graphSettings.Category,
                    Series: [],
                    SubTitle: graphSettings.SubTitle,
                    Title: $scope.DurationCurveTitle,
                    yAxisLabel: $scope.yAxisLabel,
                    xAxisLabel: "Duration(%)",
                    Crosshair: {},
                    LineWidth: 5,
                    xAxixTooltipLabel: "For: ",
                    tickInterval: $state.current.tickInterval,
                    minTicks: $state.current.minTicks,
                    maxTicks: $state.current.maxTicks,
                }
                $scope.durtionCurveData = NetworkMeteringService.SetDurationCurve(durationCurveGraphSetting, graphSettings,
                    graphData, $scope.keyName);
            }
        }]);
