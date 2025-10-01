'use strict';
app.controller("DTListCtrl", ['$scope',
    '$location', '$rootScope', '$filter', '$state', 'DataStructureFactory', 'URIService', 'AuthService', '$moment', '$stateParams',
    function ($scope, $location, $rootScope, $filter, $state, DataStructureFactory, URIService, AuthService, $moment, $stateParams) {

        $scope.alertData = {
            currentState: $state.current.name
        };
        var userInfo = AuthService.getAuthInfo();
        var tenantDateFormat = userInfo.cultureInfo.DateTimeFormats;
        var translateFilter = $filter('translate');
        $scope.unmapped = $stateParams.unmapped;
        $scope.unmappedDT = $stateParams.unmappedDT;

        $scope.showFilterPanel = false;
        $scope.showFilterIcon = true;
        $scope.filterApplied = false;

        $scope.onFilterClick = function () {
            $scope.showFilterPanel = !$scope.showFilterPanel;
            setFilterColor();
        }
        $scope.filterData = {
            filter: {
                minDate: userInfo.systemStartDate,
                maxDate: new Date(),
            },
            applyFilter: $scope.applyFilter,
            clearFilter: $scope.clearFilter,
            filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelDT.html',

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
                getViewFilteredData();
            }
        }
        $scope.add = function () {
            $location.path('app/NetworkMetering/DTForm');
        }
        angular.forEach($rootScope.usersitems, function (item) {
            if (item.uiSref == $state.current.name) {
                $scope.CanAdd = item.CanAdd;
            }
        });
        $scope.onEditDT = function (item) {
            $state.go("app.NetworkMetering.EditDTForm", { 'dtCode': item.DTCode });
        };
        $scope.onDeleteDT = function (item) {
            URIService.DeleteRequest(URIService.GetDeleteDTUrl(item.DTCode, false))
                .success(function (response, status, headers, config) {
                    if (response.Data == 1) {
                        $scope.alertData = {
                            message: "DT : " + item.DTCode + " is deleted successfully",
                            showAlert: true,
                            type: 'success'
                        }
                        getViewFilteredData($scope.dataFilter);
                    }
                    else {
                        $scope.alertData = {
                            message: response.Data,
                            showAlert: true,
                            type: 'error'
                        }
                    }

                }).error(function (data, status, headers, config) {
                    vm.disableSubmitButton = false;
                    $scope.alertData = {
                        message: translateFilter("Menu.Error_Message"),
                        showAlert: true,
                        type: 'error'
                    }
                });
        };
        $scope.performAction = function (key, item) {
            $scope[key](item);
        }
        $scope.filterData.applyFilter = function (filterObj) {
            $scope.dataFilter = {
                fromDate: filterObj.fromDate,
                toDate: filterObj.toDate

            };
            setFilterColor();
            getViewFilteredData($scope.dataFilter);
        }
        $scope.onRefreshClick = function () {
            $scope.alertData = { showAlert: false }
            getViewFilteredData($scope.dataFilter);
        }
        $scope.gridLinkColumnClicked = function (source, rowData) {
            $state.go("app.NetworkMetering.DTInformation", {
                'name': rowData.DTCode,
            });
        }

        $scope.selectedPlaceholder = $filter('translate')('Menu.dtName');
        $scope.selectedName = 'dtName';
        $scope.isDropdownOpen = false;
        $scope.filteredSuggestions = [];
        $scope.showSuggestions = false;

        $scope.toggleDropdown = function () {
            $scope.isDropdownOpen = !$scope.isDropdownOpen;
            $scope.showSuggestions = false;
        };
        $scope.changePlaceholder = function (value) {
            $scope.selectedPlaceholder = $filter('translate')('Menu.' + value);
            $scope.selectedName = $filter('translate')(value);
            document.getElementById('searchBoxFilter').value = "";
            $scope.isDropdownOpen = false;
        };
        $scope.updateSuggestions = function () {
            var searchText = document.getElementById('searchBoxFilter').value;
            var type = document.getElementById('searchBoxFilter').name;

            URIService.GetData(URIService.GetSearchList(type, searchText)).
                success(function (data) {
                    $scope.filteredSuggestions = data.Data;
                    const filteredSuggestions = $filter('filter')(data.Data, searchText);
                    $scope.filteredSuggestions = filteredSuggestions;
                })
        };
        $scope.selectData = function (suggestion) {
            $scope.searchBy = document.getElementById('searchBoxFilter').name;
            var searchBox = document.getElementById('searchBoxFilter');
            var type = document.getElementById('searchBoxFilter').name;

            if (type === 'meterId') {
                searchBox.value = suggestion.MeterId;
            } else if (type === 'dtName') {
                searchBox.value = suggestion.DTName;
            }
            else if (type === 'dtCode') {
                searchBox.value = suggestion.DTCode;
            }

            $scope.searchValue = searchBox.value;
            $("#searchByHiddenField").val($scope.searchBy);
            $("#searchValueHiddenField").val($scope.searchValue);

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
        function getRecordsByPage(pagination) {
            getViewFilteredData($scope.dataFilter, pagination);
        }
        function getViewFilteredData(dataFilter, pagination) {

            $scope.data = {};
            var fromDate = dataFilter != null ? dataFilter.fromDate : null;
            var toDate = dataFilter != null ? dataFilter.toDate : null;

            var paginationFilter = null
            if (pagination != null) {
                paginationFilter = DataStructureFactory.GetPaginationFilterInstance(pagination.currentPage, pagination.pageSize, pagination.totalRecords)
            }
            var additionalFilter = {
                "Unmapped": $scope.unmapped.toString(),
                "UnmappedDT": $scope.unmappedDT.toString(),
            }
            var rangeFilter = DataStructureFactory.GetRangeFilterInstance(fromDate, toDate, additionalFilter, paginationFilter)
            var searchBy = $('#searchByHiddenField').val();
            var searchValue = $('#searchValueHiddenField').val();
            URIService.GetData(URIService.GetDTListUrl(rangeFilter, searchBy, searchValue))
                .success(function (data) {
                    SetDataInGrid(data);

                }).error(function (data) { });

        }
        function setFilterColor() {
            if ($scope.showFilterPanel) {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "rgb(225, 236, 244)";

            } else {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "white";
                $("#searchByHiddenField").val("");
                $("#searchValueHiddenField").val("");

            }
        }
        function SetDataInGrid(data) {
            $scope.data = data.Data.DataGrid;
            if (data.Data.DataGrid.Actions != null &&
                data.Data.DataGrid.Actions != undefined &&
                data.Data.DataGrid.Actions.length > 0) {
                $scope.data.Actions = data.Data.DataGrid.Actions;
            }
            $scope.data.getRecords = getRecordsByPage;
            $scope.data.currentPage = data.Data.CurrentPage;
            $scope.data.totalRecords = data.Data.TotalRecords;
            $scope.data.pageSize = data.Data.PageSize;
            $scope.data.tableID = 'tableId';
            $scope.data.exportFileName = translateFilter("Menu.DTList");
            $scope.data.customExport = true;
            $scope.data.sortColumnName = "$SortBy$";
            $scope.data.sortLabel = "Menu.SortLabelForDTList";
            $scope.data.rowActionTemplateUrl = 'Angular1x/App/Shared/PartialView/DataGrid/rowAction.html';
            $scope.data.tableBodyTemplateURL = 'Angular1x/App/Shared/PartialView/DataGrid/tableBody/dtList.html';

            SetPageFilters(data.RequestDetails.Range);
        }
        function SetPageFilters(appliedFilters) {
            $scope.filterData.filter.fromDate = $moment(appliedFilters.Start, tenantDateFormat.FullDateTimePattern);
            $scope.filterData.filter.toDate = $moment(appliedFilters.End, tenantDateFormat.FullDateTimePattern);
            $scope.filterData.filter.labelForDateFilter = "Menu.FilterOnInstalledOn";
        }

        getViewFilteredData();

    }
]);