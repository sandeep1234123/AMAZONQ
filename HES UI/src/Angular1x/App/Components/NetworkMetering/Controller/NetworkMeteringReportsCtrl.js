'use strict';
app.controller("NetworkMeteringReportsCtrl", ['$scope',
    '$filter', '$state', 'DataStructureFactory', 'URIService', 'AuthService', 'LoaderService',
    '$stateParams', '$http', 'HierarchyService',
    function ($scope, $filter, $state, DataStructureFactory, URIService, AuthService, LoaderService,
        $stateParams, $http, HierarchyService) {
        $scope.alertData = {
            currentState: $state.current.name
        };
        $scope.reportFrequency = $state.current.reportFrequency;
        $scope.isLastMonth = $state.current.params['isLastMonth'] != undefined ? $state.current.params['isLastMonth'] : false;
        $scope.papeTitle = $scope.reportFrequency == 'Monthly' ? "Menu.DTMonthlyReport" : "Menu.DTDailyReport";
        $scope.showFilterPanel = false;
        $scope.showFilterIcon = true;
        $scope.filterApplied = false;
        $scope.selectedTabId = 0;
        $scope.isClearedRefreshedClicked = false;
        var userInfo = AuthService.getAuthInfo();
        var translateFilter = $filter('translate');
        var getRecordsByPage = function (pagination) {
            getViewFilteredData($scope.filterData.filter, pagination);
        }
        $scope.tabClick = function (tabData, tabIndex, isViewFilteredData = true) {
            $scope.showFilterIcon = false;
            $scope.filterData.filter.showLoadingConditionFilter = false;
            $scope.filterData.filter.showunbalanceFilter = false;
            $scope.filterData.filter.showOperationRelaibilityFilter = false;
            $scope.filterData.filter.showFeederLossFilter = false;
            $scope.selectedTabId = tabIndex;
            $scope.reportName = tabData.reportName;
            $scope.reportType = tabData.reportType;

            if (tabIndex == 4) {
                getMissingData();
            }
            else {
                $scope.tableBodyTemplate = tabData.tableBodyTemplate;
                $scope.tableHeadTemplate = tabData.tableHeadTemplate;
                if ($scope.reportType == 'UnderloadOverloadUnbalancedTransformer') {
                    $scope.filterData.filter.showLoadingConditionFilter = true;
                    setLoadingConditionFilterData();
                }
                else if ($scope.reportType == 'DTWiseUnbalancing') {
                    $scope.filterData.filter.showunbalanceFilter = true;
                    setUnbalanceFilter();
                }
                else if ($scope.reportType == 'OperationalReliability') {
                    $scope.filterData.filter.showOperationRelaibilityFilter = true;
                    setOperationRelaibilityFilter();
                }
                else if ($scope.reportType == 'FeederWiseEnergyAccounting') {
                    $scope.filterData.filter.showFeederLossFilter = true;
                    setFeederLossFilter();
                }
                $scope.filterData.filter.hierarchyFilter = true;
                if (isViewFilteredData) {
                    getViewFilteredData();
                }
            }
        }
        initialize();
        $scope.onFilterClick = function () {
            $scope.showFilterPanel = !$scope.showFilterPanel;
            setFilterColor();
        }
        $scope.filterData.applyFilter = function (filterObj) {
            setFilterColor();
            getViewFilteredData(filterObj);
        }
        $scope.filterData.clearFilter = function () {
            $scope.isClearedRefreshedClicked = true;
            $scope.showFilterPanel = false;
            setFilterColor();
            $scope.alertDataForFilter = {
                showAlert: false,
            }
            $scope.filterData.filter.selectedHierarchyDefinition = undefined;
            $scope.filterData.filter.selectedHierarchyDetailsLevel1 = null;
            $scope.filterData.filter.selectedHierarchyDetailsLevel2 = null;
            $scope.filterData.filter.selectedHierarchyDetailsLevel3 = null;
            $scope.filterData.filter.selectedHierarchyDetailsLevel4 = null;
            $scope.hierearchIDs = null;

            angular.forEach($scope.filterData.filter.hierarchyDetails, function (element, key) {
                element.enableDropdown = false;
            });

            setHierarchyDefinition();
        }
        $scope.onRefreshClick = function () {
            $scope.isClearedRefreshedClicked = true;
            $scope.showFilterPanel = false;
            getViewFilteredData($scope.filterData.filter);
        }
        $scope.onDownloadClick = function () {
            LoaderService.showLoader();
            var additionalFilters = {};
            additionalFilters["isCompleteDownload"] = "true";

            var reportName = $scope.reportName + " (" + $scope.FormatData($scope.fromDate, 'date') + "-" + $scope.FormatData($scope.toDate, 'date') + ")";

            $scope.rangeFilter = DataStructureFactory.GetRangeFilterInstance(moment($scope.fromDate).format('YYYY-MM-DD HH:mm:ss'),
                moment($scope.toDate).format('YYYY-MM-DD HH:mm:ss'), additionalFilters, null)

            URIService.DownloadFile(URIService.GetDownloadNetworkReportUrl($scope.rangeFilter, $scope.reportType, $scope.reportFrequency), reportName)
                .success(function (data) {
                    LoaderService.hideLoader();
                }).error(function (data) { LoaderService.hideLoader(); });
        };
        $scope.onControlClick = function (values) {
            var value = values.split("~");
            if ($scope.isNotNullorUndefined(value[1])) {
                var dropDownType = value[0];
                switch (dropDownType) {
                    case 'hierarchyDefinition':
                        {
                            $scope.definitionID = value[1];
                            var returnValue = HierarchyService.hierarchyDefinition($scope.definitionID, $scope.filterData.filter,
                                $scope.hierarchyDetails, $scope.hierarchy);
                            if (returnValue != undefined) {
                                $scope.filterData.filter = returnValue.filterObject;
                                $scope.lastMandatoryLevel = returnValue.lastMandatoryLevel;
                                $scope.levelDetails = returnValue.levelDetails;
                                $scope.levelArray = returnValue.levelArray;
                            }

                            break;
                        }
                    case 'hierarchyDetails':
                        {
                            var returnValue = HierarchyService.hierarchyDetails(value[1], value[2], $scope.filterData.filter, $scope.levelArray, $scope.levelDetails);
                            if (returnValue != undefined) {
                                $scope.filterData.filter = returnValue.filterObject;
                                $scope.levelDetails = returnValue.levelDetails;
                                $scope.levelArray = returnValue.levelArray;
                            }
                            break;
                        }
                    case 'publishReport':
                        {
                            getSelectedPeriodDates(value[1]);
                            break;
                        }
                    case 'loadingContionFilter':
                        {
                            $scope.filterData.filter.overload = false;
                            $scope.filterData.filter.underload = false;
                            $scope.filterData.filter.unbalanced = false;
                            switch (value[1]) {
                                case 'Overloaded':
                                    {
                                        $scope.filterData.filter.overload = true;
                                        break;
                                    }
                                case 'Underloaded':
                                    {
                                        $scope.filterData.filter.underload = true;
                                        break;
                                    }
                                case 'Unbalanced':
                                    {
                                        $scope.filterData.filter.unbalanced = true;
                                        break;
                                    }
                            }
                        }
                }
            }
            else {
                for (var index = 1; index <= $scope.filter.hierarchyDetailsLevels; index++) {
                    $scope.filter['selectedHierarchyDetailsLevel' + index] = "";
                    $scope.filter.hierarchyDetails[Number(index) - 1].enableDropdown = false;
                }
            }
        }
        $scope.publish = function () {
            $state.go('app.NetworkMetering.PublishReport', {
                'reportType': 'EnergyAudit',
                'frequency': $scope.reportFrequency,
            });

        }
        $scope.gridLinkColumnClicked = function (feederCode, index) {

            $scope.feederCode = feederCode;
            $scope.feederData = {};
            $scope.isProcessing = false;
            var rangeFilter = DataStructureFactory.GetRangeFilterInstance($scope.fromDate, $scope.toDate, null, null)
            URIService.GetData(URIService.GetDetailFeederWiseEnergyAccounting(feederCode, rangeFilter, $scope.reportFrequency))
                .success(function (response, status, headers, config) {
                    if (status === 200) {
                        $scope.requestDetails = response.RequestDetails;
                        var gridSettings = response.Data;

                        $scope.feederData = gridSettings.DataGrid;
                        var fromDate = $scope.FormatData($scope.fromDate, "date");
                        var toDate = $scope.FormatData($scope.toDate, "date");

                        $scope.feederData.tableID = "feederWiseModalData";
                        $scope.feederData.exportFileName = translateFilter("Menu.FeederWiseDetail") + " for Feeder "
                            + feederCode + " (" + fromDate + " - " + toDate + ")";
                        $scope.feederData.currentPage = 0;
                        $scope.feederData.totalRecords = gridSettings.DataGrid.rowData.length;
                        $scope.feederData.pageSize = gridSettings.DataGrid.rowData.length;
                        $scope.feederData.customExport = true;
                        $scope.feederData.reAlignToolbar = true;
                        $scope.feederData.serverPagination = false;
                        $scope.feederData.showPaginationRow = false;
                        $scope.feederData.options = [];
                        $scope.feederData.options.export = false;
                        $scope.feederData.tableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/dtAssociations.html';
                        $scope.feederData.tableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/dtAssociations.html';
                        $scope.feederData.showActionColum = false;

                        $scope.isProcessing = false;
                        $("#feederWise").modal('show');
                    }
                }).error(function (data, status, headers, config) {
                    $scope.isProcessing = false;
                });
        }

        function getMissingData(filterObj, pagination) {
            var paginationFilter = null
            if (pagination != null) {
                paginationFilter = DataStructureFactory.GetPaginationFilterInstance(pagination.currentPage, pagination.pageSize, pagination.totalRecords)
            }
            if ($scope.reportFrequency == 'Daily') {
                $scope.fromDate = $scope.isNotNullorUndefined(filterObj) ? moment(filterObj.selectedDailyDate) : moment($scope.filterData.filter.selectedDailyDate);
                $scope.toDate = $scope.isNotNullorUndefined(filterObj) ? moment(filterObj.selectedDailyDateCalendar) : moment($scope.filterData.filter.selectedDailyDateCalendar);
                getSelectedPeriodDatesFromDate($scope.toDate)
            }
            $scope.rangeFilter = DataStructureFactory.GetRangeFilterInstance(moment($scope.fromDate).format('YYYY-MM-DD HH:mm:ss'),
                moment($scope.toDate).format('YYYY-MM-DD HH:mm:ss'), null, paginationFilter)

            URIService.GetData(URIService.GetMissingDataUrl($scope.rangeFilter, $scope.reportFrequency))
                .success(function (response, status) {
                    if (status === 200) {
                        $scope.requestDetails = response.RequestDetails;

                        $scope.missingData = response.Data.DataGrid;
                        $scope.missingData.getRecords = getRecordsByPage;
                        $scope.missingData.currentPage = response.Data.CurrentPage;
                        $scope.missingData.totalRecords = response.Data.TotalRecords;
                        $scope.missingData.pageSize = response.Data.PageSize;
                        $scope.missingData.tableID = 'MissingRecords';
                        $scope.missingData.exportFileName = translateFilter("Menu.MissingRecords");
                        $scope.missingData.customExport = true;

                        $scope.missingData.options = [];
                        $scope.missingData.options.export = false;
                        $scope.missingData.sortColumnName = "$SortBy$";
                        $scope.missingData.sortLabel = null;
                        $scope.missingData.showActionColum = true;

                        $scope.showMissingData = true;
                        $scope.showReportData = false;
                        $scope.isProcessing = false;
                        $scope.filterData.filter.showLoadingConditionFilter = false;
                        $scope.filterData.filter.showunbalanceFilter = false;
                        $scope.filterData.filter.showOperationRelaibilityFilter = false;
                        $scope.filterData.filter.showFeederLossFilter = false;

                        $scope.filterData.filter.hierarchyFilter = false;
                    }

                }).error(function (data) { });
        }
        getRecordsByPage = function (pagination) {
            if ($scope.selectedTabId == 4) {
                getMissingData($scope.filterData.filter, pagination);
            }
            else {
                getData($scope.filterData.filter, pagination);
            }
        }
        function SetDataInGrid(data) {
            $scope.data = data.Data.DataGrid;
            $scope.data.getRecords = getRecordsByPage;
            $scope.data.currentPage = data.Data.CurrentPage;
            $scope.data.totalRecords = data.Data.TotalRecords;
            $scope.data.pageSize = data.Data.PageSize;
            $scope.data.tableID = 'tableId';
            $scope.data.exportFileName = translateFilter("Menu." + $scope.reportType);
            $scope.data.customExport = true;
            $scope.data.sortColumnName = "$SortBy$";
            $scope.data.options.export = false;
            $scope.data.tableBodyTemplateURL = $scope.tableBodyTemplate;
            $scope.data.tableHeaderTemplateURL = $scope.tableHeadTemplate;
            if ($scope.ispublished) {
                $scope.data.customtableHeader = "Published On: " + $scope.FormatData($scope.publishedDate, 'date') + " By: " + $scope.publishedBy;
            }
            else {
                $scope.data.customtableHeader = "Report Status: Unpublished";
            }

            $scope.showMissingData = false;
            $scope.showReportData = true;
        }
        function getViewFilteredData(filterObj, pagination) {

            if ($scope.isNotNullorUndefined(filterObj)) {
                if ($scope.isNotNullorUndefined(filterObj.selectedHierarchyDefinition)) {
                    var isAllMandatoryLevelVerified = verifyAllMandatoryLevel()
                    if (isAllMandatoryLevelVerified) {
                        $scope.alertDataForFilter = { showAlert: false }
                        getHierarchyID(filterObj, pagination)
                    }
                    else {
                        $scope.alertDataForFilter = {
                            message: "Please select all the mandatory level of hierarchy",
                            showAlert: true,
                            type: 'error'
                        }
                    }
                }
                else {
                    if ($scope.selectedTabId == 4) {
                        getMissingData(filterObj, pagination);
                    }
                    else {
                        getData(filterObj, pagination);
                    }

                }
            }
            else {
                if ($scope.selectedTabId == 4) {
                    getMissingData(filterObj, pagination);
                }
                else {
                    getData(filterObj, pagination);
                }
            }
        }
        function verifyAllMandatoryLevel() {
            var result = false;
            if ($scope.isNotNullorUndefined($scope.levelArray)) {
                result = HierarchyService.verifyAllMandatoryLevel($scope.levelArray, $scope.lastMandatoryLevel);
            }
            return result;
        }
        function getData(filterObj, pagination) {
            $scope.data = {};
            var additionalFilters = {};
            additionalFilters["isCompleteDownload"] = "false";

            if ($scope.isNotNullorUndefined(filterObj)) {
                if (filterObj.unbalanced) {
                    additionalFilters["unbalanced"] = filterObj.unbalanced.toString();
                }
                if (filterObj.underload) {
                    additionalFilters["underload"] = filterObj.underload.toString();
                }
                if (filterObj.overload) {
                    additionalFilters["overload"] = filterObj.overload.toString();
                }
            }

            addAdditionalFilter(additionalFilters);
            var paginationFilter = null
            if (pagination != null) {
                paginationFilter = DataStructureFactory.GetPaginationFilterInstance(pagination.currentPage, pagination.pageSize, pagination.totalRecords)
            }

            if ($scope.isNotNullorUndefined($scope.hierearchIDs)) {
                additionalFilters["hierearchIDs"] = $scope.hierearchIDs;
            }

            if ($scope.reportFrequency == 'Daily') {
                $scope.fromDate = $scope.isNotNullorUndefined(filterObj) ? moment(filterObj.selectedDailyDate) : moment($scope.filterData.filter.selectedDailyDate);
                $scope.toDate = $scope.isNotNullorUndefined(filterObj) ? moment(filterObj.selectedDailyDateCalendar) : moment($scope.filterData.filter.selectedDailyDateCalendar);
                getSelectedPeriodDatesFromDate($scope.toDate)
            }
            else if ($scope.reportFrequency == 'Monthly') {
                if (filterObj != undefined && filterObj != '') {
                    angular.forEach($scope.filterData.filter.publishReport, function (item) {
                        if (item.Id.toString() == filterObj.selectedpublishReport) {
                            $scope.fromDate = moment(item.StdyPrdStrtDt, "DD/MM/YYYY HH:mm:ss");
                            $scope.toDate = moment(item.StdyPrdEndDt, "DD/MM/YYYY HH:mm:ss");
                        }
                        getSelectedPeriodDates(filterObj.selectedpublishReport);
                    });
                }


            }
            $scope.rangeFilter = DataStructureFactory.GetRangeFilterInstance(moment($scope.fromDate).format('YYYY-MM-DD HH:mm:ss'),
                moment($scope.toDate).format('YYYY-MM-DD HH:mm:ss'), additionalFilters, paginationFilter)
            URIService.GetData(URIService.GetNetworkReportUrl($scope.rangeFilter, $scope.reportType, $scope.reportFrequency))
                .success(function (data) {
                    SetDataInGrid(data);

                }).error(function (data) { });
        }
        function initialize() {
            var currentDate = new Date();
            var firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            $scope.filterData = {
                filter: {
                    minDate: userInfo.systemStartDate,
                    maxDate: new Date(),
                    showDateFilter: true,
                    overload: false,
                    underload: false,
                    unbalanced: false,
                    showLoadingConditionFilter: false,
                    showunbalanceFilter: false,
                    showOperationRelaibilityFilter: false,
                    showFeederLossFilter: false,
                    hierarchyFilter: true,
                    isMonthly: $scope.reportFrequency == 'Monthly' ? true : false,
                    dailyMinDate: firstDayOfMonth,
                    dailyMaxDate: moment().subtract(1, 'days')
                },
                applyFilter: $scope.applyFilter,
                clearFilter: $scope.clearFilter,
                filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelForEnergyAuditReports.html',
            }
            $scope.Reports = [
                {
                    id: 0,
                    title: $filter('translate')('Menu.DTWiseUnbalancing'),
                    active: false,
                    color: "#95a2a9",
                    tableBodyTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/dtWiseUnbalancingReport.html',
                    tableHeadTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/dtWiseUnbalancingReport.html',
                    reportType: 'DTWiseUnbalancing',
                    reportName: 'DT wise Unblancing Report',
                }
                ,
                {
                    id: 1,
                    title: $filter('translate')('Menu.LoadingCondition'),
                    active: false,
                    color: "#95a2a9",
                    tableBodyTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/loadingConditionTransformer.html',
                    tableHeadTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/loadingConditionTransformer.html',
                    reportType: 'UnderloadOverloadUnbalancedTransformer',
                    reportName: 'Underload Overload Unbalanced Transformer Report',
                }
                ,
                {
                    id: 2,
                    title: $filter('translate')('Menu.OperationalReliability'),
                    active: false,
                    color: "#95a2a9",
                    tableBodyTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/operationalReliability.html',
                    tableHeadTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/operationalReliability.html',
                    reportType: 'OperationalReliability',
                    reportName: 'Operational Reliability Report',
                }
                ,
                {
                    id: 3,
                    title: $filter('translate')('Menu.EnergyAccounting'),
                    active: false,
                    color: "#95a2a9",
                    tableBodyTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/feederEnergyAccoutingReport.html',
                    tableHeadTemplate: 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/feederEnergyAccoutingReport.html',
                    reportType: 'FeederWiseEnergyAccounting',
                    reportName: 'Feeder Wise Energy Accounting Report',
                }
                ,
                {
                    id: 4,
                    title: $filter('translate')('Menu.MissingData'),
                    active: false,
                    color: "#95a2a9",
                    reportType: 'MissingData',
                    reportName: 'Missing Data',
                }
            ];
            $scope.selectedTabId = $scope.Reports[0].id
            $scope.reportType = $scope.Reports[0].reportType;
            $scope.reportName = $scope.Reports[0].reportName;
            $scope.tableBodyTemplate = $scope.Reports[0].tableBodyTemplate;
            $scope.tableHeadTemplate = $scope.Reports[0].tableHeadTemplate;
            if ($scope.reportType == 'UnderloadOverloadUnbalancedTransformer') {
                $scope.filterData.filter.showLoadingConditionFilter = true;
                setLoadingConditionFilterData();
            }
            else if ($scope.reportType == 'DTWiseUnbalancing') {
                $scope.filterData.filter.showunbalanceFilter = true;
                setUnbalanceFilter();
            }
            else if ($scope.reportType == 'OperationalReliability') {
                $scope.filterData.filter.showOperationRelaibilityFilter = true;
                setOperationRelaibilityFilter();
            }
            else if ($scope.reportType == 'FeederWiseEnergyAccounting') {
                $scope.filterData.filter.showFeederLossFilter = true;
                setFeederLossFilter();
            }

            $scope.filterData.filter.hierarchyFilter = true;
            setHierarchyDefinition();
            $scope.alertDataForFilter = {
                showAlert: false,
            }
            $scope.overload = $stateParams.overload;
            $scope.underload = $stateParams.underload;
            $scope.unbalanced = $stateParams.unbalanced;
            $scope.isFeederLoss = $stateParams.isFeederLoss;
            $scope.isOutageCount = $stateParams.isOutageCount;
            $scope.isOutageDuration = $stateParams.isOutageDuration;
            if ($scope.isOutageCount
                || $scope.isOutageDuration) {
                getPreviousMonthMetaData();
                getCurrentMonthMetaData();
                $scope.tabClick($scope.Reports[2], 2, false);
            }
            if ($scope.isFeederLoss) {
                getPreviousMonthMetaData();
                getCurrentMonthMetaData();
                $scope.tabClick($scope.Reports[3], 3, false);
            }
            if ($scope.overload
                || $scope.underload
                || $scope.unbalanced) {
                $scope.tabClick($scope.Reports[1], 1, false);
            }
            $scope.filterData.filter.mathematicalSigns = [
                { id: '1', Name: '<', value: '<', Selected: true },
                { id: '2', Name: '>', value: '>', Selected: false },
            ]
        }
        function setHierarchyDefinition() {
            HierarchyService.getNetworkHierarchyDefinition()
                .then(function (data) {
                    $scope.filterData.filter.hierarchyDefinition = data;
                    if ($scope.filterData.filter.hierarchyDefinition.length == 1) {
                        $scope.filterData.filter.showHierarchyDefinition = false;
                    }
                    else {
                        $scope.filterData.filter.showHierarchyDefinition = true;
                    }
                });
            HierarchyService.getNetworkHierarchyDetails()
                .then(function (data) {
                    $scope.hierarchyDetails = data;
                });
            HierarchyService.getNetworkHierarchy()
                .then(function (data) {
                    $scope.hierarchy = data;
                });
            var rangeFilter = DataStructureFactory.GetRangeFilterInstance(null, null, null, null)

            URIService.GetData(URIService.GetPublishedReport('EnergyAudit', rangeFilter, $scope.reportFrequency))
                .success(function (response) {
                    var responseData = response.Data.DataGrid.rowData;
                    $scope.filterData.filter.publishReport = responseData;
                    if ($scope.filterData.filter.publishReport.length > 0) {
                        $scope.filterData.filter.dailyMaxDate = moment(responseData[0].StdyPrdEndDt, 'DD/MM/YYYY HH:mm:ss').toDate();
                        $scope.filterData.filter.dailyMinDate = moment(responseData[responseData.length - 1].StdyPrdEndDt, 'DD/MM/YYYY HH:mm:ss').toDate();
                        if ($scope.isLastMonth) {
                            $scope.filterData.filter.selectedpublishReport = $scope.filterData.filter.publishReport[0].Id.toString();
                        }
                        else {
                            $scope.filterData.filter.selectedpublishReport = $scope.filterData.filter.publishReport[0].Id.toString();
                            getSelectedPeriodDates($scope.filterData.filter.selectedpublishReport);
                        }
                        getSelectedPeriodDates($scope.filterData.filter.selectedpublishReport);


                    }
                    getViewFilteredData($scope.filterData.filter);

                }).error(function (data) { });
        }
        function getHierarchyID(filterObject, pagination) {
            HierarchyService.getHierarchyID(filterObject)
                .then(function (hierarchyIDs) {
                    $scope.hierearchIDs = hierarchyIDs;
                    getData(filterObject, pagination);
                });
        }
        function getSelectedPeriodDates(publishReportId) {
            angular.forEach($scope.filterData.filter.publishReport, function (item) {
                if (item.Id.toString() == publishReportId) {
                    setPublishData(item);

                    $scope.formattedFromDate = $scope.FormatData($scope.fromDate, 'date');
                    $scope.formattedToDate = $scope.FormatData($scope.toDate, 'date');

                    if ($scope.reportFrequency == 'Monthly') {
                        $scope.pageSubtitle = "(" +
                            $scope.formattedFromDate + " - " + $scope.formattedToDate + ")";
                    }
                    else {
                        $scope.pageSubtitle = "(" +
                            $scope.formattedToDate + ")";
                    }


                    $scope.filterData.filter.selectedDailyDate = $scope.fromDate;
                    $scope.filterData.filter.selectedDailyDateCalendar = $scope.toDate;
                }
            });
        }
        function getSelectedPeriodDatesFromDate(fromDate) {
            angular.forEach($scope.filterData.filter.publishReport, function (item) {
                if ($scope.FormatData(item.StdyPrdEndDt, 'date') == $scope.FormatData(fromDate, 'date')) {
                    setPublishData(item);
                    $scope.pageSubtitle = "(" + $scope.FormatData(fromDate, 'date') + ")";
                    $scope.filterData.filter.selectedDailyDate = fromDate;
                    $scope.filterData.filter.selectedDailyDateCalendar = $scope.toDate;
                }
            });
        }
        function setPublishData(item) {
            $scope.fromDate = moment(item.StdyPrdStrtDt, "DD/MM/YYYY")
            $scope.toDate = moment(item.StdyPrdEndDt, "DD/MM/YYYY");
            $scope.ispublished = item.PublishStatus;
            $scope.publishedDate = item.PublishedDate;
            $scope.publishedBy = item.PublishedBy;
            $scope.publishedById = item.PublishedById;
        }
        function getPreviousMonthMetaData() {
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
        function addAdditionalFilter(additionalFilters) {
            if (!$scope.isClearedRefreshedClicked) {
                if ($scope.isFeederLoss) {
                    var filteredData = {};
                    if ($scope.reportFrequency == 'Monthly') {
                        filteredData = $scope.jsonMonthly.filter(function (item) {
                            return item.GraphTitle === "FeederLoss";
                        });
                    }
                    else {
                        filteredData = $scope.jsonDaily.filter(function (item) {
                            return item.GraphTitle === "FeederLoss";
                        });
                    }

                    additionalFilters["FeederLoss"] = $scope.isFeederLoss.toString();
                    additionalFilters["StartValue"] = filteredData[0].Values[0]['Min'].toString();
                    additionalFilters["EndValue"] = filteredData[0].Values[0]['Max'].toString();
                }
                if ($scope.isOutageCount) {
                    var filteredData = {};
                    if ($scope.reportFrequency == 'Monthly') {
                        filteredData = $scope.jsonMonthly.filter(function (item) {
                            return item.GraphTitle === "DtOutageCount";
                        });
                    }
                    else {
                        filteredData = $scope.jsonDaily.filter(function (item) {
                            return item.GraphTitle === "DtOutageCount";
                        });
                    }

                    additionalFilters["OutageCount"] = $scope.isOutageCount.toString();
                    additionalFilters["StartValue"] = filteredData[0].Values[0]['Min'].toString();
                    additionalFilters["EndValue"] = filteredData[0].Values[0]['Max'].toString();
                }
                if ($scope.isOutageDuration) {
                    var filteredData = {};
                    if ($scope.reportFrequency == 'Monthly') {
                        filteredData = $scope.jsonMonthly.filter(function (item) {
                            return item.GraphTitle === "DtOutageDuration";
                        });
                    }
                    else {
                        filteredData = $scope.jsonDaily.filter(function (item) {
                            return item.GraphTitle === "DtOutageDuration";
                        });
                    }
                    additionalFilters["OutageDuration"] = $scope.isOutageDuration.toString();
                    additionalFilters["StartValue"] = filteredData[0].Values[0]['Min'].toString();
                    additionalFilters["EndValue"] = filteredData[0].Values[0]['Max'].toString();
                }
                if ($scope.overload) {
                    additionalFilters["overload"] = $scope.overload.toString();
                }
                if ($scope.underload) {
                    additionalFilters["underload"] = $scope.underload.toString();

                }
                if ($scope.unbalanced) {
                    additionalFilters["unbalanced"] = $scope.unbalanced.toString();
                }
                if ($scope.filterData.filter.selectedLoadingConditionFilter == 'LoadingCondition') {
                    additionalFilters["LoadingConditionPercentage"] = "true";
                    additionalFilters["LoadingCondition"] = $scope.filterData.filter.selectedLoadingCondition;
                    additionalFilters["LoadingConditionSign"] = $scope.filterData.filter.selectedLoadingConditionSign;
                    additionalFilters["LoadingConditionValue"] = $scope.filterData.filter.selectedLoadingConditionValue.toString();
                }
                if ($scope.showFilterPanel && $scope.filterData.filter.showunbalanceFilter) {
                    additionalFilters["UnbalanceFilter"] = "true";
                    additionalFilters["Phase"] = $scope.filterData.filter.selectedPhase;
                    additionalFilters["Sign"] = $scope.filterData.filter.selectedPhaseSign;
                    additionalFilters["LoadingValue"] = $scope.filterData.filter.selectedPhaseValue.toString();
                }
                if ($scope.showFilterPanel && $scope.filterData.filter.showOperationRelaibilityFilter) {
                    if ($scope.filterData.filter.selectedOperationalRelaibilityFilterType == 'LoadingCondition') {
                        additionalFilters["LoadingConditionTime"] = "true";
                        additionalFilters["LoadingCondition"] = $scope.filterData.filter.selectedLoadingConditionTime;
                        additionalFilters["LoadingConditionSign"] = $scope.filterData.filter.selectedOperationalRelaibilitySign;
                        additionalFilters["LoadingConditionValue"] = ConverttoMinutes($scope.filterData.filter.selectedLoadingConditionValueTime).toString();
                    }
                    else if ($scope.filterData.filter.selectedOperationalRelaibilityFilterType == 'InterruptionDuration') {
                        additionalFilters["InterruptionDuration"] = "true";
                        additionalFilters["Sign"] = $scope.filterData.filter.selectedOperationalRelaibilitySign;
                        additionalFilters["Value"] = $scope.filterData.filter.selectedInterruptionDuration.toString();
                    }
                    else if ($scope.filterData.filter.selectedOperationalRelaibilityFilterType == 'InterruptionNumber') {
                        additionalFilters["InterruptionNumber"] = "true";
                        additionalFilters["Sign"] = $scope.filterData.filter.selectedOperationalRelaibilitySign;
                        additionalFilters["Value"] = $scope.filterData.filter.selectedInterruptioNumber.toString();
                    }

                }
                if ($scope.showFilterPanel && $scope.filterData.filter.showFeederLossFilter) {
                    additionalFilters["FeederLoss"] = 'true';
                    additionalFilters["Sign"] = $scope.filterData.filter.selectedFeederLossSign;
                    additionalFilters["Value"] = $scope.filterData.filter.selectedFeederLossValue.toString();
                }

            }
            else {
                $scope.filterData.filter.unbalanced = false;
                $scope.filterData.filter.underload = false;
                $scope.filterData.filter.overload = false;
            }

        }
        function setFilterColor() {
            if ($scope.showFilterPanel) {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "rgb(225, 236, 244)";

            } else {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "white";
            }
        }
        function setLoadingConditionFilterData() {
            $scope.filterData.filter.loadingConditionReportFilter = [
                { id: '1', Name: 'Overloaded', value: 'Overloaded', Selected: true },
                { id: '2', Name: 'Underloaded', value: 'Underloaded', Selected: false },
                { id: '3', Name: 'Unbalanced', value: 'Unbalanced', Selected: false },
                { id: '4', Name: 'Loading Condition', value: 'LoadingCondition', Selected: false },
            ]
            $scope.filterData.filter.loadingCondition = [
                { id: '1', Name: '< 20 %', value: '20', Selected: true },
                { id: '2', Name: '20 - 80 %', value: '20-80', Selected: false },
                { id: '3', Name: '80 - 95 %', value: '80-95', Selected: false },
                { id: '4', Name: '> 95 %', value: '95', Selected: false },
            ]
            $scope.filterData.filter.selectedLoadingCondition = '20';
            $scope.filterData.filter.selectedLoadingConditionValue = 20;
            $scope.filterData.filter.selectedLoadingConditionSign = '<'
        }
        function setUnbalanceFilter() {
            $scope.filterData.filter.unBalancePhase =
                [
                    { id: '1', Name: 'R', value: 'R', Selected: true },
                    { id: '2', Name: 'Y', value: 'Y', Selected: false },
                    { id: '3', Name: 'B', value: 'B', Selected: false },
                    { id: '4', Name: 'Any', value: 'Any', Selected: false },
                ]
            $scope.filterData.filter.selectedPhase = 'Any';
            $scope.filterData.filter.selectedPhaseValue = 0;
            $scope.filterData.filter.selectedPhaseSign = '>'
        }
        function setOperationRelaibilityFilter() {
            $scope.filterData.filter.operationalRelaibilityFilterValues = [
                { id: '1', Name: 'Loading Condition', value: 'LoadingCondition', Selected: true },
                { id: '2', Name: 'Interruption Duration', value: 'InterruptionDuration', Selected: false },
                { id: '2', Name: 'Interruption Number', value: 'InterruptionNumber', Selected: false }
            ]
            $scope.filterData.filter.selectedOperationalRelaibilityFilterType = 'LoadingCondition'
            $scope.filterData.filter.loadingCondition = [
                { id: '1', Name: '< 20 %', value: '20', Selected: true },
                { id: '2', Name: '20 - 80 %', value: '20-80', Selected: false },
                { id: '3', Name: '80 - 95 %', value: '80-95', Selected: false },
                { id: '4', Name: '> 95 %', value: '95', Selected: false },
            ]
            $scope.filterData.filter.selectedLoadingConditionTime = '20';
            $scope.filterData.filter.selectedLoadingConditionValueTime = '00:30';
            $scope.filterData.filter.selectedOperationalRelaibilitySign = '<'
        }
        function setFeederLossFilter() {
            $scope.filterData.filter.selectedFeederLossSign = '<'
            $scope.filterData.filter.selectedFeederLossValue = '100'
        }
        function ConverttoMinutes(hourMinutes) {
            var splitTime = hourMinutes.split(':');
            var hour = splitTime[0];
            var minutes = splitTime[1];
            return Number(hour) * 60 + Number(minutes);
        }
    }

]);




