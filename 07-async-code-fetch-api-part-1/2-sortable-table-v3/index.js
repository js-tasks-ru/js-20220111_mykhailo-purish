import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;
  data = [];
  scrollLoading = false;
  from = 0;
  to = 30;
  sortedBy = null;
  sortOrder = null;

  constructor(headersConfig, {url = '', sorted = {}, isSortLocally = false} = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();

  }

  async getData(options = {}) {
    const {from = 0, to = 30, id = null, order = null} = options;
    let requestURL = new URL(this.url, BACKEND_URL);
    requestURL.searchParams.set('_start', from);
    requestURL.searchParams.set('_end', to);
    if (id) {
      requestURL.searchParams.set('_sort', id);
    }
    if (order) {
      requestURL.searchParams.set('_order', order);
    }
    try {
      let response = await fetchJson(requestURL);
      this.data.push(...response);
      if ((!response.length) && (this.scrollLoading === false)) {
        this.element.classList.add('sortable-table_empty');
      }
      return response;
    }
    catch (e) {
      console.error(e);
    }
  }

  updateBody() {
    this.subElements.body.innerHTML = this.generateBody();
    this.element.classList.remove('sortable-table_loading');
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.sortEventHandler);
    document.addEventListener('scroll', this.scrollHandler);
  }
  removeEventListeners() {
    document.removeEventListener('pointerdown', this.sortEventHandler);
    document.removeEventListener('scroll', this.scrollHandler);
  }

  scrollHandler = (event) => {
    if ((window.scrollY + window.innerHeight + 50) > document.body.scrollHeight && !this.scrollLoading) {
      this.element.classList.add('sortable-table_loading');
      this.scrollLoading = true;
      this.from = this.to;
      this.to = this.to + 30;
      this.getData({from: this.from, to: this.to, id: this.sortedBy, order: this.sortOrder})
        .then((data) => {
          if (data.length) {
            this.subElements.body.innerHTML += this.generateBody(data);
            this.element.classList.remove('sortable-table_loading');
            this.scrollLoading = false;
          }
          else {
            this.element.classList.remove('sortable-table_loading');
          }
        });
    }
  }

  sortEventHandler = (event) => {
    const target = event.target.closest('.sortable-table__cell');
    if (target.dataset.sortable === 'true') {
      let sortOrder = target.dataset.order === 'desc' ? 'asc' : 'desc';
      if (this.isSortLocally) {
        this.sortOnClient(target.dataset.id, sortOrder);
      }
      else {
        this.sortOnServer(target.dataset.id, sortOrder);
      }
      this.sortedBy = target.dataset.id;
      this.sortOrder = sortOrder;
    }
  }

  sortOnClient(id, order) {
    const sortOrder = {
      asc: 1,
      desc: -1,
    };

    if (this.headerConfig.find(item => item['id'] === id)['sortType'] === 'string') {
      this.data.sort((a, b) => sortOrder[order] * a[id].localeCompare(b[id], ['ru', 'en']));
    }
    else {
      this.data.sort((a, b) => (sortOrder[order] * (a[id] - b[id])));
    }

    this.subElements.body.innerHTML = this.generateBody();
    const targetCol = this.subElements.header.querySelector(`[data-id=${id}]`); // (1 do later)
    targetCol.dataset.order = order;
    targetCol.append(this.subElements.arrow);
  }

  sortOnServer (id, order) {
    this.subElements.body.innerHTML = '';
    this.element.classList.add('sortable-table_loading');
    // Нуже ли показ лоадера? ^^^
    const targetCol = this.subElements.header.querySelector(`[data-id=${id}]`); // (1 do later)
    this.getData({id: id, order: order}).then(() => {
      this.updateBody();
      this.element.classList.remove('sortable-table_loading');
      targetCol.dataset.order = order;
      targetCol.append(this.subElements.arrow);
    });
  }
  // 1. Вынести уставновку стрелочки в отдельную функцию

  getTemplate() {
    return `
      <div class="sortable-table sortable-table_loading">
          <div data-element="header" class="sortable-table__header sortable-table__row">
           ${this.generateHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">

          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
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

  generateBody(data = this.data) {
    return data.map((item) => {
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

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements[item.dataset.element] = item;
    });
    return subElements;
  }

  async render() {
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

    await this.getData({id: this.sorted.id, order: this.sorted.order})
      .then(() => {
        this.updateBody();
        this.initEventListeners();
      });
    if (Object.keys(this.sorted).length) {
      const targetCol = this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`);
      targetCol.dataset.order = this.sorted.order;
      targetCol.append(this.subElements.arrow);
    }
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
