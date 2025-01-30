/* 
 * Copyright (C) 2020 Cloudware S.A. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class CasperTab extends PolymerElement {

  static get properties () {
    return {
      /**
       * This flag states if this current tab is active or not.
       *
       * @type {Boolean}
       */
      active: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '__activeChanged'
      },
      /**
       * This flag states if this current tab is disabled or not.
       *
       * @type {Boolean}
       */
      disabled: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '__disabledChanged'
      }
    };
  }

  static get template () {
    return html`
      <style>
        :host {
          height: 32px;
          display: flex;
          user-select: none;
          align-items: center;
          white-space: nowrap;
          justify-content: center;
          background-color: white;
          color: var(--casper-tabs-primary-color, var(--primary-color));
          border-right: 1px solid var(--disabled-background-color);
          transition: background-color 100ms linear;
        }

        :host([active]) {
          color: white;
          background-color: var(--casper-tabs-primary-color, var(--primary-color));
        }

        :host([disabled]) {
          pointer-events: none;
          color: var(--disabled-text-color);
          background-color: var(--disabled-background-color);
        }

        :host(:hover) {
          color: var(--primary-color);
          cursor: pointer;
          background-color: var(--light-primary-color, var(--casper-tabs-primary-color));
        }

        .tab-container {
          width: 100%;
          height: 100%;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <div class="tab-container" on-click="__activateTab">
        <slot></slot>
      </div>
    `;
  };

  /**
   * This method is invoked when the user clicks on the tab.
   */
  __activateTab () {
    this.active = true;
  }

  /**
   * This method is invoked when the active property changes.
   */
  __activeChanged () {
    if (this.active) this.disabled = false;
  }

  /**
   * This method is invoked when the disabled property changes.
   */
  __disabledChanged () {
    if (this.disabled) this.active = false;
  }
}

window.customElements.define('casper-tab', CasperTab);
