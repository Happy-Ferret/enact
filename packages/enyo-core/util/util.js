import R from 'ramda';

// general utils
export const self = function () {
	return this;
};
export const coerceFunction = R.unless(R.is(Function), R.always);
export const coerceArray = R.unless(R.isArrayLike, R.of);
export const prepareApply = R.compose(R.flip(R.apply), coerceArray);
export const list = R.unapply(R.identity);
export const sliceArgs = (a, b) => R.compose(R.slice(a, b), list);
export const isUndefined = R.equals(void 0);

/**
 * Loosely determines if `tag` is a renderable component (either a string or a function)
 *
 * @param  {*}  tag Component to tes
 *
 * @returns {Boolean} `true` if `tag` is renderable
 */
export const isRenderable = function (tag) {
	const type = typeof tag;
	return type === 'function' || type === 'string';
};
