'use strict';
app.factory('DataStructureFactory',
    [function () {
        var factory = {};
        factory.GetPaginationFilterInstance = function (currentPage, pageSize, totalRecords) {
            var start = currentPage * pageSize;
            var end = start + pageSize;
            var paginationFilter = new PaginationFilter(start, end, totalRecords);

            return paginationFilter;
        };

        factory.GetRangeFilterInstance = function (fromDate, toDate, additionalFilters, paginationFilter, deviceID) {
            var rangeFilter = new RangeFilter(fromDate, toDate, deviceID, additionalFilters, paginationFilter);

            return rangeFilter;
        };
        factory.GetDTReportFilterInstance = function (fromDate, toDate, reportDataView, normal, acceptable, notAcceptable, reportType, additionalFilters) {
            var dtReportFilterInstance = new DTReportFilter(fromDate, toDate, reportDataView, normal, acceptable, notAcceptable, reportType, additionalFilters);

            return dtReportFilterInstance;
        };

        return factory;
    }]);


class PaginationFilter {
    constructor(start, end, totalRecords) {
        this.Start = start;
        this.End = end;
        this.TotalRecords = totalRecords;
    }
}
class RangeFilter {
    constructor(fromDate, toDate, deviceID, additionalFilters, paginationFilter) {
        this.FromDate = fromDate;
        this.ToDate = toDate;
        this.MeterId = deviceID
        if (additionalFilters != null) {
            this.AdditionalFilters = additionalFilters;
        }
        if (paginationFilter != null) {
            this.Start = paginationFilter.Start;
            this.End = paginationFilter.End;
            this.TotalRecords = paginationFilter.TotalRecords;
        }
    }
}
class DTReportFilter {
    constructor(fromDate, toDate, reportDataView, normal, acceptable, notAcceptable, reportType, additionalFilters) {
        this.FromDate = fromDate;
        this.ToDate = toDate;
        this.ReportDataView = reportDataView;
        this.Normal = normal;
        this.Acceptable = acceptable;
        this.NotAcceptable = notAcceptable;
        this.ReportType = reportType;
        this.AdditionalFilters = additionalFilters;
    }
}


