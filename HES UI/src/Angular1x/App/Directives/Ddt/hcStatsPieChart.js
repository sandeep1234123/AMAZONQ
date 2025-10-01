'use strict'
app.directive('hcStatsPieChart', [function() {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            data: '='
        },
        link: function(scope, element) {
            var options = {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: scope.data.chartTitle
                },
                subtitle: {
                    text: scope.data.subtitle
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                 exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ["viewFullscreen"],
                        }
                    }
                },
                plotOptions: {
                    pie: {
                        showInLegend: true,
                        innerSize: '30%',
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '{point.percentage:.1f} %',
                            distance: -50,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 4
                            },
                            style: {
                                fontWeight: 'bold',
                                fontSize: '17px',
                            }
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'top',
                    x: -20,
                    y:10,
                    verticalAlign: 'bottom',
                    floating: true,
                    backgroundColor: '#00808000',
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: '',
                    colorByPoint: true,
                    data: scope.data.series
                }]
            };
            Highcharts.chart(element[0], options);
        }
    };
}]);