'use strict'

app.controller('DatagridCtrl', ['$scope', 'filterFilter', '$filter', 
  '$stateParams',  '$rootScope', DatagridCtrl]);

function DatagridCtrl($scope,  filterFilter, $filter, $stateParams,
   $rootScope) {
  var vm = this;
  vm.sortAscending = '';
  vm.sortDescending = '';
  vm.groupDataPageSize = 15;
  $scope.userInfo = $stateParams.userInfo;

  vm.srNumber = 1;
  $scope.$watch('data', function (newData) {

    vm.data = newData;

    if (vm.data) {
      var checkedCounter = 0;
      if (vm.data.showCheckbox) {
        _.forEach(vm.data.rowData, function (item) {
          if (!_.isUndefined(item.CheckboxValue) && item.CheckboxValue === "true") {
            item.CheckboxValue = true;
            checkedCounter++;
          } else {
            item.CheckboxValue = false;
          }
        })

        if (checkedCounter == vm.data.rowData.length) {
          vm.checkAll = true;
        } else {
          vm.checkAll = false;
        }
      }


      if (vm.data.isGrouping) {
        vm.data.tableBodyTemplateURL = vm.data.tableBodyTemplateURL || 'Angular1x/App/Shared/PartialView/DataGrid/groupRow.html';
      } else
        vm.data.tableBodyTemplateURL = vm.data.tableBodyTemplateURL || 'Angular1x/App/Shared/PartialView/DataGrid/tableRow.html';
      if ($rootScope.isNotNullorUndefined(vm.data.startIndex)) {
        vm.filteredData = vm.data.headingData.filter((item, index) => index > vm.data.startIndex && item.visible);

      }

      vm.isEnableTranslation = vm.data.isEnableTranslation == undefined ? true : vm.data.isEnableTranslation;
      if (vm.data.isTransformModelForGrouping) {
        vm.data.headingData = _.reject(vm.data.headingData, function (headerObj) {
          return headerObj.name == "GroupName";
        });
        vm.data.tableData = [];
        var _groupNames = _.map(vm.data.rowData, 'GroupName');
        _groupNames = _.uniq(_groupNames);
        _.forEach(_groupNames, function (value) {
          var _groupData = [];
          _groupData = _.filter(vm.data.rowData, {
            'GroupName': value
          });

          if ($scope.$parent.setGroupData != undefined &&
            $scope.$parent.setGroupData != null) {
            $scope.$parent.setGroupData(vm.data.tableData, value, _groupData);
          }
          else {
            vm.data.tableData.push({
              GroupName: value,
              GroupData: _groupData
            });
          }
        });
        vm.data.tableData.forEach(function (item) {
          item.ShowRow = vm.data.expandGroupingRows;
        })
        vm.data.rowData = [];
      }

      $scope.currentPage = 0;
      $scope.pageSize = vm.data.pageSize != null ? vm.data.pageSize : 10;
      $scope.pagination = {};
      $scope.getData = function () {
        if (vm.data.rowData == null)
          return $filter('filter')(vm.data.tableData, vm.searchVal);
        else
          return $filter('filter')(vm.data.rowData, vm.searchVal)
      }

      if (vm.data.pageSize != null) {
        $scope.pagination = {
          currentPage: 0,
          totalRecords: 0,
          pageSize: vm.data.pageSize
        };
      } else {
        $scope.pagination = {
          currentPage: 0,
          totalRecords: 0,
          pageSize: 10
        };
      }


      if (vm.data.serverPagination) {
        $scope.pagination.currentPage = vm.data.currentPage;
        $scope.pagination.pageSize = vm.data.pageSize;
        $scope.pagination.totalRecords = vm.data.totalRecords;
        $scope.pagination.totalNoOfPages = Math.ceil(vm.data.totalRecords / vm.data.pageSize);
        vm.srNumber = $scope.pagination.currentPage === 0 ? 1 : vm.srNumber;
      }
      vm.resetPaging = function (pageSize) {
        if (!vm.data.serverPagination) {

          vm.srNumber = 1;
          $scope.currentPage = 0;
          $scope.pageSize = pageSize;
        } else {
          if ($scope.pagination.currentPage != 0) {
            $scope.pagination.currentPage = Math.ceil((vm.srNumber) / pageSize);
            $scope.pagination.totalRecords = 0;
            $scope.pagination.pageSize = pageSize;
            $scope.pagination.startRow = vm.srNumber;
            vm.srNumber = vm.srNumber;
          } else {
            $scope.pagination = {
              currentPage: 0,
              totalRecords: 0,
              pageSize: pageSize
            };

            vm.srNumber = 1;
          }
          vm.data.getRecords($scope.pagination);
        }
      }

      $scope.CalculatePagePosition = function (position) {
      }

      $scope.numberOfPages = function () {
        return Math.ceil($scope.getData().length / $scope.pageSize);
      }

      $scope.lastPage = function () {
        if (vm.data.isClientSidePagination != null) {
          var lastPage = Math.ceil(vm.data.totalRecords / $scope.pageSize);
          $scope.currentPage = Math.ceil(vm.data.totalRecords / $scope.pageSize) - 1;

          vm.srNumber = ((lastPage - 1) * $scope.pageSize) + 1;
          return;

        }

        if (!vm.data.serverPagination) {
          var lastPage = Math.ceil($scope.getData().length / $scope.pageSize);
          $scope.currentPage = Math.ceil($scope.getData().length / $scope.pageSize) - 1;

          vm.srNumber = ((lastPage - 1) * $scope.pageSize) + 1;
          return $scope.currentPage;
        } else {
          if ($scope.pagination.currentPage != $scope.pagination.totalNoOfPages - 1 && $scope.pagination.totalRecords != 0) {

            if ($scope.pagination.pageSize + vm.srNumber - 1 > $scope.pagination.totalRecords) {
              return;
            }
            $scope.pagination.currentPage = $scope.pagination.totalNoOfPages - 1;
            vm.srNumber = ($scope.pagination.currentPage * $scope.pagination.pageSize) + 1;
            $scope.pagination.startRow = vm.srNumber;
            vm.data.getRecords($scope.pagination);
          }
        }
      }
      $scope.previousPage = function () {
        if (!vm.data.serverPagination) {
          $scope.currentPage = $scope.currentPage == 0 ? $scope.currentPage : $scope.currentPage - 1;
          vm.srNumber = ($scope.currentPage * $scope.pageSize) + 1;
          return $scope.currentPage;
        } else {
          if ($scope.pagination.currentPage != 0) {
            var currentVal = vm.srNumber - $scope.pageSize;
            $scope.pagination.currentPage = currentVal <= 0 ? 0 : $scope.pagination.currentPage - 1;
            vm.srNumber = currentVal <= 0 ? 1 : currentVal;
            $scope.pagination.startRow = vm.srNumber;
            vm.data.getRecords($scope.pagination);
          }
        }
      }


      $scope.nextPage = function () {
        if (vm.data.isClientSidePagination != null) {
          if (vm.srNumber + $scope.pageSize > vm.data.totalRecords)
            return;
        }

        if (!vm.data.serverPagination) {
          $scope.currentPage = $scope.currentPage >= $scope.getData().length / $scope.pageSize - 1 ? $scope.currentPage : $scope.currentPage + 1;
          vm.srNumber = vm.srNumber + $scope.pageSize;
          if ($scope.pagination.pageSize + vm.srNumber >= $scope.getData().length) {
            return;
          }
          return $scope.currentPage;
        } else {
          if ($scope.pagination.currentPage != $scope.pagination.totalNoOfPages - 1 && $scope.pagination.totalRecords != 0) {
            if ($scope.pagination.pageSize + vm.srNumber - 1 > $scope.pagination.totalRecords) {
              return;
            }

            $scope.pagination.currentPage = $scope.pagination.currentPage + 1;
            vm.srNumber = vm.srNumber + $scope.pageSize;
            $scope.pagination.startRow = vm.srNumber;
            vm.data.getRecords($scope.pagination);
          }
        }
      }

      $scope.firstPage = function () {
        if (!vm.data.serverPagination) {
          $scope.currentPage = 0;
          vm.srNumber = 1;
          return $scope.currentPage;
        } else {
          if ($scope.pagination.currentPage != 0) {
            $scope.pagination.currentPage = 0;
            vm.srNumber = 1;
            $scope.pagination.startRow = vm.srNumber;
            vm.data.getRecords($scope.pagination);
          }
        }
      }

      vm.exportTableId = Math.random().toString().replace('.', '');
      vm.numberOfItems = vm.data.numberOfItems || [10, 25, 50, 100, 500];
      if ($scope.pagination.totalRecords > 0) {
      }
      vm.itemsPerPage = vm.numberOfItems[0];
      vm.checkForVisibleColumnName = function () {
        var dataAfterFilter = filterFilter(vm.data.headingData, {
          visible: true
        });
        if (dataAfterFilter && dataAfterFilter.length > vm.data.numberOfColumn)
          vm.showPlusMinus = true;
        else
          vm.showPlusMinus = false;
      }

      vm.onChangeColumnList = function (colItem) {
        colItem.visible = !colItem.visible;
        vm.checkForVisibleColumnName();
        if (vm.data.isGrouping) {
          vm.data.tableData.forEach(function (item) {
            item.GroupData.forEach(function (item) {
              item.ShowRowDetails = false;
            })
          })
        } else {
          vm.data.rowData.forEach(function (item) {
            item.ShowRowDetails = false;
          })
        }
      }

      vm.checkForVisibleColumnName();

      vm.disabledCheckbox = function () {
        var visibleCheckbox = _.filter(vm.data.headingData, {
          visible: true
        });
        return visibleCheckbox.length === 1 ? true : false;
      }

      vm.collapseRows = function (item) {
        item.ShowRow = item.ShowRow == undefined ? true : !item.ShowRow;
        if (vm.data.isGrouping) {
          vm.data.tableData.forEach(function (item) {
            item.GroupData.forEach(function (item) {
              item.ShowRowDetails = false;
            })
          })
        }
      }
      vm.sortBy = function (propertyName) {
        vm.sortingColumnName = propertyName;
        propertyName = "'" + propertyName + "'";
        vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
        vm.propertyName = propertyName;
      }

      if (vm.data.sortColumnName != null) {
        var propertyName = vm.data.sortColumnName;
        vm.sortingColumnName = propertyName;
        propertyName = "'" + propertyName + "'";
        vm.reverse = (vm.data.reverse != undefined) ? vm.data.reverse : true; // (vm.propertyName === propertyName) ? !vm.reverse : false;
        vm.propertyName = propertyName;
      }

      vm.expandRowsDetails = function (item) {
        item.ShowRowDetails = item.ShowRowDetails == undefined ? true : !item.ShowRowDetails;
      }

      $scope.$watch('searchKeyValue', function (newData) {
        vm.searchVal = newData;
        vm.search();
      })

      vm.search = function () {
        return function (item) {
          if (!vm.searchVal)
            return true;

          var result = false;
          vm.data.headingData.forEach(function (key) {

            if (_.includes((item[key.name] ? item[key.name] : "").toString().toLowerCase(), vm.searchVal.toLowerCase())) {
              return result = true;
            };

          })
          return result;
        }
      }

      vm.ExportToExcel = function () {
        var title = "Report.xls"
        var exportTableId = vm.exportTableId;
        if (vm.data.customExport) {
          title = vm.data.exportFileName + ".xls";
          exportTableId = vm.data.tableID;
        }
        var tableContent = document.getElementById(exportTableId).innerHTML;
        var contentWithCheckmark = tableContent.replace(/<!--CHECKMARK_PLACEHOLDER-->/g, "=UNICHAR(10004)");
        var blob = new Blob([contentWithCheckmark], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, title);

      };

      vm.loadGroupData = function (item) {
        item.pageSize = !item.pageSize ? vm.groupDataPageSize + vm.groupDataPageSize : item.pageSize + vm.groupDataPageSize;
      }

      vm.onAllCheckboxChange = function () {
        if (vm.checkAll) {
          _.forEach(vm.data.rowData, function (item) {
            item.CheckboxValue = true;
          })
        } else {
          _.forEach(vm.data.rowData, function (item) {
            item.CheckboxValue = false;
          })
        }
      }
    }

  });
  $scope.showHoverDetails = function () {
    $('.popoverClass').popover({ trigger: "hover" });
  }

  $scope.formatDataForHoverColumn = function (originalText) {
    var modifiedText = originalText;
    if (originalText != null && originalText.length > 10) {
      modifiedText = originalText.substring(0, 10) + "...";
    }
    return modifiedText;
  }
  $scope.FormatData = function (columnData, columnFormat) {
    return $rootScope.FormatData(columnData, columnFormat);
  }
  $scope.OnRowInit = function (row) {
    if ($scope.$parent.OnRowInit != undefined && $scope.$parent.OnRowInit != null) {
      $scope.$parent.OnRowInit(row.$parent);
    }
  }
  $scope.FormatLinkData = function (record, column, columnData) {
    var formattedString = columnData;
    if (column.LinkDisplay != undefined && column.LinkDisplay != null) {
      formattedString = column.LinkDisplay.replace("{columnName}", columnData);
    }
    if ($scope.$parent.FormatLinkData != undefined && $scope.$parent.FormatLinkData != null) {

      formattedString = $scope.$parent.FormatLinkData(record, column, columnData, formattedString);
    }

    return formattedString;
  }
  $scope.FormatStyle = function (value) {
    var style = { 'background-color': '#ccc' };
    if ($scope.$parent.FormatStyle != undefined && $scope.$parent.FormatStyle != null) {
      style = $scope.$parent.FormatStyle(value);
    }
    return style;
  }

  $scope.linkColumnClicked = function (source, rowData) {
    if ($scope.$parent.gridLinkColumnClicked != undefined && $scope.$parent.gridLinkColumnClicked != null) {
      $scope.$parent.gridLinkColumnClicked(source, rowData);
    }
  }
  $scope.onControlClick = function (eventObject) {
    if ($scope.$parent.onControlClick != undefined && $scope.$parent.onControlClick != null) {
      $scope.$parent.onControlClick(eventObject);
    }
  }

};
