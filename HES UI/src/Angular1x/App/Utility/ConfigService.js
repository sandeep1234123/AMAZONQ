'use strict'
app.service('ConfigService', ['comCrudService',function (comCrudService) {
    var _configInfo = '';

    this.setConfigInfo = function (callback) {

        var promise = comCrudService.getList('Angular1x/config/config.json');
        promise.then(function (configData) {
            _configInfo = configData.data;
            callback();
        });
    };
    this.getConfigInfo = function () {
        return _configInfo;
    }
}]);