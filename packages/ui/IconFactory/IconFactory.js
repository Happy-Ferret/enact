/**
 * Exports the {@link moonstone/Icon.Icon} component and the list of icon constants as
 * [iconList]{@link moonstone/Icon.iconList}.
 *
 * @module moonstone/Icon
 */

import factory from '@enact/core/factory';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import {isSingleCharacter, mergeStyle} from './util.js';

import componentCss from './Icon.less';

const IconFactory = factory({css: componentCss}, ({css}) => {
	/**
	 * {@link moonstone/Icon.Icon} is a component that displays an icon image.  You may
	 * specify an image, by setting the `src` property, or a font-based icon, by setting the child to a
	 * string from the [IconList]{@link moonstone/Icon.IconList}.  If both `src` and
	 * children are specified, both will be rendered.
	 *
	 * Usage:
	 * ```
	 * <Icon small>
	 *     plus
	 * </Icon>
	 * ```
	 *
	 * @class Icon
	 * @memberof moonstone/Icon
	 * @ui
	 * @public
	 */
	const Icon = kind({
		name: 'Icon',

		propTypes: /** @lends moonstone/Icon.Icon.prototype */ {
			/**
			 * The icon specified as either:
			 *
			 * * A string that represents an icon from the [IconList]{@link moonstone/Icon.IconList},
			 * * An HTML entity string, Unicode reference or hex value (in the form '0x...'),
			 * * A URL specifying path to an icon image, or
			 * * An object representing a resolution independent resource (See {@link ui/resolution}).
			 *
			 * @type {String|Object}
			 * @public
			 */
			children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

			iconList: PropTypes.object,

			/**
			 * If `true`, apply a pressed styling
			 *
			 * @type {Boolean}
			 * @public
			 */
			pressed: PropTypes.bool,

			/**
			 * If `true`, apply the 'small' class.
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			small: PropTypes.bool
		},

		defaultProps: {
			small: false
		},

		styles: {
			css,
			className: 'icon'
		},

		computed: {
			className: ({children: icon, iconList, pressed, small, styler}) => styler.append({
				// If the icon isn't in the list, apply our custom font class
				dingbat: !iconList || !iconList[icon],
				pressed,
				small
			}),
			iconProps: ({children: iconProp, iconList, style}) => {
				let icon = iconList && iconList[iconProp];

				if (!icon) {
					if (typeof iconProp == 'string') {
						if (iconProp.indexOf('&#x') === 0) {
							// Converts a hex reference in HTML entity form: &#x99999;
							icon = parseInt(iconProp.slice(3, -1), 16);
						} else if (iconProp.indexOf('&#') === 0) {
							// Convert an HTML entity: &#99999;
							icon = parseInt(iconProp.slice(2, -1));
						} else if (iconProp.indexOf('\\u') === 0) {
							// Convert a unicode reference: \u99999;
							icon = parseInt(iconProp.slice(2), 16);
						} else if (iconProp.indexOf('0x') === 0) {
							// Converts a hex reference in string form
							icon = String.fromCodePoint(iconProp);
						} else if (isSingleCharacter(iconProp)) {
							// A single character is assumed to be an explicit icon string
							icon = iconProp;
						} else {
							// for a path or URI, add it to style
							style = mergeStyle(style, iconProp);
						}
					} else if (typeof iconProp === 'object') {
						style = mergeStyle(style, iconProp);
					}
				}

				if (typeof icon == 'number') {
					// Converts a hex reference in number form
					icon = String.fromCodePoint(icon);
				}

				return {
					children: icon,
					style
				};
			}
		},

		render: ({iconProps, ...rest}) => {
			delete rest.small;

			return <div aria-hidden {...rest} {...iconProps} />;
		}
	});

	return Icon;
});

export default IconFactory;
export {
	IconFactory
};
