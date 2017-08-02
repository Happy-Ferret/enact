/**
 * Contains the declaration for the {@link moonstone/Checkbox.Checkbox} component.
 *
 * @module moonstone/Checkbox
 */

import factory from '@enact/core/factory';
import kind from '@enact/core/kind';
import React from 'react';
import {CheckboxFactory as UiCheckboxFactory} from '@enact/ui/Checkbox';

import {IconFactory} from '../Icon';
import Skinnable from '../Skinnable';

import componentCss from './Checkbox.less';

/**
* {@link moonstone/Checkbox.CheckboxFactory} is Factory wrapper around
* {@link moonstone/Checkbox.Checkbox} that allows overriding certain classes of the base
* `Button` component at design time. See {@link moonstone/Button.ButtonBaseFactory}.
*
* @class CheckboxFactory
* @memberof moonstone/Checkbox
* @factory
* @public
*/
const CheckboxBaseFactory = factory({css: componentCss}, ({css}) => {
	// diffClasses('Moon Checkbox', componentCss, css);

	const UiCheckbox = UiCheckboxFactory({
		/* Replace classes in this step */
		css: /** @lends moonstone/Checkbox.CheckboxFactory.prototype */ {
			...componentCss,
			// Include the component class name so it too may be overridden.
			checkbox: css.checkbox
		}
	});
	const Icon = IconFactory({css});
	/**
	 * {@link moonstone/Checkbox.Checkbox} represents a Boolean state, and looks like a check mark in a box.
	 *
	 * @class Checkbox
	 * @memberof moonstone/Checkbox
	 * @ui
	 * @public
	 */
	return kind({
		name: 'Checkbox',

		styles: {
			css: componentCss,
			className: 'checkbox'
		},

		render: (props) => {
			return (
				<UiCheckbox {...props} Icon={Icon} />
			);
		}
	});
});

const CheckboxBase = CheckboxBaseFactory();

const Checkbox = Skinnable(
	CheckboxBase
);

const CheckboxFactory = (props) => Skinnable(
	CheckboxBaseFactory(props)
);


export default Checkbox;
export {
	Checkbox,
	CheckboxBase,
	CheckboxFactory,
	CheckboxBaseFactory
};
