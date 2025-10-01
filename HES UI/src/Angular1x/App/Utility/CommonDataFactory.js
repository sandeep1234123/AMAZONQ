'use strict'
app.factory('CommonDataFactory', ['$q', 'URIService',
  function ($q, URIService) {
    var factory = {};
    factory.meterNumberData = [];
    factory.SearchMeters = function (searchText, target) {
      searchText == "" ? null : searchText;
      factory.meterPPEMNumberData = [];
      var deferred = $q.defer();
      URIService.GetData(URIService.GetSearchList(target, searchText))
        .success(function (response) {
            if (response.Data.length > 0) {
              factory.meterNumberData = response.Data.map(function (state) {
                return {
                  value: state.MeterId,
                  display: state.MeterId
                };
              });
            }
         
          deferred.resolve(factory.meterNumberData);

        })
      return deferred.promise
    }

    factory.loadStates = function loadStates(isUpdate) {
      var deferred = $q.defer();
      if (factory.meterNumberData.length > 0 && !isUpdate) {
        deferred.resolve(factory.meterNumberData);
        return deferred.promise
      } else {
        return deferred.promise
      }
    }

   
    factory.clearfactoryData = function () {
      factory.meterNumberData = [];
    }
    return factory;
  }]);
