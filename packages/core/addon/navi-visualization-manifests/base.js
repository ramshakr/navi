/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Base Manifest File
 * This file registers the visualization with navi
 *
 */
import { assert } from '@ember/debug';
import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @property name
   */
  name: undefined,

  /**
   * @property niceName
   */
  niceName: undefined,

  /**
   * @property icon
   */
  icon: undefined,

  /**
   * @method hasSingleMetric
   * @param {Object} request
   * @returns {Boolean} has single metric
   */
  hasSingleMetric(request) {
    return request.metrics?.length === 1;
  },

  /**
   * @method hasNoMetric
   * @param {Object} request
   * @returns {Boolean} has no metrics
   */
  hasNoMetric(request) {
    return request.metrics?.length === 0;
  },

  /**
   * @method hasMetric
   * @param {Object} request
   * @returns {Boolean} has some metrics
   */
  hasMetric(request) {
    return !this.hasNoMetric(request);
  },

  /**
   * @method hasSingleTimeBucket
   * @param {Object} request
   * @returns {Boolean} has single time bucket
   */
  hasSingleTimeBucket(request) {
    let timeGrain = request.logicalTable?.timeGrain,
      numTimeBuckets = request.intervals?.firstObject?.interval?.diffForTimePeriod(timeGrain);

    return numTimeBuckets === 1;
  },

  /**
   * @method hasNoGroupBy
   * @param {Object} request
   * @returns {Boolean} has no group by
   */
  hasNoGroupBy(request) {
    return request.dimensions?.length === 0;
  },

  /**
   * @method hasMultipleMetrics
   * @param {Object} request
   * @returns {Boolean} has multiple metrics
   */
  hasMultipleMetrics(request) {
    return !(this.hasSingleMetric(request) || this.hasNoMetric(request));
  },

  /**
   * @method hasMultipleTimeBuckets
   * @param {Object} request
   * @returns {Boolean} has multiple time buckets
   */
  hasMultipleTimeBuckets(request) {
    return !this.hasSingleTimeBucket(request);
  },

  /**
   * @method hasGroupBy
   * @param {Object} request
   * @returns {Boolean} has group by
   */
  hasGroupBy(request) {
    return !this.hasNoGroupBy(request);
  },

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(/*request*/) {
    assert(`typeIsValid is not implemented in ${this.niceName}`);
  }
});
