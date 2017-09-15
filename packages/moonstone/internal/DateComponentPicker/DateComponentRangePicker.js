import kind from '@enact/core/kind';
import React from 'react';
import PropTypes from 'prop-types';
import Pressable from '@enact/ui/Pressable';
import Spottable from '@enact/spotlight/Spottable';
import {RangePickerBase} from '../../RangePicker';

import DateComponentPickerChrome from './DateComponentPickerChrome';

const RangePicker = Pressable(Spottable(RangePickerBase));

/**
 * {@link moonstone/internal/DataComponentPicker.DateComponentRangePicker} allows the selection of
 * one part of the date or time using a {@link moonstone/RangePicker.RangePicker}.
 *
 * @class DateComponentRangePickerBase
 * @memberof moonstone/internal/DateComponentPicker
 * @ui
 * @private
 */
const DateComponentRangePickerBase = kind({
	name: 'DateComponentRangePicker',

	propTypes:  /** @lends moonstone/internal/DateComponentPicker.DateComponentRangePickerBase.prototype */ {
		/**
		 * The maximum value for the date component
		 *
		 * @type {Number}
		 * @required
		 */
		max: PropTypes.number.isRequired,

		/**
		 * The minimum value for the date component
		 *
		 * @type {Number}
		 * @required
		 */
		min: PropTypes.number.isRequired,

		/**
		 * The value of the date component
		 *
		 * @type {Number}
		 * @required
		 */
		value: PropTypes.number.isRequired,

		/**
		 * The label to display below the picker
		 *
		 * @type {String}
		 */
		label: PropTypes.string,

		/**
		 * By default, the picker will animate transitions between items if it has a defined
		 * `width`. Specifying `noAnimation` will prevent any transition animation for the
		 * component.
		 *
		 * @type {Boolean}
		 * @public
		 */
		noAnimation: PropTypes.bool,

		/*
		 * When `true`, allow the picker to continue from the opposite end of the list of options.
		 *
		 * @type {Boolean}
		 * @public
		 */
		wrap: PropTypes.bool
	},

	render: ({className, label, max, min, noAnimation, value, wrap, ...rest}) => (
		<DateComponentPickerChrome className={className} label={label}>
			<RangePicker
				{...rest}
				accessibilityHint={label}
				joined
				max={max}
				min={min}
				noAnimation={noAnimation}
				orientation="vertical"
				value={value}
				wrap={wrap}
			/>
		</DateComponentPickerChrome>
	)
});

export default DateComponentRangePickerBase;
export {
	DateComponentRangePickerBase as DateComponentRangePicker,
	DateComponentRangePickerBase
};
