/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEqual } from 'lodash-es';
import { get, set, setProperties, action } from '@ember/object';
import ReportToWidget from 'navi-dashboards/mixins/controllers/report-to-widget';

export default class DashboardsDashboardViewController extends Controller.extend(ReportToWidget) {
  /**
   * @property {Service} compression
   */
  @service compression;

  /**
   * @property {Service} metadataService
   */
  @service('bard-metadata') metadataService;

  /**
   * @property {Service} store
   */
  @service store;

  /**
   * @property {String[]} queryParams
   */
  queryParams = ['filters'];

  /**
   * @property {String} filters query param holding encoded filters for the dashboard
   */
  filters = null;

  /**
   * @action updateFilter
   * @param {Object} dashboard
   * @param {Object} originalFilter
   * @param {Object} changeSet
   */
  @action
  async updateFilter(dashboard, originalFilter, changeSet) {
    const origFilter = originalFilter.serialize();
    origFilter.dataSource = originalFilter.dimension.source;
    const newFilters = get(dashboard, 'filters')
      .toArray()
      .map(fil => {
        const newFil = fil.serialize();
        newFil.dataSource = fil.dimension.source;
        return newFil;
      }); //Native array of serialized filters
    const filterToUpdate = newFilters.find(fil => isEqual(fil, origFilter));

    setProperties(filterToUpdate, changeSet);

    const newFilter = this.store
      .createFragment('bard-request/fragments/filter', {
        dimension: this.metadataService.getById('dimension', filterToUpdate.dimension, originalFilter.dimension.source),
        operator: filterToUpdate.operator,
        field: filterToUpdate.field,
        rawValues: filterToUpdate.rawValues || filterToUpdate.values
      })
      .serialize();

    newFilter.dataSource = originalFilter.dimension.source;
    const index = newFilters.indexOf(filterToUpdate);
    newFilters[index] = newFilter;

    const filterQueryParams = await this.compression.compress({ filters: newFilters });

    this.transitionToRoute('dashboards.dashboard', { queryParams: { filters: filterQueryParams } });
  }

  /**
   * @action removeFilter
   * @param {Object} dashboard
   * @param {Object} filter
   */
  @action
  async removeFilter(dashboard, filter) {
    const filters = get(dashboard, 'filters').serialize();
    const removedFilter = filter.serialize();
    const newFilters = filters.filter(fil => !isEqual(fil, removedFilter));
    const filterQueryParams = await get(this, 'compression').compress({ filters: newFilters });

    this.transitionToRoute('dashboards.dashboard', { queryParams: { filters: filterQueryParams } });
  }

  /**
   * @action addFilter
   * @param {Object} dashboard
   * @param {Object} dimension
   */
  @action
  async addFilter(dashboard, dimension) {
    const store = this.store;
    const bardMetadata = this.metadataService;
    const filters = dashboard.filters.toArray().map(fil => {
      const newFil = fil.serialize();
      newFil.dataSource = fil.dimension.source;
      return newFil;
    }); //Native array of serialized filters
    const dimensionMeta = bardMetadata.getById('dimension', dimension.dimension, dimension.dataSource);
    const filter = store
      .createFragment('bard-request/fragments/filter', {
        dimension: dimensionMeta,
        operator: 'in',
        field: dimensionMeta.primaryKeyFieldName
      })
      .serialize();

    filter.dataSource = dimension.dataSource;

    filters.push(filter);

    const filterQueryParams = await this.compression.compress({ filters });

    this.transitionToRoute('dashboards.dashboard', { queryParams: { filters: filterQueryParams } });
  }

  /**
   * @action clearFilterQueryParams - Remove query params as model enters clean state
   */
  @action
  clearFilterQueryParams() {
    set(this, 'filters', null);
  }
}
