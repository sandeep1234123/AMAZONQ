'use strict'
app.service('AuthService', ['localStorageService', function (localStorageService) {
    var _authInfo = '';
    var _accessToken = '';
    this._isAuthenticated = false;
    this._isAccessToken = '';
    this._authInfo = '';
    
    this.setAuthInfo = function (AuthInfo) {
        _accessToken = AuthInfo.accessToken;
        this._isAuthenticated = true;
        _authInfo = AuthInfo;
    };
    
    this.getAuthInfo = function () {
        var authInfo = localStorageService.get('authInfo');
        if (authInfo) {
            _authInfo = authInfo;
        }
        return _authInfo;
    };

    this.isAuthorised = function (stateName) {
        var autohorisedStates = [{ "core.login": true }, { "app.dashboard": true }, {}]
    };
}]);