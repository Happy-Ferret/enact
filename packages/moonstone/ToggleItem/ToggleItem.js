/**
 * Exports the {@link moonstone/ToggleItem.ToggleItem} and
 * {@link moonstone/ToggleItem.ToggleItemBase} components.
 *
 * @module moonstone/ToggleItem
 */

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import Pure from '@enact/ui/internal/Pure';
import {ToggleItemBase as UiToggleItem, ToggleItemDecorator as UiToggleItemDecorator} from '@enact/ui/ToggleItem';
import compose from 'ramda/src/compose';
import React from 'react';

import SlotItem from '../SlotItem';

import ToggleIcon from './ToggleIcon';

import css from './ToggleItem.less';

/**
 * {@link moonstone/ToggleItem.ToggleItemBase} is a component to make a Toggleable Item
 * (e.g Checkbox, RadioItem). It has a customizable prop for icon, so any Moonstone Icon can be used
 * to represent the selected state.
 *
 * @class ToggleItemBase
 * @memberof moonstone/ToggleItem
 * @ui
 * @public
 */
const ToggleItemBase = kind({
	name: 'ToggleItem',

	propTypes: /** @lends moonstone/ToggleItem.ToggleItemBase.prototype */ {
		/**
		 * The string to be displayed as the main content of the toggle item.
		 *
		 * @type {String}
		 * @public
		 */
		children: PropTypes.node.isRequired,

		/**
		 * Applies a disabled visual state to the toggle item.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		disabled: PropTypes.bool,

		/**
		 * Icon property accepts a string or an Icon Element.
		 *
		 * @type {String|moonstone/Icon.Icon}
		 * @default null
		 * @public
		 */
		icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

		/**
		 * CSS classes for Icon
		 *
		 * @type {String}
		 * @default ''
		 * @public
		 */
		iconClasses: PropTypes.string,

		/**
		 * Specifies on which side (`before` or `after`) of the text the icon appears.
		 *
		 * @type {String}
		 * @default 'before'
		 * @public
		 */
		iconPosition: PropTypes.oneOf(['before', 'after']),

		/**
		 * Applies inline styling to the toggle item.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		inline: PropTypes.bool,

		/**
		 * The handler to run when the toggle item is toggled. Developers should
		 * generally use `onToggle` instead.
		 *
		 * @type {Function}
		 */
		onTap: PropTypes.func,

		/**
		 * The handler to run when the toggle item is toggled.
		 *
		 * @type {Function}
		 * @param {Object} event
		 * @param {String} event.selected - Selected value of item.
		 * @param {*} event.value - Value passed from `value` prop.
		 * @public
		 */
		onToggle: PropTypes.func,

		/**
		 * Applies the provided `icon` when the this is `true`.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		selected: PropTypes.bool
	},

	defaultProps: {
		disabled: false,
		iconClasses: '',
		iconPosition: 'before',
		inline: false,
		selected: false
	},

	styles: {
		css,
		className: 'toggleItem',
		publicClassNames: ['toggleItem']
	},

	render: (props) => {
		return (
			<UiToggleItem
				{...props}
				component={SlotItem}
				iconComponent={ToggleIcon}
			/>
		);
	}
});

const ToggleItemDecorator = compose(
	Pure,
	UiToggleItemDecorator
);

/**
 * {@link moonstone/ToggleItem.ToggleItemBase} is a component to make a Toggleable Item
 * (e.g Checkbox, RadioItem). It has a customizable prop for icon, so any Moonstone Icon can be used
 * to represent the selected state.
 *
 * @class ToggleItem
 * @memberof moonstone/ToggleItem
 * @extends moonstone/ToggleItem.ToggleItemBase
 * @mixes ui/Toggleable.Toggleable
 * @ui
 * @public
 */
const ToggleItem = ToggleItemDecorator(ToggleItemBase);

export default ToggleItem;
export {
	ToggleItem,
	ToggleItemBase,
	ToggleItemDecorator
};
