'use strict'

app.directive('a', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#' || attrs.redirect == "false") {
                elem.on('click', function (e) {
                    e.preventDefault();
                });
            }
        }
    };
});
