'use strict'
app.directive('hcStatsStackedChart', [function () {

    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '=',
            showdetails:"&"
        },
        link: function (scope, element, attrs) {
            var showDetails = function (category) {
                if (scope.data.isOnClickEvent) {
                    scope.showdetails({category:category});
                }
            }
            var options = {
                chart: {
                    type: 'column'
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

                    categories: scope.data.categories
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: scope.data.yAxisLabel
                    },
                    stackLabels: {
                        //enabled: true,
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
                    x: -30,
                    align: 'right',
                    verticalAlign: 'top',
                    floating: true,
                    backgroundColor: '#00808000',
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} of {point.stackTotal}</b><br/>',
                    shared: true
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                'click': function () {
                                    showDetails(this.category);
                                }
                            }
                        }

                    }
                },
                series: scope.data.series
            };
            Highcharts.chart(element[0], options);
        }
    };
}]);