app.directive('hcPieChartWithCenterData', ['$filter', '$rootScope', function ($filter, $rootScope) {
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
                    verticalAlign: 'middle',
                    floating: true,
                    text: scope.data.chartTitle,
                    useHTML: true
                },
                subtitle: {
                    text: scope.data.subtitle
                },

                credits: {
                    enabled: false
                },
                plotOptions: {
                    borderColor: "transparent",
                    pie: {
                        borderWidth: 1,
                        innerSize: '95%',
                        dataLabels: true,
                        showInLegend: true,
                        stickyTracking: false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        },

                    }
                },


                series: scope.data.series
            };
            Highcharts.chart(element[0], options);
        },
    }

}]);