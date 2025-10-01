app.service('comCrudService', ['$http',function ($http) {

    this.post = function (jsnData,reqUrl) {
        var data = jsnData
        var request = $http({
            method: "post",
            url: reqUrl,
            dataType: 'json',
            data: data,
            headers: { 'Content-Type': 'application/json' },
        });
        return request;
    }
    //Get All Employees 
    this.getList = function (reqUrl) {
        return $http.get(reqUrl);
    }
}]);

app.factory('alertService',[ function () {
    var success = {},
        alert = false;
    return {
        getSuccess: function () {
            return success;
        },
        setSuccess: function (value) {
            success = value;
            alert = true;
        },       
        reset: function () {
            success = {};
            alert = false;
        },
        hasAlert: function () {
            return alert;
        }
    }
}]);
