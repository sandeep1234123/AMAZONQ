'use strict';

app.controller("DTFormCtrl", ['URIService', '$state'
    , 'alertService', '$filter', '$rootScope', '$scope', '$stateParams'
    , function (URIService, $state, alertService, $filter, $rootScope,
        $scope, $stateParams) {
        var vm = this;
        var translateFilter = $filter('translate');
        vm.editDTCode = $stateParams.dtCode;
        vm.formLabel = vm.editDTCode ? translateFilter("Menu.EditDT") : translateFilter("Menu.AddDT");
        $rootScope.activeState = 'app.NetworkMetering.DTForm';
        vm.alertData = {};

        vm.disableSubmitButton = false;
        vm.disableAddMeterButton = true;
        vm.IsDisabled = vm.editDTCode ? true : false;
        vm.isMeterValid = false;

        vm.maxDate = new Date();
        vm.MultiplyingFactor = 1;
        vm.ExternalCTRatio = "1/1";
        vm.ExternalPTRatio = "1/1";
        vm.ShowDisassociationContainer = false;
        vm.ShowAssociateContainer = false;
        vm.isDisassociatedMeterAvailable = false;
        vm.isAssociatedMeterAvailable = false;
        $scope.showHierarchy = false;

        vm.SelectedTypeOfDT = 'Public'
        vm.TypeOfDT = [
            { id: '1', Name: 'Public', value: 'Public', Selected: true },
            { id: '2', Name: 'Individual', value: 'Individual', Selected: false },
            { id: '3', Name: 'HVDS', value: 'HVDS', Selected: false },
        ]
        $scope.openCalendar = function (e, picker) {
            $scope.Calender = {};
            if (!vm.InstalledOn) {
                vm.InstalledOn = new Date();
            }
            $scope.Calender.open = true;
            $scope.$broadcast("GetCalenderStatus", $scope.Calender);
        };
        vm.EnableAddMeter = function (event, spanID) {
            vm.ClearErrorFieldMessage(spanID)
            if ($scope.isNotNullorUndefined(vm.DTName)
                && $scope.isNotNullorUndefined(vm.DTCode)
                && $scope.isNotNullorUndefined(vm.DTCapacity)) {
                vm.disableAddMeterButton = false;
            }
            else {
                vm.disableAddMeterButton = true;
            }
        }
        $scope.SelectedDateValue = function (selectedDateValue) {
            if (vm.isAssociatedMeterAvailable) {
                CheckMeterAssociation(vm.selectedMeter, selectedDateValue);
            }
        }
        $scope.SelectedValue = function (selectedMeterNumber) {
            CheckMeterAssociation(selectedMeterNumber, vm.AssociationDate);
        }
        vm.ClearErrorFieldMessage = function (spanID) {
            let element = document.getElementById(spanID);
            element.setAttribute("hidden", "hidden");
        }
        vm.submitForm = function () {

            var requiredNameResult = SetErrorForRequiredField(vm.DTName, "reqDtName", "Name is required.")
            var requiredCodeResult = SetErrorForRequiredField(vm.DTCode, "reqDtCode", "Code is required.")
            var requiredCapacityResult = SetErrorForRequiredField(vm.DTCapacity, "reqCapacity", "Capacity is required.")

            var result = false;
            if (requiredNameResult && requiredCodeResult
                && requiredCapacityResult && !vm.isAssociatedMeterAvailable) {
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
                            createDTRequest();
                        }
                    });
                }
                else {
                    createDTRequest();
                }
            }
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
            vm.Final_kWh = "";
            vm.Final_kVAh = "";
            vm.reasonForRemoval = "";

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
        vm.back = function () {
            $state.go('app.NetworkMetering.DTList');
        }
        vm.isAssociateClicked = function () {
            vm.ShowAssociateContainer = true;
            vm.isAssociatedMeterAvailable = true;

            vm.ShowAssociatedMeter = false;
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
        if (vm.editDTCode) {
            vm.ShowDisassociateMeter = false;
            vm.ShowAssociatedMeter = false;
            vm.ShowOldMeterInformation = false;
            URIService.GetData(URIService.GetDTDetailsUrl(vm.editDTCode))
                .success(function (response, status, headers, config) {
                    if (response.Data.length > 0) {
                        var dtDetails = response.Data[0];
                        vm.DTName = dtDetails.DTName;
                        vm.DTCode = dtDetails.DTCode;
                        vm.DTCapacity = dtDetails.DTCapacity;
                        vm.Latitude = dtDetails.Latitude;
                        vm.Longitude = dtDetails.Longitude;
                        vm.SelectedTypeOfDT = dtDetails.TypeOfDT;
                        vm.InstalledOn = moment(dtDetails.InstalledOn, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                        if ($scope.showHierarchy) { getOfclHrchy(vm.DTCode) };
                        if ($scope.isNotNullorUndefined(dtDetails.MeterID)) {
                            vm.OldMeterID = dtDetails.MeterID;
                            vm.OldMF = dtDetails.MF;
                            vm.OldDateOfAssociation = moment(dtDetails.DateofAssociation
                                , 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
                            vm.OldInitial_kWh = dtDetails.Initial_kWh;
                            vm.OldInitial_kVAh = dtDetails.Initial_kVAh;
                            vm.OldExternalCTRatio = dtDetails.ExternalCTRatio;
                            vm.OldExternalPTRatio = dtDetails.ExternalPTRatio;
                            vm.ShowDisassociateMeter = true;
                            vm.ShowOldMeterInformation = true;
                        }
                        else {
                            vm.ShowAssociatedMeter = true;
                        }
                    }
                })
        }
        function createDTRequest() {
            vm.disableSubmitButton = true;
            if (vm.editDTCode) {
                var editDtObject = {
                    "DTName": vm.DTName,
                    "DTCode": vm.DTCode,
                    "DTCapacity": vm.DTCapacity,
                    "Latitude": vm.Latitude,
                    "Longitude": vm.Longitude,
                    "Ofclhrchy": $scope.showHierarchy ? $scope.Ofclhrchy : null
                }

                URIService.SubmitNewRequest(URIService.GetUpdateDTUrl(vm.DTCode), editDtObject)
                    .success(function (response, status, headers, config) {
                        vm.disableSubmitButton = false;
                        if (response.Data >= 0) {
                            if (!vm.isAssociatedMeterAvailable && !vm.isDisassociatedMeterAvailable) {
                                vm.message = vm.DTName + " " + translateFilter("Menu.DTUpdated");
                                Redirect('app.NetworkMetering.DTList', vm.message)
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
                    "DTName": vm.DTName,
                    "DTCode": vm.DTCode,
                    "DTCapacity": vm.DTCapacity,
                    "InstalledOn": setDate(vm.InstalledOn),
                    "Latitude": vm.Latitude,
                    "Longitude": vm.Longitude,
                    "TypeOfDT": vm.SelectedTypeOfDT,
                    "Ofclhrchy": $scope.showHierarchy ? $scope.Ofclhrchy : null
                }

                URIService.SubmitNewRequest(URIService.GetDTNewUrl(), obj)
                    .success(function (response, status, headers, config) {
                        vm.disableSubmitButton = false;
                        if (response.Data >= 0) {
                            if (vm.isAssociatedMeterAvailable) {
                                CreateAssociateMeterRequest();
                            }
                            else {
                                vm.message = vm.DTName + " " + translateFilter("Menu.DTCreated");
                                Redirect('app.NetworkMetering.DTList', vm.message)
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
        function AssociateMeterRequest() {
            var associationObject = {
                "NwDeviceCode": vm.DTCode,
                "MeterID": vm.selectedMeter,
                "DateofAssociation": setDate(vm.AssociationDate),
                "MF": $scope.isNotNullorUndefined(vm.MultiplyingFactor) ? vm.MultiplyingFactor : 1,
                "ExternalCTRatio": $scope.isNotNullorUndefined(vm.ExternalCTRatio) ? vm.ExternalCTRatio : "1",
                "ExternalPTRatio": $scope.isNotNullorUndefined(vm.ExternalPTRatio) ? vm.ExternalPTRatio : "1",
                "Initial_kWh": $scope.isNotNullorUndefined(vm.Initial_kWh) ? vm.Initial_kWh : null,
                "Initial_kVAh": $scope.isNotNullorUndefined(vm.Initial_kVAh) ? vm.Initial_kVAh : null
            }

            URIService.SubmitNewRequest(URIService.GetAssociateMeterNetworkNewUrl(), associationObject)
                .success(function (response, status, headers, config) {
                    vm.disableSubmit = false;
                    if (response.Data >= 0) {
                        Redirect('app.NetworkMetering.DTList', $scope.message)
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
                "NwDeviceCode": vm.DTCode,
                "MeterID": vm.OldMeterID,
                "ReasonForRemoval": vm.reasonForRemoval,
                "DateofDisassociation": setDate(vm.DisassociationDate),
                "Final_kWh": $scope.isNotNullorUndefined(vm.Final_kWh) ? vm.Final_kWh : null,
                "Final_kVAh": $scope.isNotNullorUndefined(vm.Final_kVAh) ? vm.Final_kVAh : null
            }

            URIService.SubmitNewRequest(URIService.GetDisassociateMeterNetworkNewUrl(), disassociationObject)
                .success(function (response, status, headers, config) {
                    vm.disableSubmit = false;
                    if (response.Data >= 0) {
                        if (isChangeMeterRequest) {
                            AssociateMeterRequest();
                        }
                        else {
                            Redirect('app.NetworkMetering.DTList', $scope.message)
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
        function CreateAssociateMeterRequest() {
            $scope.message = "Meter Number : " + vm.selectedMeter + " is Associated with DT : " + vm.DTCode;
            AssociateMeterRequest();
        }
        function CreateChangeMeterRequest() {
            $scope.message = "Meter Number : " + vm.OldMeterID + " is Disassociated from DT : " + vm.DTCode
                + ". " + "Meter Number : " + vm.selectedMeter + " is Associated with DT : " + vm.DTCode;
            DisassociateMeterRequest(true)
        }
        function CreateDisassociateMeterRequest() {
            $scope.message = "Meter Number : " + vm.OldMeterID + " is Disassociated from DT : " + vm.DTCode;
            DisassociateMeterRequest()
        }
        function Redirect(path, message) {
            alertService.setSuccess({
                message: message,
                redirectState: path
            });
            $state.go(path);
        }
        function CheckMeterAssociation(selectedMeterNumber, associationDate) {
            URIService.GetData(URIService.GetAssociatedMeter(selectedMeterNumber, setDate(associationDate)))
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
            URIService.GetData(URIService.GetOfficialHierarchy(feederCode, 'dt'))
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
            createDTRequest();
        });
    }]);
