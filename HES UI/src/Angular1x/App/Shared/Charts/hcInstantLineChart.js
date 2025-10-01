app.directive('hcInstantLineChart', ['$filter', function ($filter) {
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

                //colors: scope.data.Colors,
                chart: {
                    type: 'line', events: {
                        load: function () {
                            this.series
                                .flatMap((serie) => serie.data)
                                .forEach((point) => point.addInfo != undefined ? point.addInfo == "Success" ? point.update({ color: 'green' }) : point.update({ color: 'red' }) : '')
                        }
                    }
                },
                title: {
                    text: scope.data.Title
                },
                subtitle: {
                    text: scope.data.Subtitle
                },
                xAxis: {
                    title: {
                        text: scope.data.xAxisTitle
                    },
                    categories: scope.data.Categories
                },
                yAxis: {
                    allowDecimals: false,
                    title: {
                        text: scope.data.yAxisTitle
                    }
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },

                series: scope.data.Series
            };

            Highcharts.chart(element[0], options);
        }
    };
}]);