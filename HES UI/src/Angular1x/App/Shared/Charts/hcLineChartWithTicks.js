app.directive('hcLineChartWithTicks', ['$filter', '$rootScope', function ($filter, $rootScope) {
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
                        enabled: scope.data.xAxisLabelEnable
                    },
                    crosshair: scope.data.crosshair,
                },
                yAxis: {
                    allowDecimals: true,
                    tickInterval: scope.data.tickInterval,
                    min: scope.data.minTicks,
                    max: scope.data.maxTicks,
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    crosshair: scope.data.crosshair,

                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    formatter: function (tooltip) {
                        if (this.series.userOptions.type == 'pie') {
                            return '<b>' + this.key + '</b><br/>' +
                                '<b>' + Highcharts.numberFormat(this.y, 0) + '/' + Highcharts.numberFormat(this.total, 0);
                        }
                        else if (scope.data.yAxisFormatting) {
                            return $rootScope.FormatData(this.y, 'timeinhourandminutes') + '(HH:MM)';
                        }
                        else {
                            this.key = scope.data.xAxixTooltipLabel + this.key;
                            return tooltip.defaultFormatter.call(this, tooltip);
                        }

                    },
                },
                plotOptions: {
                    borderColor: "transparent",
                    area: {
                        fillOpacity: scope.data.fillOpacity,
                        stacking: scope.data.stacking,
                    },
                    pie: {
                        innerSize: scope.data.innerSize ? scope.data.innerSize : '50%',
                        borderWidth: 1,
                        dataLabels: {
                            distance: 5,
                            enabled: true,
                            format: '{point.percentage:.1f} %',
                        }
                    },
                    series: {

                        lineWidth: scope.data.lineWidth,
                        lineColor: scope.data.lineColor,
                        states: {
                            inactive: {
                                opacity: 1
                            }
                        }
                    },
                    line: {
                        marker: {
                            enabled: false
                        }
                    }
                },

                series: scope.data.series
            };
            Highcharts.chart(element[0], options);
        }
    }

}]);