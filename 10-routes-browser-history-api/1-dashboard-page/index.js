import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements;
  components;

  initComponents () {
    const today = new Date();
    const rangeFrom = new Date(today.setMonth(today.getMonth() - 1));
    const rangeTo = new Date();

    const rangePicker = new RangePicker({from: rangeFrom, to: rangeTo});

    const ordersChart = new ColumnChart({
      label: 'Заказы',
      url: 'api/dashboard/orders',
      range: {
        from: rangeFrom,
        to: rangeTo,
      }
    });
    const salesChart = new ColumnChart({
      label: 'Продажи',
      url: 'api/dashboard/sales',
      range: {
        from: rangeFrom,
        to: rangeTo,
      }
    });
    const customersChart = new ColumnChart({
      label: 'Клиенты',
      url: 'api/dashboard/customers',
      range: {
        from: rangeFrom,
        to: rangeTo,
      }
    });
    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${rangeFrom.toISOString()}&to=${rangeTo.toISOString()}&_start=0&_end=30`,
      isSortLocally: true
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      let target = this.subElements[component];
      let {element} = this.components[component];

      target.append(element);
    });
  }

  initEventListeners() {
    document.addEventListener('date-select', this.handleSelectDateEvent);
  }

  handleSelectDateEvent = (e) => {
    const {from, to} = e.detail;
    this.updateComponents(from, to);
  }

  async updateComponents(from, to) {
    let bestsellersURL = new URL('api/dashboard/bestsellers', BACKEND_URL);
    bestsellersURL.searchParams.set('_start', '1');
    bestsellersURL.searchParams.set('_end', '30');
    bestsellersURL.searchParams.set('from', from);
    bestsellersURL.searchParams.set('to', to);

    const bestsellersData = await fetchJson(bestsellersURL);

    this.components.sortableTable.update(bestsellersData);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }


  render() {
    let element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements[item.dataset.element] = item;
    });
    return subElements;
  }

  getTemplate() {
    return `
    <div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        <div data-element="rangePicker"></div>
      </div>
    <div class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
    </div>
   <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
  </div>`;
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.remove()

    Object.keys(this.components).forEach(component => {
      this.components[component].destroy();
    });
  }
}
