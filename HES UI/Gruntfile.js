module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks("grunt-browserify");

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      app: {
        files: {
          './src/Angular1x/public/js/annotate/dashboard.js': ['./src/Angular1x/App/Components/Dashboard/Controller/*.js'],
          './src/Angular1x/public/js/annotate/analytics.js': ['./src/Angular1x/App/Components/Analytics/Controller/*.js'],
          './src/Angular1x/public/js/annotate/masters.js': ['./src/Angular1x/App/Components/Masters/Controller/*.js'],
          './src/Angular1x/public/js/annotate/commissioning.js': ['./src/Angular1x/App/Components/Commissioning/Controller/*.js'],
          './src/Angular1x/public/js/annotate/tools.js': ['./src/Angular1x/App/Components/Tools/Controller/*.js'],
          './src/Angular1x/public/js/annotate/users.js': ['./src/Angular1x/App/Components/Users/Controller/*.js'],
          './src/Angular1x/public/js/annotate/diagnostics.js': ['./src/Angular1x/App/Components/Diagnostics/Controller/*.js'],
          './src/Angular1x/public/js/annotate/prepayments.js': ['./src/Angular1x/App/Components/Prepayments/Controller/*.js'],
          './src/Angular1x/public/js/annotate/reports.js': ['./src/Angular1x/App/Components/Reports/Controller/*.js'],
          './src/Angular1x/public/js/annotate/services.js': ['./src/Angular1x/App/Services/*.js'],
          './src/Angular1x/public/js/annotate/ddtcontrollers.js': ['./src/Angular1x/App/Directives/Controllers/*.js'],
          './src/Angular1x/public/js/annotate/directives.js': ['./src/Angular1x/App/Directives/Ddt/*.js'],
          './src/Angular1x/public/js/annotate/shared.js': ['./src/Angular1x/App/Shared/SideBar/SideBarCtrl.js'],
          './src/Angular1x/public/js/annotate/utility.js': ['./src/Angular1x/App/Utility/*.js']
        }
      }
    },
    concat: {
        
      css: {
        files: {
          './src/Angular1x/public/css/concat/hesstyle.css': [
            './src/Angular1x/styles/vendor.eca86475.css'
            , './src/Angular1x/styles/main.23834fd9.css'
            , './src/Angular1x/styles/LoginStyle.css'
            , './src/Angular1x/styles/material.css'
            , './src/Angular1x/styles/CustomStyle.css'
            , './src/Angular1x/app.css'
            , './src/Angular1x/styles/angular-datepicker.css'
            , './src/Angular1x/styles/vis-angular.css'
            
          ],
          './src/Angular1x/styles/commoncss.min.css': [
            './src/Angular1x/styles/bootstrap.min.css', './src/Angular1x/styles/vis.min.css', './src/Angular1x/styles/angular-bootstrap-toggle.min.css', './src/Angular1x/styles/ngNotificationsBar.min.css'
          ]
        }
      },
      dist: {
        files: {
          './src/Angular1x/public/js/concat/hesapp.js': [
            './src/Angular1x/public/js/annotate/*.js'
          ],
          './src/Angular1x/public/js/concat/hesscripts.js': [
            './src/Angular1x/scripts/login.js'
            , './src/Angular1x/scripts/Util.js'
          ],
          './src/Angular1x/public/js/concat_dependencies/flot.js': [
            './src/Angular1x/scripts/vendor/flot/jquery.flot.orderBars.js'
            , './src/Angular1x/scripts/vendor/flot/jquery.flot.pie.js'
            , './src/Angular1x/scripts/Chart_Module/Chart.js'
            , './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.js'
            , './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.charts.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.gantt.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.maps.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.powercharts.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.ssgrid.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.treemap.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.widgets.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/fusioncharts.zoomscatter.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/themes/fusioncharts.theme.carbon.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/themes/fusioncharts.theme.fint.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/themes/fusioncharts.theme.ocean.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/themes/fusioncharts.theme.zune.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/maps/fusioncharts.usa.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/maps/fusioncharts.world.js', './src/Angular1x/scripts/angular-dateparser.js', './src/Angular1x/scripts/position.js', './src/Angular1x/scripts/angular-timepicker.js'
            , './src/Angular1x/scripts/angular-datepicker.js'
            , './src/Angular1x/scripts/vis-angular.js'
            , './src/Angular1x/scripts/angular-bootstrap-multiselect.min.js'
          ],
          './src/Angular1x/public/js/min/dependencies/common.min.js': [
            './src/Angular1x/scripts/ngNotificationsBar.min.js','./src/Angular1x/scripts/vis.min.js', './src/Angular1x/scripts/angular-local-storage.min.js', './src/Angular1x/scripts/angular-bootstrap-toggle.min.js', './src/Angular1x/scripts/angular-base64.min.js', './src/Angular1x/scripts/FileSaver.min.js', './src/Angular1x/scripts/datetime-picker.min.js', './src/Angular1x/scripts/Chart_Module/angular-chart.min.js', './src/Angular1x/scripts/Chart_Module/tc-angular-chartjs.min.js', './src/Angular1x/scripts/Chart_Module/Fusion_ChartModule/angular-fusioncharts.min.js', './src/Angular1x/scripts/angular-file-saver.min.js'
          ]
        }
      }
    },
    browserify: {
      dist: {
        options: {
          transform: [
            ["babelify", {
              "presets": ["es2015"]
            }]
          ]
        },
        files: {
          // In Hes, the result file's extension is always .js
          "./src/Angular1x/public/js/es2015/hesEs2015.js": [
              './src/Angular1x/public/js/concat/hesapp.js'
            , './src/Angular1x/public/js/concat/hesscripts.js'
          ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          './src/Angular1x/public/js/min/hesapp.min.js': './src/Angular1x/public/js/es2015/hesEs2015.js',
          './src/Angular1x/public/js/min/dependencies/hesscripts.min.js': [
            './src/Angular1x/public/js/concat_dependencies/hesscripts.js'
            , './src/Angular1x/public/js/concat_dependencies/flot.js'
          ]
        }
      }
    },
    cssmin: {
      css: {
        src: './src/Angular1x/public/css/concat/hesstyle.css',
        dest: './src/Angular1x/styles/hesstyle.min.css'
      }
    }
    //watch: {
    //    scripts: {
    //        files: ['./App/Components/**/Controller/*.js'],
    //        tasks: ['ngAnnotate', 'concat', 'uglify']
    //    }
    //}
  });
  grunt.registerTask('default', ['ngAnnotate', 'concat', 'browserify', 'uglify', 'cssmin']);
}
