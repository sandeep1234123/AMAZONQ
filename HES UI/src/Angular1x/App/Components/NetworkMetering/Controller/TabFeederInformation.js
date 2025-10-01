
'use strict';

app.controller('TabFeederInformation',
    ['$scope', 'URIService', '$stateParams', '$filter',
        function ($scope, URIService, $stateParams, $filter) {
            var translateFilter = null;
            $scope.init = function () {
                $scope.FeederName = $stateParams.name;
                translateFilter = $filter('translate');

                $scope.requestDetails = {};
                $scope.requestDetails.DeviceID = $scope.FeederName;

                getAttributes();
                getAssociationGrid();
            }
            $scope.refresh = function () {
                getAttributes();
                getAssociationGrid();
            }
            $scope.getFeederNameData = function () {
                getAttributes();
                getAssociationGrid();
            }
            function getAttributes() {
                $scope.isDataAvailable = false;
                $scope.gridData = {};
                $scope.isProcessing = false;

                URIService.GetData(URIService.GetFeederInformationUrl($scope.FeederName))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.isProcessing = false;

                            $scope.vm = response.Data;
                            if ($scope.isNotNullorUndefined($scope.vm.Latitude)
                                && $scope.isNotNullorUndefined($scope.vm.Longitude)) {
                                showMap($scope.vm.Latitude, $scope.vm.Longitude);

                            }
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });
                    URIService.GetData(URIService.GetAnalysisConfiguration($scope.FeederName,'Feeder'))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            $scope.AnalysisConfiguration = response.Data;
                        }
                    }).error(function (data, status, headers, config) {
                    });
                URIService.GetData(URIService.GetLastMonthFeederParametersUrl($scope.FeederName))
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
                URIService.GetData(URIService.GetAllFeederMeterAssociationsUrl($scope.FeederName))
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
                gridData.exportFileName = translateFilter("Menu.FeederAssociationExport");
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
                        title: 'Feeder',
                        description: "Name: " + $scope.FeederName
                    }
                ];

                URIService.GetData(URIService.GetAllFeederDTLocation($scope.FeederName))
                    .success(function (response, status, headers, config) {
                        if (status === 200) {
                            if (response.Data != null && response.Data.length > 0) {
                                angular.forEach(response.Data, function (value, key) {
                                    if ($scope.isNotNullorUndefined(value.Latitude)) {
                                        var location = {
                                            position: { lat: value.Latitude, lng: value.Longitude },
                                            title: value.Title,
                                            description: "Latitude: " + value.Latitude + " Longitude: " + value.Longitude,
                                            icon:
                                            {
                                                url: '/Angular1x/images/Branding/Genus/DTLocationMarker.png',
                                                scaledSize: new google.maps.Size(35, 35)
                                            }

                                        }
                                        locations.push(location);
                                    }
                                });
                            }
                            for (var i = 0; i < locations.length; i++) {
                                var location = locations[i];
                                var marker = new google.maps.Marker({
                                    position: location.position,
                                    map: map,
                                    title: location.title,
                                    description: location.description,
                                    icon: location.icon
                                });

                                // Create a tooltip for each marker
                                (function (marker, location) {
                                    var infowindow = new google.maps.InfoWindow({
                                        content: '<h2>' + location.title + '</h2><p>' + location.description + '</p>'
                                    });

                                    google.maps.event.addListener(marker, 'mouseover', function () {
                                        infowindow.open(map, marker);
                                    });

                                    google.maps.event.addListener(marker, 'mouseout', function () {
                                        infowindow.close();
                                    });
                                })(marker, location);
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.isProcessing = false;
                    });

            }
            $scope.init();
        }]);
