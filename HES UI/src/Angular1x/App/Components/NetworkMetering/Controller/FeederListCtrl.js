'use strict';
app.controller("FeederListCtrl", ['$scope',
    '$location', '$rootScope', '$filter', '$state', 'DataStructureFactory', 'URIService', 'AuthService', '$moment', '$stateParams',

    function ($scope, $location, $rootScope, $filter, $state, DataStructureFactory, URIService, AuthService, $moment, $stateParams) {
        $scope.alertData = {
            currentState: $state.current.name
        };
        var userInfo = AuthService.getAuthInfo();
        var tenantDateFormat = userInfo.cultureInfo.DateTimeFormats;
        $scope.showFilterPanel = false;
        $scope.showFilterIcon = true;
        $scope.filterApplied = false;
        $scope.unmapped = $stateParams.unmapped;
        $scope.onFilterClick = function () {
            $scope.showFilterPanel = !$scope.showFilterPanel;
            setFilterColor();
        }
        var translateFilter = $filter('translate');

        angular.forEach($rootScope.usersitems, function (item) {
            if (item.uiSref == $state.current.name) {
                $scope.CanAdd = item.CanAdd;
            }
        });
        var getRecordsByPage = function (pagination) {
            getViewFilteredData($scope.dataFilter, pagination);
        }
        var setFilterColor = function () {
            if ($scope.showFilterPanel) {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "rgb(225, 236, 244)";

            } else {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "white";
            }
        }
        getViewFilteredData();
        $scope.filterData = {
            filter: {
                minDate: userInfo.systemStartDate,
                maxDate: new Date(),
                showDateFilter: true
            },
            applyFilter: $scope.applyFilter,
            clearFilter: $scope.clearFilter,
            filterTemplateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanelFeeder.html',
        }
        $scope.add = function () {
            $location.path('app/NetworkMetering/FeederForm');
        }
        $scope.onEditFeeder = function (item) {
            $state.go("app.NetworkMetering.EditFeederForm", { 'feederCode': item.FeederCode });
        };
        $scope.onManageDT = function (item) {
            $state.go("app.NetworkMetering.ManageDTForm", { 'feederInfo': $scope.Base64EncodeUnicode(item), });
        };
        $scope.performAction = function (key, item) {
            $scope[key](item);
        }
        $scope.filterData.applyFilter = function (filterObj) {
            $scope.dataFilter = {
                fromDate: filterObj.fromDate,
                toDate: filterObj.toDate,

            };
            setFilterColor();
            getViewFilteredData($scope.dataFilter);
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
        $scope.onRefreshClick = function () {
            getViewFilteredData($scope.dataFilter);
        }
        $scope.gridLinkColumnClicked = function (source, rowData) {
            $state.go("app.NetworkMetering.FeederInformation", {
                'name': rowData.FeederCode
            });
        }
        $scope.selectedPlaceholder = $filter('translate')('Menu.feederName');
        $scope.selectedName = 'feederName';
        $scope.isDropdownOpen = false;
        $scope.filteredSuggestions = [];
        $scope.showSuggestions = false;
        angular.element(document).ready(function () {
            document.body.addEventListener('click', function (event) {
                var searchBox = document.getElementById('searchBoxFilter');
                var suggestionList = document.getElementById('element');
                if (searchBox && !searchBox.contains(event.target) && suggestionList && !suggestionList.contains(event.target)) {
                    $scope.hideSuggestions();
                }
            });
        });
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

            if (type === 'feederMeterId') {
                searchBox.value = suggestion.MeterId;
            } else if (type === 'feederName') {
                searchBox.value = suggestion.FeederName;
            }
            else if (type === 'feederCode') {
                searchBox.value = suggestion.FeederCode;
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
        function SetPageFilters(appliedFilters) {
            $scope.filterData.filter.fromDate = $moment(appliedFilters.Start, tenantDateFormat.FullDateTimePattern);
            $scope.filterData.filter.toDate = $moment(appliedFilters.End, tenantDateFormat.FullDateTimePattern);
            $scope.filterData.filter.labelForDateFilter = "Menu.FilterOnInstalledOn";
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
            $scope.data.exportFileName = translateFilter("Menu.FeederList");
            $scope.data.customExport = true;
            $scope.data.sortColumnName = "$SortBy$";
            $scope.data.sortLabel = "Menu.SortLabelForDTList";

            SetPageFilters(data.RequestDetails.Range);
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
            }
            var rangeFilter = DataStructureFactory.GetRangeFilterInstance(fromDate, toDate, additionalFilter, paginationFilter)
            var searchBy = $('#searchByHiddenField').val();
            var searchValue = $('#searchValueHiddenField').val();

            URIService.GetData(URIService.GetFeederListUrl(rangeFilter, searchBy, searchValue))
                .success(function (data) {
                    SetDataInGrid(data);

                }).error(function (data) { });

        }
    }
]);