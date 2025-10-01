app.directive('hcColumnRangeChart', ['$filter', '$rootScope', function ($filter, $rootScope) {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '='
        },
        link: function (scope, element) {
            var options = {
                chart: {
                    type: 'columnrange',
                    inverted: true,
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
                        formatter: function () {
                            return this.value;
                        },
                        style: {
                            fontSize: '14px'
                        }
                    },
                    tickPositions: scope.data.categories.map((_, i) => i),
                    startOnTick: false,
                    endOnTick: false,
                    tickLength: 0
                }
                ,
                yAxis: {
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    tickInterval: scope.data.tickInterval,
                    min: scope.data.minValue,
                    max: scope.data.maxValue,

                    plotLines: [{
                        width: 2,
                        value: scope.data.shiftingXAxisValue.rPhase,
                    }, {
                        width: 2,
                        value: scope.data.shiftingXAxisValue.yPhase,
                    },
                    {
                        width: 2,
                        value: scope.data.shiftingXAxisValue.bPhase,
                    },
                    {
                        width: 2,
                        value: scope.data.firstLine,
                        color: 'var(--highcharts-color-7) !important'
                    },
                    {
                        width: 2,
                        value: scope.data.secondLine,
                        color: 'var(--highcharts-color-7) !important'
                    }
                        ,
                    {
                        width: 2,
                        value: scope.data.firstLine + scope.data.yphaseShiftValue,
                        color: 'var(--highcharts-color-10) !important'
                    },
                    {
                        width: 2,
                        value: scope.data.secondLine + scope.data.yphaseShiftValue,
                        color: 'var(--highcharts-color-10) !important'
                    }
                        ,
                    {
                        width: 2,
                        value: scope.data.firstLine + scope.data.bphaseShiftValue,
                        color: 'var(--highcharts-color-0) !important'
                    },
                    {
                        width: 2,
                        value: scope.data.secondLine + scope.data.bphaseShiftValue,
                        color: 'var(--highcharts-color-0) !important'
                    }
                    ],
                    plotBands: [
                        {
                            from: scope.data.firstLine,
                            to: scope.data.secondLine,
                            color: 'var(--highcharts-color-7) !important'
                        },
                        {
                            from: scope.data.firstLine + scope.data.yphaseShiftValue,
                            to: scope.data.secondLine + scope.data.yphaseShiftValue,
                            color: 'var(--highcharts-color-10) !important'
                        }
                        ,
                        {
                            from: scope.data.firstLine + scope.data.bphaseShiftValue,
                            to: scope.data.secondLine + scope.data.bphaseShiftValue,
                            color: 'var(--highcharts-color-0) !important'
                        }
                    ],
                    labels: {
                        formatter: function () {
                            if (this.value >= scope.data.shiftingXAxisValue.yPhase && this.value < scope.data.shiftingXAxisValue.bPhase) {
                                var value = (this.value - scope.data.shiftingXAxisValue.yPhase) + scope.data.minValue;
                                return value;
                            }
                            else if (this.value >= scope.data.shiftingXAxisValue.bPhase) {
                                var value = (this.value - scope.data.shiftingXAxisValue.bPhase) + scope.data.minValue;
                                return value;
                            }
                            else {
                                return this.value;
                            }
                        }
                    }
                },
                credits: {
                    enabled: false
                },

                legend: {
                    enabled: false
                },
                tooltip: {
                    formatter: function () {
                        var minPoint = (this.point.low - this.point.addedValue)
                        var maxPoint = this.point.high - this.point.addedValue
                        return 'Min: ' + Highcharts.numberFormat(minPoint, 2) + ' V <br>' +
                            'Max: ' + Highcharts.numberFormat(maxPoint, 2) + ' V';
                    }
                },

                plotOptions: {
                    series: {
                        dataLabels: false
                    },
                    columnrange: {
                        borderRadius: '50%',
                        pointRange: 0.1,
                        pointPadding: 0,
                        groupPadding: 0.1,
                        dataLabels: {
                            enabled: true,
                            verticalAlign: 'bottom',
                            //inside: true,
                            yLow: -5,
                            yHigh: -5,
                            //xLow: 50,
                            // xHigh: -50,
                            yLow: 5,
                            yHigh: 5,
                            format: '{(subtract (y) point.addedValue):.2f} V',
                            style: {
                                fontWeight: 'normal',
                                fontSize: '20px'
                            }
                        }
                    }
                },
                series: scope.data.series
            };
            Highcharts.chart(element[0], options);
        }
    }
}]);

