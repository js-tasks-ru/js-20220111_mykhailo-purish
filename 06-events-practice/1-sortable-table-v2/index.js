export default class SortableTable {
  element;
  subElements;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.sort(sorted.id, sorted.order);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortEventHandler);
  }
  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.sortEventHandler);
  }

  sortEventHandler = (event) => {
    const target = event.target.closest('.sortable-table__cell');
    if (target.dataset.sortable === 'true') {
      console.log('sort');
      let sortOrder;
      if (target.dataset.order === 'asc') {
        sortOrder = 'desc';
      }
      else {
        sortOrder = 'desc';
      }
      this.sort(target.dataset.id, sortOrder);
    }
  }

  getTemplate() {
    return `
      <div>
          <div data-element="header" class="sortable-table__header sortable-table__row">
           ${this.generateHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
          ${this.generateBody()}
          </div>
      </div>
    `;
  }

  generateHeader() {
    return this.headerConfig.map((item) => {
      return `<div class="sortable-table__cell" data-id="${item['id']}" data-sortable="${item['sortable']}">
                <span>${item['title']}</span>
              </div>`;
    }).join('');
  }

  generateBody() {
    return this.data.map((item) => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
                ${this.generateRow(item)}
              </a>`;
    }).join('');
  }

  generateRow(dataItem) {
    return this.headerConfig.map((headerItem) => {
      if (headerItem.id in dataItem) {
        if (headerItem['template']) {
          return headerItem.template(dataItem[headerItem.id]);
        } else {
          return `<div class="sortable-table__cell">${dataItem[headerItem.id]}</div>`;
        }
      }
    }).join('');
  }

  sort(fieldValue, orderValue) {
    const sortOrder = {
      asc: 1,
      desc: -1,
    };
    
    if (this.headerConfig.find(item => item['id'] === fieldValue)['sortType'] === 'string') {
      this.data.sort((a, b) => sortOrder[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']));
    }
    else {
      this.data.sort((a, b) => (sortOrder[orderValue] * (a[fieldValue] - b[fieldValue])));
    }

    this.subElements.body.innerHTML = this.generateBody();
    const targetCol = this.subElements.header.querySelector(`[data-id=${fieldValue}]`);
    targetCol.dataset.order = orderValue;
    targetCol.append(this.subElements.arrow);
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements[item.dataset.element] = item;
    });
    console.log(subElements);
    return subElements;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    document.body.append(this.element);
    this.subElements = this.getSubElements();

    const sortArrow = document.createElement('div');
    sortArrow.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
                            <span class="sort-arrow"></span>
                           </span>`;
    this.subElements.arrow = sortArrow.firstElementChild;

  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.removeEventListeners();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
