'use strict';

app.service("SecurityService", ['md5'
    , function (md5) {
        this.ComputeHashWithUserNameAndPassword = function (userName, realm, password) {
            return md5.createHash(userName.toLowerCase() + ':' + realm + ':' + password);
        };
        this.ComputeHash = function (userName, realm, password, methodName, uri, nonce) {
            var ha1 = md5.createHash(userName.toLowerCase() + ':' + realm + ':' + password);
            var ha2 = md5.createHash(methodName + ':' + uri);
            return md5.createHash(ha1 + ':' + nonce + ':' + ha2);
        };
        this.GetAdditionalHeaderForReAuth = function (response, userName, password, method, uri) {
            var additionalHeaders = null;
            var authRequest = new AuthenticationRequest(userName);
            authRequest.Realm = response.realm;
            authRequest.Nonce = response.nonce;
            authRequest.Uri = uri;

            authRequest.Response = ComputeHashString(userName, authRequest.Realm, password, method, authRequest.Uri, authRequest.Nonce)
            var reAuthHeader = "Digest username = " + userName
                + ", realm = " + authRequest.Realm
                + ", nonce = " + authRequest.Nonce
                + ", uri = " + authRequest.Uri
                + ", response = " + authRequest.Response;

            additionalHeaders = { 'Re-Authentication': reAuthHeader };

            return additionalHeaders;
        }
        function ComputeHashString(userName, realm, password, methodName, uri, nonce) {
            var ha1 = md5.createHash(userName.toLowerCase() + ':' + realm + ':' + password);
            var ha2 = md5.createHash(methodName + ':' + uri);
            return md5.createHash(ha1 + ':' + nonce + ':' + ha2);
        };
    }]);





