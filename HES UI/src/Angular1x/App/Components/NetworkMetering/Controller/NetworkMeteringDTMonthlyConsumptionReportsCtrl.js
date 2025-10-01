'use strict';
app.controller("NetworkMeteringDTMonthlyConsumptionReportsCtrl",['$scope','$state','AuthService','$rootScope',
     '$filter','$http','$moment', '$stateParams','URIService','DataStructureFactory',
    function($scope,$state,AuthService,$rootScope, $moment, $stateParams,$filter,http,URIService,DataStructureFactory){

        $scope.alertData = {
                    currentState: $state.current.name
                };
        var userInfo = AuthService.getAuthInfo();
        $scope.unmapped = false;
        $scope.unmappedDT = false;
          $scope.dataFilter = {
                fromDate: '',
                toDate: ''

            }; 
       function getMonths(){
              $scope.months = [
                    { value: '01', name: 'January' },
                    { value: '02', name: 'February' },
                    { value: '03', name: 'March' },
                    { value: '04', name: 'April' },
                    { value: '05', name: 'May' },
                    { value: '06', name: 'June' },
                    { value: '07', name: 'July' },
                    { value: '08', name: 'August' },
                    { value: '09', name: 'September' },
                    { value: '10', name: 'October' },
                    { value: '11', name: 'November' },
                    { value: '12', name: 'December' }
                    ]                       ;
                    let currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
                    $scope.selectedMonth = currentMonth;
        }
        function getYear(){
            $scope.years = [];
            const currentYear = new Date().getFullYear();
            // Example: 5 years before to 5 years after
            for (let y = currentYear - 5; y <= currentYear; y++) {
            $scope.years.push(y);
            }
            // ✅ Set default to current year
            $scope.selectedYear = currentYear;
        }
          $scope.showFilterPanel = false;
          $scope.showFilterIcon = false;
          $scope.isClearedRefreshedClicked = false;
          $scope.isShowLoading=false;
          $scope.onFilterClick = function () {
            $scope.showFilterPanel = !$scope.showFilterPanel;
            getMonths();
            getYear();
            setFilterColor();
        }
         $scope.onRefreshClick = function () {
            $scope.isClearedRefreshedClicked = true;
            $scope.showFilterPanel = false;
            getDTMonthlyConsumtionFilteredData(dataFilter,pagination);
        }
         function setFilterColor() {
            if ($scope.showFilterPanel) {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "rgb(225, 236, 244)";
            } else {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "white";
            }
        }
        $scope.onMonthChange = function(selectedMonth) {
            $scope.selectedMonth = selectedMonth;
        };
        $scope.onYearChange = function(selectedYear){
            $scope.selectedYear = selectedYear;
        }
       
        $scope.onSubmitClick = function () {
            $scope.showFilterIcon = true;
                getDTMonthlyConsumtionFilteredData();
            }; 
            function SetDataInGrid(data)
            {
                 $scope.data = data.Data.DataGrid;
                  $scope.data.getRecords = getRecordsByPage;
                  $scope.data.currentPage = data.Data.CurrentPage;
                  $scope.data.totalRecords = data.Data.TotalRecords;
                  $scope.data.pageSize = data.Data.PageSize;
                  $scope.data.tableID = 'tableId';     
            }
            function getRecordsByPage(pagination) {
                    getDTMonthlyConsumtionFilteredData($scope.dataFilter,pagination);
                }
            function getDTMonthlyConsumtionFilteredData(dataFilter,pagination){
                $scope.data = {};
                var fromDate = dataFilter != null ? dataFilter.fromDate : null;
                var toDate = dataFilter != null ? dataFilter.toDate : null;
                var paginationFilter = null
                if (pagination != null) {
                    paginationFilter = DataStructureFactory.GetPaginationFilterInstance(pagination.currentPage, pagination.pageSize, pagination.totalRecords)
                }
            var rangeFilter = DataStructureFactory.GetRangeFilterInstance(fromDate, toDate, null, paginationFilter)
            var rangeFilter = {
                start: (paginationFilter && paginationFilter.Start) || 0,
                end: (paginationFilter && paginationFilter.End) || 10,
                totalRecords: (paginationFilter && paginationFilter.TotalRecords) || 0
            };
            var reportType = 'Monthly';
            var month = $scope.selectedMonth;
            var year = $scope.selectedYear;
            $scope.isShowLoading=true;
            var url = `http://localhost:5001/api/NetworkMetering/${reportType}/Reports/DTMonthlyConsumption/${month}/${year}?start=${rangeFilter.start}&end=${rangeFilter.end}&totalRecords=${rangeFilter.totalRecords}`;
            URIService.GetData(url)
                    .success(function (data) {
                        SetDataInGrid(data)
                    }).error(function (data) { });

        }
    }]
)