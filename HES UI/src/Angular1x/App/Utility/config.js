'use strict'
app.service('config', ['$http', 'session', function ($http, session) {

    this.setConfigParams = function (callback) {
        var data;
        $http.get('Angular1x/config/config.json')
             .then(function (response) {
                 data = response.data;
                 session.setConfigParams(data);
                 callback();
             });

    };

    this.getConfigParams = function () {
        return session.getConfigParams();
    };

    this.setUser = function (user) {
        this._user = user;
        localStorage.setItem('session.user', JSON.stringify(user));
        return this;
    };

}]);
