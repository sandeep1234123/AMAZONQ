'use strict';

app.service("HierarchyService", ['$rootScope', 'URIService', '$filter'
    , function ($rootScope, URIService, $filter) {
        this.getNetworkHierarchyDefinition = function () {
            return URIService.GetData(URIService.GetNetworkHierarchyDefinitionUrl())
                .then(function (response) {
                    return angular.fromJson(response.data.Data);
                });
        }
        this.getNetworkHierarchyDetails = function () {
            return URIService.GetData(URIService.GetNetworkHierarchyDetailsUrl())
                .then(function (response) {
                    return angular.fromJson(response.data.Data);
                });
        }
        this.getNetworkHierarchy = function () {
            return URIService.GetData(URIService.GetNetworkHierarchyUrl())
                .then(function (response) {
                    return angular.fromJson(response.data.Data);
                });
        }
        this.getHierarchyID = function (filterObject) {
            var hierarchy = {}
            hierarchy['DefinitionID'] = filterObject.selectedHierarchyDefinition;
            for (var indexer = 1; indexer <= filterObject.hierarchyDetailsLevels; indexer++) {
                var variableName = 'selectedHierarchyDetailsLevel' + indexer;
                hierarchy['L' + indexer] = filterObject[variableName]
            }
            return URIService.SubmitNewRequest(URIService.GetHierarchyIDUrl(), hierarchy)
                .then(function (response) {
                    if (response.data.Data != null && response.data.Data.length > 0) {
                        return response.data.Data.join(', ');
                    }
                });
        }
        this.hierarchyDefinition = function (definitionID, filterObject, hierarchyDetails, hierarchy) {
            for (var indexer = 1; indexer <= filterObject.hierarchyDetailsLevels; indexer++) {
                filterObject['selectedHierarchyDetailsLevel' + indexer] = "";
                filterObject['L' + indexer] = [];
            }

            var levelDetails = [];
            var levelArray = [];

            filterObject.hierarchyDetails = $filter('filter')(hierarchyDetails, { DefinitionID: definitionID });
            var mandatory = $filter('filter')(filterObject.hierarchyDetails, { Mandatory: true })
            var lastMandatoryLevel = mandatory[mandatory.length - 1].Level;
            angular.forEach(filterObject.hierarchyDetails, function (item) {
                levelDetails.push({ 'Level': 'L' + item.Level, 'LevelName': 'L' + item.Level + '_Name' })
                levelArray.push({ 'Level': item.Level })
                item['enableDropdown'] = false;
                if (item.Level == 1) {
                    item['enableDropdown'] = true;
                }
            });

            filterObject.hierarchy = $filter('filter')(hierarchy, { DefinitionID: definitionID });
            filterObject.hierarchyDetailsLevels = filterObject.hierarchyDetails.length;

            var uniqueObjects = {};
            filterObject.hierarchy.forEach(e => {
                var key = e['L1'] + '-' + e['L1_Name'];
                if (!uniqueObjects.hasOwnProperty(key)) {
                    uniqueObjects[key] = e;
                }
            });
            filterObject['L1'] = Object.values(uniqueObjects).map(e => ({ 'L1': e['L1'], 'L1_Name': e['L1_Name'] }))
            return { filterObject, lastMandatoryLevel, levelDetails, levelArray };
        }
        this.hierarchyDetails = function (selectedLevelName, level, filterObject, levelArray, levelDetails) {
            var currentLevelNumber = Number(level);
            angular.forEach(filterObject.hierarchyDetails, function (item) {
                if (item.Level > currentLevelNumber) {
                    item['enableDropdown'] = false;
                    filterObject['selectedHierarchyDetailsLevel' + item.Level] = "";
                    levelArray[item.Level - 1]['SelectedLevelName'] = "";
                }
            })
            levelArray[level - 1]['SelectedLevelName'] = selectedLevelName;
            var filterDataObj = {};
            filterDataObj[levelDetails[currentLevelNumber - 1]['Level']] = selectedLevelName;
            var selectednextLevel = $filter('filter')(filterObject.hierarchy, filterDataObj);
            if (levelDetails.length != currentLevelNumber) {
                var uniqueObjects = {};
                selectednextLevel.forEach(e => {
                    if ($rootScope.isNotNullorUndefined(e[levelDetails[currentLevelNumber]['Level']])) {
                        var key = e[levelDetails[currentLevelNumber]['Level']] + '-' + e[levelDetails[currentLevelNumber]['LevelName']];
                        if (!uniqueObjects.hasOwnProperty(key)) {
                            uniqueObjects[key] = e;
                        }
                    }

                });

                var nextLevel = levelDetails[currentLevelNumber]['Level']
                var nextLevelName = levelDetails[currentLevelNumber]['LevelName']

                filterObject[levelDetails[currentLevelNumber]['Level']] = Object.values(uniqueObjects).map(e => {
                    var obj = {};
                    obj[nextLevel] = e[nextLevel];
                    obj[nextLevelName] = e[nextLevelName];
                    return obj;
                });

                filterObject.hierarchyDetails[level]['enableDropdown'] = true;
                return { filterObject, levelDetails, levelArray };
            }
        }
        this.verifyAllMandatoryLevel = function (levelArray, lastMandatoryLevel) {
            var flag = true;
            if ($rootScope.isNotNullorUndefined(levelArray)) {
                if ($rootScope.isNotNullorUndefined(levelArray[0].SelectedLevelName)) {
                    angular.forEach(levelArray, function (item) {
                        if (item.Level <= lastMandatoryLevel) {
                            if (!$rootScope.isNotNullorUndefined(item.SelectedLevelName)) {
                                flag = false;
                                return false;
                            }
                        }
                    });
                }
                else {
                    flag = false;
                }
            }
            return flag;
        }
    }]);





