export default class SortableList {
  element;
  dragElem;
  placeholder;
  shiftX;
  shiftY;
  currentSiblings = {};

  constructor({items}) {
    this.items = items;

    this.render();
    this.addEventListeners();
  }

  render() {
    let element = document.createElement('ul');
    element.classList.add('sortable-list');
    this.items.forEach((item) => {
      item.classList.add('sortable-list__item');
      element.append(item);
    });
    this.element = element;
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointerup', this.handlePointerUp);
  }

  handlePointerDown = (event) => {
    const target = event.target;
    this.dragElem = event.target.closest('.sortable-list__item');

    if (target.closest('[data-delete-handle]')) {
      this.dragElem.remove();
    }

    if (target.closest('[data-grab-handle]')) {
      this.shiftX = event.clientX - this.dragElem.getBoundingClientRect().left;
      this.shiftY = event.clientY - this.dragElem.getBoundingClientRect().top;
      this.dragElem.style.width = `${this.dragElem.clientWidth}px`;
      this.dragElem.style.height = `${this.dragElem.clientHeight}px`;
      this.dragElem.style.top = event.clientY - this.shiftY + 'px';
      this.dragElem.style.left = event.clientX - this.shiftX + 'px';

      this.addPlaceholder(this.dragElem.clientWidth, this.dragElem.clientHeight);
      this.dragElem.classList.add('sortable-list__item_dragging');
      this.element.append(this.dragElem);
      this.setCurrentSiblings();

      document.addEventListener('pointermove', this.handlePointerMove);
    }
  }

  handlePointerMove = (event) => {
    this.dragElem.style.top = event.clientY - this.shiftY + 'px';
    this.dragElem.style.left = event.clientX - this.shiftX + 'px';

    if (this.currentSiblings.next && (Math.round(event.clientY) >= this.currentSiblings.next.getBoundingClientRect().top)) {
      this.currentSiblings.next.after(this.placeholder);
      this.setCurrentSiblings();
    }
    else if (this.currentSiblings.prev && (Math.round(event.clientY) <= this.currentSiblings.prev.getBoundingClientRect().bottom)) {
      this.currentSiblings.prev.before(this.placeholder);
      this.setCurrentSiblings();
    }
  }

  handlePointerUp = (event) => {
    document.removeEventListener('pointermove', this.handlePointerMove);
    this.dragElem.classList.remove('sortable-list__item_dragging');
    this.placeholder.before(this.dragElem);
    this.dragElem.style.top = 'auto';
    this.dragElem.style.left = 'auto';
    this.placeholder.remove();
  }

  addPlaceholder(width, height) {
    this.placeholder = document.createElement('div');
    this.placeholder.classList.add('sortable-list__placeholder');
    this.placeholder.style.width = `${width}px`;
    this.placeholder.style.height = `${height}px`;
    this.dragElem.before(this.placeholder);
  }

  setCurrentSiblings () {
    this.currentSiblings.prev = this.placeholder.previousSibling ? this.placeholder.previousSibling : null;
    this.currentSiblings.next = this.placeholder.nextSibling && this.placeholder.nextSibling !== this.dragElem ? this.placeholder.nextSibling : null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
