'use strict'
app.directive('hcStatsLineChart', [function () {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '='
        },
        link: function (scope, element, attrs) {

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: scope.data.chartTitle
                },
                subtitle: {
                    text: scope.data.subtitle
                },
                xAxis: {
                    title: {
                        text: scope.data.xAxisLabel,
                    },

                    categories: scope.data.categories
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    stackLabels: {
                        style: {
                            fontWeight: 'bold',
                            color: ( // theme
                                Highcharts.defaultOptions.title.style &&
                                Highcharts.defaultOptions.title.style.color
                            ) || 'gray'
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    x: -30,
                    verticalAlign: 'top',
                    floating: true,
                    backgroundColor: '#00808000',
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    formatter: function () {
                        if (scope.data.isShowPercentSign) {
                            return this.points.reduce(function (s, point) {
                                return s + '<br/>' + point.series.name + ': ' +
                                    point.y + ' %';
                            }, '<b>' + this.x + '</b>');
                        }
                        else{
                            return this.points.reduce(function (s, point) {
                                return s + '<br/>' + point.series.name + ': ' +
                                    point.y ;
                            }, '<b>' + this.x + '</b>');

                        }
                    },
                    shared: true
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                if (scope.data.isShowPercentSign)
                                return this.y+' %';
                                else
							    return this.y;
                              }
                        }
                    },
                    series: {
                        cursor: 'pointer',

                    }
                },
                series: scope.data.series
            };
            Highcharts.chart(element[0], options);
        }
    };
}]);