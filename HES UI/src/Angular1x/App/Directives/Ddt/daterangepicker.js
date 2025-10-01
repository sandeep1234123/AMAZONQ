'use strict'
app.directive('daterangepicker', function () {
    return {
        restrict: 'A',
        scope: {
            options: '=daterangepicker',
            start: '=dateBegin',
            end: '=dateEnd'
        },
        link: function (scope, element) {
            element.daterangepicker(scope.options, function (start, end) {
                scope.start = start.format('dd/MM/yyyy');
                scope.end = end.format('dd/MM/yyyy');
                scope.$apply();
            });
        }
    };
});
