'use strict';

app.service("URIService", ['$http', 'ngAuthSettings', '$location',
    function ($http, ngAuthSettings, $location) {

        const MeterSearch = 'api/Meter/Search';
        const Nonce = 'api/Authentication/Nonce';
        const Authentication = 'api/Authentication/Login';
        const DTNew = 'api/Entites/DT/New';
        const DtUpdate = 'api/Entites/DT/{0}';
        const DTList = 'api/Entites/DT';
        const DTDetails = 'api/Entites/DT/{0}';
        const AssociatedMeterSearch = 'api/Entites/DT/SearchAssociatedMeter';
        const AssociateMeterNetworkNew = 'api/Entites/DT/AssociateMeterNetworkNew';
        const DisassociateMeterNetworkNew = 'api/Entites/DT/DisassociateMeterNetworkNew';
        const DTInformation = 'api/DT/{0}/Attributes';
        const DTMeterAssociation = 'api/DT/{0}/Associations'
        const DTMeterLastMonthParameters = 'api/DT/{0}/LastMonthParameters';
        const DTReportData = 'api/DT/Report/{0}/{1}'
        const DTNameSearch = 'api/DT/Name/Search'
        const DTCodeSearch = 'api/DT/Code/Search'
        const DTMeterSearch = 'api/DT/Meter/Search'
        const DeleteDT = 'api/Entites/DT/{0}'
        const FeederList = 'api/Entites/Feeder';
        const FeederNew = 'api/Entites/Feeder/New';
        const FeederAssociatedMeter = 'api/Feeder/SearchAssociatedMeter';
        const AssociateFeederMeterNetworkNew = 'api/Entites/Feeder/AssociateMeterNetworkNew';
        const AssociateFeederWithDTNew = 'api/Feeder/AssociatefeederWithDTNew';
        const MeterByDTName = 'api/Feeder/MeterByDTName';
        const FeederDetails = 'api/Entites/Feeder/{0}';
        const FeederUpdate = 'api/Entites/Feeder/{0}';
        const DisassociateFeederDT = 'api/Entites/Feeder/DisassociateDTFromFeeder/{0}';
        const AssociatedDTsWithFeeder = 'api/Entites/Feeder/AssociatedDTsWithFeeder/{0}';
        const DisassociateMeterNetworkForFeederNew = 'api/Entites/Feeder/DisassociateMeterNetworkNew';
        const CheckIfDTIsAssociatedWithFeeder = 'api/Feeder/CheckIfDTIsAssociatedWithFeeder'
        const FeederNameSearch = 'api/Feeder/Name/Search'
        const FeederCodeSearch = 'api/Feeder/Code/Search'
        const FeederMeterSearch = 'api/Feeder/Meter/Search'
        const FeederInformation = 'api/Feeder/{0}/Attributes';
        const FeederMeterAssociation = 'api/Feeder/{0}/MeterAssociations'
        const FeederDTAssociation = 'api/Feeder/{0}/AssociatedDT'
        const FeederDTLocation = 'api/Feeder/{0}/AllFeederDTLocation'
        const FeedereterLastMonthParameters = 'api/Feeder/{0}/LastMonthParameters';
        const EnergyAuditReport = 'api/Feeder/{0}/EnergyAudit';
        const EnergyAccountingReport = 'api/Feeder/{0}/EnergyAccountingProfile';
        const DTAnalysisConfiguration = 'api/DT/{0}/DTAnalysisConfiguration';
        const FeederAnalysisConfiguration = 'api/Feeder/{0}/FeederAnalysisConfiguration';
        const FeederReportData = 'api/Feeder/Report/{0}/{1}';
        const VoltageDropData = 'api/Feeder/{0}/FeederVoltageDrop';
        const UpdateDTFeeder = 'api/Entites/Feeder/UpdateDTFeeder';
        const FeederNameUrl = 'api/Feeder/{0}/DeviceNameByDeviceID';
        const DTNameUrl = 'api/DT/{0}/DeviceNameByDeviceID';
        const OfclHrchyDTUrl = 'api/DT/{0}/OfclHrchy';
        const OfclHrchyFeederUrl = 'api/Feeder/{0}/OfclHrchy';

        const DTWiseUnbalancingReportUrl = 'api/NetworkMetering/{0}/Reports/DTWiseUnbalancing';
        const DownloadDTWiseUnbalancingReportUrl = 'api/NetworkMetering/{0}/Reports/DTWiseUnbalancing/Download'
        const OperationalReliabilityReportUrl = 'api/NetworkMetering/{0}/Reports/OperationalReliability';
        const DownloadOperationalReliabilityReportUrl = 'api/NetworkMetering/{0}/Reports/OperationalReliability/Download'
        const LoadingConditionTransformerReportUrl = 'api/NetworkMetering/{0}/Reports/LoadingConditionTransformer';
        const DownloadLoadingConditionTransformerReportUrl = 'api/NetworkMetering/{0}/Reports/LoadingConditionTransformer/Download';
        const PublishedReportUrl = 'api/NetworkMetering/{0}/Reports/Publish/{1}';
        const UpdatePublishStatusUrl = 'api/NetworkMetering/{0}/Reports/Publish/{1}';
        const MissingDataUrl = 'api/NetworkMetering/{0}/Reports/MissingRecords';
        const DownloadMissingRecordsUrl = 'api/NetworkMetering/{0}/Reports/MissingRecords/Download';
        const FeederWiseEnergyAccountingReportUrl = 'api/NetworkMetering/{0}/Reports/FeederWiseEnergyAccounting'
        const DownloadFeederWiseEnergyAccountingReportUrl = 'api/NetworkMetering/{0}/Reports/FeederWiseEnergyAccounting/Download'
        const DetailFeederWiseEnergyAccountingtUrl = 'api/NetworkMetering/{0}/Reports/FeederWiseEnergyAccounting/{1}'
     
        


        const NetworkHierarchyDefinitionUrl = 'api/NetworkHierarchy/Definition';
        const NetworkHierarchyDetailsUrl = 'api/NetworkHierarchy/Details';
        const NetworkHierarchyUrl = 'api/NetworkHierarchy';
        const HierarchyIDUrl = 'api/NetworkHierarchy/HierarchyID';

        const GetNetworkDashboard = 'api/NetworkMetering/Dashboard';
        const FeederLoss = 'api/NetworkMetering/Dashboard/FeederLoss/LastMonth';
        const OutageCount = 'api/NetworkMetering/Dashboard/OutageCount/LastMonth';
        const OutageDuration = 'api/NetworkMetering/Dashboard/OutageDuration/LastMonth';
        const OverloadUnderloadUnbalanced = 'api/NetworkMetering/Dashboard/DTOverloadUnderloadUnbalanced/LastMonth';

        const FeederLossCurrentMonth = 'api/NetworkMetering/Dashboard/FeederLoss/CurrentMonth';
        const OutageCountCurrentMonth = 'api/NetworkMetering/Dashboard/OutageCount/CurrentMonth';
        const OutageDurationCurrentMonth = 'api/NetworkMetering/Dashboard/OutageDuration/CurrentMonth';
        const OverloadUnderloadUnbalancedCurrentMonth = 'api/NetworkMetering/Dashboard/DTOverloadUnderloadUnbalanced/CurrentMonth';

        function EncodeFilterAsBase64(filterObject, filterObjectKey) {

            var jsonString = JSON.stringify(filterObject)
            var utf8Bytes = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode('0x' + p1);
            });
            if (filterObjectKey == null || filterObjectKey == undefined) {
                filterObjectKey = "filter"
            }

            return filterObjectKey + "=" + btoa(utf8Bytes);
        }

        function SetFilter(filterObject, filterObjectKey) {

            return filterObjectKey + "=" + filterObject;
        }

        function StringFormat(format, args) {
            var theString = format;

            for (var i = 0; i < args.length; i++) {
                var regEx = new RegExp("\\{" + i + "\\}", "gm");
                theString = theString.replace(regEx, args[i]);
            }

            return theString;
        }

        function GetUrl(apiPath, rangeFilter, filterObjectKey) {
            var url = `${ngAuthSettings.apiServiceBaseUri}${apiPath}`

            var queryString = EncodeFilterAsBase64(rangeFilter, filterObjectKey)
            if (queryString != null && queryString != undefined) {
                url = url + '?' + queryString;
            }

            return url;
        }
        this.GetSearchList = function (target, filter) {
            var apiUrlKey = '';
            switch (target) {
                case 'meter':
                    {
                        apiUrlKey = MeterSearch;
                        break;
                    }
                case 'dtName':
                    {
                        apiUrlKey = DTNameSearch;
                        break;
                    }
                case 'dtCode':
                    {
                        apiUrlKey = DTCodeSearch;
                        break;
                    }
                case 'meterId':
                    {
                        apiUrlKey = DTMeterSearch;
                        break;
                    }
                case 'feederName':
                    {
                        apiUrlKey = FeederNameSearch;
                        break;
                    }
                case 'feederCode':
                    {
                        apiUrlKey = FeederCodeSearch;
                        break;
                    }
                case 'feederMeterId':
                    {
                        apiUrlKey = FeederMeterSearch;
                        break;
                    }

            }

            var url = `${ngAuthSettings.apiServiceBaseUri}${apiUrlKey}`
            if (filter != null && filter != undefined) {
                var queryString = SetFilter(filter, 'searchText')
                if (queryString != null && queryString != undefined) {
                    url = url + '?' + queryString;
                }
            }


            return url;

        }
        this.GetNonceUrl = function (userID) {
            var queryString = '?userID=' + userID;
            return `${ngAuthSettings.apiServiceBaseUri}${Nonce}${queryString}`;
        }
        this.GetTryAuthenticationUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${Authentication}`;
            
        }
        this.GetDTListUrl = function (rangeFilter, searchBy, searchValue) {
            var additionalFilter = ''
            switch (searchBy) {
                case 'dtName':
                    {
                        additionalFilter = '&dtName=' + searchValue;
                        break;
                    }
                case 'dtCode':
                    {
                        additionalFilter = '&dtCode=' + encodeURIComponent(searchValue);
                        break;
                    }
                case 'meterId':
                    {
                        additionalFilter = '&meter=' + searchValue;
                        break;
                    }
            }
            var url = `${ngAuthSettings.apiServiceBaseUri}${DTList}`

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != undefined) {
                url = url + '?' + queryString;
            }
            if (additionalFilter != '') {
                url = url + additionalFilter;
            }
            return url;

        }

        this.GetDTNewUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${DTNew}`;
        }
        this.GetUpdateDTUrl = function (dtCode) {
            return `${ngAuthSettings.apiServiceBaseUri}${StringFormat(DtUpdate, [encodeURIComponent(dtCode)])}`;
        }
        this.GetDeleteDTUrl = function (dtCode) {
            return `${ngAuthSettings.apiServiceBaseUri}${StringFormat(DeleteDT, [encodeURIComponent(dtCode)])}`;
        }

        this.GetDTDetailsUrl = function (dtCode) {
            var formattedUrl = StringFormat(DTDetails, [encodeURIComponent(dtCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`;
        }
        this.GetAssociateMeterNetworkNewUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${AssociateMeterNetworkNew}`;
        }

        this.GetDisassociateMeterNetworkNewUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${DisassociateMeterNetworkNew}`;
        }
        this.GetAssociatedMeter = function (filter, dateofAssociation) {

            var queryString = SetFilter(filter, 'searchText')

            var url = `${ngAuthSettings.apiServiceBaseUri}${AssociatedMeterSearch}` + '?' + queryString + '&dateofAssociation=' + dateofAssociation;
            return url;

        }
        this.GetDTInformationUrl = function (dtCode) {

            var formattedUrl = StringFormat(DTInformation, [encodeURIComponent(dtCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetAllDTMeterAssociationsUrl = function (dtCode) {
            var formattedUrl = StringFormat(DTMeterAssociation, [encodeURIComponent(dtCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetLastMonthParametersUrl = function (dtCode) {
            var formattedUrl = StringFormat(DTMeterLastMonthParameters, [encodeURIComponent(dtCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetAnalysisConfiguration = function (deviceName, reportFor) {
            var encodedDeviceName = encodeURIComponent(deviceName)                ;
            var formattedUrl = null;
            if (reportFor == "DT") {
                formattedUrl = StringFormat(DTAnalysisConfiguration, [encodedDeviceName]);
            }
            else if (reportFor == "Feeder") {
                formattedUrl = StringFormat(FeederAnalysisConfiguration, [encodedDeviceName]);
            }
            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }

        this.GetReportUrl = function (deviceName, reportName, rangeFilter, reportFor) {
            var encodedDeviceName = encodeURIComponent(deviceName)
            var formattedUrl = null;
            if (reportFor == "DT") {
                formattedUrl = StringFormat(DTReportData, [encodedDeviceName, reportName]);
            }
            else if (reportFor == "Feeder") {
                formattedUrl = StringFormat(FeederReportData, [encodedDeviceName, reportName]);
            }

            return GetUrl(formattedUrl, rangeFilter);
        }
        this.GetVoltageDropDataUrl = function (feederCode, rangeFilter) {
            var formattedUrl = StringFormat(VoltageDropData, [encodeURIComponent(feederCode)]);
            return GetUrl(formattedUrl, rangeFilter);
        }
        this.GetFeederListUrl = function (rangeFilter, searchBy, searchValue) {
            var additionalFilter = ''
            switch (searchBy) {
                case 'feederName':
                    {
                        additionalFilter = '&feederName=' + searchValue;
                        break;
                    }
                case 'feederCode':
                    {
                        additionalFilter = '&feederCode=' + encodeURIComponent(searchValue);
                        break;
                    }
                case 'feederMeterId':
                    {
                        additionalFilter = '&meter=' + searchValue;
                        break;
                    }
            }
            var url = `${ngAuthSettings.apiServiceBaseUri}${FeederList}`

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != undefined) {
                url = url + '?' + queryString;
            }
            if (additionalFilter != '') {
                url = url + additionalFilter;
            }
            return url;

        }

        this.GetFeederNewUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${FeederNew}`;
        }
        this.GetAssociateFeederMeterNetworkNewUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${AssociateFeederMeterNetworkNew}`;
        }
        this.GetFeederAssociatedMeterUrl = function (filter, dateofAssociation) {

            var queryString = SetFilter(filter, 'searchText')

            var url = `${ngAuthSettings.apiServiceBaseUri}${FeederAssociatedMeter}` + '?' + queryString + '&dateofAssociation=' + dateofAssociation;
            return url;

        }
        this.GetAssociateFeederWithDTNewUrl = function (feederCode) {
            var queryString = SetFilter(encodeURIComponent(feederCode), 'feederCode')
            var url = `${ngAuthSettings.apiServiceBaseUri}${AssociateFeederWithDTNew}` + '?' + queryString;
            return url;
        }
        this.GetUpdateDTFeederUrl = function (feederCode) {
            var queryString = SetFilter(encodeURIComponent(feederCode), 'feederCode')
            var url = `${ngAuthSettings.apiServiceBaseUri}${UpdateDTFeeder}` + '?' + queryString;
            return url;
        }

        this.GetMeterByDTNameUrl = function (filter) {

            var queryString = SetFilter(filter, 'dtName')

            var url = `${ngAuthSettings.apiServiceBaseUri}${MeterByDTName}` + '?' + queryString;
            return url;

        }
        this.GetAssociatedDTsWithFeederUrl = function (feederCode) {
            var formattedUrl = StringFormat(AssociatedDTsWithFeeder, [encodeURIComponent(feederCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`;
        }
        this.GetFeederAssociatedDTUrl = function (filter, dateofAssociation) {

            var queryString = SetFilter(encodeURIComponent(filter), 'dtCode')

            var url = `${ngAuthSettings.apiServiceBaseUri}${CheckIfDTIsAssociatedWithFeeder}` + '?' + queryString + '&dateofAssociation=' + dateofAssociation;
            return url;

        }
        this.GetFeederDetailsUrl = function (feederCode) {
            var formattedUrl = StringFormat(FeederDetails, [encodeURIComponent(feederCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`;
        }
        this.GetUpdateFeederUrl = function (feederCode) {
            return `${ngAuthSettings.apiServiceBaseUri}${StringFormat(FeederUpdate, [encodeURIComponent(feederCode)])}`;
        }
        this.GetDisassociateFeederDTUrl = function (feederCode) {
            return `${ngAuthSettings.apiServiceBaseUri}${StringFormat(DisassociateFeederDT, [encodeURIComponent(feederCode)])}`;
        }
        this.GetDisassociateMeterNetworkForFeederNewUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${DisassociateMeterNetworkForFeederNew}`;
        }
        this.GetFeederInformationUrl = function (feederCode) {

            var formattedUrl = StringFormat(FeederInformation, [encodeURIComponent(feederCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetAllFeederMeterAssociationsUrl = function (feederCode) {
            var formattedUrl = StringFormat(FeederMeterAssociation, [encodeURIComponent(feederCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetAllFeederDTAssociationsUrl = function (feederCode, rangeFilter) {
            var formattedUrl = StringFormat(FeederDTAssociation, [encodeURIComponent(feederCode)]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != '' && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetAllFeederDTLocation = function (feederCode) {
            var formattedUrl = StringFormat(FeederDTLocation, [encodeURIComponent(feederCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetLastMonthFeederParametersUrl = function (feederCode) {
            var formattedUrl = StringFormat(FeedereterLastMonthParameters, [encodeURIComponent(feederCode)]);

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetEnergyAuditReportUrl = function (feederCode, rangeFilter) {
            var formattedUrl = StringFormat(EnergyAuditReport, [encodeURIComponent(feederCode)]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != '' && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetEnergyAccountingReportUrl = function (feederCode, rangeFilter) {
            var formattedUrl = StringFormat(EnergyAccountingReport, [encodeURIComponent(feederCode)]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != '' && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetDeviceNameByDeviceID = function (deviceID, deviceType) {

            var uri = null;
            switch (deviceType) {
                case 'feeder':
                    {
                        uri = FeederNameUrl;
                        break;
                    }
                case 'dt':
                    {
                        uri = DTNameUrl;
                        break;
                    }
            }

            var formattedUrl = StringFormat(uri, [encodeURIComponent(deviceID)]);
            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetOfficialHierarchy = function (deviceID, deviceType) {
            var uri = null;
            switch (deviceType) {
                case 'feeder':
                    {
                        uri = OfclHrchyFeederUrl;
                        break;
                    }
                case 'dt':
                    {
                        uri = OfclHrchyDTUrl;
                        break;
                    }
            }

            var formattedUrl = StringFormat(uri, [encodeURIComponent(deviceID)]);
            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }

       

        
        this.GetNetworkReportUrl = function (rangeFilter, reportType, reportFrequency) {

            var urlValue = '';
            switch (reportType) {
                case 'DTWiseUnbalancing':
                    {
                        urlValue = DTWiseUnbalancingReportUrl;
                        break;
                    }
                case 'OperationalReliability':
                    {
                        urlValue = OperationalReliabilityReportUrl;
                        break;
                    }
                case 'UnderloadOverloadUnbalancedTransformer':
                    {
                        urlValue = LoadingConditionTransformerReportUrl;
                        break;
                    }
                case 'FeederWiseEnergyAccounting':
                    {
                        urlValue = FeederWiseEnergyAccountingReportUrl;
                        break;
                    }
            }
            var url = `${ngAuthSettings.apiServiceBaseUri}${urlValue}`
            var formattedUrl = StringFormat(url, [reportFrequency]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }
            return formattedUrl;

        }
        this.GetDownloadNetworkReportUrl = function (rangeFilter, reportType, reportFrequency) {

            var urlValue = '';
            switch (reportType) {
                case 'DTWiseUnbalancing':
                    {
                        urlValue = DownloadDTWiseUnbalancingReportUrl;
                        break;
                    }
                case 'OperationalReliability':
                    {
                        urlValue = DownloadOperationalReliabilityReportUrl;
                        break;
                    }
                case 'UnderloadOverloadUnbalancedTransformer':
                    {
                        urlValue = DownloadLoadingConditionTransformerReportUrl;
                        break;
                    }
                case 'FeederWiseEnergyAccounting':
                    {
                        urlValue = DownloadFeederWiseEnergyAccountingReportUrl;
                        break;
                    }
                case 'MissingData':
                    {
                        urlValue = DownloadMissingRecordsUrl;
                        break;
                    }

            }
            var url = `${ngAuthSettings.apiServiceBaseUri}${urlValue}`
            var formattedUrl = StringFormat(url, [reportFrequency]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }
            return formattedUrl;

        }
        this.GetPublishedReport = function (reportType, rangeFilter, reportFrequency) {
            var formattedUrl = StringFormat(PublishedReportUrl, [reportFrequency, reportType]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != '' && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetDetailFeederWiseEnergyAccounting = function (feederCode, rangeFilter, reportFrequency) {
            var formattedUrl = StringFormat(DetailFeederWiseEnergyAccountingtUrl, [reportFrequency, feederCode]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != '' && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetMissingDataUrl = function (rangeFilter, reportFrequency) {
            var formattedUrl = StringFormat(MissingDataUrl, [reportFrequency]);

            var queryString = EncodeFilterAsBase64(rangeFilter)
            if (queryString != null && queryString != '' && queryString != undefined) {
                formattedUrl = formattedUrl + '?' + queryString;
            }

            return `${ngAuthSettings.apiServiceBaseUri}${formattedUrl}`
        }
        this.GetUpdatePublishStatusUrl = function (reportID, reportFrequency) {
            return `${ngAuthSettings.apiServiceBaseUri}${StringFormat(UpdatePublishStatusUrl, [reportFrequency, reportID])}`;
        }
        this.GetNetworkHierarchyUrl = function () {
            var url = `${ngAuthSettings.apiServiceBaseUri}${NetworkHierarchyUrl}`

            return url;
        }
        this.GetNetworkHierarchyDefinitionUrl = function () {
            var url = `${ngAuthSettings.apiServiceBaseUri}${NetworkHierarchyDefinitionUrl}`

            return url;
        }
        this.GetNetworkHierarchyDetailsUrl = function () {
            var url = `${ngAuthSettings.apiServiceBaseUri}${NetworkHierarchyDetailsUrl}`

            return url;
        }
        this.GetHierarchyIDUrl = function (hierarchy) {
            var url = `${ngAuthSettings.apiServiceBaseUri}${HierarchyIDUrl}`
            return url;
        }
        
        this.GetNetworkDashboardUrl = function () {
            return `${ngAuthSettings.apiServiceBaseUri}${GetNetworkDashboard}`;
        }
        this.GetFeederLossUrl = function (islastMonth) {
            var url = '';
            if (islastMonth) {
                url = `${ngAuthSettings.apiServiceBaseUri}${FeederLoss}`
            }
            else {
                url = `${ngAuthSettings.apiServiceBaseUri}${FeederLossCurrentMonth}`
            }
            return url;
        }
        this.GetOutageCountUrl = function (islastMonth) {
            var url = '';
            if (islastMonth) {
                url = `${ngAuthSettings.apiServiceBaseUri}${OutageCount}`
            }
            else {
                url = `${ngAuthSettings.apiServiceBaseUri}${OutageCountCurrentMonth}`
            }
            return url;

        }
        this.GetOutageDurationUrl = function (islastMonth) {
            var url = '';
            if (islastMonth) {
                url = `${ngAuthSettings.apiServiceBaseUri}${OutageDuration}`
            }
            else {
                url = `${ngAuthSettings.apiServiceBaseUri}${OutageDurationCurrentMonth}`
            }
            return url;
        }
        this.GetDTOverloadUnderloadUnbalancedUrl = function (islastMonth) {
            var url = '';
            if (islastMonth) {
                url = `${ngAuthSettings.apiServiceBaseUri}${OverloadUnderloadUnbalanced}`
            }
            else {
                url = `${ngAuthSettings.apiServiceBaseUri}${OverloadUnderloadUnbalancedCurrentMonth}`
            }
            return url;
        }

        
        this.GetData = function (url) {
            var response = $http({
                method: 'GET',
                url: url,
                headers: { 'Content-Type': "application/json" }
            })

            var returnValue = response;
            response.success(function (data, status, headers, config) {

            }).error(function (data, status, headers, config) {
                OnError(data, status, headers, config);
            });

            return returnValue;
        }
        this.DeleteRequest = function (url) {

            var response = $http({
                method: 'DELETE',
                url: url,
                headers: { 'Content-Type': "application/json" }
            })

            var returnValue = response;
            response.success(function (data, status, headers, config) {

            }).error(function (data, status, headers, config) {
                OnError(data, status, headers, config);
            });

            return returnValue;
        }

        this.SubmitNewRequest = function (url, requestData, additionalHeaders) {
            var headers = { 'Content-Type': 'application / json' };
            if (additionalHeaders != null && additionalHeaders != '' && additionalHeaders != undefined) {
                angular.forEach(additionalHeaders, function (value, key) {
                    headers[key] = value;
                });

            }
            var response = $http({
                method: 'POST',
                url: url,
                headers: headers,
                dataType: 'json',
                data: requestData
            })

            var returnValue = response;
            response.success(function (data, status, headers, config) {

            }).error(function (data, status, headers, config) {
                OnError(data, status, headers, config);
            });

            return returnValue;
        }
        this.UploadFile = function (files, url) {
            var data = new FormData();
            for (var i = 0; i < files.length; i++) {
                data.append(files[i].name, files[i]);
            }
            var response = $http({
                url: url,
                method: 'POST',
                data: data,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            });

            var returnValue = response;
            response.success(function (data, status, headers, config) {

            }).error(function (data, status, headers, config) {
                OnError(data, status, headers, config);
            });

            return returnValue;
        };
        this.DownloadFile = function (url, fileName) {
            var response = $http({
                method: 'GET',
                url: url, // Change the URL as needed
                responseType: 'arraybuffer'
            });

            var returnValue = response;
            response.then(function (response) {
                var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                var downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = fileName;
                downloadLink.click();
            });

            return returnValue;
        };
        function OnError(data, status, headers, config) {
            var errorDetails = {
                Status: status,
                Title: data.title,
                Detail: data.detail,
                Refer: $location.$$url
            };
            sessionStorage.ErrorDetails = JSON.stringify(errorDetails);

            if (status == 401 || status == 403) {
                var path = status == 401 ? 'app/Unauthorized' : 'app/ForbiddenError';
                $location.path(path);
            }
            else if (!config.url.includes("api/Authentication")) {
                $location.path('app/error');
            }
        }

    }]);

