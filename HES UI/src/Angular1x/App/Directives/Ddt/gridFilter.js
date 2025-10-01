'use strict'

app.directive('gridFilter', function () {
    return {
        restrict: 'E',
        scope: {
            filterData: '='
        },
        controller: GridFilterCtrl,
        templateUrl: 'Angular1x/App/Shared/PartialView/gridFilter/gridFilter.html',
    }
})
