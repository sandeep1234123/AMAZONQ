app.controller("HierarchyPartialViewController", ['$scope', 'HierarchyService'
    , function ($scope, HierarchyService) {
        $scope.filter = {
        };
        $scope.onControlClick = function (values) {
            var value = values.split("~");
            if ($scope.isNotNullorUndefined(value[1])) {
                var dropDownType = value[0];
                switch (dropDownType) {
                    case 'hierarchyDefinition':
                        {
                            $scope.definitionID = value[1];
                            var returnValue = HierarchyService.hierarchyDefinition($scope.definitionID, $scope.filter, $scope.hierarchyDetails, $scope.hierarchy);
                            if (returnValue != undefined) {
                                $scope.filter = returnValue.filterObject;
                                $scope.lastMandatoryLevel = returnValue.lastMandatoryLevel;
                                $scope.levelDetails = returnValue.levelDetails;
                                $scope.levelArray = returnValue.levelArray;
                            }

                            break;
                        }
                    case 'hierarchyDetails':
                        {
                            var returnValue = HierarchyService.hierarchyDetails(value[1], value[2], $scope.filter, $scope.levelArray, $scope.levelDetails);
                            if (returnValue != undefined) {
                                $scope.filter = returnValue.filterObject;
                                $scope.levelDetails = returnValue.levelDetails;
                                $scope.levelArray = returnValue.levelArray;
                            }
                            break;
                        }
                }
            }
            else {
                if ($scope.filter.hierarchyDetailsLevels != null && $scope.filter.hierarchyDetailsLevels != undefined && $scope.filter.hierarchyDetailsLevels != '') {
                    for (var index = 1; index <= $scope.filter.hierarchyDetailsLevels; index++) {
                        $scope.filter['selectedHierarchyDetailsLevel' + index] = "";
                        $scope.filter.hierarchyDetails[Number(index) - 1].enableDropdown = false;
                    }
                }
            }
        }
        function setHierarchyDefinition() {
            HierarchyService.getNetworkHierarchyDefinition()
                .then(function (data) {
                    $scope.filter.hierarchyDefinition = data;
                    if ($scope.filter.hierarchyDefinition.length == 1) {
                        $scope.filter.showHierarchyDefinition = false;
                    }
                    else {
                        $scope.filter.showHierarchyDefinition = true;
                    }
                });
            HierarchyService.getNetworkHierarchyDetails()
                .then(function (data) {
                    $scope.hierarchyDetails = data;
                });
            HierarchyService.getNetworkHierarchy()
                .then(function (data) {
                    $scope.hierarchy = data;
                });
            $scope.filter.hierarchyFilter = true;
        }
        setHierarchyDefinition();

        $scope.$on('verifyAllMandatoryLevels', function (event, callback) {
            var result = null;
            var isHierarchySelected = false;
            if ($scope.isNotNullorUndefined($scope.levelArray)) {
                var result = HierarchyService.verifyAllMandatoryLevel($scope.levelArray, $scope.lastMandatoryLevel);
                isHierarchySelected = true;
            }
            callback(result, isHierarchySelected);
        });
        $scope.$on('requestHierarchyIDs', function (event) {
            HierarchyService.getHierarchyID($scope.filter)
                .then(function (hierarchyIDs) {
                    $scope.$emit('hierarchyIDsResponse', hierarchyIDs);
                });
        });
        $scope.$on('setHirerachyDetails', function (event, data) {
            $scope.filter.selectedHierarchyDefinition = Number(data[0].DefinitionID).toString();
            $scope.onControlClick('hierarchyDefinition' + '-' + $scope.filter.selectedHierarchyDefinition);

            angular.forEach(data, function (item) {
                $scope.filter['selectedHierarchyDetailsLevel' + item.Level] = item.LevelName
                $scope.onControlClick('hierarchyDetails' + '-' + $scope.filter['selectedHierarchyDetailsLevel' + item.Level] + '-' + item.Level)
            });
        });
    }]);
