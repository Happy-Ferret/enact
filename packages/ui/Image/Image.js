/**
 * Provides unstyled image component to be customized by a theme or application.
 *
 * @module ui/Image
 * @exports Image
 */

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';
import {selectSrc} from '../resolution';

import componentCss from './Image.less';

/**
 * A basic image component designed to display images conditionally based on screen size. This
 * component does not have a default size as a result image will not show unless size is specified
 * for its particular usage using a CSS `className` or inline `style`.
 *
 * Usage:
 *
 * ```
 * const src = {
 *   'hd': 'http://lorempixel.com/64/64/city/1/',
 *   'fhd': 'http://lorempixel.com/128/128/city/1/',
 *   'uhd': 'http://lorempixel.com/256/256/city/1/'
 * };
 *
 * <Image className={css.myImage} src={src} sizing="fill" />
 * ```
 *
 * `ui/Image` is based on the `div` element, but it uses `img` to provide `onError` and `onLoad`
 * events. The image that you see on screen is a `background-image` from the `div` element, not the
 * `img` element.
 *
 * > If you need a naturally sized image, you can use the native `<img>` element instead.
 *
 * @class Image
 * @memberof ui/Image
 * @ui
 * @public
 */
const ImageBase = kind({
	name: 'ui:Image',

	propTypes: /** @lends ui/Image.Image.prototype */ {
		/**
		 * String value or Object of values used to determine which image will appear on
		 * a specific screenSize.
		 *
		 * @type {String | Object}
		 * @required
		 * @public
		 */
		src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,

		/**
		 * Sets the aria-label for the image. If unset, it defaults to the value of `alt`
		 *
		 * @type {String}
		 * @public
		 * @memberof ui/Image.Image.prototype
		 */
		// Quoting this (necessary) makes it alphabetically sort differently...
		'aria-label': PropTypes.string,

		/**
		 * String value for the alt attribute of the image.
		 *
		 * @type {String}
		 * @public
		 */
		alt: PropTypes.string,

		/**
		 * Node for the children of an Image. Useful for overlays.
		 *
		 * @type {Node}
		 * @public
		 */
		children: PropTypes.node,

		/**
		 * Customizes the component by mapping the supplied collection of CSS class names to the
		 * corresponding internal Elements and states of this component.
		 *
		 * The following classes are supported:
		 *
		 * * `image` - The root component class
		 * * `fit` - Applied when `sizing` prop is `fit`
		 * * `fill` - Applied when `sizing` prop is `fill`
		 *
		 * @type {Object}
		 * @public
		 */
		css: PropTypes.object,

		/**
		 * Function that will run if the image has an error.
		 *
		 * @type {Function}
		 * @public
		 */
		onError: PropTypes.func,

		/**
		 * Function that will run once the image is loaded.
		 *
		 * @type {Function}
		 * @public
		 */
		onLoad: PropTypes.func,

		/**
		 * A placeholder image to be displayed before the image is loaded.
		 * For performance purposes, it should be pre-loaded or be a data url.
		 *
		 * @type {String}
		 * @default ''
		 * @public
		 */
		placeholder: PropTypes.string,

		/**
		 * Used to set the `background-size` of an Image.
		 *
		 * * `'fill'` - sets `background-size: cover`
		 * * `'fit'` - sets `background-size: contain`
		 * * `'none'` - uses the image's natural size
		 *
		 * @type {String}
		 * @default 'fill'
		 * @public
		 */
		sizing: PropTypes.oneOf(['fit', 'fill', 'none'])
	},

	defaultProps: {
		placeholder: '',
		sizing: 'fill'
	},

	styles: {
		css: componentCss,
		className: 'image',
		publicClassNames: true
	},

	computed: {
		bgImage: ({src, placeholder}) => {
			const imageSrc = selectSrc(src);
			if (!imageSrc) return null;
			return placeholder ? `url("${imageSrc}"), url("${placeholder}")` : `url("${imageSrc}")`;
		},
		className: ({className, sizing, styler}) => {
			return sizing !== 'none' ? styler.append(sizing) : className;
		},
		imgSrc: ({src}) => selectSrc(src) || null
	},

	render: ({alt, 'aria-label': ariaLabel, bgImage, children, css, imgSrc, onError, onLoad, style, ...rest}) => {
		delete rest.placeholder;
		delete rest.sizing;
		delete rest.src;

		return (
			<div role="img" {...rest} aria-label={ariaLabel || alt} style={{...style, backgroundImage: bgImage}}>
				{children}
				<img className={css.img} src={imgSrc} alt={alt} onLoad={onLoad} onError={onError} />
			</div>
		);
	}
});

export default ImageBase;
export {
	ImageBase as Image,
	ImageBase
};
