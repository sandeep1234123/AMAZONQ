'use strict';

app.controller('TabUnbalanceReport',
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
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": false,
                    "isDTUnbalanced": false,
                    "showValueGraph": false,
                    "showDurationGraph": false,
                    "showLoadingCurve": false,
                    "showSegments": false,
                }

                $scope.DeviceName = $stateParams.name;
                translateFilter = $filter('translate');
                $scope.filterDetails = {};
                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.DeviceName;
                $scope.reportView = "daily"
                $scope.additionalFilters = null;
                $scope.partialViewPath = $state.current.partialViewPath;
                $scope.controllerName = $state.current.controllerName;

                $scope.yAxisLabel = $state.current.yAxisLabel;
                $scope.ApiUrlKey = $state.current.apiUrlKey;
                $scope.reportFor = $state.current.reportFor;
                $scope.mainTitle = translateFilter("Menu." + $scope.reportFor);
                $scope.pageTitle = $state.current.pageTitle;
                $scope.DurationCurveTitle = $state.current.durationCurveTitle;
                $scope.showLoadedUnloadedCurveOnUi = true;
                $scope.filterTitle = $state.current.filterTitle != undefined ? $state.current.filterTitle : "Value";
                $scope.buttonTitle = $state.current.buttonTitle != undefined ? $state.current.buttonTitle : "Curve";
                $scope.gridID = $state.current.gridID;
                $scope.dict = {};

                $scope.filterData = {
                    filter: {
                        startDate: moment().subtract(90, 'days'),
                        endDate: $moment(new Date()),
                        date: {
                            startDate: moment().subtract(90, 'days'),
                            endDate: $moment(new Date()),
                        },
                        filterTitle: 'Menu.' + $scope.filterTitle,
                        showUnbalancedCurveFilter: false
                    },
                    applyFilter: applyFilter,
                    clearFilter: clearFilter,
                    enableTime: false,
                    minMaxValidation: true,
                    filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelForDTVoltageUnbalanceReport.html',
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

                $scope.hideShowValue.showLoadedUnloadedCurveFilter = false;
                $scope.additionalFilters = null;
                if (!$scope.showFilterPanel) {
                    dayFilter.style.backgroundColor = "white";
                    monthFilter.style.backgroundColor = "white";
                    datefilter.style.backgroundColor = "white"
                }
            }
            $scope.refresh = function () {
                $scope.isRefreshedAppliedClicked = true;
                $scope.oldHideShowValue = $scope.hideShowValue
                $scope.showUnbalancedCurveFilter = $scope.filterData.filter.showUnbalancedCurveFilter;
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
                $scope.filterData.filter.showUnbalancedCurveFilter = false;
                setCurveType("durationButtonID", ["valueButtonID", "loadingConditionButton"], false, true);
            }
            $scope.showValueCurve = function () {
                $scope.filterData.filter.showUnbalancedCurveFilter = false;
                setCurveType("valueButtonID", ["durationButtonID", "loadingConditionButton"], true, false);
            }
            $scope.showLoadedUnloadedCurve = function () {
                $scope.filterData.filter.showUnbalancedCurveFilter = true;
                setCurveType("loadingConditionButton", ["valueButtonID", "durationButtonID",], false, false);

                setAdditionalFilter($scope.filterData.filter);
                getGridData($scope.filterData.filter)
            }
            $scope.inputElementFocus = function (criteriaValue, inputID) {
                if (criteriaValue != undefined) {
                    $scope.dict['Criteria' + inputID] = criteriaValue;
                    setCriteriaForLoadedDropDown($scope.dict)
                }
            }
            $scope.inputElementBlur = function (criteriaValue, inputID) {
                if (criteriaValue == undefined) {
                    var indexer = Number(inputID) - 1;
                    criteriaValue = $scope.dtAnalysisConfiguration.LoadingStats[indexer];
                    $scope.filterData.filter['criteria' + inputID] = criteriaValue;
                    
                    $scope.dict['Criteria' + inputID] = criteriaValue;
                    setCriteriaForLoadedDropDown($scope.dict)
                }
            }
            $scope.onReportViewType = function (reportView) {
                $scope.reportView = reportView;
                setReportView($scope.reportView)
                $scope.additionalFilters = null;
                getData();
            }
            $scope.getMinValue = function (value) {
                var minValue = 0;
                if (value != undefined) {
                    minValue = value + 1
                }
                return Number(minValue);
            }
            $scope.getMaxValue = function (value) {
                var maxValue = 100;
                if (value != undefined) {
                    maxValue = value - 1
                }
                return Number(maxValue);
            }
            $scope.init();

            function setCriteriaForLoadedDropDown(dict) {
                $scope.filterData.filter.criteriaunbalancedDropDown = NetworkMeteringService.SetCriteriaForLoadedDropDown(dict);
                $scope.filterData.filter.unbalancedCriteria = $scope.filterData.filter.criteriaunbalancedDropDown[0].value;
            }
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
                        $scope.additionalFilters = null;
                        if ($scope.isDataAvailable) {
                            $scope.hideShowValue =
                            {
                                "isProcessing": false,
                                "isValueCurve": true,
                                "showLoadedUnloadedCurveFilter": false,
                                "isGraphAvailable": true,
                                "isDTUnbalanced": false,
                                "showValueGraph": true,
                                "showDurationGraph": false,
                                "showLoadingCurve": false,
                                "showSegments": false,
                            }
                        }

                    }
                    else if (isDurationCurve) {
                        $scope.PageTitle = translateFilter("Menu.LoadCurveDuration")
                        $scope.additionalFilters = null;
                        if ($scope.isDataAvailable) {
                            $scope.hideShowValue =
                            {
                                "isProcessing": false,
                                "isValueCurve": false,
                                "showLoadedUnloadedCurveFilter": false,
                                "isGraphAvailable": true,
                                "isDTUnbalanced": false,
                                "showValueGraph": false,
                                "showDurationGraph": true,
                                "showLoadingCurve": false,
                                "showSegments": false,
                            }
                        }
                    }
                }
                else {
                    if (!isValueCurve && !isDurationCurve) {
                        $scope.filterData.filter.showVoltageLoadedUnloaded = $scope.showVoltageLoadedUnloaded;
                    }
                }
            }
            function showCombinationChart() {
                $scope.chartData = $scope.lineChartData;
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": false,
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": true,
                    "isDTUnbalanced": false,
                    "showValueGraph": false,
                    "showDurationGraph": true,
                    "showLoadingCurve": false,
                    "showSegments": true,
                }
            }
            function hideCombinationChart() {
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": false,
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": true,
                    "isDTUnbalanced": false,
                    "showValueGraph": true,
                    "showDurationGraph": false,
                    "showLoadingCurve": false,
                    "showSegments": false,
                }
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
            function applyFilter(filterObj) {
                if (filterObj.showUnbalancedCurveFilter) {
                    setAdditionalFilter(filterObj)
                    $scope.showLoadedUnloadedCurveFilter = false
                }
                else {
                    setReportView($scope.reportView);
                    $scope.additionalFilters = null;
                }
                $scope.oldHideShowValue = $scope.hideShowValue
                getGridData(filterObj);
            }
            function setAdditionalFilter(filterObj) {
                if (filterObj.showUnbalancedCurveFilter) {
                    $scope.additionalFilters = {};
                    for (var indexer = 0; indexer < $scope.dtAnalysisConfiguration.LoadingStats.length; indexer++) {
                        var criteriaNumber = Number(indexer) + 1;
                        $scope.additionalFilters['Criteria' + criteriaNumber] = filterObj['criteria' + criteriaNumber] != null
                            ? filterObj['criteria' + criteriaNumber].toString()
                            : "";
                    }
                }
            }
            function clearFilter() {
                $scope.init();
                $scope.onFilterClick();
                $scope.reportView = "daily"
                setReportView($scope.reportView);
                $scope.showFilterPanel = false;
                $scope.additionalFilters = null;
                getData();
            }
            function getGridData(filterObj) {
                $scope.loadingGridData = {};
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": false,
                    "isDTUnbalanced": false,
                    "showValueGraph": true,
                    "showDurationGraph": true,
                    "showLoadingCurve": false,
                    "showSegments": false,
                }

                var filter = NetworkMeteringService.GetFilter(filterObj, $scope.filterData, $scope.reportView, $scope.additionalFilters);
                URIService.GetData(URIService.GetReportUrl($scope.DeviceName, $scope.ApiUrlKey, filter, $scope.reportFor))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;
                            NetworkMeteringService.SetPageFilters($scope.requestDetails, $scope.filterData)
                            getStudyCriteriaValue($scope.dtAnalysisConfiguration, $scope.filterData.filter);

                            if (response.Data != null && response.Data != undefined &&
                                response.Data.Data.length > 0) {
                                $scope.graphSettings = response.Data.GraphSettings;
                                $scope.gridSettings = response.Data.GridSettings;

                                if ($scope.additionalFilters != null && $scope.additionalFilters != undefined) {
                                    $scope.loadingData = response.Data.Data;

                                    $scope.hideShowValue =
                                    {
                                        "isProcessing": false,
                                        "isValueCurve": true,
                                        "showLoadedUnloadedCurveFilter": false,
                                        "isGraphAvailable": true,
                                        "isDTUnbalanced": false,
                                        "showValueGraph": false,
                                        "showDurationGraph": false,
                                        "showLoadingCurve": true,
                                        "showSegments": false,
                                    }

                                    if ($scope.isNotNullorUndefined($scope.graphSettings)) {
                                        $scope.loadingCurveData = NetworkMeteringService.ConvertDataToGraph($scope.graphSettings, $scope.loadingData, false, true);
                                    }

                                    $scope.loadingGridData = NetworkMeteringService.GetGridDataFromResponse($scope.gridSettings,
                                        $scope.loadingData, 'VoltageUnbalancedStats', translateFilter("Menu.VoltageUnbalancedStats"), $scope.requestDetails, null, null, $scope.reportFor)
                                    if ($scope.isNotNullorUndefined(filterObj) && filterObj.showUnbalancedCurveFilter) {
                                        getIfDTIsunBalanced()
                                    }
                                }
                                else {
                                    $scope.hideShowValue =
                                    {
                                        "isProcessing": false,
                                        "isValueCurve": true,
                                        "showLoadedUnloadedCurveFilter": false,
                                        "isGraphAvailable": true,
                                        "isDTUnbalanced": false,
                                        "showValueGraph": false,
                                        "showDurationGraph": false,
                                        "showLoadingCurve": false,
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
                                            "showLoadedUnloadedCurveFilter": false,
                                            "isGraphAvailable": true,
                                            "isDTUnbalanced": false,
                                            "showValueGraph": true,
                                            "showDurationGraph": false,
                                            "showLoadingCurve": false,
                                            "showSegments": false,
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
                                        $scope.data, $scope.gridID, translateFilter("Menu.VoltageUnbalance"), $scope.requestDetails, $state.current.tableHeaderTemplateURL, $state.current.tableBodyTemplateURL, $scope.reportFor)
                                    if (response.Data.Data[0]['Message'] != undefined) {
                                        $scope.isDataAvailable = false;
                                    }
                                    else {
                                        $scope.isDataAvailable = true;
                                    }
                                }
                            }
                            else {
                                $scope.gridData = {};
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
                            "showLoadedUnloadedCurveFilter": false,
                            "isGraphAvailable": false,
                            "isDTUnbalanced": false,
                            "showValueGraph": true,
                            "showDurationGraph": false,
                            "showLoadingCurve": false,
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
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": true,
                    "isDTUnbalanced": false,
                    "showValueGraph": true,
                    "showDurationGraph": false,
                    "showLoadingCurve": false,
                    "showSegments": false,
                }
            }
            function setDurationCurve(graphSettings, graphData) {
                graphSettings.tickInterval = $state.current.tickInterval
                graphSettings.minTicks = $state.current.minTicks;
                graphSettings.maxTicks = $state.current.maxTicks;

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
                    xAxixTooltipLabel: "For: "
                }
                $scope.durtionCurveData = NetworkMeteringService.SetDurationCurve(durationCurveGraphSetting, graphSettings,
                    graphData, $scope.keyName);
            }
            function getStudyCriteriaValue(dtAnalysisConfiguration, filterObj) {
                if ($scope.showLoadedUnloadedCurveOnUi) {
                    var result = true;
                    for (var indexer = 0; indexer < dtAnalysisConfiguration.LoadingStats.length; indexer++) {
                        var criteriaCount = Number(indexer) + 1;
                        if (!$scope.isNotNullorUndefinedForNumber(filterObj['criteria' + criteriaCount])) {
                            result = false;
                        }
                    }
                    if (!result) {
                        var filterCriteria = {};
                        $scope.dict = {}
                        for (var indexer = 0; indexer < dtAnalysisConfiguration.LoadingStats.length; indexer++) {
                            var criteriaCount = Number(indexer) + 1;
                            filterCriteria['criteria' + criteriaCount] = dtAnalysisConfiguration.LoadingStats[indexer];
                            $scope.dict['Criteria' + criteriaCount] = dtAnalysisConfiguration.LoadingStats[indexer];
                        }

                        $scope.unbalancedCriteriaMins = dtAnalysisConfiguration.UnbalancedCriteriaMins;

                        $scope.filterData.filter.unbalancedCriteriaValue = $scope.FormatData($scope.unbalancedCriteriaMins, 'timeinhourandminutes');
                        angular.extend($scope.filterData.filter, filterCriteria);

                        var criteriaInputElement = [];
                        for (var indexer = 0; indexer < dtAnalysisConfiguration.LoadingStats.length; indexer++) {
                            var criteriaCount = Number(indexer) + 1;
                            var criteriaInput = {
                                Id: criteriaCount,
                                Label: 'Criteria ' + criteriaCount,
                                Color: getBorderColor(criteriaCount),
                                MinValue: indexer,
                                MaxValue: criteriaCount + 1,
                            }
                            criteriaInputElement.push(criteriaInput)
                        }
                        $scope.filterData.filter['criteriaInputElement'] = criteriaInputElement;

                        setCriteriaForLoadedDropDown($scope.dict);
                    }
                }
            }
            function getBorderColor(criteriaNumber) {
                var color = 'black';
                switch (criteriaNumber) {
                    case 1:
                        {
                            color = 'green';
                            break;
                        }
                    case 2:
                        {
                            color = 'yellow';
                            break;
                        }
                    case 3:
                        {
                            color = 'orange';
                            break;
                        }
                    case 4:
                        {
                            color = 'red';
                            break;
                        }
                }
                return color;
            }
            function getIfDTIsunBalanced() {
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": true,
                    "isDTUnbalanced": false,
                    "showValueGraph": false,
                    "showDurationGraph": false,
                    "showLoadingCurve": true,
                    "showSegments": false,
                }

                var unbalancedValue = parseInt(($scope.filterData.filter.unbalancedCriteriaValue.split(':')[0]) * 60) + parseInt($scope.filterData.filter.unbalancedCriteriaValue.split(':')[1]);

                if ($scope.loadingData[0][$scope.filterData.filter.unbalancedCriteria] >= unbalancedValue) {
                    $scope.hideShowValue.isDTUnbalanced = true
                }
            }
        }]);
