export default class RangePicker {
  element;
  subElements;
  newRangeFrom = null;

  constructor({from, to}) {

    this.monthTo = to;
    this.rangeFrom = from;
    this.rangeTo = to;

    this.render();
    this.initEventListeners();
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

  initEventListeners() {
    this.subElements.input.addEventListener('click', this.inputEventHandler);
    this.subElements.selector.addEventListener('click', this.selectorEventHandler);
    document.addEventListener('click', this.outsideClickHander, true);
  }
  removeEventListeners() {
    document.removeEventListener('click', this.outsideClickHander, true);
  }

  outsideClickHander = (event) => {
    if (this.element.contains(event.target)) return;
    this.element.classList.toggle('rangepicker_open');
  }
  inputEventHandler = () => {
    this.subElements.selector.innerHTML = this.buildSelector();
    this.element.classList.toggle('rangepicker_open');
  }
  selectorEventHandler = (event) => {

    const target = event.target;


    if (target.closest('.rangepicker__selector-control-left')) {
      this.shiftRange(-1);
    }
    if (target.closest('.rangepicker__selector-control-right')) {
      this.shiftRange(1);
    }

    else if (target.closest('.rangepicker__cell')) {
      const targetCell = target.closest('.rangepicker__cell');
      this.selectDate(targetCell);
    }
  }

  shiftRange(shift) {
    this.monthTo.setMonth(this.monthTo.getMonth() + shift);
    let [calendar1, calendar2] = this.subElements.selector.querySelectorAll('.rangepicker__calendar');
    calendar1.innerHTML = this.buildCalendar(this.getPreviousMonth(this.monthTo));
    calendar2.innerHTML = this.buildCalendar(this.monthTo);
  }

  getPreviousMonth (date) {
    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  }

  selectDate(target) {
    if (!this.newRangeFrom) {

      let selectedElements = this.subElements.selector.querySelectorAll('[class*="rangepicker__selected"]');
      selectedElements.forEach(element => {
        element.className = "rangepicker__cell";
      });

      this.newRangeFrom = new Date(target.dataset.value);
      this.rangeFrom = new Date(target.dataset.value);
      this.rangeTo = new Date(target.dataset.value);
      this.subElements.selector.querySelector(`[data-value="${target.dataset.value}"]`).classList.add('rangepicker__selected-from');
    }

    else {
      this.rangeFrom = this.newRangeFrom;
      this.rangeTo = new Date(target.dataset.value);
      this.subElements.selector.querySelector(`[data-value="${target.dataset.value}"]`).classList.add('rangepicker__selected-to');

      if (this.rangeFrom > this.rangeTo) {
        [this.rangeFrom, this.rangeTo] = [this.rangeTo, this.rangeFrom];
        let rangeLimits = this.subElements.selector.querySelectorAll('.rangepicker__selected-from, .rangepicker__selected-to');
        rangeLimits[0].className = "rangepicker__selected rangepicker__selected-from";
        rangeLimits[1].className = "rangepicker__selected rangepicker__selected-to";
      }

      this.newRangeFrom = null;
      this.subElements.selector.innerHTML = this.buildSelector(this.rangeFrom, this.rangeTo);
      this.subElements.from.innerHTML = this.rangeFrom.toLocaleString('ru', {dateStyle: 'short'});
      this.subElements.to.innerHTML = this.rangeTo.toLocaleString('ru', {dateStyle: 'short'});
      this.monthTo = new Date(this.rangeTo);
      this.element.classList.toggle('rangepicker_open');
      this.element.dispatchEvent(new CustomEvent('date-select', {
        detail: { from: this.rangeFrom,
                  to: this.rangeTo,
        }, bubbles: true
      }));
    }

  }

  getMonthName(date) {
    return new Intl.DateTimeFormat('ru', {month: 'long'}).format(date);
  }

  getDaysInMonth (date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  buildDayGrid(date) {
    const dateCopy = new Date(date);
    dateCopy.setDate(1);
    const startDay = (dateCopy.getDay() === 0) ? 7 : dateCopy.getDay();
    const daysArray = [...Array(this.getDaysInMonth(date) + 1).keys()];
    daysArray.shift();

    return daysArray.map((day) => {
      dateCopy.setDate(day);
      let shift = '';
      let selectedClass = '';
      if (dateCopy.getTime() === this.rangeFrom.getTime()) {
        selectedClass = ' rangepicker__selected-from';
      }
      if (dateCopy.getTime() === this.rangeTo.getTime()) {
        selectedClass = ' rangepicker__selected-to';
      }
      if ((dateCopy.getTime() > this.rangeFrom.getTime()) && (dateCopy.getTime() < this.rangeTo.getTime())) {
        selectedClass = ' rangepicker__selected-between';
      }
      if (day === 1) {
        shift = ` style="--start-from: ${startDay}"`;
      }

      return `<button type="button" class="rangepicker__cell${selectedClass}" data-value="${dateCopy.toISOString()}"${shift}>${day}</button>`;
    }).join('');
  }

  buildCalendar(date) {
    return `
    <div class="rangepicker__month-indicator">
      <time datetime="${this.getMonthName(date)}">${this.getMonthName(date)}</time>
    </div>
    <div class="rangepicker__day-of-week">
      <div>Пн</div>
      <div>Вт</div>
      <div>Ср</div>
      <div>Чт</div>
      <div>Пт</div>
      <div>Сб</div>
      <div>Вс</div>
    </div>
    <div class="rangepicker__date-grid">
        ${this.buildDayGrid(date)}
    </div>
    `;
  }

  buildSelector() {
    return `
    <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
      ${this.buildCalendar(this.getPreviousMonth(this.monthTo))}
      </div>
      <div class="rangepicker__calendar">
      ${this.buildCalendar(this.monthTo)}
      </div>
    </div>
    `;
  }

  getTemplate() {
    return `
    <div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.rangeFrom.toLocaleString('ru', {dateStyle: 'short'})}</span> -
      <span data-element="to">${this.rangeTo.toLocaleString('ru', {dateStyle: 'short'})}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>
  </div>
    `;
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
