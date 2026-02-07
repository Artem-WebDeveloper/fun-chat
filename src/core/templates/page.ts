import dom from './creator';

export default abstract class Page {
  DEL_MODAL_ERROR_SEC = 2000;

  protected container: HTMLElement;

  constructor(id: string) {
    this.container = dom.create({ tag: 'div', id: id });
  }

  showServerError(message: string, isErrorSolved?: boolean) {
    message = `⚠️ ${message[0].toUpperCase()}${message.slice(1)}`;

    if (this.container.querySelector('.server-error__modal')) return;

    const modal = dom.create({ tag: 'div', classNames: ['server-error__modal'] });
    if (isErrorSolved) {
      modal.classList.add('server-error__modal--resolved');
    }
    modal.innerHTML = message;

    this.container.append(modal);
    setTimeout(() => {
      modal.remove();
    }, this.DEL_MODAL_ERROR_SEC);
  }

  render() {
    return this.container;
  }
}
