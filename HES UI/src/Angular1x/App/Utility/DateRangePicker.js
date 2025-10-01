'use strict'
app.directive('input', ['$compile', '$parse', '$filter', 'AuthService', function ($compile, $parse, $filter, AuthService) {
	return {
		restrict: 'E',
		require: '?ngModel',
		link: function ($scope, $element, $attributes, ngModel) {

			var userInfo = AuthService.getAuthInfo();
			var dateFormat = userInfo.cultureInfo.DateTimeFormats.ShortDatePattern;
			var lookBackDate = userInfo.dataLookBackDate;
			if ($attributes.type !== 'daterange' || ngModel === null) {
				return;
			}

			$attributes.format = dateFormat || $attributes.format || 'YYYY-MM-DD';
			if ($attributes.minDate != undefined && $attributes.minDate != '' && $attributes.minDate != null) {
				$attributes.minDate = moment($attributes.minDate, "DD/MM/YYYY");
			}
			else {
				$attributes.minDate = moment(lookBackDate, "DD/MM/YYYY");
			}
			$attributes.maxDate = moment(new Date());

			var options = {};
			options.format = $attributes.format;
			options.separator = $attributes.separator || ' - ';
			options.minDate = $attributes.minDate;
			options.maxDate = $attributes.maxDate;
			options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function (elem, index) {
				return index === 0 && parseInt(elem, 10) || elem;
			}));


			options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);
			options.locale = $attributes.locale && $parse($attributes.locale)($scope);
			options.opens = $attributes.opens || $parse($attributes.opens)($scope);

			if ($attributes.enabletimepicker) {
				options.timePicker = true;
				angular.extend(options, $parse($attributes.enabletimepicker)($scope));
			}

			function datify(date) {
				return moment.isMoment(date) ? date.toDate() : date;
			}

			function momentify(date) {
				return (!moment.isMoment(date)) ? moment(date) : date;
			}

			function format(date) {
				if (date.format)
					return $filter('date')(datify(date), date.format(options.format));// options.format.replace(/Y/g, 'y').replace(/D/g, 'd')); //date.format(options.format);
				else
					return moment(date).format(options.format);
			}

			function formatted(dates) {
				return [format(dates.startDate), format(dates.endDate)].join(options.separator);
			}

			ngModel.$render = function () {
				if (!ngModel.$viewValue || !ngModel.$viewValue.startDate) {
					return;
				}
				$element.val(formatted(ngModel.$viewValue));
			};

			$scope.$watch(function () {
				return $attributes.ngModel;
			}, function (modelValue, oldModelValue) {

				if (!ngModel.$modelValue || (!ngModel.$modelValue.startDate)) {
					ngModel.$setViewValue({
						startDate: moment().startOf('day'),
						endDate: moment().startOf('day')
					});
					return;
				}

				if (oldModelValue !== modelValue) {
					return;
				}

				$element.data('daterangepicker').startDate = momentify(ngModel.$modelValue.startDate);
				$element.data('daterangepicker').endDate = momentify(ngModel.$modelValue.endDate);
				$element.data('daterangepicker').updateView();
				$element.data('daterangepicker').updateCalendars();
				$element.data('daterangepicker').updateInputText();

			});

			$element.daterangepicker(options, function (start, end, label) {

				var modelValue = ngModel.$viewValue;

				if (angular.equals(start, modelValue.startDate) && angular.equals(end, modelValue.endDate)) {
					return;
				}

				$scope.$apply(function () {
					ngModel.$setViewValue({
						startDate: (moment.isMoment(modelValue.startDate)) ? start : start.toDate(),
						endDate: (moment.isMoment(modelValue.endDate)) ? end : end.toDate()
					});
					ngModel.$render();
				});

			});

		}

	};

}]);