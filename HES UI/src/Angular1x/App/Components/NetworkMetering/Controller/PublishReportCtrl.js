
'use strict';

app.controller('PublishReportCtrl',
    ['$scope', 'URIService', '$stateParams', '$filter', 'DataStructureFactory', '$state',
        function ($scope, URIService, $stateParams, $filter, DataStructureFactory, $state) {
            var translateFilter = $filter('translate');
            $scope.reportType = $stateParams.reportType;
            $scope.reportFrequency = $stateParams.frequency;
            var getRecordsByPage = function (pagination) {
                getAssociationGrid(pagination);
            }
            $scope.onRefreshClick = function () {
                getAssociationGrid();
            }
            $scope.onControlClick = function (source) {
                URIService.SubmitNewRequest(URIService.GetUpdatePublishStatusUrl(source, $scope.reportFrequency))
                    .success(function (response, status, headers, config) {
                        if (response.Data >= 0) {
                            $scope.alertData = {
                                message: "The report has been published",
                                showAlert: true,
                                type: 'success'
                            }
                        }
                        getAssociationGrid();
                    }).error(function (data, status, headers, config) {

                    });
            }

            $scope.back = function () {
                $state.go('app.NetworkMetering.DT' + $scope.reportFrequency + 'Report');
            }
            function getAssociationGrid(pagination) {
                $scope.isDataAvailable = false;
                $scope.gridData = {};
                $scope.isProcessing = false;

                $scope.data = {};
                var paginationFilter = null
                if (pagination != null) {
                    paginationFilter = DataStructureFactory.GetPaginationFilterInstance(pagination.currentPage, pagination.pageSize, pagination.totalRecords)
                }
                var additionalFilters = { "isPaginationRequired": "true" };
                var rangeFilter = DataStructureFactory.GetRangeFilterInstance(null, null, additionalFilters, paginationFilter)

                URIService.GetData(URIService.GetPublishedReport($scope.reportType, rangeFilter, $scope.reportFrequency))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;

                            $scope.gridData = getGridDataFromResponse(response);
                            $scope.isProcessing = false;
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            function getGridDataFromResponse(data) {
                $scope.data = data.Data.DataGrid;
                $scope.data.Actions = data.Data.DataGrid.Actions;
                $scope.data.getRecords = getRecordsByPage;
                $scope.data.currentPage = data.Data.CurrentPage;
                $scope.data.totalRecords = data.Data.TotalRecords;
                $scope.data.pageSize = data.Data.PageSize;
                $scope.data.tableID = 'tableId';
                $scope.data.exportFileName = translateFilter("Menu.PublishReport") ;
                $scope.data.customExport = true;
                $scope.data.sortColumnName = "$SortBy$";
                $scope.data.sortLabel = "Menu.SortLabelForDTList";
                $scope.data.showActionColum = true;
                $scope.data.tableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/publishReport.html';
                $scope.data.tableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/publishReport.html';
                return $scope.data;
            }
            getAssociationGrid();

        }]);
