app.directive('hcCombinedStackAndLineChart', ['$filter', '$rootScope', function ($filter, $rootScope) {
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
                            if (scope.data.isHourMinutes) {
                                return $rootScope.FormatData(this.value, 'timeinhourandminutes');
                            }
                            else {
                                return this.axis.defaultLabelFormatter.call(this);
                            }
                        }
                    },
                    crosshair: scope.data.crosshair,
                },
                yAxis: {
                    allowDecimals: false,
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    crosshair: scope.data.crosshair,
                    tickPositions: scope.data.customYAxisTicks || undefined,
                    labels: {
                        formatter: function () {
                            if (scope.data.yAxisFormatting) {
                                return $rootScope.FormatData(this.value, 'timeinhourandminutes');
                            }
                            else if (scope.data.percentageFormatting) {
                                return this.value.toFixed(0);
                            }
                        }
                    },
                    plotLines: [{
                        value: scope.data.plotLineValue,
                        label: {
                            text: scope.data.plotLineText,
                            style: {
                                fontWeight: 'bold',
                                color: 'black',
                                fontSize: '17px',
                            }
                        },
                        stroke: 'black',
                        dashStyle: 'shortdash',
                        width: 3,
                        zIndex: 10
                    }
                    ]
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    formatter: function (tooltip) {
                        if (this.series.userOptions.type == 'pie') {
                            return '<b>' + this.key + '</b><br/>' +
                                '<b>' + Highcharts.numberFormat(this.y, 2) + '/' + Highcharts.numberFormat(this.total, 2);
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
                            format: '{point.percentage:.2f} %',
                        },

                        showInLegend: scope.data.showInLegend
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