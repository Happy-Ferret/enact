import React from 'react';
import {mount, shallow} from 'enzyme';
import Image from '../Image';
import css from '../Image.less';
import uiCss from '@enact/ui/Image/Image.less';

const src = {
	'hd': 'http://lorempixel.com/64/64/city/1/',
	'fhd': 'http://lorempixel.com/128/128/city/1/',
	'uhd': 'http://lorempixel.com/256/256/city/1/'
};

describe('Image Specs', () => {
	it('should have `image` class from UI', function () {
		const image = mount(
			<Image src={src} />
		);

		const expected = true;
		const actual = image.find('div').hasClass(css.image);

		expect(actual).to.equal(expected);
	});

	it('should have `image` class from Moonstone', function () {
		const image = mount(
			<Image src={src} />
		);

		const expected = true;
		const actual = image.find('div').hasClass(uiCss.image);

		expect(actual).to.equal(expected);
	});

	it('should only have image class without sizing', function () {
		const image = mount(
			<Image src={src} sizing="none" />
		);

		const expected = false;
		const actual = (image.find('div').hasClass(uiCss.fill) || image.find('div').hasClass(uiCss.fit));

		expect(actual).to.equal(expected);
	});

	it('should have class for fill', function () {
		const image = mount(
			<Image src={src} sizing="fill" />
		);

		const expected = true;
		const actual = image.find('div').hasClass(uiCss.fill);

		expect(actual).to.equal(expected);
	});

	it('should have class for fit', function () {
		const image = mount(
			<Image src={src} sizing="fit" />
		);

		const expected = true;
		const actual = image.find('div').hasClass(uiCss.fit);

		expect(actual).to.equal(expected);
	});


	it('should set role to img by default', function () {
		const image = shallow(
			<Image src={src} sizing="fit" />
		);

		const expected = 'img';
		const actual = image.prop('role');

		expect(actual).to.equal(expected);
	});
});
