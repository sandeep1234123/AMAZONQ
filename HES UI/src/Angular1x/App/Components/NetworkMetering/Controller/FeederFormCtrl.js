'use strict';

app.controller("FeederFormCtrl", ['URIService', '$state'
    , 'alertService', '$filter', '$rootScope', '$scope', '$stateParams'
    , function (URIService, $state, alertService, $filter, $rootScope,
        $scope, $stateParams) {

        var vm = this;
        var translateFilter = $filter('translate');
        vm.editFeederCode = $stateParams.feederCode;
        vm.formLabel = vm.editFeederCode ? translateFilter("Menu.Edit") : translateFilter("Menu.AddFeeder");
        $rootScope.activeState = 'app.NetworkMetering.FeederForm';
        vm.alertData = {};
        vm.alertDataForAssociationAndDisassociation = {};
        vm.MultiplyingFactor = 1;
        vm.ExternalCTRatio = "1/1";
        vm.ExternalPTRatio = "1/1";
        vm.disableSubmitButton = false;
        vm.ShowAssociateContainer = false;
        vm.isMeterValid = false;
        vm.disableAssociateButton = true;
        vm.ShowAssociateContainer = false;
        vm.isAssociatedMeterAvailable = false;
        vm.ShowDisassociationContainer = false;
        vm.isDisassociatedMeterAvailable = false;
        vm.IsDisabled = vm.editFeederCode ? true : false;
        $scope.gridDataDetails = [];
        $scope.showHierarchy = false;

        vm.maxDate = new Date();

        vm.SelectedTypeOfFeeder = 'Industrial'
        vm.TypeOfFeeder = [
            { id: '1', Name: 'Industrial', value: 'Industrial', Selected: true },
            { id: '2', Name: 'Independent', value: 'Independent', Selected: false },
            { id: '3', Name: 'Agriculture', value: 'Agriculture', Selected: false },
            { id: '4', Name: 'Mix', value: 'Mix', Selected: false },
        ]
        vm.VoltageLevel = '33'
        vm.ddlVoltageLevel = [
            { id: '1', Name: '33KV', value: '33', Selected: true },
            { id: '2', Name: '11KV', value: '11', Selected: false },
        ]

        vm.SelectedEnergyType = 'Actual'
        vm.TypeOfEnergy = [
            { id: '1', Name: 'Actual', value: 'Actual', Selected: true },
            { id: '2', Name: 'Assessed', value: 'Assessed', Selected: false },
        ]

        vm.EnableAddMeter = function (event, spanID) {
            vm.ClearErrorFieldMessage(spanID)
            if ($scope.isNotNullorUndefined(vm.FeederName)
                && $scope.isNotNullorUndefined(vm.FeederCode)
                && $scope.isNotNullorUndefined(vm.FeederCapacity)) {
                vm.disableAssociateButton = false;
            }
            else {
                vm.disableAssociateButton = true;
            }
        }
        vm.ClearErrorFieldMessage = function (spanID) {
            let element = document.getElementById(spanID);
            element.setAttribute("hidden", "hidden");
        }
        vm.submitForm = function () {

            var requiredNameResult = SetErrorForRequiredField(vm.FeederName, "reqFeederName", "Name is required.")
            var requiredCodeResult = SetErrorForRequiredField(vm.FeederCode, "reqFeederCode", "Code is required.")

            var result = false;
            if (requiredNameResult && requiredCodeResult && !vm.isAssociatedMeterAvailable) {
                result = true;
            }
            if (vm.isDisassociatedMeterAvailable) {
                result = ValidateDisassociateMeter()
            }

            if (vm.isAssociatedMeterAvailable) {
                result = ValidateAssociateMeter()
            }
            if (result) {
                if ($scope.showHierarchy) {
                    var verfifyMandatoryLevels = false;
                    verifyAllMandatoryLevels(function (result, isHirarchySelected) {
                        if (isHirarchySelected) {
                            verfifyMandatoryLevels = result;
                            if (verfifyMandatoryLevels == true) {
                                $scope.$broadcast('requestHierarchyIDs');
                            }
                            else {
                                vm.disableSubmitButton = false;
                                vm.alertData = {
                                    message: translateFilter("Menu.SelectTheHierarchy"),
                                    showAlert: true,
                                    type: 'error'
                                }
                            }
                        }
                        else {
                            createFeederRequest();
                        }
                    });
                }
                else {
                    createFeederRequest();
                }

            }
        }
        vm.back = function () {
            $state.go('app.NetworkMetering.FeederList');
        }
        vm.isAssociateClicked = function () {
            vm.ShowAssociateContainer = true;
            vm.isAssociatedMeterAvailable = true;
            vm.ShowAssociatedMeter = false;
        }
        vm.Clear = function () {
            vm.ShowAssociateContainer = false;
            vm.isAssociatedMeterAvailable = false;
            vm.ShowDisassociationContainer = false;
            vm.isDisassociatedMeterAvailable = false;
            vm.selectedMeter = "";
            vm.MultiplyingFactor = 1;
            vm.ExternalCTRatio = "1/1";
            vm.ExternalPTRatio = "1/1";
            vm.Initial_kWh = "";
            vm.Initial_kVAh = "";
            if (vm.OldMeterID) {
                vm.ShowDisassociateMeter = true;
            }
            else {
                vm.ShowAssociatedMeter = true;
            }
            let element = document.getElementsByClassName('reqError');
            for (let i = 0; i < element.length; i++) {
                element[i].setAttribute("hidden", "hidden");
            }
            vm.alertDataForAssociationAndDisassociation = { showAlert: false }
        }
        vm.isChangeMeterClicked = function () {
            vm.isAssociateClicked();
            vm.isDisassociateClicked();
        }
        vm.isDisassociateClicked = function () {
            vm.ShowDisassociationContainer = true;
            vm.isDisassociatedMeterAvailable = true;

            vm.ShowDisassociateMeter = false;
        }
        $scope.openCalendar = function (e, picker) {
            $scope.Calender = {};
            if (!vm.InstalledOn) {
                vm.InstalledOn = new Date();
            }
            $scope.Calender.open = true;
            $scope.$broadcast("GetCalenderStatus", $scope.Calender);
        };
        $scope.SelectedDateValue = function (selectedDateValue) {
            if (vm.ShowAssociateContainer) {
                CheckMeterAssociation(vm.selectedMeter, vm.AssociationDate);
            }
        }
        $scope.SelectedValue = function (selectedMeterNumber) {
            if (vm.ShowAssociateContainer) {
                vm.ClearErrorFieldMessage('reqMeterNumber');
                CheckMeterAssociation(vm.selectedMeter, vm.AssociationDate);
            }
        }
        if (vm.editFeederCode) {
            vm.ShowDisassociateMeter = false;
            vm.ShowAssociatedMeter = false;

            URIService.GetData(URIService.GetFeederDetailsUrl(vm.editFeederCode))
                .success(function (response, status, headers, config) {
                    if (response.Data.length > 0) {
                        var feederDetails = response.Data[0];
                        vm.FeederName = feederDetails.FeederName;
                        vm.FeederCode = feederDetails.FeederCode;
                        vm.VoltageLevel = feederDetails.VoltageLevel.toString();
                        vm.SelectedTypeOfFeeder = feederDetails.TypeOfFeeder;
                        vm.SelectedEnergyType = feederDetails.EnergyType;
                        vm.Latitude = feederDetails.Latitude;
                        vm.Longitude = feederDetails.Longitude;
                        vm.FeederCapacity = feederDetails.FeederCapacity;
                        vm.InstalledOn = moment(feederDetails.InstalledOn, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');

                        if ($scope.showHierarchy) { getOfclHrchy(vm.FeederCode) };
                        if ($scope.isNotNullorUndefined(feederDetails.MeterID)) {
                            vm.OldMeterID = feederDetails.MeterID;
                            vm.OldMF = feederDetails.MF;
                            vm.OldExternalCTRatio = feederDetails.ExternalCTRatio;
                            vm.OldExternalPTRatio = feederDetails.ExternalPTRatio;
                            vm.OldMeterDateOfAssociation = moment(feederDetails.MeterDateOfAssociation
                                , 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                            vm.OldInitial_kWh = feederDetails.Initial_kWh;
                            vm.OldInitial_kVAh = feederDetails.Initial_kVAh;
                            vm.ShowDisassociateMeter = true;
                        }
                        else {
                            vm.ShowAssociatedMeter = true;
                        }
                    }
                })
        }

        function createFeederRequest() {
            vm.disableSubmitButton = true;
            if (vm.editFeederCode) {
                var editFeederObject = {
                    "FeederName": vm.FeederName,
                    "FeederCode": vm.FeederCode,
                    "VoltageLevel": parseFloat(vm.VoltageLevel),
                    "TypeofFeeder": vm.SelectedTypeOfFeeder,
                    "EnergyType": vm.SelectedEnergyType,
                    "Latitude": vm.Latitude,
                    "Longitude": vm.Longitude,
                    "FeederCapacity": vm.FeederCapacity,
                    "Ofclhrchy": $scope.showHierarchy ? $scope.Ofclhrchy : null
                }
                URIService.SubmitNewRequest(URIService.GetUpdateFeederUrl(vm.FeederCode), editFeederObject)
                    .success(function (response, status, headers, config) {
                        vm.disableSubmitButton = false;
                        if (response.Data >= 0) {
                            if (!vm.isAssociatedMeterAvailable && !vm.isDisassociatedMeterAvailable) {
                                vm.message = translateFilter("Menu.Feeder") + " " + vm.FeederName + " " + translateFilter("Menu.FeederUpdated");
                                Redirect('app.NetworkMetering.FeederList', vm.message)
                            }
                            else if (vm.isDisassociatedMeterAvailable && !vm.isAssociatedMeterAvailable) {
                                CreateDisassociateMeterRequest();
                            }
                            else if (vm.isAssociatedMeterAvailable && vm.isDisassociatedMeterAvailable) {
                                CreateChangeMeterRequest();
                            }
                            else if (vm.isAssociatedMeterAvailable && !vm.isDisassociatedMeterAvailable) {
                                CreateAssociateMeterRequest();
                            }
                        }
                    }).error(function (data, status, headers, config) {
                        vm.disableSubmitButton = false;
                        vm.alertData = {
                            message: translateFilter("Menu.Error_Message"),
                            showAlert: true,
                            type: 'error'
                        }
                    });

            }
            else {
                var obj = {
                    "FeederName": vm.FeederName,
                    "FeederCode": vm.FeederCode,
                    "VoltageLevel": parseFloat(vm.VoltageLevel),
                    "InstalledOn": setDate(vm.InstalledOn),
                    "TypeofFeeder": vm.SelectedTypeOfFeeder,
                    "EnergyType": vm.SelectedEnergyType,
                    "Latitude": vm.Latitude,
                    "Longitude": vm.Longitude,
                    "FeederCapacity": vm.FeederCapacity,
                    "Ofclhrchy": $scope.showHierarchy ? $scope.Ofclhrchy : null
                }
                URIService.SubmitNewRequest(URIService.GetFeederNewUrl(), obj)
                    .success(function (response, status, headers, config) {
                        vm.disableSubmitButton = false;
                        if (response.Data >= 0) {
                            if (vm.isAssociatedMeterAvailable) {
                                CreateAssociateMeterRequest();
                            }
                            else {
                                vm.message = vm.FeederName + " " + translateFilter("Menu.FeederCreated");
                                Redirect('app.NetworkMetering.FeederList', vm.message)
                            }

                        }
                    }).error(function (data, status, headers, config) {
                        vm.disableSubmitButton = false;
                        vm.alertData = {
                            message: translateFilter("Menu.Error_Message"),
                            showAlert: true,
                            type: 'error'
                        }
                    });
            }
        }
        function Redirect(path, message) {
            alertService.setSuccess({
                message: message,
                redirectState: path
            });
            $state.go(path);
        }
        function CheckMeterAssociation(selectedMeterNumber, associationDate) {
            URIService.GetData(URIService.GetFeederAssociatedMeterUrl(selectedMeterNumber, setDate(associationDate)))
                .success(function (response, status, headers, config) {
                    vm.isMeterValid = true;
                    vm.alertDataForAssociationAndDisassociation = {
                        showAlert: false,
                    }
                    if (response.Data.length > 0) {
                        vm.isMeterValid = false;
                        vm.alertDataForAssociationAndDisassociation = {
                            message: translateFilter("Menu.MeterNumberAssociated") + " " + selectedMeterNumber + " " + translateFilter("Menu.IsAssociated") + " " + response.Data[0].NwDeviceCode + " " + translateFilter("Menu.Since") + " " + $scope.FormatData(response.Data[0].DateofAssociation, 'date'),
                            showAlert: true,
                            type: 'error'
                        }
                    }
                })
        }
        function SetErrorForRequiredField(value, spanId, message) {
            var result = true;
            if (!$scope.isNotNullorUndefined(value)) {
                result = false;
                document.getElementById(spanId).innerHTML = "* " + message;
            }
            return result;
        }
        function ValidateAssociateMeter() {
            var result = false;
            var requiredMeterResult = true;
            var associationDateValidator = true;
            if (!$scope.isNotNullorUndefined(vm.selectedMeter)) {
                var requiredMeterResult = false;
                document.getElementById('reqMeterNumber').innerHTML = "* " + "Meter Number is required.";
            }
            var requiredInitialkWhResult = SetErrorForRequiredField(vm.Initial_kWh, "reqInitialkWh", "Initial kWh is required.")
            var requiredInitialkVAhResult = SetErrorForRequiredField(vm.Initial_kVAh, "reqInitialkVAh", "Initial kVAh is required.")
            var requiredfactorResult = SetErrorForRequiredField(vm.MultiplyingFactor, "reqMultipyingFactor", "Multiplying Factor is required.")
            var requiredCTRatioResult = SetErrorForRequiredField(vm.ExternalCTRatio, "reqExternalCTRatio", "External CT Ratio is required.")
            var requiredPTRatioResult = SetErrorForRequiredField(vm.ExternalPTRatio, "reqExternalPTRatio", "External PT Ratio is required.")

            if (Date.parse(vm.AssociationDate) < Date.parse(vm.InstalledOn)) {
                associationDateValidator = false;

                vm.alertDataForAssociationAndDisassociation = {
                    message: translateFilter("Menu.AssociationDateSmaller"),
                    showAlert: true,
                    type: 'error'
                }
            }

            if (requiredMeterResult
                && requiredInitialkWhResult && requiredInitialkVAhResult
                && requiredfactorResult && requiredCTRatioResult && requiredPTRatioResult && associationDateValidator) {
                result = true;
            }
            return result;
        }
        function ValidateDisassociateMeter() {
            var result = false;
            var disassociationdateValidator = true;

            var requiredFinalkWhResult = SetErrorForRequiredField(vm.Final_kWh, "reqFinalkWh", "Final kWh is required.")
            var requiredFinalkVAhResult = SetErrorForRequiredField(vm.Final_kVAh, "reqFinalkVAh", "Final kVAh is required.")
            if (Date.parse(vm.OldDateOfAssociation) > Date.parse(vm.DisassociationDate)) {
                disassociationdateValidator = false;
                vm.alertDataForAssociationAndDisassociation = {
                    message: translateFilter("Menu.DisassociationDateSmaller"),
                    showAlert: true,
                    type: 'error'
                }
            }

            if (disassociationdateValidator
                && requiredFinalkWhResult && requiredFinalkVAhResult) {
                result = true;
            }
            return result;
        }
        function CreateAssociateMeterRequest() {
            $scope.message = "Meter Number : " + vm.selectedMeter + " is Associated with Feeder : " + vm.FeederCode;
            AssociateMeterRequest();
        }
        function CreateChangeMeterRequest() {
            $scope.message = "Meter Number : " + vm.OldMeterID + " is Disassociated from Feeder : " + vm.FeederCode
                + "." + "Meter Number : " + vm.selectedMeter + " is Associated with Feeder : " + vm.FeederCode;
            DisassociateMeterRequest(true)
        }
        function CreateDisassociateMeterRequest() {
            $scope.message = "Meter Number : " + vm.OldMeterID + " is Disassociated from Feeder : " + vm.FeederCode;
            DisassociateMeterRequest()
        }
        function AssociateMeterRequest() {
            var associationObject = {
                "NwDeviceCode": vm.FeederCode,
                "MeterID": vm.selectedMeter,
                "DateofAssociation": setDate(vm.AssociationDate),
                "MF": $scope.isNotNullorUndefined(vm.MultiplyingFactor) ? vm.MultiplyingFactor : 1,
                "ExternalCTRatio": $scope.isNotNullorUndefined(vm.ExternalCTRatio) ? vm.ExternalCTRatio : "1",
                "ExternalPTRatio": $scope.isNotNullorUndefined(vm.ExternalPTRatio) ? vm.ExternalPTRatio : "1",
                "Initial_kWh": $scope.isNotNullorUndefined(vm.Initial_kWh) ? vm.Initial_kWh : null,
                "Initial_kVAh": $scope.isNotNullorUndefined(vm.Initial_kVAh) ? vm.Initial_kVAh : null
            }

            URIService.SubmitNewRequest(URIService.GetAssociateFeederMeterNetworkNewUrl(), associationObject)
                .success(function (response, status, headers, config) {
                    vm.disableSubmit = false;
                    if (response.Data >= 0) {
                        Redirect('app.NetworkMetering.FeederList', $scope.message)
                    }
                }).error(function (data, status, headers, config) {
                    vm.disableSubmit = false;
                    vm.alertData = {
                        message: translateFilter("Menu.Error_Message"),
                        showAlert: true,
                        type: 'error'
                    }
                });

        }
        function DisassociateMeterRequest(isChangeMeterRequest) {
            var disassociationObject = {
                "NwDeviceCode": vm.FeederCode,
                "MeterID": vm.OldMeterID,
                "ReasonForRemoval": vm.reasonForRemoval,
                "DateofDisassociation": setDate(vm.DisassociationDate),
                "Final_kWh": $scope.isNotNullorUndefined(vm.Final_kWh) ? vm.Final_kWh : null,
                "Final_kVAh": $scope.isNotNullorUndefined(vm.Final_kVAh) ? vm.Final_kVAh : null
            }

            URIService.SubmitNewRequest(URIService.GetDisassociateMeterNetworkForFeederNewUrl(), disassociationObject)
                .success(function (response, status, headers, config) {
                    vm.disableSubmit = false;
                    if (response.Data >= 0) {
                        if (isChangeMeterRequest) {
                            AssociateMeterRequest();
                        }
                        else {
                            Redirect('app.NetworkMetering.FeederList', $scope.message)
                        }
                    }
                }).error(function (data, status, headers, config) {
                    vm.disableSubmit = false;
                    vm.alertData = {
                        message: translateFilter("Menu.Error_Message"),
                        showAlert: true,
                        type: 'error'
                    }
                });

        }
        function setDate(date) {
            var dateModified = date == "Invalid Date" ? new Date() : date;
            return $scope.ToSerializedDate(dateModified)
        }
        function verifyAllMandatoryLevels(callback) {
            $scope.$broadcast('verifyAllMandatoryLevels', function (result, isHirarchySelected) {
                callback(result, isHirarchySelected);
            });
        }
        function getOfclHrchy(feederCode) {
            URIService.GetData(URIService.GetOfficialHierarchy(feederCode, 'feeder'))
                .success(function (response, status, headers, config) {
                    if (status === 200) {
                        if ($scope.isNotNullorUndefined(response.Data) && response.Data.length > 0) {
                            $scope.hierarchyDetils = response.Data;
                            $scope.$broadcast('setHirerachyDetails', $scope.hierarchyDetils);
                        }
                    }
                }).error(function (data, status, headers, config) {
                    $scope.isProcessing = false;
                });
        }
        $scope.$on('hierarchyIDsResponse', function (event, hierarchyIDs) {
            $scope.Ofclhrchy = hierarchyIDs
            createFeederRequest();
        });
    }]);