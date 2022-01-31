export default class SortableTable {
  element;
  subElements;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
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
      this.data.sort((a, b) => sortOrder[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en'], {caseFirst: 'upper'}));
    }
    else {
      this.data.sort((a, b) => {
        return sortOrder[orderValue] * (a[fieldValue] - b[fieldValue]);
      });
    }

    this.subElements.get('body').innerHTML = this.generateBody();
    const targetCol = this.subElements.get('header').querySelector(`[data-id=${fieldValue}]`);
    targetCol.dataset.order = orderValue;
    targetCol.append(this.subElements.get('arrow'));
  }

  getSubElements() {
    const subElements = new Map();
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements.set(item.dataset.element, item);
    });
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
    this.subElements.set('arrow', sortArrow.firstElementChild);

  }

  remove() {
    if (this.element) {this.element.remove();}
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements.clear();
  }
}

