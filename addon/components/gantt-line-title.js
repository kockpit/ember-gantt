import Component from '@ember/component';
import layout from '../templates/components/gantt-line-title';

/**
 This is a sub component for wrapping title content

 @class GanttLineTitle
 @namespace Components
 @extends Ember.Component
 @private
 */
export default Component.extend({
  layout,

  classNames: ['gantt-line-title']
});
