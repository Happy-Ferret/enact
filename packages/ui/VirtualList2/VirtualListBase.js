/*
 * Exports the {@link ui/VirtualList.VirtualListBase} and
 * {@link ui/VirtualList.VirtualListCore} components and the
 * {@link ui/VirtualList.gridListItemSizeShape} validator. The default
 * export is {@link ui/VirtualList.VirtualListBase}.
 */

import clamp from 'ramda/src/clamp';
import classNames from 'classnames';
import {forward} from '@enact/core/handle';
import hoc from '@enact/core/hoc';
import {Job} from '@enact/core/util';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {contextTypes as contextTypesResize} from '../Resizable';
import ri from '../resolution';

import ScrollAnimator from './ScrollAnimator';
import Scrollbar from './Scrollbar';

import css from './VirtualListBase.less';

const
	forwardMouseDown = forward('onMouseDown'),
	forwardMouseLeave = forward('onMouseLeave'),
	forwardMouseMove = forward('onMouseMove'),
	forwardMouseUp = forward('onMouseUp'),
	forwardTouchStart = forward('onTouchStart'),
	forwardTouchMove = forward('onTouchMove'),
	forwardTouchEnd = forward('onTouchEnd'),
	forwardScroll = forward('onScroll'),
	forwardScrollStart = forward('onScrollStart'),
	forwardScrollStop = forward('onScrollStop');

const /* for dragging */
	calcVelocity = (d, dt) => (d && dt) ? d / dt : 0,
	perf = (typeof window === 'object') ? window.performance : {now: Date.now},
	holdTime = 50;

const /* for wheeling */
	scrollWheelMultiplierForDeltaPixel = 1.5, // The ratio of wheel 'delta' units to pixels scrolled.
	scrollWheelPageMultiplierForMaxPixel = 0.2, // The ratio of the maximum distance scrolled by wheel to the size of the viewport.
	pixelPerLine = 39;

const /* general */
	nop = () => {},
	epsilon = 1,
	animationDuration = 1000;

/**
 * {@link ui/Scroller.dataIndexAttribute} is the name of a custom attribute
 * which indicates the index of an item in {@link ui/VirtualList.VirtualList}
 * or {@link ui/VirtualList.VirtualGridList}.
 *
 * @constant dataIndexAttribute
 * @memberof ui/Scroller
 * @type {String}
 * @private
 */
const dataIndexAttribute = 'data-index';

/**
 * The shape for the grid list item size in a list for {@link ui/VirtualList.listItemSizeShape}.
 *
 * @typedef {Object} gridListItemSizeShape
 * @memberof ui/VirtualList
 * @property {Number} minWidth - The minimum width of the grid list item.
 * @property {Number} minHeight - The minimum height of the grid list item.
 */
const gridListItemSizeShape = PropTypes.shape({
	minWidth: PropTypes.number.isRequired,
	minHeight: PropTypes.number.isRequired
});

/**
 * {@link ui/VirtualList.VirtualListBase} is a base component for
 * {@link ui/VirtualList.VirtualList} and
 * {@link ui/VirtualList.VirtualGridList} with Scrollable applied.
 *
 * VirtualListBase calls `onScrollStart`, `onScroll`, and `onScrollStop` callback functions during scroll.
 *
 * @class VirtualListCore
 * @memberof ui/VirtualList
 * @ui
 * @private
 */
class VirtualListCore extends Component {
	static displayName = 'VirtualListBase'

	static propTypes = /** @lends ui/VirtualList.VirtualListCore.prototype */ {
		/**
		 * The render function for an item of the list.
		 * `index` is for accessing the index of the item.
		 * `key` MUST be passed as a prop for DOM recycling.
		 * Data manipulation can be done in this function.
		 *
		 * @type {Function}
		 * @public
		 */
		component: PropTypes.func.isRequired,

		/**
		 * Size of an item for the list; valid values are either a number for `VirtualList`
		 * or an object that has `minWidth` and `minHeight` for `VirtualGridList`.
		 *
		 * @type {Number|ui/VirtualList.gridListItemSizeShape}
		 * @public
		 */
		itemSize: PropTypes.oneOfType([
			PropTypes.number,
			gridListItemSizeShape
		]).isRequired,

		/**
		 * The callback function which is called for linking scrollTo function.
		 * You should specify a callback function as the value of this prop
		 * to use scrollTo feature.
		 *
		 * The scrollTo function passed to the parent component requires below as an argument.
		 * - {position: {x, y}} - You can set a pixel value for x and/or y position
		 * - {align} - You can set one of values below for align
		 *   `'left'`, `'right'`, `'top'`, `'bottom'`,
		 *   `'topleft'`, `'topright'`, `'bottomleft'`, and `'bottomright'`.
		 * - {index} - You can set an index of specific item. (`0` or positive integer)
		 *   This option is available for only VirtualList kind.
		 * - {node} - You can set a node to scroll
		 * - {animate} - When `true`, scroll occurs with animation.
		 *   Set it to `false`, if you want scrolling without animation.
		 *
		 * Example:
		 * ```
		 *	// If you set cbScrollTo prop like below;
		 *	cbScrollTo: (fn) => {this.scrollTo = fn;}
		 *	// You can simply call like below;
		 *	this.scrollTo({align: 'top'}); // scroll to the top
		 * ```
		 * @type {Function}
		 * @public
		 */
		cbScrollTo: PropTypes.func,

		/**
		 * Client size of the list; valid values are an object that has `clientWidth` and `clientHeight`.
		 *
		 * @type {Object}
		 * @property {Number} clientWidth - The client width of the list.
		 * @property {Number} clientHeight - The client height of the list.
		 * @public
		 */
		clientSize: PropTypes.shape({
			clientWidth: PropTypes.number.isRequired,
			clientHeight:  PropTypes.number.isRequired
		}),

		/**
		 * Data for the list.
		 * Check mutation of this and determine whether the list should update or not.
		 *
		 * @type {Any}
		 * @default []
		 * @public
		 */
		data: PropTypes.any,

		/**
		 * Size of the data.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		dataSize: PropTypes.number,

		/**
		 * Direction of the list; valid values are `'horizontal'` and `'vertical'`.
		 *
		 * @type {String}
		 * @default 'vertical'
		 * @public
		 */
		direction: PropTypes.oneOf(['horizontal', 'vertical']),

		/**
		 * Specifies how to show horizontal scrollbar. Acceptable values are `'auto'`,
		 * `'visible'`, and `'hidden'`.
		 *
		 * @type {String}
		 * @default 'auto'
		 * @public
		 */
		horizontalScrollbar: PropTypes.oneOf(['auto', 'visible', 'hidden']),

		/**
		 * Called when scrolling
		 *
		 * @type {Function}
		 * @public
		 */
		onScroll: PropTypes.func,

		/**
		 * Called when scroll starts
		 *
		 * @type {Function}
		 * @public
		 */
		onScrollStart: PropTypes.func,

		/**
		 * Called when scroll stops
		 *
		 * @type {Function}
		 * @public
		 */
		onScrollStop: PropTypes.func,

		/**
		 * Number of spare DOM node.
		 * `3` is good for the default value experimentally and
		 * this value is highly recommended not to be changed by developers.
		 *
		 * @type {Number}
		 * @default 3
		 * @private
		 */
		overhang: PropTypes.number,

		/**
		 * Spacing between items.
		 *
		 * @type {Number}
		 * @default 0
		 * @public
		 */
		spacing: PropTypes.number,

		/**
		 * Scrollable CSS style.
		 * Should be defined because we manuplate style prop in render().
		 *
		 * @type {Object}
		 * @public
		 */
		style: PropTypes.object,

		/**
		 * Specifies how to show vertical scrollbar. Acceptable values are `'auto'`,
		 * `'visible'`, and `'hidden'`.
		 *
		 * @type {String}
		 * @default 'auto'
		 * @public
		 */
		verticalScrollbar: PropTypes.oneOf(['auto', 'visible', 'hidden'])
	}

	static contextTypes = {
		rtl: PropTypes.bool
	}

	static defaultProps = {
		cbScrollTo: nop,
		data: [],
		dataSize: 0,
		direction: 'vertical',
		horizontalScrollbar: 'hidden',
		onScroll: nop,
		onScrollStart: nop,
		onScrollStop: nop,
		overhang: 3,
		spacing: 0,
		verticalScrollbar: 'hidden'
	}

	static childContextTypes = contextTypesResize

	/**********************************************************************
	 * Constructor
	 **********************************************************************/

	constructor (props) {
		super(props);

		this.state = {
			firstIndex: 0,
			numOfItems: 0,
			isHorizontalScrollbarVisible: props.horizontalScrollbar === 'visible',
			isVerticalScrollbarVisible: props.verticalScrollbar === 'visible'
		};

		const {onMouseDown, onMouseLeave, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, onWheel} = this;
		this.eventHandlers = {
			onMouseDown,
			onMouseLeave,
			onMouseMove,
			onMouseUp,
			onTouchStart,
			onTouchMove,
			onTouchEnd,
			onWheel
		};

		this.initChildRef = this.initRef('childRef');
		this.initOuterContainerRef = this.initRef('outerContainerRef');
		this.initContainerRef = this.initRef('containerRef');

		this.verticalScrollbarProps = {
			ref: this.initRef('verticalScrollbarRef'),
			vertical: true
		};

		this.horizontalScrollbarProps = {
			ref: this.initRef('horizontalScrollbarRef'),
			vertical: false
		};

		props.cbScrollTo(this.scrollTo);
	}

	/**********************************************************************
	 * Context Methods
	 **********************************************************************/

	getChildContext () {
		return {
			invalidateBounds: this.enqueueForceUpdate
		};
	}

	/**********************************************************************
	 * Life Cycle Methods
	 **********************************************************************/

/* From scrollable */
	componentDidMount () {
		this.direction = this.childRef.props.direction;
		this.updateScrollbars();
	}

	componentWillUpdate () {
		this.deferScrollTo = true;
	}

	componentDidUpdate () {
		// Need to sync calculated client size if it is different from the real size
		this.childRef.syncClientSize();

		this.direction = this.childRef.props.direction;
		this.updateScrollbars();

		if (this.scrollToInfo !== null) {
			if (!this.deferScrollTo) {
				this.scrollTo(this.scrollToInfo);
			}
		}
	}

	componentWillUnmount () {
		// Before call cancelAnimationFrame, you must send scrollStop Event.
		if (this.animator.isAnimating()) {
			this.doScrollStop();
			this.animator.stop();
		}
		this.forceUpdateJob.stop();
	}

	componentWillMount () {
		if (this.props.clientSize) {
			this.calculateMetrics(this.props);
			this.updateStatesAndBounds(this.props);
		}
	}
/* From scrollable */

	// Calculate metrics for VirtualList after the 1st render to know client W/H.
	// We separate code related with data due to re use it when data changed.
	componentDidMount () {
		if (!this.props.clientSize) {
			this.calculateMetrics(this.props);
			this.updateStatesAndBounds(this.props);
		}
	}

	// Call updateStatesAndBounds here when dataSize has been changed to update nomOfItems state.
	// Calling setState within componentWillReceivePropswill not trigger an additional render.
	componentWillReceiveProps (nextProps) {
		const
			{dataSize, direction, itemSize, overhang, spacing} = this.props,
			hasMetricsChanged = (
				direction !== nextProps.direction ||
				((itemSize instanceof Object) ? (itemSize.minWidth !== nextProps.itemSize.minWidth || itemSize.minHeight !== nextProps.itemSize.minHeight) : itemSize !== nextProps.itemSize) ||
				overhang !== nextProps.overhang ||
				spacing !== nextProps.spacing
			),
			hasDataChanged = (dataSize !== nextProps.dataSize);

		if (hasMetricsChanged) {
			this.calculateMetrics(nextProps);
			this.updateStatesAndBounds(nextProps);
		} else if (hasDataChanged) {
			this.updateStatesAndBounds(nextProps);
		}
	}

	/**********************************************************************
	 * Internal Properties
	 **********************************************************************/

	scrollBounds = {
		clientWidth: 0,
		clientHeight: 0,
		scrollWidth: 0,
		scrollHeight: 0,
		maxLeft: 0,
		maxTop: 0
	}

	moreInfo = {
		firstVisibleIndex: null,
		lastVisibleIndex: null
	}

	primary = null
	secondary = null

	isPrimaryDirectionVertical = true
	isItemSized = false

	dimensionToExtent = 0
	threshold = 0
	maxFirstIndex = 0
	curDataSize = 0
	cc = []
	scrollPosition = 0
	updateFrom = null
	updateTo = null

	containerRef = null

	/**********************************************************************
	 * Internal Properties
	 **********************************************************************/

	// status
	direction = 'vertical'
	isScrollAnimationTargetAccumulated = false
	wheelDirection = 0
	isFirstDragging = false
	isDragging = false
	deferScrollTo = true

	// drag info
	dragInfo = {
		t: 0,
		clientX: 0,
		clientY: 0,
		dx: 0,
		dy: 0,
		dt: 0
	}

	// bounds info
	bounds = {
		clientWidth: 0,
		clientHeight: 0,
		scrollWidth: 0,
		scrollHeight: 0,
		maxTop: 0,
		maxLeft: 0
	}

	// scroll info
	scrollLeft = 0
	scrollTop = 0
	scrollToInfo = null

	// component info
	childRef = null
	outerContainerRef = null

	// scroll animator
	animator = new ScrollAnimator()

	/**********************************************************************
	 * Event Handlers for Mouse Events
	 **********************************************************************/

	dragStart (e) {
		const d = this.dragInfo;

		this.isDragging = true;
		this.isFirstDragging = true;
		d.t = perf.now();
		d.clientX = e.clientX;
		d.clientY = e.clientY;
		d.dx = d.dy = 0;
	}

	drag (e) {
		const
			{direction} = this,
			t = perf.now(),
			d = this.dragInfo;

		if (direction === 'horizontal' || direction === 'both') {
			d.dx = e.clientX - d.clientX;
			d.clientX = e.clientX;
		} else {
			d.dx = 0;
		}

		if (direction === 'vertical' || direction === 'both') {
			d.dy = e.clientY - d.clientY;
			d.clientY = e.clientY;
		} else {
			d.dy = 0;
		}

		d.t = t;

		return {dx: d.dx, dy: d.dy};
	}

	dragStop () {
		const
			d = this.dragInfo,
			t = perf.now();

		d.dt = t - d.t;
		this.isDragging = false;
	}

	onMouseDown = (e) => {
		this.animator.stop();
		this.dragStart(e);
		forwardMouseDown(e);
	}

	onMouseMove = (e) => {
		if (this.isDragging) {
			const
				{dx, dy} = this.drag(e),
				bounds = this.getScrollBounds();

			if (this.isFirstDragging) {
				this.doScrollStart();
				this.isFirstDragging = false;
			}
			this.showThumb(bounds);
			this.scroll(this.scrollLeft - dx, this.scrollTop - dy);
		}
		forwardMouseMove(e);
	}

	onMouseUp = (e) => {
		if (this.isDragging) {
			this.dragStop(e);

			if (this.dragInfo.dt > holdTime) {
				this.stop();
			} else {
				const
					d = this.dragInfo,
					target = this.animator.simulate(
						this.scrollLeft,
						this.scrollTop,
						calcVelocity(-d.dx, d.dt),
						calcVelocity(-d.dy, d.dt)
					);

				this.isScrollAnimationTargetAccumulated = false;
				this.start({
					targetX: target.targetX,
					targetY: target.targetY,
					animate: true,
					silent: true,
					duration: target.duration
				});
			}
		}
		forwardMouseUp(e);
	}

	onMouseLeave = (e) => {
		this.onMouseMove(e);
		this.onMouseUp(e);
		forwardMouseLeave(e);
	}

	/**********************************************************************
	 * Event Handlers for Touch Events
	 **********************************************************************/

	onTouchStart = (e) => {
		this.onMouseDown(e.changedTouches[0]);
		forwardTouchStart(e);
	}

	onTouchMove = (e) => {
		this.onMouseMove(e.changedTouches[0]);
		forwardTouchMove(e);
	}

	onTouchEnd = (e) => {
		this.onMouseUp(e.changedTouches[0]);
		forwardTouchEnd(e);
	}

	/**********************************************************************
	 * Event Handlers for Wheel Events
	 **********************************************************************/

	wheel (e, canScrollHorizontally, canScrollVertically) {
		const
			bounds = this.getScrollBounds(),
			deltaMode = e.deltaMode,
			wheelDeltaY = -e.wheelDeltaY;
		let
			delta = (wheelDeltaY || e.deltaY),
			maxPixel;

		if (canScrollVertically) {
			maxPixel = bounds.clientHeight * scrollWheelPageMultiplierForMaxPixel;
		} else if (canScrollHorizontally) {
			maxPixel = bounds.clientWidth * scrollWheelPageMultiplierForMaxPixel;
		} else {
			return 0;
		}

		if (deltaMode === 0) {
			delta = clamp(-maxPixel, maxPixel, ri.scale(delta * scrollWheelMultiplierForDeltaPixel));
		} else if (deltaMode === 1) { // line; firefox
			delta = clamp(-maxPixel, maxPixel, ri.scale(delta * pixelPerLine * scrollWheelMultiplierForDeltaPixel));
		} else if (deltaMode === 2) { // page
			delta = delta < 0 ? -maxPixel : maxPixel;
		}

		return delta;
	}

	onWheel = (e) => {
		e.preventDefault();
		if (!this.isDragging) {
			const
				bounds = this.getScrollBounds(),
				canScrollHorizontally = this.canScrollHorizontally(bounds),
				canScrollVertically = this.canScrollVertically(bounds),
				delta = this.wheel(e, canScrollHorizontally, canScrollVertically),
				direction = Math.sign(delta);

			if (direction !== this.wheelDirection) {
				this.isScrollAnimationTargetAccumulated = false;
				this.wheelDirection = direction;
			}
			this.scrollToAccumulatedTarget(delta, canScrollVertically);
		}
	}

	/**********************************************************************
	 * Internal Methods - callbacks
	 **********************************************************************/

	doScrollStart () {
		forwardScrollStart({scrollLeft: this.scrollLeft, scrollTop: this.scrollTop, moreInfo: this.getMoreInfo()}, this.props);
	}

	doScrolling () {
		forwardScroll({scrollLeft: this.scrollLeft, scrollTop: this.scrollTop, moreInfo: this.getMoreInfo()}, this.props);
	}

	doScrollStop () {
		forwardScrollStop({scrollLeft: this.scrollLeft, scrollTop: this.scrollTop, moreInfo: this.getMoreInfo()}, this.props);
	}

	/**********************************************************************
	 * Internal Methods
	 **********************************************************************/

	scrollToAccumulatedTarget = (delta, vertical) => {
		const silent = this.isScrollAnimationTargetAccumulated;

		if (!this.isScrollAnimationTargetAccumulated) {
			this.accumulatedTargetX = this.scrollLeft;
			this.accumulatedTargetY = this.scrollTop;
			this.isScrollAnimationTargetAccumulated = true;
		}

		if (vertical) {
			this.accumulatedTargetY = this.accumulatedTargetY + delta;
		} else {
			this.accumulatedTargetX = this.accumulatedTargetX + delta;
		}

		this.start({
			targetX: this.accumulatedTargetX,
			targetY: this.accumulatedTargetY,
			animate: true,
			silent
		});
	}

	// update scroll position

	setScrollLeft (value) {
		const bounds = this.getScrollBounds();

		this.scrollLeft = clamp(0, bounds.maxLeft, value);
		if (this.state.isHorizontalScrollbarVisible) {
			this.updateThumb(this.horizontalScrollbarRef, bounds);
		}
	}

	setScrollTop (value) {
		const bounds = this.getScrollBounds();

		this.scrollTop = clamp(0, bounds.maxTop, value);
		if (this.state.isVerticalScrollbarVisible) {
			this.updateThumb(this.verticalScrollbarRef, bounds);
		}
	}

	// scroll start/stop

	start ({targetX, targetY, animate = true, silent = false, duration = animationDuration}) {
		const {scrollLeft, scrollTop} = this;
		const bounds = this.getScrollBounds();

		this.animator.stop();
		if (!silent) {
			this.doScrollStart();
		}

		if (Math.abs(bounds.maxLeft - targetX) < epsilon) {
			targetX = bounds.maxLeft;
		}
		if (Math.abs(bounds.maxTop - targetY) < epsilon) {
			targetY = bounds.maxTop;
		}

		this.showThumb(bounds);

		if (animate) {
			this.animator.animate(this.scrollAnimation({
				sourceX: scrollLeft,
				sourceY: scrollTop,
				targetX,
				targetY,
				duration
			}));
		} else {
			targetX = clamp(0, bounds.maxLeft, targetX);
			targetY = clamp(0, bounds.maxTop, targetY);

			this.scroll(targetX, targetY);
			this.stop();
		}
	}

	scrollAnimation = (animationInfo) => (curTime) => {
		const
			{sourceX, sourceY, targetX, targetY, duration} = animationInfo,
			bounds = this.getScrollBounds();

		if (curTime < duration) {
			this.scroll(
				this.canScrollHorizontally(bounds) ? clamp(0, bounds.maxLeft, this.animator.timingFunction(sourceX, targetX, duration, curTime)) : sourceX,
				this.canScrollVertically(bounds) ? clamp(0, bounds.maxTop, this.animator.timingFunction(sourceY, targetY, duration, curTime)) : sourceY
			);
		} else {
			this.scroll(
				clamp(0, bounds.maxLeft, targetX),
				clamp(0, bounds.maxTop, targetY)
			);
			this.stop();
		}
	}

	scroll = (left, top) => {
		let
			dirX = 0,
			dirY = 0;

		if (left !== this.scrollLeft) {
			dirX = Math.sign(left - this.scrollLeft);
			this.setScrollLeft(left);
		}
		if (top !== this.scrollTop) {
			dirY = Math.sign(top - this.scrollTop);
			this.setScrollTop(top);
		}

		this.childRef.setScrollPosition(this.scrollLeft, this.scrollTop, dirX, dirY);
		this.doScrolling();
	}

	stop () {
		this.animator.stop();
		this.isScrollAnimationTargetAccumulated = false;
		this.hideThumb();
		this.doScrollStop();
	}

	// scrollTo API

	getPositionForScrollTo = (opt) => {
		const
			bounds = this.getScrollBounds(),
			canScrollHorizontally = this.canScrollHorizontally(bounds),
			canScrollVertically = this.canScrollVertically(bounds);
		let
			itemPos,
			left = null,
			top = null;

		if (opt instanceof Object) {
			if (opt.position instanceof Object) {
				if (canScrollHorizontally) {
					// We need '!=' to check if opt.potision.x is null or undefined
					left = opt.position.x != null ? opt.position.x : this.scrollLeft;
				} else {
					left = 0;
				}
				if (canScrollVertically) {
					// We need '!=' to check if opt.potision.y is null or undefined
					top = opt.position.y != null ? opt.position.y : this.scrollTop;
				} else {
					top = 0;
				}
			} else if (typeof opt.align === 'string') {
				if (canScrollHorizontally) {
					if (opt.align.includes('left')) {
						left = 0;
					} else if (opt.align.includes('right')) {
						left = bounds.maxLeft;
					}
				}
				if (canScrollVertically) {
					if (opt.align.includes('top')) {
						top = 0;
					} else if (opt.align.includes('bottom')) {
						top = bounds.maxTop;
					}
				}
			} else {
				if (typeof opt.index === 'number' && typeof this.childRef.getItemPosition === 'function') {
					itemPos = this.childRef.getItemPosition(opt.index, opt.stickTo);
				}
				if (itemPos) {
					if (canScrollHorizontally) {
						left = itemPos.left;
					}
					if (canScrollVertically) {
						top = itemPos.top;
					}
				}
			}
		}

		return {left, top};
	}

	scrollTo = (opt) => {
		if (!this.deferScrollTo) {
			const {left, top} = this.getPositionForScrollTo(opt);
			this.scrollToInfo = null;
			this.start({
				targetX: (left !== null) ? left : this.scrollLeft,
				targetY: (top !== null) ? top : this.scrollTop,
				animate: opt.animate
			});
		} else {
			this.scrollToInfo = opt;
		}
	}

	canScrollHorizontally = (bounds) => {
		const {direction} = this;

		return (direction === 'horizontal' || direction === 'both') && (bounds.scrollWidth > bounds.clientWidth) && !isNaN(bounds.scrollWidth);
	}

	canScrollVertically = (bounds) => {
		const {direction} = this;

		return (direction === 'vertical' || direction === 'both') && (bounds.scrollHeight > bounds.clientHeight) && !isNaN(bounds.scrollHeight);
	}

	// scroll bar

	showThumb (bounds) {
		if (this.state.isHorizontalScrollbarVisible && this.canScrollHorizontally(bounds)) {
			this.horizontalScrollbarRef.showThumb();
		}
		if (this.state.isVerticalScrollbarVisible && this.canScrollVertically(bounds)) {
			this.verticalScrollbarRef.showThumb();
		}
	}

	updateThumb (scrollbarRef, bounds) {
		scrollbarRef.update({
			...bounds,
			scrollLeft: this.scrollLeft,
			scrollTop: this.scrollTop
		});
	}

	hideThumb () {
		if (this.state.isHorizontalScrollbarVisible) {
			this.horizontalScrollbarRef.startHidingThumb();
		}
		if (this.state.isVerticalScrollbarVisible) {
			this.verticalScrollbarRef.startHidingThumb();
		}
	}

	updateScrollbars = () => {
		const
			{horizontalScrollbar, verticalScrollbar} = this.props,
			{isHorizontalScrollbarVisible, isVerticalScrollbarVisible} = this.state,
			bounds = this.getScrollBounds(),
			canScrollHorizontally = this.canScrollHorizontally(bounds),
			canScrollVertically = this.canScrollVertically(bounds),
			curHorizontalScrollbarVisible = (horizontalScrollbar === 'auto') ? canScrollHorizontally : horizontalScrollbar === 'visible',
			curVerticalScrollbarVisible = (verticalScrollbar === 'auto') ? canScrollVertically : verticalScrollbar === 'visible';

		// determine if we should hide or show any scrollbars
		const
			isVisibilityChanged = (
				isHorizontalScrollbarVisible !== curHorizontalScrollbarVisible ||
				isVerticalScrollbarVisible !== curVerticalScrollbarVisible
			);

		if (isVisibilityChanged) {
			// one or both scrollbars have changed visibility
			this.setState({
				isHorizontalScrollbarVisible: curHorizontalScrollbarVisible,
				isVerticalScrollbarVisible: curVerticalScrollbarVisible
			});
		} else {
			this.deferScrollTo = false;
			if (curHorizontalScrollbarVisible || curVerticalScrollbarVisible) {
				// no visibility change but need to notify whichever scrollbars are visible of the
				// updated bounds and scroll position
				const updatedBounds = {
					...bounds,
					scrollLeft: this.scrollLeft,
					scrollTop: this.scrollTop
				};

				if (curHorizontalScrollbarVisible) {
					this.horizontalScrollbarRef.update(updatedBounds);
				}
				if (curVerticalScrollbarVisible) {
					this.verticalScrollbarRef.update(updatedBounds);
				}
			}
		}
	}

	// ref

	// forceUpdate is a bit jarring and may interrupt other actions like animation so we'll
	// queue it up in case we get multiple calls (e.g. when grouped expandables toggle).
	//
	// TODO: consider replacing forceUpdate() by storing bounds in state rather than a non-
	// state member.
	enqueueForceUpdate = () => {
		this.childRef.calculateMetrics();
		this.forceUpdateJob.start();
	}

	forceUpdateJob = new Job(this.forceUpdate.bind(this), 32)
	/**********************************************************************
	 * Internal Methods
	 **********************************************************************/

	isVertical = () => this.isPrimaryDirectionVertical

	isHorizontal = () => !this.isPrimaryDirectionVertical

	getScrollBounds = () => this.scrollBounds

	getMoreInfo = () => this.moreInfo

	getGridPosition (index) {
		const
			{dimensionToExtent, primary, secondary} = this,
			primaryPosition = Math.floor(index / dimensionToExtent) * primary.gridSize,
			secondaryPosition = (index % dimensionToExtent) * secondary.gridSize;

		return {primaryPosition, secondaryPosition};
	}

	getItemPosition = (index, stickTo = 'start') => {
		const
			{itemSize} = this.props,
			{primary} = this,
			position = this.getGridPosition(index),
			offset = ((itemSize instanceof Object) || stickTo === 'start') ? 0 : primary.clientSize - primary.itemSize;

		position.primaryPosition -= offset;

		return this.gridPositionToItemPosition(position);
	}

	gridPositionToItemPosition = ({primaryPosition, secondaryPosition}) =>
		(this.isPrimaryDirectionVertical ? {left: secondaryPosition, top: primaryPosition} : {left: primaryPosition, top: secondaryPosition})

	getClientSize = (node) => {
		return {
			clientWidth: node.clientWidth,
			clientHeight: node.clientHeight
		};
	}

	calculateMetrics (props) {
		const
			{clientSize, direction, itemSize, spacing} = props,
			node = this.containerRef;

		if (!clientSize && !node) {
			return;
		}

		const
			{clientWidth, clientHeight} = (clientSize || this.getClientSize(node)),
			heightInfo = {
				clientSize: clientHeight,
				minItemSize: itemSize.minHeight || null,
				itemSize: itemSize
			},
			widthInfo = {
				clientSize: clientWidth,
				minItemSize: itemSize.minWidth || null,
				itemSize: itemSize
			};
		let primary, secondary, dimensionToExtent, thresholdBase;

		this.isPrimaryDirectionVertical = (direction === 'vertical');

		if (this.isPrimaryDirectionVertical) {
			primary = heightInfo;
			secondary = widthInfo;
		} else {
			primary = widthInfo;
			secondary = heightInfo;
		}
		dimensionToExtent = 1;

		this.isItemSized = (primary.minItemSize && secondary.minItemSize);

		if (this.isItemSized) {
			// the number of columns is the ratio of the available width plus the spacing
			// by the minimum item width plus the spacing
			dimensionToExtent = Math.max(Math.floor((secondary.clientSize + spacing) / (secondary.minItemSize + spacing)), 1);
			// the actual item width is a ratio of the remaining width after all columns
			// and spacing are accounted for and the number of columns that we know we should have
			secondary.itemSize = Math.floor((secondary.clientSize - (spacing * (dimensionToExtent - 1))) / dimensionToExtent);
			// the actual item height is related to the item width
			primary.itemSize = Math.floor(primary.minItemSize * (secondary.itemSize / secondary.minItemSize));
		}

		primary.gridSize = primary.itemSize + spacing;
		secondary.gridSize = secondary.itemSize + spacing;
		thresholdBase = primary.gridSize * 2;

		this.threshold = {min: -Infinity, max: thresholdBase, base: thresholdBase};
		this.dimensionToExtent = dimensionToExtent;

		this.primary = primary;
		this.secondary = secondary;

		// reset
		this.scrollPosition = 0;
		// eslint-disable-next-line react/no-direct-mutation-state
		this.state.firstIndex = 0;
		// eslint-disable-next-line react/no-direct-mutation-state
		this.state.numOfItems = 0;
	}

	updateStatesAndBounds (props) {
		const
			{dataSize, overhang} = props,
			{firstIndex} = this.state,
			{dimensionToExtent, primary, moreInfo, scrollPosition} = this,
			numOfItems = Math.min(dataSize, dimensionToExtent * (Math.ceil(primary.clientSize / primary.gridSize) + overhang)),
			wasFirstIndexMax = ((this.maxFirstIndex < moreInfo.firstVisibleIndex - dimensionToExtent) && (firstIndex === this.maxFirstIndex));
		let newFirstIndex = firstIndex;

		this.maxFirstIndex = dataSize - numOfItems;
		this.curDataSize = dataSize;
		this.updateFrom = null;
		this.updateTo = null;

		// reset children
		this.cc = [];

		if (wasFirstIndexMax) {
			newFirstIndex = this.maxFirstIndex;
		} else {
			newFirstIndex = Math.min(firstIndex, this.maxFirstIndex);
		}

		this.setState({firstIndex: newFirstIndex, numOfItems});
		this.calculateScrollBounds(props);
		this.updateMoreInfo(dataSize, scrollPosition);
	}

	calculateScrollBounds (props) {
		const
			{clientSize} = props,
			node = this.containerRef;

		if (!clientSize && !node) {
			return;
		}

		const
			{scrollBounds, isPrimaryDirectionVertical} = this,
			{clientWidth, clientHeight} = clientSize || this.getClientSize(node);
		let maxPos;

		scrollBounds.clientWidth = clientWidth;
		scrollBounds.clientHeight = clientHeight;
		scrollBounds.scrollWidth = this.getScrollWidth();
		scrollBounds.scrollHeight = this.getScrollHeight();
		scrollBounds.maxLeft = Math.max(0, scrollBounds.scrollWidth - clientWidth);
		scrollBounds.maxTop = Math.max(0, scrollBounds.scrollHeight - clientHeight);

		// correct position
		maxPos = isPrimaryDirectionVertical ? scrollBounds.maxTop : scrollBounds.maxLeft;

		this.syncThreshold(maxPos);

		if (this.scrollPosition > maxPos) {
			this.scrollTo({position: (isPrimaryDirectionVertical) ? {y: maxPos} : {x: maxPos}});
		}
	}

	updateMoreInfo (dataSize, primaryPosition) {
		const
			{dimensionToExtent, moreInfo} = this,
			{itemSize, gridSize, clientSize} = this.primary;

		if (dataSize <= 0) {
			moreInfo.firstVisibleIndex = null;
			moreInfo.lastVisibleIndex = null;
		} else {
			moreInfo.firstVisibleIndex = (Math.floor((primaryPosition - itemSize) / gridSize) + 1) * dimensionToExtent;
			moreInfo.lastVisibleIndex = Math.min(dataSize - 1, Math.ceil((primaryPosition + clientSize) / gridSize) * dimensionToExtent - 1);
		}
	}

	syncThreshold (maxPos) {
		const {threshold} = this;

		if (threshold.max > maxPos) {
			if (maxPos < threshold.base) {
				threshold.max = threshold.base;
				threshold.min = -Infinity;
			} else {
				threshold.max = maxPos;
				threshold.min = maxPos - threshold.base;
			}
		}
	}

	setScrollPosition (x, y, dirX, dirY) {
		const
			{dataSize} = this.props,
			{firstIndex, numOfItems} = this.state,
			{isPrimaryDirectionVertical, threshold, dimensionToExtent, maxFirstIndex, scrollBounds} = this,
			{gridSize} = this.primary,
			maxPos = isPrimaryDirectionVertical ? scrollBounds.maxTop : scrollBounds.maxLeft,
			minOfMax = threshold.base,
			maxOfMin = maxPos - minOfMax;
		let
			delta, numOfGridLines, newFirstIndex = firstIndex, pos, dir = 0;

		if (isPrimaryDirectionVertical) {
			pos = y;
			dir = dirY;
		} else {
			pos = x;
			dir = dirX;
		}

		if (dir === 1 && pos > threshold.max) {
			delta = pos - threshold.max;
			numOfGridLines = Math.ceil(delta / gridSize); // how many lines should we add
			threshold.max = Math.min(maxPos, threshold.max + numOfGridLines * gridSize);
			threshold.min = Math.min(maxOfMin, threshold.max - gridSize);
			newFirstIndex = Math.min(maxFirstIndex, (dimensionToExtent * Math.ceil(firstIndex / dimensionToExtent)) + (numOfGridLines * dimensionToExtent));
		} else if (dir === -1 && pos < threshold.min) {
			delta = threshold.min - pos;
			numOfGridLines = Math.ceil(delta / gridSize);
			threshold.max = Math.max(minOfMax, threshold.min - (numOfGridLines * gridSize - gridSize));
			threshold.min = (threshold.max > minOfMax) ? threshold.max - gridSize : -Infinity;
			newFirstIndex = Math.max(0, (dimensionToExtent * Math.ceil(firstIndex / dimensionToExtent)) - (numOfGridLines * dimensionToExtent));
		}

		this.syncThreshold(maxPos);
		this.scrollPosition = pos;
		this.updateMoreInfo(dataSize, pos);

		if (firstIndex !== newFirstIndex) {
			this.setState({firstIndex: newFirstIndex});
		} else {
			this.positionItems({updateFrom: firstIndex, updateTo: firstIndex + numOfItems});
		}
	}

	applyStyleToExistingNode = (index, ...rest) => {
		const
			{numOfItems} = this.state,
			node = this.containerRef.children[index % numOfItems];

		if (node) {
			this.composeStyle(node.style, ...rest);
		}
	}

	applyStyleToNewNode = (index, ...rest) => {
		const
			{component, data} = this.props,
			{numOfItems} = this.state,
			key = index % numOfItems,
			itemElement = component({
				data,
				[dataIndexAttribute]: index,
				index,
				key
			}),
			style = {};

		this.composeStyle(style, ...rest);

		this.cc[key] = React.cloneElement(itemElement, {
			className: classNames(css.listItem, itemElement.props.className),
			style: {...itemElement.props.style, ...style}
		});
	}

	positionItems ({updateFrom, updateTo}) {
		const {isPrimaryDirectionVertical, dimensionToExtent, primary, secondary, scrollPosition} = this;

		// we only calculate position of the first child
		let
			{primaryPosition, secondaryPosition} = this.getGridPosition(updateFrom),
			width, height;

		primaryPosition -= scrollPosition;
		width = (isPrimaryDirectionVertical ? secondary.itemSize : primary.itemSize) + 'px';
		height = (isPrimaryDirectionVertical ? primary.itemSize : secondary.itemSize) + 'px';

		// positioning items
		for (let i = updateFrom, j = updateFrom % dimensionToExtent; i < updateTo; i++) {
			if (this.updateFrom === null || this.updateTo === null || this.updateFrom > i || this.updateTo <= i) {
				this.applyStyleToNewNode(i, width, height, primaryPosition, secondaryPosition);
			} else {
				this.applyStyleToExistingNode(i, width, height, primaryPosition, secondaryPosition);
			}

			if (++j === dimensionToExtent) {
				secondaryPosition = 0;
				primaryPosition += primary.gridSize;
				j = 0;
			} else {
				secondaryPosition += secondary.gridSize;
			}
		}

		this.updateFrom = updateFrom;
		this.updateTo = updateTo;
	}

	composeStyle (style, width, height, ...rest) {
		if (this.isItemSized) {
			style.width = width;
			style.height = height;
		}
		this.composeTransform(style, ...rest);
	}

	getXY = (primaryPosition, secondaryPosition) => {
		const rtlDirection = this.context.rtl ? -1 : 1;
		return (this.isPrimaryDirectionVertical ? {x: (secondaryPosition * rtlDirection), y: primaryPosition} : {x: (primaryPosition * rtlDirection), y: secondaryPosition});
	}

	composeTransform (style, primaryPosition, secondaryPosition = 0) {
		const {x, y} = this.getXY(primaryPosition, secondaryPosition);

		style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
	}

	getScrollHeight = () => (this.isPrimaryDirectionVertical ? this.getVirtualScrollDimension() : this.scrollBounds.clientHeight)

	getScrollWidth = () => (this.isPrimaryDirectionVertical ? this.scrollBounds.clientWidth : this.getVirtualScrollDimension())

	getVirtualScrollDimension = () => {
		const
			{dimensionToExtent, primary, curDataSize} = this,
			{spacing} = this.props;

		return (Math.ceil(curDataSize / dimensionToExtent) * primary.gridSize) - spacing;
	}

	syncClientSize = () => {
		const
			{props} = this,
			node = this.containerRef;

		if (!props.clientSize && !node) {
			return;
		}

		const
			{clientWidth, clientHeight} = props.clientSize || this.getClientSize(node),
			{scrollBounds} = this;

		if (clientWidth !== scrollBounds.clientWidth || clientHeight !== scrollBounds.clientHeight) {
			this.calculateMetrics(props);
			this.updateStatesAndBounds(props);
		}
	}

	/**********************************************************************
	 * render methods
	 **********************************************************************/

	initRef (prop) {
		return (ref) => {
			this[prop] = ref;
		};
	}

	/* prevent scrolling by web engine */
	handleScroll = () => {
		if (!this.animator.isAnimating() && this.childRef && this.childRef.outerContainerRef) {
			this.childRef.outerContainerRef.scrollTop = this.scrollTop;
			this.childRef.outerContainerRef.scrollLeft = this.scrollLeft;
		}
	}

	renderCalculate () {
		const
			{dataSize} = this.props,
			{firstIndex, numOfItems} = this.state,
			max = Math.min(dataSize, firstIndex + numOfItems);

		this.positionItems({updateFrom: firstIndex, updateTo: max});
	}

	render () {
		const
			props = Object.assign({}, this.props),
			{className, style} = this.props,
			{isHorizontalScrollbarVisible, isVerticalScrollbarVisible} = this.state,
			{primary, cc} = this,
			scrollableClasses = classNames(css.virtualListBase, className);

		delete props.cbScrollTo;
		delete props.className;
		delete props.clientSize;
		delete props.component;
		delete props.data;
		delete props.dataSize;
		delete props.direction;
		delete props.horizontalScrollbar;
		delete props.itemSize;
		delete props.onScroll;
		delete props.onScrollStart;
		delete props.onScrollStop;
		delete props.overhang;
		delete props.spacing;
		delete props.style;
		delete props.verticalScrollbar;

		if (primary) {
			this.renderCalculate();
		}

		return (
			<div
				className={scrollableClasses}
				ref={this.initOuterContainerRef}
				style={style}
			>
				<div className={css.outerContainer}>
					<div
						{...props}
						ref={this.initContainerRef}>
						{...this.eventHandlers}
						className={css.innerContainer}
						onScroll={this.handleScroll}
						ref={this.initChildRef}
					>
						{cc}
					</div>
					{isVerticalScrollbarVisible ? <Scrollbar {...this.verticalScrollbarProps} disabled={!isVerticalScrollbarVisible} /> : null}
				</div>
				{isHorizontalScrollbarVisible ? <Scrollbar {...this.horizontalScrollbarProps} disabled={!isHorizontalScrollbarVisible} /> : null}
			</div>
		);
	}
}

/**
 * {@link ui/VirtualList.VirtualListBase} is a base component for
 * {@link ui/VirtualList.VirtualList} and
 * {@link ui/VirtualList.VirtualGridList} with Scrollable applied.
 *
 * @class VirtualListBase
 * @memberof ui/VirtualList
 * @mixes ui/Scrollable
 * @ui
 * @private
 */
const VirtualListBase = Scrollable(VirtualListCore);

export default VirtualListBase;
export {gridListItemSizeShape, VirtualListCore, VirtualListBase};
