'use strict';
app.controller('autoCompleteController', ['$rootScope', '$scope', 'CommonDataFactory', '$filter', autoCompleteController]);
function autoCompleteController($rootScope, $filter, $scope, CommonDataFactory,) {
    var self = this;
    self.simulateQuery = false;
    var translateFilter = $filter('translate');
    self.isDisabled = $scope.disabled || false;
    self.noCache = false;
    self.selectedItem = $scope.selectedValue;
    self.placeholder = $scope.placeholder || translateFilter("Menu.EnterMeterNumber");
    self.targetDevice = $scope.target || "meter";
    self.errormessage = $scope.errormessage || "Please select meter number";
    self.rangeerrormessage = $scope.errormessage != undefined ? "Gateway Number Range Invalid" : "Meter Number Range Invalid";
    // list of states to be displayed
    self.states = $scope.data;
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = searchTextChange;
    self.newState = newState;
    self.isValid = $scope.selectedValid || false;
    self.isRangeValid = $scope.isRangeValid;
    $scope.$watch(function () { return $scope.disabled }, function (newVal, oldVal) {
        self.isDisabled = newVal == true || newVal == undefined ? false : true;
    }, true);
    $scope.$watch(function () { return $scope.selectedValid }, function (newVal, oldVal) {
        self.isValid = newVal;
    }, true);
    $scope.$watch(function () { return $scope.isRangeValid }, function (newVal, oldVal) {
        self.isRangeValid = newVal;
    }, true);
    $scope.$watch('data', function (newData) {
        self.states = newData;
    })
    $scope.$watch('placeholder', function (newData) {
        if ($rootScope.isNotNullorUndefined(newData))
            self.placeholder = newData;
    })
    $scope.$watch('target', function (newData) {
        if ($rootScope.isNotNullorUndefined(newData))
            self.targetDevice = newData;
    })
    $scope.$watch('selectedValue', function (newData) {
        //    self.selectedItem = newData;
        if (newData) {
            self.selectedItem = {
                display: newData,
                value: newData.toLowerCase()
            };
            if ($scope.$parent.SelectedValue != undefined && $scope.$parent.SelectedValue != null) {
                $scope.$parent.SelectedValue(newData);
            }
        }
    })

    $scope.$on('clearAutoCompleteSelectedValue', function (event, data) {
        self.selectedItem = "";
        self.searchText = "";
    });

    function newState(state) {
        $scope.selectedValue = JSON.stringify(state);
    }
    function querySearch(query) {
        if (query != null) {
            $scope.enteredtext = self.searchText;
            return CommonDataFactory.SearchMeters(query, self.targetDevice);//  query ? self.states.filter(createFilterFor(query)) : self.states; 
        }

    }
    function searchTextChange(text) {
        $scope.selectedValue = "";
    }
    function selectedItemChange(item) {
        if (item) {
            $scope.selectedValue = item.display;
            $scope.selectedValid = false;
        }
    }
    //filter function for search query
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (angular.lowercase(state.value).indexOf(lowercaseQuery) === 0);
        };
    }
}
