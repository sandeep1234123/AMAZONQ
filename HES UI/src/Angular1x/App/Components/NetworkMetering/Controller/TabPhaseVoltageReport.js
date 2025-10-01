'use strict';

app.controller('TabPhaseVoltageReport',
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
                    "showSegments": false,
                    "showDurationGraph": false,
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
                $scope.pageTitle = $state.current.pageTitle;
                $scope.reportFor = $state.current.reportFor;
                $scope.mainTitle = translateFilter("Menu." + $scope.reportFor);
                $scope.DurationCurveTitle = $state.current.durationCurveTitle;
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
                    filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelForPhaseVoltageReport.html',
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
                        setButtonColor("valueButtonID", "durationButtonID");
                    }
                    else {
                        document.getElementById("showSegmentsID").value = false;
                        hideCombinationChart()
                    }
                }
            }
            $scope.showValueCurve = function () {
                setCurveType("valueButtonID", "durationButtonID", true, false);
            }
            $scope.showDurationCurve = function () {
                setCurveType("durationButtonID", "valueButtonID", false, true);
            }

            $scope.inputElementFocus = function (value, inputID) {
                if (value != undefined) {
                    if (inputID == 'normal') {
                        $scope.filterData.filter.phaseVoltage.Positive.Normal = getValues(value);
                        $scope.filterData.filter.phaseVoltage.Negative.Normal = getValues(value * -1);
                    }
                    else if (inputID == 'acceptable') {
                        $scope.filterData.filter.phaseVoltage.Positive.Acceptable = getValues(value);
                        $scope.filterData.filter.phaseVoltage.Negative.Acceptable = getValues(value * -1);
                    }
                    else if (inputID == 'notacceptable') {
                        $scope.filterData.filter.phaseVoltage.Positive.NotAcceptable = getValues(value);
                        $scope.filterData.filter.phaseVoltage.Negative.NotAcceptable = getValues(value * -1);
                    }
                }
            }
            $scope.inputElementBlur = function (value, inputID) {
                if (value == undefined) {
                    if (inputID == 'normal') {
                        value = $scope.dtAnalysisConfiguration.PhaseVoltage.Normal;
                        $scope.filterData.filter.normal = value;
                        $scope.filterData.filter.phaseVoltage.Positive.Normal = getValues(value);
                        $scope.filterData.filter.phaseVoltage.Negative.Normal = getValues(value * -1);
                    }
                    else if (inputID == 'acceptable') {
                        value = $scope.dtAnalysisConfiguration.PhaseVoltage.Acceptable;
                        $scope.filterData.filter.acceptable = value;
                        $scope.filterData.filter.phaseVoltage.Positive.Acceptable = getValues(value);
                        $scope.filterData.filter.phaseVoltage.Negative.Acceptable = getValues(value * -1);
                    }
                    else if (inputID == 'notacceptable') {
                        value = $scope.dtAnalysisConfiguration.PhaseVoltage.NotAcceptable;
                        $scope.filterData.filter.notAcceptable = value;
                        $scope.filterData.filter.phaseVoltage.Positive.NotAcceptable = getValues(value);
                        $scope.filterData.filter.phaseVoltage.Negative.NotAcceptable = getValues(value * -1);
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
            function setCurveType(selectedButtonID, deselectButtonID, isValueCurve, isDurationCurve) {
                if (!$scope.isRefreshedAppliedClicked) {
                    setButtonColor(selectedButtonID, deselectButtonID);
                    var checkbox = document.getElementById('showSegmentsID');
                    checkbox.checked = false;
                    document.getElementById("showSegmentsID").value = false;

                    if (isValueCurve) {
                        $scope.PageTitle = translateFilter("Menu.LoadCurveValue")
                        $scope.additionalFilters = null;
                        if ($scope.isDataAvailable) {
                            $scope.hideShowValue =
                            {
                                "isProcessing": false,
                                "isValueCurve": true,
                                "showValueGraph": true,
                                "showCombineGraph": false,
                                "isGraphAvailable": true,
                                "showSegments": false,
                                "showDurationGraph": false,
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
                                "isValueCurve": true,
                                "showValueGraph": false,
                                "showCombineGraph": false,
                                "isGraphAvailable": true,
                                "showSegments": false,
                                "showDurationGraph": true,
                            }
                        }
                    }
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
                    "showSegments": true,
                    "showDurationGraph": false,
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
                    "showSegments": false,
                    "showDurationGraph": false,
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
                $scope.lineChartData = {};
                $scope.combinationChartData = {};
                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": false,
                    "showCombineGraph": false,
                    "isGraphAvailable": false,
                    "showSegments": false,
                    "showDurationGraph": false,
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
                                    setDurationCurve($scope.graphSettings, $scope.data)
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
                                    $scope.data, $scope.gridID, translateFilter("Menu.PhaseVoltageReport"), $scope.requestDetails, $state.current.tableHeaderTemplateURL, $state.current.tableBodyTemplateURL,$scope.reportFor)
                                if (response.Data.Data[0]['Message'] != undefined) {
                                    $scope.isDataAvailable = false;
                                }
                                else {
                                    $scope.isDataAvailable = true;
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
                            "showValueGraph": false,
                            "showCombineGraph": false,
                            "isGraphAvailable": false,
                            "showSegments": false,
                            "showDurationGraph": false,
                        }
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
                $scope.combinationChartData = CreateAreaGraphForPhaseVoltage(graphSettings, graphData, $scope.criteriaValue);

                $scope.hideShowValue =
                {
                    "isProcessing": false,
                    "isValueCurve": true,
                    "showValueGraph": true,
                    "showCombineGraph": false,
                    "isGraphAvailable": true,
                    "showSegments": false,
                    "showDurationGraph": false,
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
            function getStudyCriteriaValue(filterObj) {
                $scope.filterData.filter.voltageRating = $scope.dtAnalysisConfiguration.VoltageRating;

                if ($scope.isNotNullorUndefinedForNumber(filterObj.Normal)
                    && $scope.isNotNullorUndefinedForNumber(filterObj.Acceptable)
                    && $scope.isNotNullorUndefinedForNumber(filterObj.NotAcceptable)) {

                    const phaseVoltage = new PhaseVoltage();
                    phaseVoltage.Positive = {
                        Normal: getValues(filterObj.Normal),
                        Acceptable: getValues(filterObj.Acceptable),
                        NotAcceptable: getValues(filterObj.NotAcceptable),
                        Critical: getValues(100),
                    }
                    phaseVoltage.Negative = {
                        Normal: getValues(filterObj.Normal * -1),
                        Acceptable: getValues(filterObj.Acceptable * -1),
                        NotAcceptable: getValues(filterObj.NotAcceptable * -1),
                        Critical: getValues(100 * -1),
                    }

                    $scope.criteriaValue = {
                        voltage: $scope.filterData.filter.voltageRating,
                        phaseVoltage: phaseVoltage
                    };

                    var criteriaFilter =
                    {
                        normal: filterObj.Normal,
                        acceptable: filterObj.Acceptable,
                        notAcceptable: filterObj.NotAcceptable,
                        phaseVoltage: phaseVoltage
                    }
                }
                else {
                    const phaseVoltage = new PhaseVoltage();
                    phaseVoltage.Positive = {
                        Normal: getValues($scope.dtAnalysisConfiguration.PhaseVoltage.Normal),
                        Acceptable: getValues($scope.dtAnalysisConfiguration.PhaseVoltage.Acceptable),
                        NotAcceptable: getValues($scope.dtAnalysisConfiguration.PhaseVoltage.NotAcceptable),
                        Critical: getValues(100),
                    }
                    phaseVoltage.Negative = {
                        Normal: getValues($scope.dtAnalysisConfiguration.PhaseVoltage.Normal * -1),
                        Acceptable: getValues($scope.dtAnalysisConfiguration.PhaseVoltage.Acceptable * -1),
                        NotAcceptable: getValues($scope.dtAnalysisConfiguration.PhaseVoltage.NotAcceptable * -1),
                        Critical: getValues(100 * -1),
                    }

                    $scope.criteriaValue = {
                        voltage: $scope.filterData.filter.voltageRating,
                        phaseVoltage: phaseVoltage
                    };

                    var criteriaFilter =
                    {
                        normal: $scope.dtAnalysisConfiguration.PhaseVoltage.Normal,
                        acceptable: $scope.dtAnalysisConfiguration.PhaseVoltage.Acceptable,
                        notAcceptable: $scope.dtAnalysisConfiguration.PhaseVoltage.NotAcceptable,
                        phaseVoltage: phaseVoltage
                    }
                }

                angular.extend($scope.filterData.filter, criteriaFilter);
            }
            function getValues(percentage) {
                return ($scope.filterData.filter.voltageRating * (1 + (percentage / 100))).toFixed(2) + " V";
            }
            function CreateAreaGraphForPhaseVoltage(graphSettings, graphData, filterData) {
                var areaSeries = [
                    {
                        Property: "CriticalPositiveValue",
                        Label: "Critical1",
                        Color: "#eca0a0",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }

                    },
                    {
                        Property: "NotAcceptablePositiveValue",
                        Label: "Not Acceptable1",
                        Color: "#ffd0a3",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }

                    },
                    {
                        Property: "AcceptablePositiveValue",
                        Label: "Acceptable1",
                        Color: "#ffffbf",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }
                    },
                    {
                        Property: "Normal",
                        Label: "Normal",
                        Color: "#d1e8d1",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }
                    },
                    {
                        Property: "AcceptableNegativeValue",
                        Label: "Acceptable",
                        Color: "#ffffbf",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }
                    },
                    {
                        Property: "NotAcceptableNegativeValue",
                        Label: "Not Acceptable",
                        Color: "#ffd0a3",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }

                    },
                    {
                        Property: "CriticalNegativeValue",
                        Label: "Critical",
                        Color: "#eca0a0",
                        Type: 'area',
                        ShowInLegend: false,
                        EnableMouseTracking: false,
                        Marker: { enabled: false }

                    }
                ];
                graphSettings.Series = graphSettings.Series.concat(areaSeries);
                graphSettings["FillOpacity"] = 0.5

                graphSettings["plotLineValue"] = filterData.voltage
                graphSettings["plotLineText"] = filterData.voltage + " V";

                var acceptablePositiveValue = parseFloat(removeVoltage(filterData.phaseVoltage.Positive.Acceptable) - removeVoltage(filterData.phaseVoltage.Positive.Normal));
                var notAcceptablePositiveValue = parseFloat(removeVoltage(filterData.phaseVoltage.Positive.NotAcceptable) - removeVoltage(filterData.phaseVoltage.Positive.Acceptable));
                var criticalPositiveValue = parseFloat(removeVoltage(filterData.phaseVoltage.Positive.Critical) - removeVoltage(filterData.phaseVoltage.Positive.NotAcceptable));
                var normal = parseFloat(removeVoltage(filterData.phaseVoltage.Positive.Normal) - removeVoltage(filterData.phaseVoltage.Negative.Normal));
                var acceptableNegativeValue = parseFloat(removeVoltage(filterData.phaseVoltage.Negative.Normal) - removeVoltage(filterData.phaseVoltage.Negative.Acceptable));
                var notAcceptableNegativeValue = parseFloat(removeVoltage(filterData.phaseVoltage.Negative.Acceptable) - removeVoltage(filterData.phaseVoltage.Negative.NotAcceptable));
                var criticalNegativeValue = parseFloat(removeVoltage(filterData.phaseVoltage.Negative.NotAcceptable) - removeVoltage(filterData.phaseVoltage.Negative.Critical));

                for (let dataIndexer = 0; dataIndexer < graphData.length; dataIndexer++) {

                    graphData[dataIndexer]['AcceptablePositiveValue'] = acceptablePositiveValue;
                    graphData[dataIndexer]['NotAcceptablePositiveValue'] = notAcceptablePositiveValue;
                    graphData[dataIndexer]['CriticalPositiveValue'] = criticalPositiveValue;
                    graphData[dataIndexer]['Normal'] = normal;
                    graphData[dataIndexer]['AcceptableNegativeValue'] = acceptableNegativeValue;
                    graphData[dataIndexer]['NotAcceptableNegativeValue'] = notAcceptableNegativeValue;
                    graphData[dataIndexer]['CriticalNegativeValue'] = criticalNegativeValue;
                }

                return NetworkMeteringService.ConvertDataToGraph(graphSettings, graphData);
            };
            function removeVoltage(value) {
                const letterToRemove = "V";
                const stringArray = value.split('');
                const modifiedArray = stringArray.filter(char => char !== letterToRemove);
                return modifiedArray.join('');
            }
        }]);


class ParameterStudyCriteria {
    constructor() {
        this.Normal = 0;
        this.Acceptable = 0;
        this.NotAcceptable = 0;
        this.Critical = 0;
    }
}

class PhaseVoltage {
    constructor() {
        this.Positive = new ParameterStudyCriteria();
        this.Negative = new ParameterStudyCriteria();
    }
}

