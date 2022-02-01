export default class NotificationMessage {
  element;

  notificationTypes = {
    success: 'success',
    error: 'error'
  };

  static activeNotification = null;

  constructor(message = '', {
    duration = 0,
    type = '',
  } = {}) {

    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.notificationTypes[this.type]}" style="--value:${(this.duration / 1000) + 's'}">
        <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                ${this.message}
            </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  cleanActiveNotification() {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
      NotificationMessage.activeNotification = null;
    }
  }

  show(target) {
    this.cleanActiveNotification();

    NotificationMessage.activeNotification = this.element;

    if (target) {
      target.append(this.element);
    }
    else {
      document.body.append(this.element);
    }

    setTimeout(() => {
      this.remove();
    }, this.duration);

  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      NotificationMessage.activeNotification = null;
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}

