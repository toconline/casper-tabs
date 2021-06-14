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
          /* width: fit-content; */
          justify-content: center;
        }

        #tabsContainer {
          display: flex;
          border-radius: 15px;
          /* border: 1px solid rgb(124, 124, 124); */
          border: 1px solid var(--casper-tabs-primary-color, var(--primary-color));
          font-size: 14px;
          margin: 0 15px;
          overflow: scroll;
          scroll-behavior: smooth;
          -ms-overflow-style: none;  /* Hides scrollbar for IE and Edge */
          scrollbar-width: none;  /* Hides scrollbar for Firefox */
        }

        /* Hides scrollbar for Chrome, Safari and Opera */
        #tabsContainer::-webkit-scrollbar {
          display: none;
        }

        ::slotted(casper-tab) {
          flex: 1;
        }

        ::slotted(casper-tab:last-of-type) {
          border-right: none;
        }

        #leftArrow, #rightArrow {
          display: flex;
          align-items: center;
          color: rgb(124, 124, 124);
          cursor: pointer;
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




    // ver se isto é necessário (e corrigir condição)
      // if (casperTabs.offsetWidth < casperTabsContainer.offsetWidth) {
      //   rightArrow.style.visibility = 'hidden';
      //   leftArrow.style.visibility = 'hidden';
      // }

    // This will observe the resize of the given elements (entries)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.tagName === 'CASPER-TABS') {
          const casperTabs = entry.target;
          const allTabs = casperTabs.querySelectorAll('casper-tab');
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

    this.$.leftArrow.addEventListener('click', this.__scrollFiltersTabs.bind(this, 'left', 150));
    this.$.rightArrow.addEventListener('click', this.__scrollFiltersTabs.bind(this, 'right', 150));
    this.$.tabsContainer.addEventListener('click', event => this.__findTabsScrollDirection(event));
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
     * This function fires when the user clicks on a scroll arrow. It is responsible for scrolling the casper tabs.
     *
     * @param {String} direction The direction of the scroll.
     * @param {Number} value The value of the scroll.
     */
   __scrollFiltersTabs (direction, value) {
    const tabsContainer = this.shadowRoot.querySelector('#tabsContainer');
    const leftArrow = this.$.leftArrow;
    const rightArrow = this.$.rightArrow;

    if (direction === 'right') {
      tabsContainer.scrollLeft += value;
    } else if (direction === 'left') {
      tabsContainer.scrollLeft -= value;
    }
    
    // Here we need a timeout to make sure that the scroll-behavior: smooth has finished
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
     * It is responsible for finding whether the tabs should scroll left or right.
     *
     * @param {Object} event The event's object.
     */
   __findTabsScrollDirection (event) { 
    if (event && event.currentTarget) {
      const tabsContainer = event.currentTarget;

      // Here there's no need to scroll
      if (tabsContainer.offsetWidth >= tabsContainer.scrollWidth) return;

      const tabIndex = this.selectedIndex;
      const selectedTab = tabsContainer.querySelector('slot').assignedElements()[tabIndex];

      const middleX = tabsContainer.offsetWidth / 2;
      const clickX = event.clientX - tabsContainer.getBoundingClientRect().left;

      let direction;
      if (clickX >= middleX) {
        direction = 'right';
      } else if (clickX < middleX) {
        direction = 'left';
      }
      
      const scrollValue = selectedTab.offsetWidth;
    
      this.__scrollFiltersTabs(direction, scrollValue);
    }
  }
}

window.customElements.define('casper-tabs', CasperTabs);