import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements;
  chartHeight = 50;
  data = [];
  value = null;

  constructor({
    url = '',
    label = '',
    range = {},
    link = '',
    formatHeading = val => val,
  } = {})
  {
    this.url = url;
    this.range = range;
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;

    this.render();
    this.getData().then(() => this.drawChart(this.data));

  }

  async getData(url = this.url, range = this.range) {
    let reqURL = new URL(url, BACKEND_URL);
    let response;
    reqURL.search = encodeURI(`from=${range.from.toISOString()}&to=${range.to.toISOString()}`);

    try {
      response = await fetchJson(reqURL);
    }
    catch (Error) {
      console.log(Error);
    }
    this.data = Array.from(Object.values(response));
    this.value = this.data.reduce((sum, current) => sum + current);
    return response; // Исключительно для тестов, см. комментарий ниже
  }

  // update = (from, to) => {
  //   const UPDATE_URL = 'api/dashboard/orders';
  //   const range = {
  //     from: from,
  //     to: to
  //   };
  //   this.getData(UPDATE_URL, range).then(() => this.drawChart(this.data));
  // }

  // Функция update() предустматривалась та, которая выше ^^^.
  // Поскольку тесты хотят обязательно видеть асинхронный update(),
  // а меня архитектуру только ради тестов не хочется,
  // я стал передавать response из getData(), ловить его в async update()
  // и навязчиво возвращать для прохожденяи тестов.

  async update(from, to) {
    const UPDATE_URL = 'api/dashboard/orders';
    const range = {
      from: from,
      to: to
    };
    let answer; // Для тестов
    await this.getData(UPDATE_URL, range).then((response) => {
      this.drawChart(this.data);
      answer = response; // Для тестов
    });
    return answer; // Для тестов
  }

  getTemplate() {
    return `
    <div class="column-chart${this.data.length > 0 ? '' : ' column-chart_loading'}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="${this.link}" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">

        </div>
      </div>
    </div>
    `;
  }

  buildChart(data) {
    const maxValue = Math.max(...data);
    return data.map(value => (`<div style="--value: ${Math.floor(value / maxValue * this.chartHeight)}" data-tooltip="${Math.round(value / maxValue * 100)}%"></div>`)).join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements[item.dataset.element] = item;
    });
    return subElements;
  }

  drawChart(data) {
    if (!data.length) {
      this.element.classList.add('column-chart_loading');
    }
    else {
      this.element.classList.remove('column-chart_loading');
    }
    this.subElements['header'].innerHTML = this.formatHeading(this.value);
    this.subElements['body'].innerHTML = this.buildChart(data);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.element.remove();
  }

}
