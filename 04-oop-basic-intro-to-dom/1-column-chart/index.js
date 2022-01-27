export default class ColumnChart {
  element;
  subElements;
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = val => val,
  } = {})
  {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;

    this.render();
  }

  getTemplate() {
    return `
    <div class="column-chart${this.data.length > 0 ? '' : ' column-chart_loading'}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="${this.link}" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
        ${this.buildChart(this.data)}
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
    const subElements = new Map();
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements.set(item.dataset.element, item);
    });
    return subElements;
  }

  update(data) {
    if (!data.length) {
      this.element.classList.add('column-chart_loading');
    }
    else {
      this.element.classList.remove('column-chart_loading');
    }
    this.subElements.get('body').innerHTML = this.buildChart(data);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements.clear();
    this.element.remove();
  }

}
