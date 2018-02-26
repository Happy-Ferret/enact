import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';
import Toggleable from '@enact/ui/Toggleable';

import $L from '../internal/$L';
import IconButton from '../IconButton';

import css from './Scrollbar.less';

const classNameMap = {
	up: css.scrollbarUpButton,
	down: css.scrollbarBottomButton,
	left: css.scrollbarLeftButton,
	right: css.scrollbarRightButton
};

/**
 * A moonstone-styled base component for [ScrollButton]{@link moonstone/Scrollable.ScrollButton}.
 *
 * @class ScrollButtonBase
 * @memberof moonstone/Scrollable
 * @ui
 * @private
 */
const ScrollButtonBase = kind({
	name: 'ScrollButton',

	propTypes: /** @lends moonstone/Scrollable.ScrollButtonBase.prototype */ {
		/**
		 * Scroll direction for this button (down, left, right, or up)
		 *
		 * @type {String}
		 * @public
		 */
		direction: PropTypes.oneOf(['down', 'left', 'right', 'up']).isRequired,

		/**
		 * Render function for children
		 *
		 * @type {Function}
		 * @private
		 */
		render: PropTypes.func.isRequired,

		/**
		 * When `true`, the `aria-label` is set.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		active: PropTypes.bool,

		/**
		 * When `true`, the component is shown as disabled and does not generate `onClick`
		 * [events]{@glossary event}.
		 *
		 * @type {Boolean}
		 * @public
		 */
		disabled: PropTypes.bool
	},

	styles: {
		css,
		className: 'scrollButton'
	},

	computed: {
		'aria-label': ({active, direction}) => {
			if (!active) {
				return null;
			}

			switch (direction) {
				case 'up':
					return $L('scroll up');
				case 'down':
					return $L('scroll down');
				case 'left':
					return $L('scroll left');
				case 'right':
					return $L('scroll right');
			}
		},
		className: ({direction, styler}) => styler.append(classNameMap[direction])
	},

	render: ({disabled, render, ...rest}) => {
		delete rest.active;
		delete rest.direction;

		return (
			<IconButton
				{...rest}
				backgroundOpacity="transparent"
				disabled={disabled}
				small
			>
				{render({ref: this})}
			</IconButton>
		);
	}
});


/**
 * An [IconButton]{@link moonstone/IconButton.IconButton} used within
 * a [Scrollbar]{@link moonstone/Scrollable.Scrollbar}.
 *
 * @class ScrollButton
 * @memberof moonstone/Scrollable
 * @ui
 * @private
 */
const ScrollButton = Toggleable(
	{activate: 'onFocus', deactivate: 'onBlur', toggle: null},
	ScrollButtonBase
);

export default ScrollButton;
export {
	ScrollButton,
	ScrollButtonBase
};