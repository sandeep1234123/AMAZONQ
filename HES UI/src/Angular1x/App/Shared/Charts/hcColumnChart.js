app.directive('hcColumnChart', ['$filter', '$rootScope', function ($filter, $rootScope) {
    var translateFilter = $filter('translate');
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '='
        },
        link: function (scope, element) {
            var options = {
                lang: {
                    downloadPNG: translateFilter("Menu.DownloadPNG"),
                    downloadJPEG: $filter('translate')("Menu.DownloadJPEG"),
                    downloadPDF: $filter('translate')("Menu.DownloadPDF"),
                    downloadSVG: $filter('translate')("Menu.DownloadSVG"),
                    downloadXLS: $filter('translate')("Menu.DownloadXLS"),
                    downloadCSV: $filter('translate')("Menu.DownloadCSV"),
                    printChart: $filter('translate')("Menu.PrintChart"),
                    viewFullscreen: $filter('translate')("Menu.FullScreen"),
                    viewData: $filter('translate')("Menu.ViewData")
                },
                 exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ["viewFullscreen"],
                        }
                    }
                },
                title: {
                    text: scope.data.chartTitle
                },
                subtitle: {
                    text: scope.data.subtitle
                },
                xAxis: {

                    title: {
                        text: scope.data.xAxisLabel
                    },
                    categories: scope.data.categories,
                    labels: {
                        rotation: 315,
                        enabled: scope.data.xAxisLabelEnable,
                        formatter: function () {
                            return this.axis.defaultLabelFormatter.call(this);
                        }
                    },
                },
                yAxis: {
                    allowDecimals: false,
                    tickInterval: scope.data.tickInterval,
                    min: 0,
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    labels: {
                        format: '{value}',
                    },
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
                    shared: true
                },
                plotOptions: {
                    borderColor: "transparent",
                },
                series: scope.data.series
            };
            Highcharts.chart(element[0], options);
        }
    }

}]);