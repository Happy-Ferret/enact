/**
 * Exports the {@link ui/Layout.Layout}, {@link ui/Layout.LayoutBase}, and  {@link ui/Layout.Cell}
 * components. The default export is {@link ui/Layout.Layout}. Layout also has two shorthand
 * components exported: `Row` and `Column`. These two assign preset `orientation` properties to
 * simplify usage and readability. They are identical to `<Layout orientation="horizontal">` and
 * `<Layout orientation="vertical">` respectively.
 *
 * @example
 * <Layout>
 * 	<Cell shrink>
 * 		<Button small>First</Button>
 * 	</Cell>
 * 	<Cell>
 * 		<Item>An Item with some long text in it</Item>
 * 	</Cell>
 * 	<Cell shrink>
 * 		<Button small>Last</Button>
 * 	</Cell>
 * </Layout>
 *
 * @module ui/Layout
 */

import kind from '@enact/core/kind';
import React from 'react';
import PropTypes from 'prop-types';

import {Cell, toFlexAlign} from './Cell';

import css from './Layout.less';

/**
 * A stateless component that acts as a containing area for [Cells]{@link ui/Layout.Cell} to be
 * positioned in a row or a column (horizontally or vertically, respectively. It supports an
 * [orientation]{@link ui/Layout.Layout#orientation} property for laying-out its contents
 * (Cells) in an organized, readable way.
 *
 * Additional Example:
 * ```
 * import Input from '@enact/moonstone/Input';
 * import css from './LayoutExample.less';
 * ...
 * <fieldset>
 * 	<Layout align="center">
 * 		<Cell component="label" size="40%" className={css.label} shrink>First Name</Cell>
 * 		<Cell component={Input} placeholder="First" className={css.input} />
 * 	</Layout>
 * 	<Layout align="center">
 * 		<Cell component="label" size="40%" className={css.label} shrink>Last Name</Cell>
 * 		<Cell component={Input} placeholder="Last" className={css.input} />
 * 	</Layout>
 * </fieldset>
 * ```
 *
 * @class Layout
 * @memberof ui/Layout
 * @public
 */
const LayoutBase = kind({
	name: 'LayoutBase',

	propTypes: /** @lends ui/Layout.Layout.prototype */ {
		/**
		 * Aligns the children [Cells]{@link ui/Layout.Cell} vertically in the case of a horizontal
		 * layout or horizontally in the case of a vertical layout. `"start"`, `"center"` and
		 * `"end"` are the most commonly used, although all values of `align-items` are supported.
		 * `"start"` refers to the top in a horizontal layout, and left in a vertical LTR layout
		 * `"end"` refers to the bottom in a horizontal layout, and right in a vertical LTR layout
		 * `"start"` and `"end"` reverse places when in a vertical layout in a RTL locale.
		 * This includes support for `align-parts` which is shorthand for combining `align-items`
		 * and `justify-content` into a single property, separated by a space, in that order.
		 * This allows you to specify both the horizontal and vertical alignment in one property,
		 * separated by a space.
		 *
		 * @type {String}
		 * @public
		 */
		align: PropTypes.string,

		/**
		 * Only [Cell]{@link ui/Layout.Cell} components are supported as children.
		 *
		 * @type {Node}
		 * @public
		 */
		children: PropTypes.node,

		/**
		 * The type of component to use to render as the Layout. May be a DOM node name (e.g 'div',
		 * 'span', etc.) or a custom component.
		 *
		 * @type {String|Node}
		 * @default 'div'
		 * @public
		 */
		component:  PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

		/**
		 * Allows this Layout to have following siblings drawn on the same line as itself, instead
		 * of carving out the entire horizontal space for itself.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		inline: PropTypes.bool,

		/**
		 * The orientation of the Layout, i.e. how the children [Cells]{@link ui/Layout.Cell} are
		 * positioned on the screen. Must be either `'horizontal'` or `'vertical'`.
		 *
		 * @type {String}
		 * @default 'horizontal'
		 * @public
		 */
		orientation: PropTypes.oneOf(['horizontal', 'vertical']),

		/**
		 * Determine how a Layout handles its cells if there are more than fit in the available
		 * space. This works like a normal Boolean prop, but also accepts strings for customization
		 * beyond the basic on/off support. In addition to `true` and `false`, the following strings
		 * are supported: 'wrap', 'nowrap', 'reverse'. 'reverse' preforms standard line wrapping but
		 * additional lines are placed above/before the preceding line instead of below/after.
		 *
		 * @type {Boolean|String}
		 * @public
		 */
		wrap: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['reverse', 'nowrap', 'wrap'])])
	},

	defaultProps: {
		component: 'div',
		inline: false,
		orientation: 'horizontal',
		wrap: false
	},

	styles: {
		css,
		className: 'layout'
	},

	computed: {
		className: ({inline, orientation, wrap, styler}) => {
			return styler.append(
				orientation,
				{
					inline,
					nowrap: wrap === false || wrap === 'nowrap',
					wrap: wrap === true || wrap === 'wrap',
					wrapReverse: wrap === 'wrapReverse'
				}
			);
		},
		style: ({align, style}) => {
			if (!align) return style;

			// This is effectively a polyfill for the upcoming `place-items` prop which is shorthand
			// for align-items and justify-items together
			const alignParts = align.split(' ');

			return {
				...style,
				alignItems: toFlexAlign(alignParts[0]),
				justifyItems: toFlexAlign(alignParts[1])
			};
		}
	},

	render: ({component: Component, ...rest}) => {
		delete rest.align;
		delete rest.inline;
		delete rest.orientation;
		delete rest.wrap;

		return <Component {...rest} />;
	}
});

/**
 * A {@link ui/Layout.Layout} that positions its [Cells]{@link ui/Layout.Cell} vertically.
 *
 * @class Column
 * @memberof ui/Layout
 * @public
 */
const Column = (props) => (
	<LayoutBase {...props} orientation="vertical" />
);

/**
 * A {@link ui/Layout.Layout} that positions its [Cells]{@link ui/Layout.Cell} horizontally.
 *
 * @class Row
 * @memberof ui/Layout
 * @public
 */
const Row = (props) => (
	<LayoutBase {...props} orientation="horizontal" />
);

export default LayoutBase;
export {
	Cell,
	Column,
	LayoutBase as Layout,
	LayoutBase,
	Row
};
