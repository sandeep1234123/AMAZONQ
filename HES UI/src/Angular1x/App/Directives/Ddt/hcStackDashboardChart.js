'use strict'
app.directive('hcStackDashboardChart', ['$rootScope', '$filter', function ($rootScope, $filter) {
    var translateFilter = $filter('translate');
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '=',
            showdetails: "&"
        },
        link: function (scope, element, attrs) {
            var showDetails = function (category) {
                if (scope.data.isOnClickEvent) {
                    scope.showdetails({ category: category });
                }
            }
            var options = {
                chart: {
                    type: 'column',
                    events: {
                        load: function () {
                            //var series = this.series[0];
                            // series.points.forEach(function (point) {
                            //     if (point.category === scope.data.thresholdValue) {
                            //         if (point.graphic != undefined) {
                            //             point.graphic.shadow({
                            //                 color: 'darkblue',
                            //                 width: 10,
                            //                 opacity: 1,
                            //                 offsetX: 0,
                            //                 offsetY: 0
                            //             });
                            //         }

                            //     }
                            // });

                        }
                    }
                },
                exporting:
                {
                    enabled: false
                },

                lang: {
                    downloadPNG: translateFilter("Menu.DownloadPNG"),
                    downloadJPEG: $filter('translate')("Menu.DownloadJPEG"),
                    downloadPDF: $filter('translate')("Menu.DownloadPDF"),
                },

                title: {
                    text: scope.data.chartTitle
                },
                subtitle: {
                    text: scope.data.subtitle,
                    style: {
                        color: 'black'
                    }
                },
                xAxis: {
                    title: {
                        text: scope.data.xAxisLabel
                    },
                    gridLineWidth: 0,
                    visible: false,
                    labels: {
                        enabled: false,
                        formatter: function () {
                            if (scope.data.xAxisFormatting) {
                                return $rootScope.FormatData(this.value, scope.data.xAxisFormat);
                            }
                            else {
                                return this.value;
                            }
                        }
                    },

                    categories: scope.data.categories
                },
                yAxis: {
                    min: 0,
                    gridLineWidth: 0,
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    labels: {
                        enabled: false
                    },
                    stackLabels: {
                        style: {
                            fontWeight: 'bold',
                            color: (
                                Highcharts.defaultOptions.title.style &&
                                Highcharts.defaultOptions.title.style.color
                            ) || 'gray'
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    positioner: function (labelWidth, labelHeight, point) {
                        var chart = this.chart;
                        var x = point.plotX + chart.plotLeft - labelWidth / 2; // Center tooltip horizontally
                        var y = point.plotY + chart.plotTop - labelHeight - 1; // Place tooltip above the column with some offset
                        return { x: x, y: y };
                    },
                    borderWidth: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    formatter: function () {
                        if (scope.data.unit != undefined) {
                            return '<div style="padding: 10px;">' + this.y + ' (>=' + this.x + ' ' + scope.data.unit + ')' + '</div>';
                        }
                        else {
                            return '<div style="padding: 10px;">' + this.y + ' (>=' + this.x + ')' + '</div>';
                        }




                        // if (scope.data.isDateTime) {
                        //     return this.points.reduce(function (s, point) {
                        //         return s + '<br/>' + point.series.name + ': ' +
                        //             point.y;
                        //     }, '<b>' + $rootScope.FormatData(this.x, scope.data.xAxisFormat) + '</b>');
                        // }
                        // else if (scope.data.isPercentage) {
                        //     return this.points.reduce(function (s, point) {
                        //         return s + '<br/>' + point.series.name + ': ' +
                        //             point.y;
                        //     }, '<b>' + this.x + ' % </b>');
                        // }
                        // else {
                        //     return this.points.reduce(function (s, point) {
                        //         return s + '<br/>' + point.series.name + ': ' +
                        //             point.y;
                        //     }, '<b>' + this.x + '</b>');

                        // }
                    },
                    shared: true
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: false,
                            zIndex: 3,
                            formatter: function () {
                                if (this.x == scope.data.thresholdValue) {
                                    if (scope.data.isDateTime) {
                                        return '<div class="custom-data-label">' + $rootScope.FormatData(this.x, scope.data.xAxisFormat) + '</br>' + 'Count' + ': ' + this.y + '</div>';

                                    }
                                    else if (scope.data.isPercentage) {
                                        return '<div class="custom-data-label">' + this.x + ' % </br>' + 'Count' + ': ' + this.y + '</div>';
                                    }
                                    else {
                                        return '<div class="custom-data-label">' + this.x + '</br>' + 'Count' + ': ' + this.y + '</div>';
                                    }


                                }
                            },
                            useHTML: true,
                            allowOverlap: true,
                            verticalAlign: 'bottom', // Align the data labels to the top of the bars
                            y: -200,
                            style: {
                                textAlign: 'center' // Center-align the data labels
                            }
                        }
                    },

                    series: {
                        showInLegend: false,
                        cursor: 'pointer',
                        point: {
                            events: {
                                'click': function () {
                                    showDetails(this.category);
                                }
                            }
                        },
                    },
                },
                series: scope.data.series
            }
            Highcharts.chart(element[0], options);
        }
    };
}]);