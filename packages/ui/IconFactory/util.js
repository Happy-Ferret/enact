import ri from '../resolution';

/**
 * Merges consumer styles with the image `src` resolved through the resolution independence module.
 *
 * @param	{Object}		style	Style object
 * @param	{String|Object}	src		URI to image or object of URIs
 *
 * @returns	{Object}				Original style object with backgroundImage updated
 * @private
 */
const mergeStyle = function (style, src) {
	let updated = Object.assign({}, style);
	let source = ri.selectSrc(src);
	if (src && src !== 'none' && src !== 'inherit' && src !== 'initial') {
		source = `url(${source})`;
	}

	updated.backgroundImage = source;
	return updated;
};

/**
 * Tests if a character is a single printable character
 *
 * @param	{String}	c	Character to test
 *
 * @returns	{Boolean}		`true` if c is a single character
 * @private
 */
const isSingleCharacter = function (c) {
	return	c.length === 1 ||
			// check for 4-byte Unicode character
			c.length === 2 && c.charCodeAt() !== c.codePointAt();
};

export {
	isSingleCharacter,
	mergeStyle
};
