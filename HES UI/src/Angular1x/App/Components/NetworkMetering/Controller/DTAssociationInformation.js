
'use strict';

app.controller('TabDTAssociationInformation',
    ['$scope', 'URIService', '$stateParams', '$filter', 'AuthService', 'DataStructureFactory', '$moment',
        function ($scope, URIService, $stateParams, $filter, AuthService, DataStructureFactory, $moment) {
            var translateFilter = null;
            var userInfo = AuthService.getAuthInfo();
            var tenantDateFormat = userInfo.cultureInfo.DateTimeFormats;
            $scope.init = function () {
                $scope.FeederName = $stateParams.name;
                translateFilter = $filter('translate');

                $scope.showFilterPanel = false;
                $scope.showFilterIcon = true;
                $scope.filterApplied = false;
                $scope.analysisConfiguration
                $scope.indexKey = 0;
                $scope.indexKeyFarthest = 0;
                $scope.indexKeyNearest = 0;
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

                getAssociationGrid();
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
                $scope.filterData.filter.labelForDateFilter = "Menu.filterOnAssociationdDate";
            }
            function getGridData(dataFilter) {
                var currentDate = new Date();
                var firstDateOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                var fromDate = dataFilter != null ? dataFilter.fromDate : firstDateOfMonth;
                var toDate = dataFilter != null ? dataFilter.toDate : currentDate;

                $scope.isDataAvailable = false;
                $scope.gridData = {};
                $scope.isProcessing = false;
                var rangeFilter = DataStructureFactory.GetRangeFilterInstance(fromDate, toDate, null, null)
                URIService.GetData(URIService.GetAllFeederDTAssociationsUrl($scope.FeederName, rangeFilter))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;
                            $scope.gridData = getGridDataFromResponse(response.Data);
                            SetPageFilters(response.RequestDetails.Range);
                            SetChartData(response.Data.DataGrid.rowData, $scope.analysisConfiguration);
                            $scope.isProcessing = false;

                            getVoltageDropData(rangeFilter);
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            function getAssociationGrid(dataFilter) {
                if (!$scope.isNotNullorUndefined($scope.analysisConfiguration)) {
                    URIService.GetData(URIService.GetAnalysisConfiguration($scope.FeederName, 'Feeder'))
                        .success(function (response, status, headers, config) {
                            if (status === 200) {
                                $scope.analysisConfiguration = response.Data;
                                $scope.analysisConfiguration['Capacity'] = response.RequestDetails
                                getGridData(dataFilter);
                            }
                        }).error(function (data, status, headers, config) {
                        });
                }
                else {
                    getGridData(dataFilter);
                }
            }
            function getGridDataFromResponse(viewModel) {
                var gridSettings = viewModel;
                var gridData = gridSettings.DataGrid;
                var fromDate = $scope.FormatData($scope.requestDetails.Range.Start, "date");
                var toDate = $scope.FormatData($scope.requestDetails.Range.End, "date");

                gridData.tableID = "data";
                gridData.exportFileName = translateFilter("Menu.FeederAssociationExport") + " for Feeder " + $scope.requestDetails.DeviceID;
                gridData.currentPage = 0;
                gridData.totalRecords = gridSettings.DataGrid.rowData.length;
                gridData.pageSize = gridSettings.DataGrid.rowData.length;
                gridData.customExport = true;
                gridData.reAlignToolbar = true;
                gridData.serverPagination = false;
                gridData.showPaginationRow = false;
                gridData.options = [];
                gridData.options.export = true;
                gridData.tableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/dtAssociations.html';
                gridData.tableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/dtAssociations.html';
                gridData.showActionColum = false;

                $scope.pageSubtitle = fromDate + ' - ' + toDate;

                return gridData;
            }
            function getVoltageDropData(rangeFilter) {
                $scope.showColumnChart = false;
                URIService.GetData(URIService.GetVoltageDropDataUrl($scope.FeederName, rangeFilter))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;
                            var categories = [];
                            var series = [{
                                name: 'VoltageDrop',
                                data: [],
                            }]

                            // var feederTable = response.Data.Data.Feeder[0];
                            if (response.Data.Data.DT != undefined) {

                                var minVal = Infinity;
                                var maxVal = -Infinity;
                                response.Data.Data.DT.forEach(item => {
                                    for (var key in item) {
                                        if (item.hasOwnProperty(key) && typeof item[key] === 'number') {
                                            if (item[key] < minVal) minVal = item[key];
                                            if (item[key] > maxVal) maxVal = item[key];
                                        }
                                    }
                                });

                                var minValue = 180;
                                var maxValue = 480;
                                var tickInterval = 5;
                                var firstBlock = 207;
                                var secondBlock = 253;
                                var rphaseGeneralValue = 150;

                                var dtValueRange = response.Data.Data.DT[0]['MaxRPhase'];
                                if (dtValueRange > rphaseGeneralValue * 100) {
                                    minValue = 15000;
                                    maxValue = 33000;
                                    tickInterval = 500;
                                    firstBlock = 16000;
                                    secondBlock = 19000;
                                }
                                else if (dtValueRange > rphaseGeneralValue * 10) {
                                    minValue = 4000;
                                    maxValue = 16000;
                                    tickInterval = 500;
                                    firstBlock = 5700;
                                    secondBlock = 6800;
                                }
                                var noOfSlots = (maxValue - minValue) / tickInterval;
                                var noofSlotsinPerSection = noOfSlots / 3;
                                var firstLine = minValue + noofSlotsinPerSection * tickInterval;
                                var secondLine = minValue + noofSlotsinPerSection * tickInterval * 2;
                                var diffBetween2Lines = secondLine - firstLine;
                                var yphaseShiftValue = diffBetween2Lines * 1;
                                var bphaseShiftValue = diffBetween2Lines * 2;

                                var shiftingValue = {
                                    'rPhase': 0,
                                    'yPhase': yphaseShiftValue,
                                    'bPhase': bphaseShiftValue
                                }
                                var shiftingXAxisValue = {
                                    'rPhase': 0,
                                    'yPhase': firstLine,
                                    'bPhase': secondLine
                                }

                                // createDataPoint(0, feederTable['MinRPhase'], feederTable['MaxRPhase'], shiftingValue.rPhase, series, 'red');
                                // createDataPoint(0, feederTable['MinYPhase'], feederTable['MaxYPhase'], shiftingValue.yPhase, series, 'yellow');
                                // createDataPoint(0, feederTable['MinBPhase'], feederTable['MaxBPhase'], shiftingValue.bPhase, series, 'blue');

                                //categories.push('<tspan class="deviceCodeClass">' + feederTable['NwDevicecode'] + '</tspan>');
                                angular.forEach(response.Data.Data.DT, function (element, key) {
                                    if (element.IsFarthest) {
                                        setNearestFarthest('Farthest', $scope.indexKeyFarthest++, element, categories, shiftingValue, series, false)
                                    }
                                });
                                angular.forEach(response.Data.Data.DT, function (element, key) {
                                    if (element.IsNearest) {
                                        setNearestFarthest('Nearest', $scope.indexKeyNearest++, element, categories, shiftingValue, series, true)
                                    }
                                });

                                var maxIndex = Math.max.apply(null, Object.keys(categories));
                                for (var i = 0; i <= maxIndex; i++) {
                                    if (!categories[i]) {
                                        categories[i] = '';  // fill missing with empty string
                                    }
                                }
                                $scope.columnChartData = {
                                    yAxisLabel: "Voltage (V)",
                                    series: series,
                                    chartTitle: "Considering Period : " + response.Data.GraphSettings.SubTitle,
                                    categories: categories,
                                    subtitle: "",
                                    innerSize: '95%',
                                    showInLegend: true,
                                    shiftingValue: shiftingValue,
                                    shiftingXAxisValue: shiftingXAxisValue,
                                    firstLine: firstBlock,
                                    secondLine: secondBlock,
                                    yphaseShiftValue: yphaseShiftValue,
                                    bphaseShiftValue: bphaseShiftValue,
                                    minValue: minValue,
                                    maxValue: maxValue,
                                    tickInterval: tickInterval
                                };

                                $scope.showColumnChart = true;
                            }
                            else {
                                $scope.showColumnChart = false;
                            }

                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            function setNearestFarthest(vicinity, key, element, categories, shiftingValue, series, isNearest) {
                var dtCategory = '<tspan class="deviceCodeClass">' + element.NwDevicecode + '</tspan></br>' + '<tspan class="vicinityClass">' + vicinity + '</tspan>';
                //  categories.push(dtCategory);

                var indexKey = key + $scope.indexKey;
                //var indexKey = $scope.indexKey++;
                if (isNearest) {
                    indexKey += 5;
                }
                categories[indexKey] = dtCategory;
                createDataPoint(indexKey, element.MinRPhase, element.MaxRPhase, shiftingValue.rPhase, series, 'red');
                createDataPoint(indexKey, element.MinYPhase, element.MaxYPhase, shiftingValue.yPhase, series, '#ffc922');
                createDataPoint(indexKey, element.MinBPhase, element.MaxBPhase, shiftingValue.bPhase, series, 'blue');
            }
            function createDataPoint(key, minValue, maxvalue, colorOffset, series, color) {
                if (minValue != null && maxvalue != null) {
                    var data = {
                        x: key,
                        low: parseFloat(minValue.toFixed(2)) + colorOffset,
                        high: parseFloat(maxvalue.toFixed(2)) + colorOffset,
                        color: color,
                        addedValue: colorOffset,
                    };
                    series[0].data.push(data);
                }

            }
            function SetChartData(data, analysisConfiguration) {
                var pieData = [];
                var totalDTCapacity = 0;

                angular.forEach(data, function (element, key) {
                    if (!$scope.isNotNullorUndefined(element.DateOfDisassociation)) {
                        totalDTCapacity += element.DTCapacity
                    }
                });

                pieData.push({ name: "Total Association Capacity", y: totalDTCapacity, color: 'green' });
                pieData.push({ name: "Available Feeder Capacity", y: analysisConfiguration.Capacity - totalDTCapacity, color: '#0080001f' });

                var pieSeries = [{ type: 'pie', data: pieData }]
                var feederCapacityAvailablePercentage = (totalDTCapacity * 100 / analysisConfiguration['Capacity']).toFixed(2)

                $scope.chartData = {
                    series: pieSeries,
                    chartTitle: feederCapacityAvailablePercentage + '<span class="percentage"> %</span><br/> <div class="subTitle">' + totalDTCapacity + ' / ' + analysisConfiguration['Capacity'] + '<span class="unit"> kVA</span></div>',
                    subtitle: "",
                    innerSize: '95%',
                    showInLegend: true
                };

                $scope.showPieChart = true;
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
                getAssociationGrid($scope.dataFilter);
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
                    getAssociationGrid();
                }
            }
            $scope.getFeederNameData = function () {
                getAssociationGrid();
            }
            $scope.refresh = function () {
                getAssociationGrid($scope.dataFilter);
            }
        }]);
