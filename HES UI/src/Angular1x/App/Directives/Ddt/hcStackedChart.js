'use strict'
app.directive('hcStackedChart', [function() {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '='
        },
        link: function(scope, element, attrs) {
            var options = {
                chart: {
                    type: 'column'
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
                    min: 0,
                    title: {
                        text: scope.data.yAxisTitle
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
                    x:-30,
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
                       // stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    },
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                'click': function () {
                                    if (this.series.data.length > 1) {
                                        this.remove();
                                    }
                                }
                            }
                        }

                    }
                },
                series: scope.data.Series
            };
            Highcharts.chart(element[0], options);
        }
    };
}]);