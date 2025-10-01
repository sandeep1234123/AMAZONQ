'use strict'

app.directive('hesDatePicker', function () {
    return {
        restrict: 'E',
        scope: {
            maximumDate: '=',
            minimumDate: '=',
            data: '=',
            selectedValue: '=',
            enableTime: '=',
            disabled: '=',
            format: '=',
        },
        replace: false,
        controller: 'DatePickerCtrl', //Embed a custom controller in the directive
        controllerAs: 'DatePicker',
        templateUrl: 'Angular1x/App/Shared/PartialView/_datePicker.html',
    };
});
