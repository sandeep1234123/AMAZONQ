'use strict'
app.controller('GridFilterCtrl', ['$scope', '$rootScope', '$moment', '$filter', 'CommonDataFactory', GridFilterCtrl]);

function GridFilterCtrl($scope, $rootScope, $moment, $filter, CommonDataFactory) {
    var translateFilter = $filter('translate');
    $scope.autoCompleteMeterData = "";
    $scope.filterData = $scope.$parent.filterData != undefined ? $scope.$parent.filterData : $scope.filterData;
    $scope.filterTemplateUrl = $scope.filterData.filterTemplateUrl ? $scope.filterData.filterTemplateUrl : 'Angular1x/App/Shared/PartialView/gridFilter/gridFilterPanel.html';
    $scope.filter = $scope.filterData.filter;
    //Added Auto Completed meter no
    CommonDataFactory.loadStates().then(function (data) {
        $scope.autoCompleteMeterData = data;
    });

    $scope.applyFilter = function () {
        if ($scope.filterData.additionalFilter != undefined
            && $scope.filterData.additionalFilter != ""
            && $scope.filterData.additionalFilter != null) {
            $scope.filter.AdditionalFilter = $scope.filterData.additionalFilter
        }
        $scope.filterData.applyFilter($scope.filter);
    }

    $scope.clearFilter = function () {
        $scope.filterData.clearFilter();
    }
    $scope.setDate = function () {
        if ($scope.filterData.flag == 'icon') {
            $scope.filterData.flag = '';
        }
        else {
            $scope.filterData.filter.startDate = $scope.filterData.filter.date.startDate;
            $scope.filterData.filter.endDate = $scope.filterData.filter.date.endDate;
        }

    }
    $scope.enableTime = !_.isUndefined($scope.filterData.enableTime) ? $scope.filterData.enableTime : false;
    $scope.format = $scope.enableTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";
    $scope.minMaxValidation = !_.isUndefined($scope.filterData.minMaxValidation) ? $scope.filterData.minMaxValidation : false;

    $scope.$watch('filterData.disableMeterNumber', function (newData) {
        $scope.disableMeterNumber = !_.isUndefined(newData) ? newData : false;
    })

    $scope.buttonBar = {
        show: true,
        now: {
            show: false,
        },
        today: {
            show: true,
            text: translateFilter("Menu.Today"),
            cls: 'btn-sm btn-default'
        },
        clear: {
            show: false,
        },
        date: {
            show: true,
            text: translateFilter("Menu.Date"),
            cls: 'btn-sm btn-default'
        },
        time: {
            show: true,
            text: translateFilter("Menu.Time"),
            cls: 'btn-sm btn-default'
        },
        close: {
            show: true,
            text: translateFilter("Menu.Close"),
            cls: 'btn-sm btn-default'
        },
        cancel: {
            show: true,
            text: translateFilter("Menu.Cancel"),
            cls: 'btn-sm btn-default'
        }
    },

        $scope.date = {};

    if ($scope.minMaxValidation) {
        if ($scope.filter.fromDate == undefined) {
            $scope.fromDatepickerOptions = {
                minDate: $moment($scope.filter.minimumDate, "DD/MM/YYYY HH:mm:ss", true),
                maxDate: $moment($scope.filter.toDate)
            };
        }
        else {
            $scope.fromDatepickerOptions = {
                minDate: $moment($scope.filter.fromDate),
                maxDate: $moment($scope.filter.toDate)
            };
        }
    } else {
        $scope.fromDatepickerOptions = {};
        $scope.toDatepickerOptions = {};
    }

    $scope.fromDateOpenCalendar = function () {
        if (!$scope.filter.fromDate) {
            $scope.filter.fromDate = new Date();
        }
        $scope.date.fromDateOpen = true;
    };
    $scope.FormatData = function (columnData, columnFormat) {
        return $rootScope.FormatData(columnData, columnFormat);
    }
    $scope.toDateOpenCalendar = function () {
        if (!$scope.filter.toDate) {
            $scope.filter.toDate = new Date();
        }
        $scope.date.toDateOpen = true;
    };
    $scope.openDatePicker = function () {
        $scope.filterData.openDatePicker();
    }
    $scope.onControlClick = function (selectedValue) {
        if ($scope.$parent.onControlClick != undefined && $scope.$parent.onControlClick != null) {
            $scope.$parent.onControlClick(selectedValue);
        }
    }
    $scope.onCheckboxClicked = function (selectedValue) {
        if ($scope.$parent.onCheckboxClicked != undefined && $scope.$parent.onCheckboxClicked != null) {
            $scope.$parent.onCheckboxClicked(selectedValue);
        }
    }
    $scope.inputElementFocus = function (selectedValue, inputID) {
        if ($scope.$parent.inputElementFocus != undefined && $scope.$parent.inputElementFocus != null) {
            $scope.$parent.inputElementFocus(selectedValue, inputID);
        }
    }
    $scope.inputElementBlur = function (selectedValue, inputID) {
        if ($scope.$parent.inputElementBlur != undefined && $scope.$parent.inputElementBlur != null) {
            $scope.$parent.inputElementBlur(selectedValue, inputID);
        }
    }
    $scope.getMinValue = function (value) {
        var minValue = value;
        if ($scope.$parent.getMinValue != undefined && $scope.$parent.getMinValue != null) {
            minValue = $scope.$parent.getMinValue(value);
        }
        return minValue;
    }
    $scope.getMaxValue = function (value) {
        var maxValue = value;
        if ($scope.$parent.getMaxValue != undefined && $scope.$parent.getMaxValue != null) {
            maxValue = $scope.$parent.getMaxValue(value);
        }
        return maxValue;
    }
}