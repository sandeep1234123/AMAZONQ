'use strict';
app.factory('ToolsFactory', ['$filter', '$moment', 'AuthService', function ($filter, $moment, AuthService) {
    var factory = {};
    var translateFilter = $filter('translate');
    var dateTimeFormats = AuthService.getAuthInfo().cultureInfo.DateTimeFormats;
    

    factory.shortDate = function (dateTime, RecievedDateTimeFormat) {
        var RecievedDateTimeFormat = dateTimeFormats.FullDateTimePattern;// RecievedDateTimeFormat == null ? this.DateTimeFormat.DefaultRecievedFormat : RecievedDateTimeFormat
        return $moment(dateTime, RecievedDateTimeFormat).format(dateTimeFormats.ShortDatePattern)
    }

    factory.shortTime = function (dateTime, RecievedDateTimeFormat) {
        var RecievedDateTimeFormat = dateTimeFormats.FullDateTimePattern;// RecievedDateTimeFormat == null ? this.DateTimeFormat.DefaultRecievedFormat : RecievedDateTimeFormat
        return $moment(dateTime, RecievedDateTimeFormat).format(this.DateTimeFormat.shortTime)
    }
    factory.shortDateShortTime = function (dateTime, RecievedDateTimeFormat) {
        var RecievedDateTimeFormat = RecievedDateTimeFormat == null ? this.DateTimeFormat.DefaultRecievedFormat : RecievedDateTimeFormat
        return $moment(dateTime, RecievedDateTimeFormat).format(this.DateTimeFormat.shortDateShortTime)
    }

    factory.DateTimeFormat = {
        "DefaultRecievedFormat": "YYYY/MM/DD HH:mm:ss",
        "DDMMYYYHHmmss": "DD/MM/YYYY HH:mm:ss",
        "MMDDYYYHHmmss": "MM/DD/YYYY HH:mm:ss",
        "MMDDYYYHHmmss": "MM/DD/YYYY HH:mm",
        "shortDateShortTime": "DD/MM/YYYY HH:mm",
        "sortableDateTime": "YYYY/MM/DD HH:mm",
        "shortDate": "DD/MM/YYYY",
        "shortTime": "HH:mm",
        "DDMM": "DD/MM",
        "Serilaization": "yyyy-MM-ddTHH:mm:ss"
    }

    return factory;
}]);