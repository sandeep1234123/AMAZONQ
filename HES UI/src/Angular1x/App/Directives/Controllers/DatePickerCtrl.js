'use strict';
app.controller('DatePickerCtrl', ['$scope', '$resource', '$filter', 'AuthService'
    , function ($scope, $resource, $filter, AuthService) {
        var self = this;
        var translateFilter = $filter('translate');
        var userInfo = AuthService.getAuthInfo();
        var format = ConvertDateTimeFormat(userInfo.cultureInfo.DateTimeFormats.ShortDatePattern);
        var dateTimeFormat = ConvertDateTimeFormat(userInfo.cultureInfo.DateTimeFormats.FullDateTimePattern);
        self.minDate = moment(userInfo.dataLookBackDate, userInfo.cultureInfo.DateTimeFormats.ShortDatePattern);
        self.format = format != undefined ? format : "dd/MM/yyyy",
            $scope.$watch('self.data', function (newData) {
                self.data = newData;
                if (self.data != null) {
                }
            });

        self.disabledCalender = $scope.disabled;
        self.disabledDates = $scope.data
        self.enableTime = !_.isUndefined($scope.enableTime) && $scope.enableTime ? $scope.enableTime : false;

        self.disabled = function (date, mode) {
            var cloneMinimumDate = _.cloneDeep($scope.minimumDate);
            var isHoliday = false;

            if (areDatesLessThanMinData(cloneMinimumDate, date)) {
                isHoliday = true;
            }

            if (checkForDisabledDate(date)) {
                isHoliday = true;
            }

            return (mode === 'day' && isHoliday);
        };

        function areDatesLessThanMinData(date1, date2) {
            return date1.setHours(0, 0, 0, 0) > date2.setHours(0, 0, 0, 0)
        }

        function areDatesGreaterThanMaxData(date1, date2) {
            return date2.setHours(0, 0, 0, 0) > date1.setHours(0, 0, 0, 0)
        }


        function checkForDisabledDate(date) {
            var _status = false;
            if (Array.isArray(self.disabledDates)) {
                _.find(self.disabledDates, function (item) {
                    var _itemDate = new Date(item);
                    if (!_status)
                        _status = _itemDate.getFullYear() === date.getFullYear() && _itemDate.getMonth() == date.getMonth() && _itemDate.getDate() == date.getDate();
                });
            }
            return _status;
        }

        self.dateSelected = function () {
            $scope.selectedValue = new Date(self.dt);
        };

        self.open = false;
        self.selectedDate = $scope.selectedValue ? new Date($scope.selectedValue) : new Date();
        $scope.selectedValue = self.selectedDate;

        $scope.$watch('minimumDate', function (newData) {
            self.minDate = newData ? new Date(newData) : self.minDate;
            self.minDate = new Date(self.minDate); 
            self.minDate.setHours(0, 0, 0, 0);
            self.scheduleDatePicker.datepickerOptions.minDate = self.minDate;
        });
        $scope.$watch('maximumDate', function (newData) {
            if (newData) {
                self.maxDate = newData;
                self.scheduleDatePicker.datepickerOptions.maxDate = self.maxDate;
            }
        });
        self.scheduleDatePicker = {
            date: new Date(),
            format: self.enableTime ? dateTimeFormat : self.format,
            datepickerOptions: {}
        };
        $scope.$watch('selectedValue', function (newData) {
            if (newData == "Invalid Date") {
                newData = new Date();
            }
            if (newData) {
                self.selectedDate = newData ? new Date(newData) : new Date();
                if ($scope.$parent.SelectedDateValue != undefined && $scope.$parent.SelectedDateValue != null) {
                    $scope.$parent.SelectedDateValue(newData);
                }
            }
        });
        $scope.$watch('format', function (newData) {
            if (newData) {
                self.format = newData;
                self.scheduleDatePicker.format = self.format;
            }
        });
        self.openCalendar = function (event) {
            if (!self.selectedDate) {
                self.selectedDate = new Date();
            }
            self.open = true;
        };




        self.buttonBar = {
            show: true,
            now: {
                show: true,
                text: translateFilter("Menu.Now"),
                cls: 'btn-sm btn-default'
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

            self.dateSelected = function () {
                $scope.selectedValue = new Date(self.selectedDate);
            };
        function ConvertDateTimeFormat(dateTimeFormat) {
            return dateTimeFormat.replace("DD", "dd").replace("YYYY", "yyyy").replace('YY', 'yy');
        }
    }]);