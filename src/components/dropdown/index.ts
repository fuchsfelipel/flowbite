import { createPopper } from "@popperjs/core";

const Default = {
  placement: "bottom",
  triggerType: "click",
  offsetSkidding: 0,
  offsetDistance: 10,
  onShow: () => {},
  onHide: () => {},
};

class Dropdown {
  constructor(targetElement = null, triggerElement = null, options = {}) {
    this._targetEl = targetElement;
    this._triggerEl = triggerElement;
    this._options = { ...Default, ...options };
    this._popperInstance = this._createPopperInstace();
    this._visible = false;
    this._init();
  }

  _init() {
    if (this._triggerEl) {
      this._triggerEl.addEventListener("click", () => {
        this.toggle();
      });
    }
  }

  _createPopperInstace() {
    return createPopper(this._triggerEl, this._targetEl, {
      placement: this._options.placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [
              this._options.offsetSkidding,
              this._options.offsetDistance,
            ],
          },
        },
      ],
    });
  }

  _handleClickOutside(ev, targetEl) {
    const clickedEl = ev.target;
    if (
      clickedEl !== targetEl &&
      !targetEl.contains(clickedEl) &&
      !this._triggerEl.contains(clickedEl) &&
      this._visible
    ) {
      this.hide();
    }
    document.body.removeEventListener("click", this._handleClickOutside, true);
  }

  toggle() {
    if (this._visible) {
      this.hide();
      document.body.removeEventListener(
        "click",
        this._handleClickOutside,
        true
      );
    } else {
      this.show();
    }
  }

  show() {
    this._targetEl.classList.remove("hidden");
    this._targetEl.classList.add("block");

    // Enable the event listeners
    this._popperInstance.setOptions((options) => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: "eventListeners", enabled: true },
      ],
    }));

    document.body.addEventListener(
      "click",
      (ev) => {
        this._handleClickOutside(ev, this._targetEl);
      },
      true
    );

    // Update its position
    this._popperInstance.update();
    this._visible = true;

    // callback function
    this._options.onShow(this);
  }

  hide() {
    this._targetEl.classList.remove("block");
    this._targetEl.classList.add("hidden");

    // Disable the event listeners
    this._popperInstance.setOptions((options) => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: "eventListeners", enabled: false },
      ],
    }));

    this._visible = false;

    // callback function
    this._options.onHide(this);
  }
}

window.Dropdown = Dropdown;

export function initDropdowns() {
  document.querySelectorAll("[data-dropdown-toggle]").forEach((triggerEl) => {
    const targetEl = document.getElementById(
      triggerEl.getAttribute("data-dropdown-toggle")
    );
    const placement = triggerEl.getAttribute("data-dropdown-placement");
    const offsetSkidding = triggerEl.getAttribute(
      "data-dropdown-offset-skidding"
    );
    const offsetDistance = triggerEl.getAttribute(
      "data-dropdown-offset-distance"
    );

    new Dropdown(targetEl, triggerEl, {
      placement: placement ? placement : Default.placement,
      offsetSkidding: offsetSkidding
        ? parseInt(offsetSkidding)
        : Default.offsetSkidding,
      offsetDistance: offsetDistance
        ? parseInt(offsetDistance)
        : Default.offsetDistance,
    });
  });
}

export default Dropdown;