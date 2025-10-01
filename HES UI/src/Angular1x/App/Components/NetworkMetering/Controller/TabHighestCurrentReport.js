'use strict';

app.controller('TabHighestCurrentReport',
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
                    "showValueGraph": false,
                    "showCombineGraph": false,
                    "isGraphAvailable": false,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": false,
                    "showHighestCurrentStats": true
                }
                $scope.DeviceName = $stateParams.name;
                $scope.dtAnalysisConfiguration = null

                translateFilter = $filter('translate');
                $scope.filterDetails = {};
                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.DeviceName;

                $scope.partialViewPath = $state.current.partialViewPath;
                $scope.controllerName = $state.current.controllerName;
                $scope.yAxisLabel = $state.current.yAxisLabel;
                $scope.ApiUrlKey = $state.current.apiUrlKey;
                $scope.reportFor = $state.current.reportFor;
                $scope.mainTitle = translateFilter("Menu." + $scope.reportFor);
                $scope.pageTitle = $state.current.pageTitle;
                $scope.showHighestCurrentStats = true;
                $scope.filterTitle = $state.current.filterTitle != undefined ? $state.current.filterTitle : "Value";
                $scope.gridID = $state.current.gridID;
                $scope.filterData = {
                    filter: {
                        startDate: moment().subtract(90, 'days'),
                        endDate: $moment(new Date()),
                        date: {
                            startDate: moment().subtract(90, 'days'),
                            endDate: $moment(new Date()),
                        },
                        filterTitle: 'Menu.' + $scope.filterTitle,
                    },
                    applyFilter: applyFilter,
                    clearFilter: clearFilter,
                    enableTime: false,
                    minMaxValidation: true,
                    filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelForDistributionTransformerReport.html',
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
                        setButtonColor("valueButtonID", "highestCurrentStatsBtn");
                    }
                    else {
                        document.getElementById("showSegmentsID").value = false;
                        hideCombinationChart()
                    }
                }
            }
            $scope.showValueCurve = function () {
                setCurveType("valueButtonID", "highestCurrentStatsBtn");
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": true,
                    "showCombineGraph": false,
                    "isGraphAvailable": true,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": false,
                    "showHighestCurrentStats": true,
                }
            }

            $scope.showHighestCurrentStatsCurve = function () {

                setCurveType("highestCurrentStatsBtn", "valueButtonID");
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": false,
                    "showCombineGraph": false,
                    "isGraphAvailable": false,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": false,
                    "showHighestCurrentStats": true,
                }
                $scope.studyCrieteriaGraph = {};
                $scope.phaseCurrentContributionChart = {};
                var segementData = NetworkMeteringService.GetSegmentData($scope.data, $scope.filterData.filter,
                    $scope.filterData.filter.currentRating, $scope.keyName);
                var pieSeries = [
                    {
                        type: 'pie',
                        data: [
                            {
                                name: 'Normal',
                                y: segementData.normalCount,
                                color: "#d1e8d1"
                            },
                            {
                                name: 'Accepatble',
                                y: segementData.acceptableCount,
                                color: "#ffffbf"
                            },
                            {
                                name: 'Not Acceptable',
                                y: segementData.notAcceptableCount,
                                color: "#ffd0a3"
                            },
                            {
                                name: 'Critical',
                                y: segementData.criticalCount,
                                color: "#eca0a0"
                            },
                        ],
                        showInLegend: true,
                        innerSize: '20%',
                    }
                ];

                var graphData = {};
                graphData['series'] = pieSeries;
                graphData['chartTitle'] = 'Highest Current Classification Study';
                graphData['subtitle'] = $scope.graphSettings.SubTitle;
                $scope.studyCrieteriaGraph = graphData;

                var rPhaseCount = 0;
                var yPhaseCount = 0;
                var bPhaseCount = 0;
                angular.forEach($scope.data, function (element, key) {
                    if (element.GreatestPhaseValue == 1) {
                        rPhaseCount++;
                    }
                    else if (element.GreatestPhaseValue == 2) {
                        yPhaseCount++
                    }
                    else {
                        bPhaseCount++
                    }
                });

                var pieContributionSeries = [
                    {
                        type: 'pie',
                        data: [
                            {
                                name: 'R Phase',
                                y: rPhaseCount,
                                color: "#e86868"
                            },
                            {
                                name: 'Y Phase',
                                y: yPhaseCount,
                                color: "#f2f27b"
                            },
                            {
                                name: 'B Phase',
                                y: bPhaseCount,
                                color: "#7e7ef1"
                            }
                        ],
                        showInLegend: true,
                        innerSize: '20%',
                    }
                ];

                var pieContributionData = {};
                pieContributionData['series'] = pieContributionSeries;
                pieContributionData['chartTitle'] = 'Phase Wise Highest Current Contribution';
                pieContributionData['subtitle'] = $scope.graphSettings.SubTitle;
                $scope.phaseCurrentContributionChart = pieContributionData;

                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": false,
                    "showCombineGraph": false,
                    "isGraphAvailable": true,
                    "showHighestPhaseCurrentStatsChart": true,
                    "showSegments": false,
                    "showHighestCurrentStats": true,
                }
            }
            $scope.inputElementFocus = function (value, inputID) {
                if (value != undefined) {
                    if (inputID == 'normal') {
                        $scope.filterData.filter.normalValue = getValues(value) + ' A';
                    }
                    else if (inputID == 'acceptable') {
                        $scope.filterData.filter.acceptableValue = getValues(value) + ' A';
                    }
                    else if (inputID == 'notacceptable') {
                        $scope.filterData.filter.notAcceptableValue = getValues(value) + ' A';
                    }
                }
            }
            $scope.inputElementBlur = function (value, inputID) {
                if (value == undefined) {
                    if (inputID == 'normal') {
                        value = $scope.dtAnalysisConfiguration.HighestCurrent.Normal;
                        $scope.filterData.filter.normal = value;
                        $scope.filterData.filter.normalValue = getValues(value) + ' A';
                    }
                    else if (inputID == 'acceptable') {
                        value = $scope.dtAnalysisConfiguration.HighestCurrent.Acceptable;
                        $scope.filterData.filter.acceptable = value;
                        $scope.filterData.filter.acceptableValue = getValues(value) + ' A';
                    }
                    else if (inputID == 'notacceptable') {
                        value = $scope.dtAnalysisConfiguration.HighestCurrent.NotAcceptable;
                        $scope.filterData.filter.notAcceptable = value;
                        $scope.filterData.filter.notAcceptableValue = getValues(value) + ' A';
                    }
                }
            }
            $scope.onReportViewType = function (reportView) {
                $scope.reportView = reportView;
                setReportView($scope.reportView)
                getData();
            }
            $scope.getMinValue = function (value) {
                return value + 1;
            }
            $scope.getMaxValue = function (value) {
                return value - 1;
            }
            $scope.init();
            function setButtonColor(selectedButtonID, deselectButtonID) {
                document.getElementById(selectedButtonID).style.backgroundColor = "#337ab7"
                document.getElementById(selectedButtonID).style.color = "#FFFFFF"

                document.getElementById(deselectButtonID).style.backgroundColor = "#E1ECF4"
                document.getElementById(deselectButtonID).style.color = "#337ab7"
            }
            function setCurveType(selectedButtonID, deselectButtonID) {
                if (!$scope.isRefreshedAppliedClicked) {
                    setButtonColor(selectedButtonID, deselectButtonID);
                    var checkbox = document.getElementById('showSegmentsID');
                    checkbox.checked = false;
                    document.getElementById("showSegmentsID").value = false;
                }
            }
            function showCombinationChart() {
                $scope.filterData.filter.showCurrentrating = true;
                $scope.chartData = $scope.lineChartData;

                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": false,
                    "showCombineGraph": true,
                    "isGraphAvailable": true,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": true,
                    "showHighestCurrentStats": true,
                }
            }
            function hideCombinationChart() {
                $scope.filterData.filter.showCurrentrating = false;
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": true,
                    "showCombineGraph": false,
                    "isGraphAvailable": true,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": false,
                    "showHighestCurrentStats": true,
                }
            }
            function applyFilter(filterObj) {
                $scope.isRefreshedAppliedClicked = true;
                $scope.oldHideShowValue = $scope.hideShowValue
                setReportView($scope.reportView);
                getGridData(filterObj);
            }
            function clearFilter() {
                $scope.init();
                $scope.reportView = "daily"
                setReportView($scope.reportView);
                $scope.onFilterClick();
                getData();
            }
            function getData() {
                if (!$scope.isNotNullorUndefined($scope.dtAnalysisConfiguration)) {
                    URIService.GetData(URIService.GetAnalysisConfiguration($scope.DeviceName, $scope.reportFor))
                        .success(function (response, status, headers, config) {
                            if (status === 200) {
                                $scope.dtAnalysisConfiguration = response.Data;
                                $scope.dtAnalysisConfiguration['Capacity'] = response.RequestDetails
                                getGridData();
                            }
                        }).error(function (data, status, headers, config) {
                        });
                }
                else {
                    getGridData();
                }
            }
            function getGridData(filterObj) {
                $scope.gridData = {};
                $scope.studyCrieteriaGraph = {};
                $scope.phaseCurrentContributionChart = {};
                $scope.lineChartData = {};
                $scope.combinationChartData = {};
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": false,
                    "showCombineGraph": false,
                    "isGraphAvailable": false,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": false,
                    "showHighestCurrentStats": true,
                }
                var filter = NetworkMeteringService.GetFilter(filterObj, $scope.filterData, $scope.reportView);
                URIService.GetData(URIService.GetReportUrl($scope.DeviceName, $scope.ApiUrlKey, filter, $scope.reportFor))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;
                            NetworkMeteringService.SetPageFilters($scope.requestDetails, $scope.filterData, $scope.dtAnalysisConfiguration)
                            getStudyCriteriaValue(filter);

                            if (response.Data != null && response.Data != undefined &&
                                response.Data.Data.length > 0) {
                                $scope.graphSettings = response.Data.GraphSettings;
                                $scope.gridSettings = response.Data.GridSettings;

                                $scope.data = response.Data.Data
                                $scope.keyName = [];
                                if ($scope.isNotNullorUndefined($scope.graphSettings)) {
                                    angular.forEach($scope.graphSettings.Series, function (value, key) {
                                        $scope.keyName.push(value.Property)
                                    });
                                    setGraph($scope.graphSettings, $scope.data)
                                    if ($scope.hideShowValue.showSegments) {
                                        showCombinationChart()
                                    }
                                    else {
                                        hideCombinationChart()
                                    }
                                    if (!$scope.hideShowValue.showSegments && $scope.hideShowValue.showValueGraph) {
                                        $scope.showValueCurve();
                                    }
                                }
                                $scope.gridData = NetworkMeteringService.GetGridDataFromResponse($scope.gridSettings,
                                    $scope.data, $scope.gridID, translateFilter("Menu.HighestCurrentReport"), $scope.requestDetails, $state.current.tableHeaderTemplateURL, $state.current.tableBodyTemplateURL,$scope.reportFor)
                                if (response.Data.Data[0]['Message'] != undefined) {
                                    $scope.hideShowValue =
                                    {
                                        "isProcessing": false,
                                        "isValueCurve": true,
                                        "showValueGraph": false,
                                        "showCombineGraph": false,
                                        "isGraphAvailable": false,
                                        "showHighestPhaseCurrentStatsChart": false,
                                        "showSegments": false,
                                        "showHighestCurrentStats": true,
                                    }
                                }
                            }
                            else {
                                $scope.hideShowValue =
                                {
                                    "isProcessing": false,
                                    "isValueCurve": true,
                                    "showValueGraph": false,
                                    "showCombineGraph": false,
                                    "isGraphAvailable": false,
                                    "showHighestPhaseCurrentStatsChart": false,
                                    "showSegments": false,
                                    "showHighestCurrentStats": true,
                                }
                            }
                            if ($scope.isRefreshedAppliedClicked) {
                                $scope.isRefreshedAppliedClicked = false;
                                if ($scope.oldHideShowValue.showHighestPhaseCurrentStatsChart) {
                                    $scope.showHighestCurrentStatsCurve();
                                }
                                $scope.hideShowValue = $scope.oldHideShowValue
                            }
                        }
                    }).error(function (data, status, headers, config) {
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
                $scope.lineChartData = NetworkMeteringService.ConvertDataToGraph(graphSettings, graphData, true);
                $scope.combinationChartData = NetworkMeteringService.CreateAreaGraphForHighestCurrent(graphSettings, graphData, $scope.criteriaValue);

                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": true,
                    "showCombineGraph": false,
                    "isGraphAvailable": true,
                    "showHighestPhaseCurrentStatsChart": false,
                    "showSegments": false,
                    "showHighestCurrentStats": true,
                }
            }
            function getStudyCriteriaValue(filterObj) {
                var capacity = $scope.dtAnalysisConfiguration.Capacity;
                var voltageRating = $scope.dtAnalysisConfiguration.VoltageRating;
                $scope.filterData.filter.currentRating = ((capacity * 1000) / (3 * voltageRating)).toFixed(2)
                $scope.filterData.filter.capacity = capacity;

                if ($scope.isNotNullorUndefinedForNumber(filterObj.Normal)
                    && $scope.isNotNullorUndefinedForNumber(filterObj.Acceptable)
                    && $scope.isNotNullorUndefinedForNumber(filterObj.NotAcceptable)) {

                    $scope.criteriaValue = {
                        normalValue: getValues(filterObj.Normal),
                        acceptableValue: getValues(filterObj.Acceptable),
                        notAcceptableValue: getValues(filterObj.NotAcceptable),
                        criticalValue: getValues(100),
                    };

                    var criteriaFilter =
                    {
                        normal: filterObj.Normal,
                        acceptable: filterObj.Acceptable,
                        notAcceptable: filterObj.NotAcceptable,
                        normalValue: $scope.criteriaValue.normalValue + ' A',
                        acceptableValue: $scope.criteriaValue.acceptableValue + ' A',
                        notAcceptableValue: $scope.criteriaValue.notAcceptableValue + ' A',
                        criticalValue: $scope.criteriaValue.criticalValue + ' A',
                    }
                }
                else {
                    $scope.criteriaValue = {
                        normalValue: getValues($scope.dtAnalysisConfiguration.HighestCurrent.Normal),
                        acceptableValue: getValues($scope.dtAnalysisConfiguration.HighestCurrent.Acceptable),
                        notAcceptableValue: getValues($scope.dtAnalysisConfiguration.HighestCurrent.NotAcceptable),
                        criticalValue: getValues(100),
                    };

                    var criteriaFilter =
                    {
                        normal: $scope.dtAnalysisConfiguration.HighestCurrent.Normal,
                        acceptable: $scope.dtAnalysisConfiguration.HighestCurrent.Acceptable,
                        notAcceptable: $scope.dtAnalysisConfiguration.HighestCurrent.NotAcceptable,
                        normalValue: $scope.criteriaValue.normalValue + ' A',
                        acceptableValue: $scope.criteriaValue.acceptableValue + ' A',
                        notAcceptableValue: $scope.criteriaValue.notAcceptableValue + ' A',
                        criticalValue: $scope.criteriaValue.criticalValue + ' A',
                    }
                }

                angular.extend($scope.filterData.filter, criteriaFilter);
            }
            function getValues(percentage) {
                return (percentage * $scope.filterData.filter.currentRating / 100).toFixed(2);
            }
        }]);
