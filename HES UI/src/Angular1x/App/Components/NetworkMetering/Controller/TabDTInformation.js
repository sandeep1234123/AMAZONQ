
'use strict';

app.controller('TabDTInformation',
    ['$scope', 'URIService', '$stateParams', '$filter',
        function ($scope, URIService, $stateParams, $filter) {
            var translateFilter = null;
            $scope.init = function () {
                $scope.DTName = $stateParams.name;
                translateFilter = $filter('translate');

                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.DTName;

                getAttributes();
                getAssociationGrid();
            }
            $scope.getDTNameData = function () {
                getAttributes();
                getAssociationGrid();
            }
            $scope.refresh = function () {
                getAttributes();
                getAssociationGrid();
            }
            function getAttributes() {
                $scope.isDataAvailable = false;
                $scope.gridData = {};
                $scope.isProcessing = false;

                URIService.GetData(URIService.GetDTInformationUrl($scope.DTName))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.isProcessing = false;

                            $scope.vm = response.Data;
                            showMap($scope.vm.Latitude, $scope.vm.Longitude);
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
                URIService.GetData(URIService.GetAnalysisConfiguration($scope.DTName,'DT'))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.AnalysisConfiguration = response.Data;
                        }
                    }).error(function (data, status, headers, config) {
                    });
                URIService.GetData(URIService.GetLastMonthParametersUrl($scope.DTName))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {

                            $scope.isProcessing = false;

                            $scope.lastMonthParam = response.Data;
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            function getAssociationGrid() {
                $scope.isDataAvailable = false;
                $scope.gridData = {};
                $scope.isProcessing = false;
                URIService.GetData(URIService.GetAllDTMeterAssociationsUrl($scope.DTName))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.requestDetails = response.RequestDetails;

                            $scope.gridData = getGridDataFromResponse(response.Data);

                            $scope.isProcessing = false;
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
            }
            function getGridDataFromResponse(viewModel) {
                var gridSettings = viewModel;
                var gridData = gridSettings.DataGrid;

                gridData.tableID = "data";
                gridData.exportFileName = translateFilter("Menu.DTAssociationExport");
                gridData.currentPage = 0;
                gridData.totalRecords = gridSettings.DataGrid.rowData.length;
                gridData.pageSize = gridSettings.DataGrid.rowData.length;
                gridData.tableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/meterAssociationHead.html';
                gridData.tableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/meterAssociationBody.html';
                gridData.customExport = true;
                gridData.reAlignToolbar = true;
                gridData.serverPagination = false;
                gridData.showPaginationRow = false;
                gridData.options = [];
                return gridData;
            }
            function showMap(latitude, longitude) {
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: latitude, lng: longitude },
                    zoom: 10
                });
                var locations = [
                    {
                        position: { lat: latitude, lng: longitude },
                    }
                ];
                for (var i = 0; i < locations.length; i++) {
                    var location = locations[i];
                    var marker = new google.maps.Marker({
                        position: location.position,
                        map: map,
                        title: location.title
                    });
                }
            }
            $scope.init();
        }]);


