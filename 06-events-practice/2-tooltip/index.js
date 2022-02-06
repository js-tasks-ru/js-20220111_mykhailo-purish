class Tooltip {
  static instance = null;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  getTemplate() {
    return `
        <div class="tooltip"></div>
    `;
  }

  render(text) {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.element.innerHTML = text;
    document.body.append(this.element);
  }

  initialize () {
    document.addEventListener('pointerover', this.pointerIn);
    document.addEventListener('pointerout', this.pointerLeave);

  }

  pointerIn = (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      this.render(target.dataset.tooltip);
      document.addEventListener('pointermove', this.pointerMove);
    }
  }

  pointerLeave = (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      document.removeEventListener('pointermove', this.pointerMove);
      this.element.remove();
    }
  }

  pointerMove = (event) => {
    this.element.style.top = event.offsetY + 10 + 'px';
    this.element.style.left = event.offsetX + 10 + 'px';
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.pointerIn);
    document.removeEventListener('pointerout', this.pointerLeave);
    document.removeEventListener('pointermove', this.pointerMove);
    Tooltip.instance = null;
  }
}

export default Tooltip;
