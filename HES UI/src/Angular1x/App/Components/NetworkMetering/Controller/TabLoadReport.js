'use strict';

app.controller('TabLoadReport',
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
                    "isDTLoaded": false,
                    "isDTUnloaded": false,
                    "showValueGraph": false,
                    "showDurationGraph": false,
                    "showLoadingCurve": false,
                    "showSegments": false,
                    "showCombineGraph": false
                }

                $scope.DeviceName = $stateParams.name;
                translateFilter = $filter('translate');
                $scope.filterDetails = {};
                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.DeviceName;
                $scope.reportView = "daily"
                $scope.reportCategory = 'kVA';
                $scope.ReportName = translateFilter("Menu.Apparent");
                $scope.additionalFilters = null;
                $scope.partialViewPath = $state.current.partialViewPath;
                $scope.controllerName = $state.current.controllerName;

                $scope.yAxisLabel = $state.current.yAxisLabel;
                $scope.ApiUrlKey = $state.current.apiUrlKey;
                $scope.pageTitle = $state.current.pageTitle;
                $scope.reportFor = $state.current.reportFor;
                $scope.mainTitle = translateFilter("Menu." + $scope.reportFor);
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
                        selectedReportType: 'kVA',
                        reportType: [],
                        showReportType: true,
                        filterTitle: 'Menu.' + $scope.filterTitle,
                        showVoltageLoadedUnloaded: false
                    },
                    applyFilter: applyFilter,
                    clearFilter: clearFilter,
                    enableTime: false,
                    minMaxValidation: true,
                    filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelForDTLoadReport.html',
                    flag: 'icon'
                }
                $scope.filterData.filter.reportType = [
                    { Id: '0', Name: translateFilter("Menu.Apparent"), value: 'kVA', Selected: true },
                    { Id: '1', Name: translateFilter("Menu.Active"), value: 'kW', Selected: false },
                    { Id: '2', Name: translateFilter("Menu.Reactive"), value: 'VAr', Selected: false },
                ]
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
                $scope.showVoltageLoadedUnloaded = $scope.filterData.filter.showVoltageLoadedUnloaded;
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
                $scope.filterData.filter.showVoltageLoadedUnloaded = false;
                setCurveType("durationButtonID", ["valueButtonID", "loadingConditionButton"], false, true);
            }
            $scope.showValueCurve = function () {
                $scope.filterData.filter.showVoltageLoadedUnloaded = false;
                setCurveType("valueButtonID", ["durationButtonID", "loadingConditionButton"], true, false);
            }
            $scope.showLoadedUnloadedCurve = function () {
                $scope.filterData.filter.showVoltageLoadedUnloaded = true;
                setCurveType("loadingConditionButton", ["valueButtonID", "durationButtonID",], false, false);

                setAdditionalFilter($scope.filterData.filter);
                getGridData($scope.filterData.filter)
            }
            $scope.onControlClick = function (reportCategory) {
                $scope.filterData.filter.reportType

                angular.forEach($scope.filterData.filter.reportType, function (reportType, value) {
                    if (reportType.value == reportCategory) {
                        $scope.ReportName = reportType.Name;
                    }
                });

                $scope.reportCategory = reportCategory;
                $scope.gridID = reportCategory + $state.current.gridID;
                $scope.yAxisLabel = "Load(" + $scope.reportCategory + ")"
                if (reportCategory == 'kW' || reportCategory == 'VAr') {
                    $scope.showLoadedUnloadedCurveOnUi = false
                }
                else {
                    $scope.showLoadedUnloadedCurveOnUi = true
                }
            }
            $scope.inputElementFocus = function (criteriaValue, inputID) {
                if (criteriaValue != undefined) {
                    var calculatedCriteriaValue = getValues(criteriaValue) + ' kVA';
                    if (inputID == 'Criteria1') {
                        $scope.filterData.filter.criteria1Value = calculatedCriteriaValue;
                    }
                    else if (inputID == 'Criteria2') {
                        $scope.filterData.filter.criteria2Value = calculatedCriteriaValue;
                    }
                    else if (inputID == 'Criteria3') {
                        $scope.filterData.filter.criteria3Value = calculatedCriteriaValue;
                    }
                    else if (inputID == 'Criteria4') {
                        $scope.filterData.filter.criteria4Value = calculatedCriteriaValue;
                    }

                    $scope.dict[inputID] = criteriaValue;
                    setCriteriaForLoadedDropDown($scope.dict)
                }
            }
            $scope.inputElementBlur = function (criteriaValue, inputID) {
                if (criteriaValue == undefined) {
                    if (inputID == 'Criteria1') {
                        criteriaValue = $scope.dtAnalysisConfiguration.LoadingStats[0];
                        $scope.filterData.filter.criteria1 = criteriaValue;
                        $scope.filterData.filter.criteria1Value = getValues(criteriaValue) + ' kVA';
                    }
                    else if (inputID == 'Criteria2') {
                        criteriaValue = $scope.dtAnalysisConfiguration.LoadingStats[1];
                        $scope.filterData.filter.criteria2 = criteriaValue;
                        $scope.filterData.filter.criteria2Value = getValues(criteriaValue) + ' kVA';
                    }
                    else if (inputID == 'Criteria3') {
                        criteriaValue = $scope.dtAnalysisConfiguration.LoadingStats[2];
                        $scope.filterData.filter.criteria3 = criteriaValue;
                        $scope.filterData.filter.criteria3Value = getValues(criteriaValue) + ' kVA';
                    }
                    else if (inputID == 'Criteria4') {
                        criteriaValue = $scope.dtAnalysisConfiguration.LoadingStats[3];
                        $scope.filterData.filter.criteria4 = criteriaValue;
                        $scope.filterData.filter.criteria4Value = getValues(criteriaValue) + ' kVA';
                    }

                    $scope.dict[inputID] = criteriaValue;
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
                return value + 1;
            }
            $scope.getMaxValue = function (value) {
                return value - 1;
            }
            $scope.init();

            function setCriteriaForLoadedDropDown(dict) {
                $scope.filterData.filter.criteriaLoadedDropDown = NetworkMeteringService.SetCriteriaForLoadedDropDown(dict);
                $scope.filterData.filter.loadedCriteria = $scope.filterData.filter.criteriaLoadedDropDown[$scope.filterData.filter.criteriaLoadedDropDown.length - 1].value;
                $scope.filterData.filter.unloadedCriteria = $scope.filterData.filter.criteriaLoadedDropDown[0].value;
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
                                "isDTLoaded": false,
                                "isDTUnloaded": false,
                                "showValueGraph": true,
                                "showDurationGraph": false,
                                "showLoadingCurve": false,
                                "showSegments": false,
                                "showCombineGraph": false
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
                                "isDTLoaded": false,
                                "isDTUnloaded": false,
                                "showValueGraph": false,
                                "showDurationGraph": true,
                                "showLoadingCurve": false,
                                "showSegments": false,
                                "showCombineGraph": false
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
                    "isDTLoaded": false,
                    "isDTUnloaded": false,
                    "showValueGraph": false,
                    "showDurationGraph": true,
                    "showLoadingCurve": false,
                    "showSegments": true,
                    "showCombineGraph": true
                }
            }
            function hideCombinationChart() {
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": false,
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": true,
                    "isDTLoaded": false,
                    "isDTUnloaded": false,
                    "showValueGraph": true,
                    "showDurationGraph": false,
                    "showLoadingCurve": false,
                    "showSegments": false,
                    "showCombineGraph": false
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
                if (filterObj.showVoltageLoadedUnloaded) {
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
                if (filterObj.showVoltageLoadedUnloaded) {
                    $scope.additionalFilters = {
                        "Criteria1": filterObj.criteria1 != null ? filterObj.criteria1.toString() : "",
                        "Criteria2": filterObj.criteria2 != null ? filterObj.criteria2.toString() : "",
                        "Criteria3": filterObj.criteria3 != null ? filterObj.criteria3.toString() : "",
                        "Criteria4": filterObj.criteria4 != null ? filterObj.criteria4.toString() : "",
                    };
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
                    "isDTLoaded": false,
                    "isDTUnloaded": false,
                    "showValueGraph": true,
                    "showDurationGraph": true,
                    "showLoadingCurve": false,
                    "showSegments": false,
                    "showCombineGraph": false
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
                                        "isDTLoaded": false,
                                        "isDTUnloaded": false,
                                        "showValueGraph": false,
                                        "showDurationGraph": false,
                                        "showLoadingCurve": true,
                                        "showSegments": false,
                                        "showCombineGraph": false
                                    }

                                    if ($scope.isNotNullorUndefined($scope.graphSettings)) {
                                        $scope.loadingCurveData = NetworkMeteringService.ConvertDataToGraph($scope.graphSettings, $scope.loadingData);
                                    }

                                    $scope.loadingGridData = NetworkMeteringService.GetGridDataFromResponse($scope.gridSettings,
                                        $scope.loadingData, "LoadCurveStats", translateFilter("Menu.LoadCurveStats"), $scope.requestDetails, $state.current.tableHeaderTemplateURL, $state.current.tableBodyTemplateURL, $scope.reportFor)
                                    if ($scope.isNotNullorUndefined(filterObj) && filterObj.showVoltageLoadedUnloaded) {
                                        getIfDTIsLoadedOrUnloaded()
                                    }
                                }
                                else {
                                    $scope.hideShowValue =
                                    {
                                        "isProcessing": false,
                                        "isValueCurve": true,
                                        "showLoadedUnloadedCurveFilter": false,
                                        "isGraphAvailable": true,
                                        "isDTLoaded": false,
                                        "isDTUnloaded": false,
                                        "showValueGraph": false,
                                        "showDurationGraph": false,
                                        "showLoadingCurve": false,
                                        "showSegments": false,
                                        "showCombineGraph": false
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
                                            "isDTLoaded": true,
                                            "isDTUnloaded": false,
                                            "showValueGraph": true,
                                            "showDurationGraph": false,
                                            "showLoadingCurve": false,
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
                                        $scope.data, $scope.gridID, $scope.ReportName + " " + translateFilter("Menu.LoadCurve"), $scope.requestDetails, $state.current.tableHeaderTemplateURL, $state.current.tableBodyTemplateURL, $scope.reportFor)
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
                            "isDTLoaded": false,
                            "isDTUnloaded": false,
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
                $scope.lineChartData = NetworkMeteringService.ConvertDataToGraph(graphSettings, graphData);
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showLoadedUnloadedCurveFilter": false,
                    "isGraphAvailable": true,
                    "isDTLoaded": false,
                    "isDTUnloaded": false,
                    "showValueGraph": true,
                    "showDurationGraph": false,
                    "showLoadingCurve": false,
                    "showSegments": false,
                }
            }
            function setDurationCurve(graphSettings, graphData) {
                angular.forEach($scope.filterData.filter.reportType, function (element, key) {
                    if (element.value == $scope.reportCategory)
                        $scope.DurationCurveTitle = element.Name + "DurationCurve";
                });


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
            function getValues(percentage) {
                return (percentage * $scope.filterData.filter.capacity / 100).toFixed(2);
            }

            function getStudyCriteriaValue(dtAnalysisConfiguration, filterObj) {
                if ($scope.showLoadedUnloadedCurveOnUi) {

                    $scope.filterData.filter.capacity = $scope.dtAnalysisConfiguration.Capacity;

                    if (!$scope.isNotNullorUndefinedForNumber(filterObj.criteria1)
                        || !$scope.isNotNullorUndefinedForNumber(filterObj.criteria2)
                        || !$scope.isNotNullorUndefinedForNumber(filterObj.criteria3)
                        || !$scope.isNotNullorUndefinedForNumber(filterObj.criteria4)) {
                        var filterCriteria = {
                            criteria1: dtAnalysisConfiguration.LoadingStats[0],
                            criteria2: dtAnalysisConfiguration.LoadingStats[1],
                            criteria3: dtAnalysisConfiguration.LoadingStats[2],
                            criteria4: dtAnalysisConfiguration.LoadingStats[3],

                        }
                        var filterCriteriaValue = {
                            criteria1Value: getValues(filterCriteria.criteria1) + ' kVA',
                            criteria2Value: getValues(filterCriteria.criteria2) + ' kVA',
                            criteria3Value: getValues(filterCriteria.criteria3) + ' kVA',
                            criteria4Value: getValues(filterCriteria.criteria4) + ' kVA',
                        }

                        $scope.unloadedCriteriaMins = dtAnalysisConfiguration.UnloadedCriteriaMins;
                        $scope.overloadedCriteriaMins = dtAnalysisConfiguration.OverloadedCriteriaMins;

                        $scope.filterData.filter.unloadedCriteriaValue = $scope.FormatData($scope.unloadedCriteriaMins, 'timeinhourandminutes');
                        $scope.filterData.filter.loadedCriteriaValue = $scope.FormatData($scope.overloadedCriteriaMins, 'timeinhourandminutes');

                        angular.extend(filterCriteria, filterCriteriaValue);
                        angular.extend($scope.filterData.filter, filterCriteria);

                        $scope.dict = {
                            "Criteria1": $scope.filterData.filter.criteria1,
                            "Criteria2": $scope.filterData.filter.criteria2,
                            "Criteria3": $scope.filterData.filter.criteria3,
                            "Criteria4": $scope.filterData.filter.criteria4,
                        };

                        setCriteriaForLoadedDropDown($scope.dict);
                    }
                }
            }
            function getIfDTIsLoadedOrUnloaded() {
                var unloadedValue = parseInt(($scope.filterData.filter.unloadedCriteriaValue.split(':')[0]) * 60) + parseInt($scope.filterData.filter.unloadedCriteriaValue.split(':')[1]);
                var loadedValue = parseInt(($scope.filterData.filter.loadedCriteriaValue.split(':')[0]) * 60) + parseInt($scope.filterData.filter.loadedCriteriaValue.split(':')[1]);

                if ($scope.loadingData[0][$scope.filterData.filter.unloadedCriteria] >= unloadedValue) {
                    $scope.hideShowValue =
                    {
                        "isProcessing": false,
                        "isValueCurve": true,
                        "showLoadedUnloadedCurveFilter": false,
                        "isGraphAvailable": true,
                        "isDTLoaded": false,
                        "isDTUnloaded": true,
                        "showValueGraph": false,
                        "showDurationGraph": false,
                        "showLoadingCurve": true,
                        "showSegments": false,
                        "showCombineGraph": false
                    }

                }
                else if ($scope.loadingData[0][$scope.filterData.filter.loadedCriteria] >= loadedValue) {
                    $scope.hideShowValue =
                    {
                        "isProcessing": false,
                        "isValueCurve": true,
                        "showLoadedUnloadedCurveFilter": false,
                        "isGraphAvailable": true,
                        "isDTLoaded": true,
                        "isDTUnloaded": false,
                        "showValueGraph": false,
                        "showDurationGraph": false,
                        "showLoadingCurve": true,
                        "showSegments": false,
                        "showCombineGraph": false
                    }
                }
                else {
                    $scope.hideShowValue =
                    {
                        "isProcessing": false,
                        "isValueCurve": true,
                        "showLoadedUnloadedCurveFilter": false,
                        "isGraphAvailable": true,
                        "isDTLoaded": false,
                        "isDTUnloaded": false,
                        "showValueGraph": false,
                        "showDurationGraph": false,
                        "showLoadingCurve": true,
                        "showSegments": false,
                        "showCombineGraph": false
                    }
                }
            }
        }]);
