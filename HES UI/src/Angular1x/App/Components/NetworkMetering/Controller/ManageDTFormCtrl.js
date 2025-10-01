
'use strict';

app.controller('ManageDTFormCtrl',
    ['$scope', 'URIService', '$stateParams', '$filter', 'DataStructureFactory',
        function ($scope, URIService, $stateParams, $filter, DataStructureFactory) {
            var translateFilter = $filter('translate');

            $scope.init = function () {
                $scope.feederInfo = JSON.parse(atob($stateParams.feederInfo));
                $scope.FeederCode = $scope.feederInfo.FeederCode;
                $scope.FeederInstalledOn = moment($scope.feederInfo.InstalledOn, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                $scope.disableDisassociatedDTSubmit = false;
                $scope.disableAssociateMeter = true;
                $scope.isEditDT = false;
                $scope.maxDateOfAssociation = moment();

                $scope.distanceValues = [
                    { id: '1', Name: 'Select', value: null, Selected: true },
                    { id: '1', Name: 'Nearest', value: 'IsNearest', Selected: false },
                    { id: '2', Name: 'Farthest', value: 'IsFarthest', Selected: false },
                ]

                getAssociationGrid();
            }
            var getRecordsByPage = function (pagination) {
                getAssociationGrid(pagination);
            }


            $scope.updateSuggestions = function () {
                var searchText = document.getElementById('searchBoxFilter').value;
                URIService.GetData(URIService.GetSearchList('dtCode', searchText)).
                    success(function (data) {
                        $scope.filteredSuggestions = data.Data;
                        const filteredSuggestions = $filter('filter')(data.Data, searchText);
                        $scope.filteredSuggestions = filteredSuggestions;
                    })
            };
            $scope.selectData = function (suggestion) {
                var searchBox = document.getElementById('searchBoxFilter');
                if ($scope.isNotNullorUndefined(suggestion.DTCode)) {
                    $scope.disableAssociateMeter = false;
                }
                $scope.selectedDTCode = suggestion.DTCode;
                searchBox.value = suggestion.DTCode;
                document.getElementById('element').style.display = "none";
            };
            $scope.hideSuggestions = function () {
                $scope.showSuggestions = false;
                $scope.$apply();
            };
            angular.element(document).ready(function () {
                document.body.addEventListener('click', function (event) {
                    var searchBox = document.getElementById('searchBoxFilter');
                    var suggestionList = document.getElementById('element');
                    if (searchBox && !searchBox.contains(event.target) && suggestionList && !suggestionList.contains(event.target)) {
                        $scope.hideSuggestions();
                    }
                });
            });
            $scope.getFeederNameData = function () {
                getAssociationGrid();
            }
            $scope.onRefreshClick = function () {
                getAssociationGrid();
            }
            $scope.gridLinkColumnClicked = function (source, index) {
                $scope.DisassociateDTCode = source['DTCode']
                $scope.DTAssociationDate = moment(source['DateOfAssociation'], 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                $scope.minDateForDTDisassociation = $scope.DTAssociationDate;
                $scope.DisassociateDTName = source['DTName']
                $("#removeDTModal").modal('show');
            }
            $scope.onControlClick = function (source) {
                $scope.isEditDT = true;
                $scope.disableAssociateMeter = false;

                $scope.AssociateDTCode = source['DTCode']
                $scope.DTAssociationDate = moment(source['DateOfAssociation'], 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                $scope.DTInstalledOn = moment(source['DTInstalledOn'], 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                $scope.SelectDistance = source['IsFarthest'] ? 'IsFarthest' : source['IsNearest'] ? 'IsNearest' : "";
                $("#removeDTModal").modal('hide');
                $("#addDTModal").modal('show');
            }
            $scope.isDisassociateDTClicked = function () {
                $scope.disableDisassociatedDTSubmit = true;
                var disassocationObject = {
                    "DTCode": $scope.DisassociateDTCode,
                    "DateofDisassociation": setDate($scope.DTDisassociationDate),
                    "ReasonForRemoval": $scope.DTreasonForRemoval,
                }

                URIService.SubmitNewRequest(URIService.GetDisassociateFeederDTUrl($scope.feederInfo.FeederCode), disassocationObject)
                    .success(function (response, status, headers, config) {
                        $scope.disableDisassociatedDTSubmit = false;
                        if (response.Data >= 0) {
                            $scope.alertData = {
                                message: "DT : " + $scope.DisassociateDTCode + "  is disassociated successfully from feeder : " + $scope.feederInfo.FeederName,
                                showAlert: true,
                                type: 'success'
                            }
                            $("#removeDTModal").modal('hide');
                            getAssociationGrid();
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.disableDisassociatedDTSubmit = false;
                        $scope.alertData = {
                            message: translateFilter("Menu.Error_Message"),
                            showAlert: true,
                            type: 'error'
                        }
                    });
            }
            $scope.isAssociateDTClicked = function () {
                $scope.disableAssociateMeter = false;
                $scope.isEditDT = false;
                $scope.minDateForAssociation = $scope.FeederInstalledOn;
                $scope.DTAssociationDate = moment()
                $("#removeDTModal").modal('hide');
                $("#addDTModal").modal('show');
            }

            $scope.init();
            $scope.AssociateDTWithFeeder = function () {
                $scope.disableAssociateMeter = true;
                $scope.alertDataForDTAssociation = {
                    showAlert: false,
                }
                if (Date.parse($scope.DTAssociationDate) < Date.parse($scope.FeederInstalledOn)) {
                    $scope.disableAssociateMeter = false;
                    $scope.alertDataForDTAssociation = {
                        message: translateFilter("Menu.AssociationDateSmaller"),
                        showAlert: true,
                        type: 'error'
                    }
                }

                else {
                    if ($scope.isEditDT) {
                        if (Date.parse($scope.DTAssociationDate) < Date.parse($scope.DTInstalledOn)) {
                            $scope.disableAssociateMeter = false;
                            $scope.alertDataForDTAssociation = {
                                message: translateFilter("Menu.AssociationDateSmaller"),
                                showAlert: true,
                                type: 'error'
                            }
                        }
                        else {
                            var associateObject = {
                                DTCode: $scope.AssociateDTCode,
                                DateofAssociation: setDate($scope.DTAssociationDate),
                            }
                        }

                        if ($scope.isNotNullorUndefined($scope.SelectDistance)) {
                            if ($scope.SelectDistance == "IsNearest") {
                                associateObject['IsNearest'] = true;
                                associateObject['IsFarthest'] = false;
                            }
                            else if ($scope.SelectDistance == "IsFarthest") {
                                associateObject['IsFarthest'] = true;
                                associateObject['IsNearest'] = false;
                            }
                        }
                        URIService.SubmitNewRequest(URIService.GetUpdateDTFeederUrl($scope.feederInfo.FeederCode), associateObject)
                            .success(function (response, status, headers, config) {
                                $scope.disableAssociateMeter = true;
                                if (response.Data >= 0) {
                                    $("#addDTModal").modal('hide');
                                    $scope.alertData = {
                                        message: "DT: " + $scope.AssociateDTCode + " association is updated successfully against Feeder: " + $scope.feederInfo.FeederName + " (" + $scope.feederInfo.FeederCode + ")",
                                        showAlert: true,
                                        type: 'success'
                                    }
                                    getAssociationGrid();
                                }
                            }).error(function (data, status, headers, config) {
                                $scope.disableAssociateMeter = false;
                                $scope.alertData = {
                                    message: translateFilter("Menu.Error_Message"),
                                    showAlert: true,
                                    type: 'error'
                                }
                            });
                    }
                    else {
                        URIService.GetData(URIService.GetFeederAssociatedDTUrl($scope.selectedDTCode, setDate($scope.DTAssociationDate)))
                            .success(function (response, status, headers, config) {
                                if (response.Data.length > 0) {
                                    var dtAssociationDate = $scope.DTAssociationDate
                                    var installedOn = moment(response.Data[0].InstalledOn, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss')
                                    var dateofDisassociation = response.Data[0].DateofDisassociation != null ?
                                        moment(response.Data[0].DateofDisassociation, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss') : response.Data[0].DateofDisassociation;
                                    var dateOfAssociation = moment(response.Data[0].DateofAssociation, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss')

                                    $scope.disableAssociateMeter = false;
                                    if ((Date.parse(installedOn)) > Date.parse(dtAssociationDate)) {
                                        $scope.alertDataForDTAssociation = {
                                            message: "Association Date should be greater then DT Installation Date i.e." + installedOn,
                                            showAlert: true,
                                            type: 'error'
                                        }
                                    }
                                    else if (dateofDisassociation != null) {
                                        if (Date.parse(dtAssociationDate) >= Date.parse(dateOfAssociation)
                                            && Date.parse(dtAssociationDate) <= Date.parse(dateofDisassociation)) {
                                            $scope.alertDataForDTAssociation = {
                                                message: translateFilter("Menu.DTAssociated") + " " + $scope.selectedDTCode + " " + translateFilter("Menu.IsAssociated") + " " + response.Data[0].FeederCode + " " + translateFilter("Menu.Since") + " " + response.Data[0].DateofAssociation,
                                                showAlert: true,
                                                type: 'error'
                                            }
                                        }
                                    }
                                    else if (dateofDisassociation == null && Date.parse(dtAssociationDate) >= Date.parse(dateOfAssociation)) {
                                        $scope.alertDataForDTAssociation = {
                                            message: translateFilter("Menu.DTAssociated") + " " + $scope.selectedDTCode + " " + translateFilter("Menu.IsAssociated") + " " + response.Data[0].FeederCode + " " + translateFilter("Menu.Since") + " " + response.Data[0].DateofAssociation,
                                            showAlert: true,
                                            type: 'error'
                                        }
                                    }
                                    else {
                                        var associateObject = {
                                            DTCode: $scope.selectedDTCode,
                                            DateofAssociation: setDate($scope.DTAssociationDate),
                                        }
                                        if ($scope.isNotNullorUndefined($scope.SelectDistance)) {
                                            if ($scope.SelectDistance == "IsNearest") {
                                                associateObject['IsNearest'] = true;
                                                associateObject['IsFarthest'] = false;
                                            }
                                            else if ($scope.SelectDistance == "IsFarthest") {
                                                associateObject['IsFarthest'] = true;
                                                associateObject['IsNearest'] = false;
                                            }
                                        }
                                        URIService.SubmitNewRequest(URIService.GetAssociateFeederWithDTNewUrl($scope.feederInfo.FeederCode), associateObject)
                                            .success(function (response, status, headers, config) {
                                                $scope.disableAssociateMeter = true;
                                                if (response.Data >= 0) {
                                                    $("#addDTModal").modal('hide');
                                                    $scope.alertData = {
                                                        message: "DT: " + $scope.selectedDTCode + " is successfully associated with Feeder: " + $scope.feederInfo.FeederName + " (" + $scope.feederInfo.FeederCode + ")",
                                                        showAlert: true,
                                                        type: 'success'
                                                    }
                                                    getAssociationGrid();
                                                }
                                            }).error(function (data, status, headers, config) {
                                                $scope.disableAssociateMeter = false;
                                                scope.alertData = {
                                                    message: translateFilter("Menu.Error_Message"),
                                                    showAlert: true,
                                                    type: 'error'
                                                }
                                            });
                                    }
                                }

                            })
                    }

                }


            }
            function setDate(date) {
                var dateModified = date == "Invalid Date" ? new Date() : date;
                return $scope.ToSerializedDate(dateModified)
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

                URIService.GetData(URIService.GetAllFeederDTAssociationsUrl($scope.FeederCode, rangeFilter))
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
                $scope.data.getRecords = getRecordsByPage;
                $scope.data.currentPage = data.Data.CurrentPage;
                $scope.data.totalRecords = data.Data.TotalRecords;
                $scope.data.pageSize = data.Data.PageSize;
                $scope.data.tableID = 'tableId';
                $scope.data.exportFileName = translateFilter("Menu.FeederAssociationExport") + " for Feeder " + $scope.FeederCode;
                $scope.data.customExport = true;
                $scope.data.sortColumnName = "$SortBy$";
                $scope.data.sortLabel = "Menu.SortLabelForDTList";
                $scope.data.showActionColum = true;
                $scope.data.tableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/dtAssociations.html';
                $scope.data.tableHeaderTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableHead/dtAssociations.html';
                return $scope.data;
            }

        }]);
