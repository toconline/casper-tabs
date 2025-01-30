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

class CasperTabs extends PolymerElement {

  static get properties () {
    return {
      /**
       * This property states the selected tab index.
       *
       * @type {Number}
       */
      selectedIndex: {
        type: Number,
        notify: true,
        observer: '__selectedIndexChanged'
      }
    };
  }

  static get template () {
    return html`
      <style>
        :host {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* If the casper-tabs are slotted inside the casper-epaper-tabs, we fix the styles which are applied there */
        :host([slot="casper-epaper-tabs"]) #tabsContainer {
          border: 1px solid var(--casper-tabs-primary-color, var(--primary-color));
          box-shadow: 0px 2px 12px -1px rgba(0, 0, 0, 0.6);
        }

        :host([slot="casper-epaper-tabs"]) #leftArrow, 
        :host([slot="casper-epaper-tabs"]) #rightArrow {
          color: white;
          filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.7));
        }

        #tabsContainer {
          display: flex;
          font-size: 14px;
          margin: 0 10px;
          border-radius: 15px;
          border: 1px solid rgb(124, 124, 124);
          overflow: scroll;
          scroll-behavior: smooth;
          -ms-overflow-style: none;  /* Hides scrollbar for IE and Edge */
          scrollbar-width: none;  /* Hides scrollbar for Firefox */
        }

        /* Hides scrollbar for Chrome, Safari and Opera */
        #tabsContainer::-webkit-scrollbar {
          display: none;
        }

        #leftArrow, #rightArrow {
          display: flex;
          align-items: center;
          color: rgb(124, 124, 124);
          cursor: pointer;
          visibility: hidden;
        }

        ::slotted(casper-tab) {
          flex: 1;
        }

        ::slotted(casper-tab:last-of-type) {
          border-right: none;
        }
      </style>

      <span id="leftArrow">
        <casper-icon icon="fa-regular:angle-left"></casper-icon>
      </span>
      <div id="tabsContainer">
        <slot></slot>
      </div>
      <span id="rightArrow">
        <casper-icon icon="fa-regular:angle-right"></casper-icon>
      </span>
    `;
  }

  ready () {
    super.ready();

    this.__tabs = this.shadowRoot.querySelector('slot').assignedElements();
    this.__tabs.forEach((currentTab, currentTabIndex) => {
      // Check if there is a tab already active.
      if (currentTab.active) this.selectedIndex = currentTabIndex;

      currentTab.addEventListener('active-changed', () => {
        if (!currentTab.active) return;

        this.selectedIndex = currentTabIndex;
        this.__tabs
          .filter(tab => currentTab !== tab)
          .forEach(tab => tab.active = false);
      });

      currentTab.addEventListener('disabled-changed', () => {
        if (!currentTab.disabled && currentTabIndex === this.selectedIndex) {
          currentTab.active = true;
        }
      });
    });

    // This will observe the resize of the given elements (entries).
    // In this case, it's responsible for displaying the arrows when necessary, to scroll.
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.tagName === 'CASPER-TABS') {
          const casperTabs = entry.target;
          const allTabs = casperTabs.shadowRoot.querySelector('slot').assignedElements();
          const leftArrow = casperTabs.shadowRoot.querySelector('#leftArrow');
          const rightArrow = casperTabs.shadowRoot.querySelector('#rightArrow');

          let allTabsWidth = 0;
          for (const tab of allTabs) {
            allTabsWidth += tab.offsetWidth;
          }
          
          // If the width of all tabs plus the two scroll arrows is bigger than the width of their container, then we show the right arrow
          if ((allTabsWidth + leftArrow.offsetWidth * 2) > casperTabs.offsetWidth) {
            rightArrow.style.visibility = 'visible';
          } else {
            rightArrow.style.visibility = 'hidden';
            leftArrow.style.visibility = 'hidden';
          }
        }
      }
    });
    resizeObserver.observe(this);

    this.$.leftArrow.addEventListener('click', event => this.__scrollTabsContainer('left', 150));
    this.$.rightArrow.addEventListener('click', event => this.__scrollTabsContainer('right', 150));
    this.$.tabsContainer.addEventListener('click', event => this.__findScrollDirection(event));
  }

  /**
   * This method is invoked when the selected index property changes.
   */
  __selectedIndexChanged () {
    const currentTab = this.__tabs[this.selectedIndex];

    currentTab && !currentTab.disabled
      ? currentTab.active = true
      : this.__tabs.forEach(tab => tab.active = false);
  }

  /**
     * This function fires when the user clicks on an arrow. It is responsible for scrolling the casper tabs.
     *
     * @param {String} direction The direction of the scroll.
     * @param {Number} value The value of the scroll.
     */
  __scrollTabsContainer (direction, value) {
    const tabsContainer = this.$.tabsContainer;
    const leftArrow = this.$.leftArrow;
    const rightArrow = this.$.rightArrow;

    if (direction === 'right') {
      tabsContainer.scrollLeft += value;
    } else if (direction === 'left') {
      tabsContainer.scrollLeft -= value;
    }
    
    // A timeout is needed to make sure that the scroll-behavior: smooth has finished
    setTimeout(() => {
      // Here we're at the end of the scroll
      if ((tabsContainer.offsetWidth + tabsContainer.scrollLeft) > tabsContainer.scrollWidth) {
        rightArrow.style.visibility = 'hidden';
      } else {
        rightArrow.style.visibility = 'visible';
      }

      // Here we're at the beginning of the scroll
      if (tabsContainer.scrollLeft === 0) { 
        leftArrow.style.visibility = 'hidden';
      } else {
        leftArrow.style.visibility = 'visible';
      }
    }, 200);
  }

  /**
     * This function fires when the user clicks on the tabs container. 
     * It is responsible for finding whether the tabs container should be scrolled left or right.
     *
     * @param {Object} event The event's object.
     */
  __findScrollDirection (event) { 
    if (event && event.currentTarget) {
      const tabsContainer = event.currentTarget;

      // Here there's no need to scroll
      if (tabsContainer.offsetWidth >= tabsContainer.scrollWidth) return;

      const currentTab = this.__tabs[this.selectedIndex];
      const middleX = tabsContainer.offsetWidth / 2;
      const clickX = event.clientX - tabsContainer.getBoundingClientRect().left;

      let direction;
      if (clickX >= middleX) {
        direction = 'right';
      } else if (clickX < middleX) {
        direction = 'left';
      }
      
      const scrollValue = currentTab.offsetWidth;
      this.__scrollTabsContainer(direction, scrollValue);
    }
  }
}

window.customElements.define('casper-tabs', CasperTabs);
