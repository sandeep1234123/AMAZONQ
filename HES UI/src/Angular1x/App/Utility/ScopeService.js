'use strict'

app.service('ScopeService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {
    this.updateScope = function (obj) {
        return $http({
            method: 'POST',
            url: ngAuthSettings.apiServiceBaseUri + "api/Scope/UpdateScope",
            headers: { 'Content-Type': undefined },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("model", angular.toJson(data.model));
                return formData;
            },
            data: { model: obj }
        })
    };

    this.TotalPageNumber;

}]);
