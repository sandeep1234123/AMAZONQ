'use strict';
app.service('NetworkMeteringService', ['$filter', '$moment', '$rootScope', 'DataStructureFactory', 'ToolsFactory', 'AuthService',
    function ($filter, $moment, $rootScope, DataStructureFactory, ToolsFactory, AuthService) {

        var userInfo = AuthService.getAuthInfo();
        var tenantDateFormat = userInfo.cultureInfo.DateTimeFormats;

        function ConvertDataToGraphModel(graphSettings, graphData, reverseData) {

            var formattedGraphData = [...graphData];
            var categories = [];
            var series = [];
            var chartTitle = $filter('translate')("Menu." + graphSettings.Title)
            var yAxisLabel = $filter('translate')("Menu." + graphSettings.yAxisLabel);
            var xAxisLabel = graphSettings.xAxisLabel != null ? $filter('translate')("Menu." + graphSettings.xAxisLabel) : "";
            var xAxisLabelEnable = graphSettings.xAxisLabelEnable != undefined ? graphSettings.xAxisLabelEnable : true;
            var subtitle = graphSettings.SubTitle;
            var crosshair = graphSettings.Crosshair != undefined ? graphSettings.Crosshair : false;
            var lineWidth = graphSettings.LineWidth != undefined ? graphSettings.LineWidth : 2;
            var lineColor = graphSettings.LineColor != undefined ? graphSettings.LineColor : "";
            var fillOpacity = graphSettings.FillOpacity != undefined ? graphSettings.FillOpacity : 0.1;
            var stacking = graphSettings.Stacking != undefined ? graphSettings.Stacking : 'normal';
            var xAxixTooltipLabel = graphSettings.xAxixTooltipLabel != undefined ? graphSettings.xAxixTooltipLabel : "";
            var yAxisFormatting = graphSettings.yAxisFormatting;
            var tickInterval = graphSettings.tickInterval;
            var minTicks = graphSettings.minTicks;
            var maxTicks = graphSettings.maxTicks;
            var innerSize = graphSettings.InnerSize;
            var plotLineValue = graphSettings.plotLineValue;
            var plotLineText = graphSettings.plotLineText;
            var percentageFormatting = graphSettings.percentageFormatting;
            var customYAxisTicks = graphSettings.customYAxisTicks;

            //setting the x-axis data
            var categoryProperty = graphSettings.Category;
            for (let categoryIndexer = 0; categoryIndexer < formattedGraphData.length; categoryIndexer++) {
                if (formattedGraphData[categoryIndexer][categoryProperty] != null) {
                    categories[categoryIndexer] = formattedGraphData[categoryIndexer][categoryProperty];
                }
            }

            //setting the series
            for (let seriesIndexer = 0; seriesIndexer < graphSettings.Series.length; seriesIndexer++) {
                var seriesSetting = graphSettings.Series[seriesIndexer];
                series[seriesIndexer] = {
                    name: seriesSetting["Label"],
                    color: seriesSetting["Color"],
                    type: seriesSetting["Type"],
                    visible: seriesSetting["Visible"],
                    data: [],
                    showInLegend: seriesSetting["ShowInLegend"],
                    enableMouseTracking: seriesSetting["EnableMouseTracking"],
                    marker: {},
                    center: seriesSetting["Center"],
                    size: seriesSetting["Size"],

                };
                if (seriesSetting["showInLegend"] == undefined && graphSettings.Series.length == 1) {
                    series[seriesIndexer]['showInLegend'] = false
                }
                if (seriesSetting["Marker"] != undefined)
                    series[seriesIndexer]['marker'] = seriesSetting["Marker"]
                if (seriesSetting["Data"] != undefined)
                    series[seriesIndexer]['data'] = seriesSetting["Data"]

                var dataPropertyName = seriesSetting.Property;
                for (let dataIndexer = 0; dataIndexer < formattedGraphData.length; dataIndexer++) {
                    if (series[seriesIndexer].data[dataIndexer] == undefined) {
                        series[seriesIndexer].data[dataIndexer] = formattedGraphData[dataIndexer][dataPropertyName];
                    }

                }
            }

            return {
                chartTitle,
                xAxisLabel,
                xAxisLabelEnable,
                yAxisLabel,
                subtitle,
                categories,
                series,
                crosshair,
                lineWidth,
                lineColor,
                xAxixTooltipLabel,
                fillOpacity,
                stacking,
                yAxisFormatting,
                tickInterval,
                maxTicks,
                minTicks,
                innerSize,
                plotLineValue,
                plotLineText,
                percentageFormatting,
                customYAxisTicks
            };
        }

        function SegementData(graphData, requestDetails, attributeValue, keyName) {

            var normalValue = requestDetails[Object.keys(requestDetails).find(key => key.toLowerCase() === 'normal')] * attributeValue / 100;
            var acceptableValue = requestDetails[Object.keys(requestDetails).find(key => key.toLowerCase() === 'acceptable')] * attributeValue / 100;
            var notAcceptableValue = requestDetails[Object.keys(requestDetails).find(key => key.toLowerCase() === 'notacceptable')] * attributeValue / 100;
            var criticalValue = requestDetails[Object.keys(requestDetails).find(key => key.toLowerCase() === 'critical')] * attributeValue / 100;

            var normalCount = 0;
            var acceptableCount = 0;
            var notAcceptableCount = 0;
            var criticalCount = 0;

            var sortedList = graphData.map(e => e[keyName[0]]).sort(function (a, b) { return b - a });
            angular.forEach(sortedList, function (value, key) {
                var loadValue = parseFloat(value);

                if (loadValue <= normalValue) {
                    normalCount++;
                }
                else if (loadValue > normalValue
                    && loadValue <= acceptableValue) {
                    acceptableCount++;
                }
                else if (loadValue > acceptableValue
                    && loadValue <= notAcceptableValue) {
                    notAcceptableCount++;
                }
                else {
                    criticalCount++;
                }
            });

            return {
                normalValue, acceptableValue, notAcceptableValue, criticalValue,
                normalCount, acceptableCount, notAcceptableCount, criticalCount
            }
        };
        this.GetSegmentData = function (graphData, requestDetails, attributeValue, keyName) {
            return SegementData(graphData, requestDetails, attributeValue, keyName);
        }
        this.ConvertDataToGraph = function (graphSettings, graphData, reverseData) {
            return ConvertDataToGraphModel(graphSettings, graphData, reverseData);
        }
        this.ConvertDataToGraph = function (graphSettings, graphData, reverseData, isPieAvailable) {
            if (isPieAvailable) {
                var data = [];
                angular.forEach(graphSettings.Series, function (value, key) {
                    var serie = {
                        name: value.Label,
                        y: graphData[0][value.Property],
                    }
                    data.push(serie);
                });
                var pieSeries = [
                    {
                        Type: 'pie',
                        Data: data,
                        Center: [1300, 125],
                        Size: 200,
                        ShowInLegend: false,
                    }
                ];
                graphSettings.Series = graphSettings.Series.concat(pieSeries);
                graphSettings.InnerSize = '30%';
            }

            return ConvertDataToGraphModel(graphSettings, graphData, reverseData);
        }
        this.CreateAreaGraph = function (graphSettings, graphData, requestDetails, attributeValue,
            keyName, addPieSeries = false) {

            var segementData = SegementData(graphData, requestDetails, attributeValue, keyName)

            var areaSeries = [
                {
                    Property: "Critical",
                    Label: "Critical",
                    Color: "red",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }

                },
                {
                    Property: "NotAcceptable",
                    Label: "Not Acceptable",
                    Color: "orange",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }

                },
                {
                    Property: "Acceptable",
                    Label: "Acceptable",
                    Color: "yellow",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }

                },
                {
                    Property: "Normal",
                    Label: "Normal",
                    Color: "green",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }
                }
            ];
            graphSettings.Series = graphSettings.Series.concat(areaSeries);

            if (addPieSeries) {
                var pieSeries = [
                    {
                        Type: 'pie',
                        Data: [
                            {
                                name: 'Normal',
                                y: segementData.normalCount,
                                color: "green"
                            },
                            {
                                name: 'Accepatble',
                                y: segementData.acceptableCount,
                                color: "yellow"
                            },
                            {
                                name: 'Notacceptable',
                                y: segementData.notAcceptableCount,
                                color: "orange"
                            },
                            {
                                name: 'Critical',
                                y: segementData.criticalCount,
                                color: "red"
                            },
                        ],
                        Center: [150, 35],
                        Size: 100,
                        ShowInLegend: false,
                    }
                ];
                graphSettings.Series = graphSettings.Series.concat(pieSeries);
            }


            for (let dataIndexer = 0; dataIndexer < graphData.length; dataIndexer++) {
                graphData[dataIndexer]['Normal'] = segementData.normalValue;
                graphData[dataIndexer]['Acceptable'] = segementData.acceptableValue - segementData.normalValue;
                graphData[dataIndexer]['NotAcceptable'] = segementData.notAcceptableValue - segementData.acceptableValue;
                graphData[dataIndexer]['Critical'] = segementData.criticalValue - segementData.notAcceptableValue;
            }
            return ConvertDataToGraphModel(graphSettings, graphData);
        };
        this.CreateAreaGraphForHighestCurrent = function (graphSettings, graphData, filterData) {
            var areaSeries = [
                {
                    Property: "Critical",
                    Label: "Critical",
                    Color: "red",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }

                },
                {
                    Property: "NotAcceptable",
                    Label: "Not Acceptable",
                    Color: "orange",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }

                },
                {
                    Property: "Acceptable",
                    Label: "Acceptable",
                    Color: "yellow",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }

                },
                {
                    Property: "Normal",
                    Label: "Normal",
                    Color: "green",
                    Type: 'area',
                    ShowInLegend: false,
                    EnableMouseTracking: false,
                    Marker: { enabled: false }
                }
            ];
            graphSettings.Series = graphSettings.Series.concat(areaSeries);
            for (let dataIndexer = 0; dataIndexer < graphData.length; dataIndexer++) {
                graphData[dataIndexer]['Normal'] = parseFloat(filterData.normalValue);
                graphData[dataIndexer]['Acceptable'] = parseFloat(filterData.acceptableValue - filterData.normalValue);
                graphData[dataIndexer]['NotAcceptable'] = parseFloat(filterData.notAcceptableValue - filterData.acceptableValue);
                graphData[dataIndexer]['Critical'] = parseFloat(filterData.criticalValue - filterData.notAcceptableValue);
            }
            return ConvertDataToGraphModel(graphSettings, graphData);
        };
        this.GetGridDataFromResponse = function (viewModel, data, tableID, exportFileName,
            requestDetails, tableHeaderTemplateURL, tableBodyTemplateURL, reportFor, startDate, endDate) {
            var gridSettings = viewModel;
            var gridData = gridSettings.DataGrid;

            var fromDate = startDate == null ? $rootScope.FormatData(requestDetails.FromDate, "date") : $rootScope.FormatData(startDate, "date");
            var toDate = endDate == null ? $rootScope.FormatData(requestDetails.ToDate, "date") : $rootScope.FormatData(endDate, "date");

            gridData.tableID = tableID;
            gridData.exportFileName = exportFileName + " for " + reportFor + " " + requestDetails.DeviceID + " (" + fromDate + "-" + toDate + ")";
            gridData.currentPage = 0;
            gridData.totalRecords = data.length;
            gridData.pageSize = data.length;
            gridData.customExport = true;
            gridData.reAlignToolbar = true;
            gridData.serverPagination = false;
            gridData.showPaginationRow = false;
            gridData.options = [];
            gridData.options.export = true;
            gridData.requestDetails = requestDetails;
            if ($rootScope.isNotNullorUndefined(tableHeaderTemplateURL)) {
                gridData.tableHeaderTemplateURL = tableHeaderTemplateURL;
            }
            if ($rootScope.isNotNullorUndefined(tableBodyTemplateURL)) {
                gridData.tableBodyTemplateURL = tableBodyTemplateURL;
            }

            gridData.rowData = data;
            return gridData;

        }

        this.SetDurationCurve = function (durationCurveGraphSetting, graphSettings, graphData, keyName) {
            for (let seriesIndexer = 0; seriesIndexer < keyName.length; seriesIndexer++) {
                angular.forEach(graphSettings.Series, function (value, key) {
                    if (value.Property == keyName[seriesIndexer]) {
                        durationCurveGraphSetting.Series[seriesIndexer] = graphSettings.Series[key]
                        durationCurveGraphSetting.Series[seriesIndexer].Type = 'area';
                        durationCurveGraphSetting.Series[seriesIndexer].ShowInLegend = true;
                        durationCurveGraphSetting.Series[seriesIndexer].Marker = { enabled: false }
                    }
                });
            };
            if (durationCurveGraphSetting.Series.length > 1) {
                durationCurveGraphSetting.Series[0]['showInLegend'] = false
            }

            durationCurveGraphSetting.FillOpacity = 0.2;
            durationCurveGraphSetting.Stacking = ''
            durationCurveGraphSetting.Crosshair =
            {
                width: 2,
                color: 'rgb(22 31 139)',
                dashStyle: 'shortdot'
            }
            var durationObject = []
            var totalRecords = graphData.length;
            for (let seriesIndexer = 1; seriesIndexer <= totalRecords; seriesIndexer++) {
                var Duration = Math.trunc(100 * seriesIndexer / totalRecords) + '.00 %';
                var object = { Duration }
                durationObject.push(object)
            };

            var durtionCurveGraphData = [];
            for (let seriesIndexer = 0; seriesIndexer < keyName.length; seriesIndexer++) {
                var property = keyName[seriesIndexer];
                var sortedList = graphData.map(e => e[property]).sort(function (a, b) { return b - a }).map(e => ({ [property]: e }));
                angular.merge(durtionCurveGraphData, durationObject, sortedList);
            }

            return ConvertDataToGraphModel(durationCurveGraphSetting,
                durtionCurveGraphData, false);
        }
        this.GetFilter = function (filterObj, filterData, reportView, additionalFilters) {

            var fromDate = null;
            var toDate = null;
            var normal = null;
            var acceptable = null;
            var notAcceptable = null;
            var selectedReportType = null;

            if (filterObj != null && filterObj != undefined) {
                fromDate = $filter('date')(new Date(filterObj.startDate), ToolsFactory.DateTimeFormat.Serilaization);
                toDate = $filter('date')(new Date(filterObj.endDate), ToolsFactory.DateTimeFormat.Serilaization);
                normal = filterObj.normal;
                acceptable = filterObj.acceptable;
                notAcceptable = filterObj.notAcceptable;
                selectedReportType = filterObj.selectedReportType;
            }
            else if (filterData.filter != null && filterData.filter != undefined) {
                fromDate = filterData.filter.startDate;
                toDate = filterData.filter.endDate;
                normal = filterData.filter.normal;
                acceptable = filterData.filter.acceptable;
                notAcceptable = filterData.filter.notAcceptable;
                selectedReportType = filterData.filter.selectedReportType;
            }
            return DataStructureFactory.GetDTReportFilterInstance(fromDate, toDate, reportView,
                normal, acceptable, notAcceptable, selectedReportType, additionalFilters)

        }
        this.GetDateFilter = function (filterObj, filterData) {
            var fromDate = null;
            var toDate = null;

            if (filterObj != null && filterObj != undefined) {
                fromDate = $filter('date')(new Date(filterObj.startDate), ToolsFactory.DateTimeFormat.Serilaization);
                toDate = $filter('date')(new Date(filterObj.endDate), ToolsFactory.DateTimeFormat.Serilaization);
            }
            else if (filterData.filter != null && filterData.filter != undefined) {
                fromDate = filterData.filter.startDate;
                toDate = filterData.filter.endDate;
            }
            return DataStructureFactory.GetRangeFilterInstance(fromDate, toDate, null, null)

        }
        this.SetPageFilters = function (appliedFilters, filterData) {
            filterData.filter.date.startDate = $moment(appliedFilters.FromDate, tenantDateFormat.FullDateTimePattern);
            filterData.filter.date.endDate = $moment(appliedFilters.ToDate, tenantDateFormat.FullDateTimePattern);
            filterData.filter.startDate = $moment(appliedFilters.FromDate, tenantDateFormat.FullDateTimePattern);
            filterData.filter.endDate = $moment(appliedFilters.ToDate, tenantDateFormat.FullDateTimePattern);

            filterData.filter.minimumDate = $rootScope.FormatData((userInfo.systemStartDate), 'datetime');

            filterData.filter.normal = appliedFilters.Normal;
            filterData.filter.acceptable = appliedFilters.Acceptable;
            filterData.filter.notAcceptable = appliedFilters.NotAcceptable;

            filterData.filter.normalValue = appliedFilters.Normal;
            filterData.filter.acceptableValue = appliedFilters.Acceptable;
            filterData.filter.notAcceptableValue = appliedFilters.NotAcceptable;
        }
        this.SetDateFilters = function (appliedFilters, filterData) {
            filterData.filter.date.startDate = $moment(appliedFilters.Range.Start, tenantDateFormat.FullDateTimePattern);
            filterData.filter.date.endDate = $moment(appliedFilters.Range.End, tenantDateFormat.FullDateTimePattern);
            filterData.filter.startDate = $moment(appliedFilters.Range.Start, tenantDateFormat.FullDateTimePattern);
            filterData.filter.endDate = $moment(appliedFilters.Range.End, tenantDateFormat.FullDateTimePattern);
        }
        this.SetCriteriaForLoadedDropDown = function (dict) {
            var criteriaunbalancedDropDown = [];
            var sortedDict = Object.values(dict).sort(function (a, b) { return a - b });
            var index = 0;
            var object = { Id: index, Name: '< ' + sortedDict[0] + '%', value: '< ' + sortedDict[0] + '%', Selected: true }
            index++
            criteriaunbalancedDropDown.push(object);
            if (sortedDict.length > 1) {
                for (let seriesIndexer = 0; seriesIndexer < sortedDict.length - 1; seriesIndexer++) {
                    var value = sortedDict[seriesIndexer] + '% - ' + sortedDict[seriesIndexer + 1] + '%';
                    object = { Id: index, Name: value, value: value, Selected: false }
                    index++;
                    criteriaunbalancedDropDown.push(object);
                }
            }
            object = { Id: index, Name: '> ' + sortedDict[sortedDict.length - 1] + '%', value: '> ' + sortedDict[sortedDict.length - 1] + '%', Selected: false }
            index++
            criteriaunbalancedDropDown.push(object);
            return criteriaunbalancedDropDown;
        }

    }]);