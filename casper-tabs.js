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
          overflow: hidden;
          width: fit-content;
          border-radius: 15px;
          border: 1px solid var(--casper-tabs-primary-color, var(--primary-color));
        }

        ::slotted(casper-tab) {
          flex: 1;
        }

        ::slotted(casper-tab:last-of-type) {
          border-right: none;
        }
      </style>
      <slot></slot>
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
}

window.customElements.define('casper-tabs', CasperTabs);