/**
 * Exports the {@link moonstone/ToggleItem.ToggleItem} and
 * {@link moonstone/ToggleItem.ToggleItemBase} components.
 *
 * @module moonstone/ToggleItem
 */

import kind from '@enact/core/kind';
import React from 'react';
import PropTypes from 'prop-types';
import Toggleable from '@enact/ui/Toggleable';

import componentCss from './ToggleItem.less';

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
		 * [component description]
		 *
		 * @type {[type]}
		 */
		component: PropTypes.func,

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

		iconComponent: PropTypes.func,

		/**
		 * Specifies on which side (`before` or `after`) of the text the icon appears.
		 *
		 * @type {String}
		 * @default 'before'
		 * @public
		 */
		iconPosition: PropTypes.oneOf(['before', 'after']),

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
		selected: false,
		value: null
	},

	styles: {
		css: componentCss,
		className: 'toggleItem',
		publicClassNames: true
	},

	computed: {
		className: ({selected, styler}) => styler.append({selected}),
		slotAfter: ({iconClasses, iconComponent: Icon, selected, icon, iconPosition, styler}) => {
			if (iconPosition === 'after') {
				return (
					<Icon className={styler.join('icon', iconClasses)} selected={selected}>
						{icon}
					</Icon>
				);
			}
		},
		slotBefore: ({iconClasses, iconComponent: Icon, selected, icon, iconPosition, styler}) => {
			if (iconPosition === 'before') {
				return (
					<Icon className={styler.join('icon', iconClasses)} selected={selected}>
						{icon}
					</Icon>
				);
			}
		}
	},

	render: ({children, component: Component, slotAfter, slotBefore, selected, ...rest}) => {
		delete rest.icon;
		delete rest.iconClasses;
		delete rest.iconPosition;
		delete rest.iconComponent;

		return (
			<Component
				role="checkbox"
				{...rest}
				aria-checked={selected}
				slotAfter={slotAfter}
				slotBefore={slotBefore}
			>
				{children}
			</Component>
		);
	}
});

const ToggleItemDecorator = Toggleable({toggleProp: 'onTap'});

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
