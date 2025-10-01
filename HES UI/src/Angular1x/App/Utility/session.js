'use strict'

app.service('session', ['$log', 'localStorage', function ($log, localStorage) {

    // Instantiate data when service
    // is loaded
    this._user = JSON.parse(localStorage.getItem('session.user'));
    this._accessToken = JSON.parse(localStorage.getItem('session.accessToken'));
    this._configParam = JSON.parse(localStorage.getItem('session.configParams'));

    this.getUser = function () {
        return this._user;
    };

    this.setUser = function (user) {
        this._user = user;
        localStorage.setItem('session.user', JSON.stringify(user));
        return this;
    };
    this.setConfigParams = function (data) {
        this._configParam = data;
        localStorage.setItem('session.configParams', JSON.stringify(data))
    };

    this.getConfigParams = function () {
        return this._configParam;
    };

    this.getAccessToken = function () {
        return this._accessToken;
    };

    this.setAccessToken = function (token) {
        this._accessToken = token;
        localStorage.setItem('session.accessToken', token);
        return this;
    };

    /**
     * Destroy session
     */
    this.destroy = function destroy() {
        this.setUser(null);
        this.setAccessToken(null);
    };


}]);
