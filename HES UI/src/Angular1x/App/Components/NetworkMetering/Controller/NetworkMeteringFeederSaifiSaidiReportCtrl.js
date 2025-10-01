'use strict';
app.controller("NetworkMeteringFeederSaifiSaidiReportCtrl",['$scope','$state','AuthService',
    '$rootScope','$filter','$http','$moment', '$stateParams','URIService',
    'DataStructureFactory',function($scope,$state,AuthService,
        $rootScope, $moment, $stateParams,$filter,http,URIService,DataStructureFactory){
            $scope.alertData = {
                    currentState: $state.current.name
                };
        var userInfo = AuthService.getAuthInfo();
        var tenantDateFormat = userInfo.cultureInfo.DateTimeFormats;
        $scope.showFilterPanel = false;
          $scope.showFilterIcon = false;
          $scope.isClearedRefreshedClicked = false;
          $scope.isShowLoading=false;
          $scope.dataFilter = {
                fromDate: '',
                toDate: ''

            }; 
          var today = new Date();
          var lastDateOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          $scope.filter = {
              minDate: new Date(2020, 0, 1),      
              maxDate: lastDateOfMonth,          
              fromDate: today,                   
              toDate: lastDateOfMonth
            };

          $scope.onFilterClick = function () {
            $scope.showFilterPanel = !$scope.showFilterPanel;
            setFilterColor();
        }
        function setFilterColor() {
            if ($scope.showFilterPanel) {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "rgb(225, 236, 244)";
            } else {
                document.getElementById("FilterBackgroundColor").style.backgroundColor = "white";
            }
        }

        $scope.onSubmitClick = function () {
            
            getFeederSaifiSaidiReportData();
          
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
                    getFeederSaifiSaidiReportData($scope.dataFilter,pagination);
                }
        function getFeederSaifiSaidiReportData(dataFilter,pagination){
            var from = $scope.filter.fromDate;
            var to = $scope.filter.toDate;   
            var formattedFrom = moment(from).format("YYYY-MM-DD");
            var formattedTo = moment(to).format("YYYY-MM-DD");  
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
             $scope.isShowLoading=true;
            var url =`http://localhost:5001/api/NetworkMetering/${reportType}/Reports/FeederSaifiSaidiReport/${formattedFrom}/${formattedTo}?start=${rangeFilter.start}&end=${rangeFilter.end}&totalRecords=${rangeFilter.totalRecords}`;
              URIService.GetData(url)
                    .success(function (data) {
                        SetDataInGrid(data)
                    }).error(function (data) { });     
        }

}])