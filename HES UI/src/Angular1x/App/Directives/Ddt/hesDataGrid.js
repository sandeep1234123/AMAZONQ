'use strict'
app.directive('hesDataGrid', function () {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            onLinkAction: '=onLinkAction',
            onDeleteAction: '=onDeleteAction',
            onUpdateAction: '=onUpdateAction',
            onSelectAction: '=onSelectAction',
            performAction: '=performAction',
            searchKeyValue: '=searchKeyValue',
            downloadAction: '=downloadAction'
        },
        controller: DatagridCtrl, //Embed a custom controller in the directive
        controllerAs: 'vm',
        templateUrl: 'Angular1x/App/Shared/PartialView/DataGrid/table.html',
    };
});
 