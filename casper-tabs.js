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
          border-radius: 15px;
          box-shadow: 0px 2px 12px -1px rgba(0, 0, 0, 0.6);
        }

        ::slotted(casper-tab:first-of-type) {
          border-top-left-radius: 15px;
          border-bottom-left-radius: 15px;
        }

        ::slotted(casper-tab:last-of-type) {
          border-right: none;
          border-top-right-radius: 15px;
          border-bottom-right-radius: 15px;
        }
      </style>
      <slot></slot>
    `;
  }

  ready () {
    super.ready();

    this.__tabs = this.shadowRoot.querySelector('slot').assignedElements();
    this.__tabs.forEach((tab, tabIndex) => {
      // Check if there is a tab already active.
      if (tab.active) this.selectedIndex = tabIndex;

      tab.addEventListener('active-changed', () => {
        if (!tab.active) return;

        this.selectedIndex = tabIndex;
        this.__tabs
          .filter(tab => tab !== tab)
          .forEach(tab => tab.active = false);
      });

      tab.addEventListener('disabled-changed', () => {
        if (!tab.disabled && tabIndex === this.selectedIndex) {
          tab.active = true;
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