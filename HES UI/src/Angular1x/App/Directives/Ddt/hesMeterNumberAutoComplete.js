'use strict'

app.directive('hesMeterNumberAutoComplete', function () {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            selectedValue: '=',
            selectedValid: '=',
            isRangeValid: '=',
            placeholder: '@',
            disabled: '=',
            errormessage: '@',
            target:'@',
            enteredtext:'=?'
        },
        replace: false,
        controller: autoCompleteController, //Embed a custom controller in the directive
        controllerAs: 'ctrl',
        templateUrl: 'Angular1x/App/Shared/PartialView/_autoComplete.html',
    };
});
