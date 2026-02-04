import Header from '../../core/components/header/header';
import Footer from '../../core/components/footer/footer';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';
import chatSocket from '../../core/services/socket.services';

import './main.page.scss';
import type { Message, User } from '../../app/types';
import formatDate from '../../core/utils/formatDate';
import getStatusMessage from '../../core/utils/getStatusMessage';

const user1 = {
  id: '220d350f-c1a1-4b5f-8d8c-3b9dc52a38eb_1770233935189',
  from: 'Artem',
  to: 'dvd1',
  text: 'Asfds',
  datetime: 1770233935189,
  status: {
    isDelivered: false,
    isReaded: false,
    isEdited: false,
  },
};

const user2 = {
  id: '220d350f-c1a1-4b5f-8d8c-3b9dc52a38eb_1770233935189',
  from: 'dvd1',
  to: 'Artem',
  text: 'Asfds',
  datetime: 1770233937189,
  status: {
    isDelivered: false,
    isReaded: false,
    isEdited: false,
  },
};

export default class MainPage extends Page {
  header: Header;
  footer: Footer;
  main: HTMLElement;
  sidebar: HTMLElement;
  form: HTMLFormElement;
  btnSend: HTMLButtonElement;
  inputField: HTMLTextAreaElement;

  constructor(id: string) {
    super(id);
    this.header = new Header();
    this.footer = new Footer();
    this.main = dom.create({ tag: 'main', classNames: ['main'] });
    this.sidebar = dom.create({ tag: 'aside', classNames: ['sidebar'] });

    this.form = dom.create({ tag: 'form', classNames: ['form-dialog'] });
    this.inputField = dom.create({ tag: 'textarea', classNames: ['form-dialog__input'] });
    this.btnSend = dom.create({
      tag: 'button',
      classNames: ['btn', 'form-dialog__btn'],
      text: '⮝',
    });

    chatSocket.updateUsers = (otherUsers: Record<string, User>) => {
      this.renderSidebar(otherUsers);
    };

    chatSocket.updateStatusDialogUser = (isLogined: boolean) => {
      this.updateSelectedUser(isLogined);
    };

    this.form.addEventListener('submit', this.submitForm);

    this.sidebar.addEventListener('click', this.selectDialog);
  }

  renderSidebar(otherUsers: Record<string, User>) {
    this.sidebar.replaceChildren();
    const usersList = dom.create({ tag: 'ul', classNames: ['users__list'] });
    const users = Object.keys(otherUsers);

    users.forEach((user) => {
      const { login, isLogined } = otherUsers[user];
      const userElement = this.createUser(login, isLogined);
      usersList.append(userElement);
    });

    this.sidebar.append(usersList);
  }

  createUser(login: string, isLogined: boolean) {
    const user = dom.create({ tag: 'div', classNames: ['users__item'] });
    user.dataset.user = login;
    if (chatSocket.selectedUser === login) user.classList.add('users__item--active');

    const userName = dom.create({ tag: 'p', classNames: ['users__name'], text: login });
    const userStatus = dom.create({ tag: 'div', classNames: ['users__status'] });
    const messages = dom.create({ tag: 'p', classNames: ['users__messages'], text: String(23) });

    userStatus.style.backgroundColor = isLogined ? 'green' : 'red';

    user.append(userStatus, userName, messages);
    return user;
  }

  renderMain() {
    this.main.replaceChildren();

    if (chatSocket.selectedUser) {
      const user = chatSocket.otherUsers[chatSocket.selectedUser];
      const header = dom.create({ tag: 'div', classNames: ['main__header'] });
      const name = dom.create({ tag: 'p', classNames: ['main__companion-name'], text: user.login });
      const status = dom.create({ tag: 'p', classNames: ['main__companion-status'] });
      status.classList.add(user.isLogined ? 'online' : 'offline');
      status.textContent = user.isLogined ? 'online' : 'offline';

      header.append(name, status);
      const content = dom.create({ tag: 'div', classNames: ['chat'] });
      const message = this.createMessage(user1);
      const message2 = this.createMessage(user2);

      content.append(message, message2);

      this.inputField.placeholder = 'Write a message...';
      this.inputField.name = 'dialog-input';
      this.form.append(this.inputField, this.btnSend);
      this.main.append(header, content, this.form);
    } else {
      const hint = dom.create({ tag: 'p', text: 'Select a user to send the message...' });
      hint.classList.add('main__info');
      this.main.append(hint);
    }
  }

  createMessage(message: Message) {
    const { from, text, datetime, status } = message;
    const isMine = from === chatSocket.curUser;

    const wrap = dom.create({ tag: 'div', classNames: ['chat__message'] });
    if (!isMine) wrap.classList.add('chat__message--companion');

    const date = formatDate(datetime);
    const dateElement = dom.create({ tag: 'p', classNames: ['chat__message-date'], text: date });
    const fromName = dom.create({
      tag: 'p',
      classNames: ['chat__message-from'],
      text: isMine ? 'You' : from,
    });
    const content = dom.create({ tag: 'p', classNames: ['chat__message-content'] });
    content.textContent = text;

    const statusElement = dom.create({
      tag: 'span',
      classNames: ['chat__message-status'],
      text: getStatusMessage(status, isMine),
    });

    if (status.isEdited) {
      statusElement.textContent += ' (edited)';
    }

    const header = dom.create({ tag: 'div', classNames: ['chat__message-header'] });
    header.append(fromName, dateElement);
    wrap.append(header, content, statusElement);

    return wrap;
  }

  submitForm = (event: Event) => {
    if (!(event.target instanceof HTMLFormElement)) return;
    event.preventDefault();

    const formData = new FormData(event.target);
    const input = String(formData.get('dialog-input'));

    chatSocket.sendMessage(input);
    this.inputField.value = '';
  };

  selectDialog = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const item = target.closest('.users__item');
    if (!(item instanceof HTMLElement)) return;

    document
      .querySelectorAll('.users__item')
      .forEach((elem) => elem.classList.remove('users__item--active'));

    item.classList.add('users__item--active');

    const user = item.dataset.user;
    if (!user) return;

    chatSocket.setSelectedUser(user);
    this.renderMain();
  };

  updateSelectedUser(isLogined: boolean) {
    const status = this.main.querySelector('.main__companion-status');
    console.log(status);
    if (!status) return;
    status.textContent = isLogined ? 'online' : 'offline';
    status.classList.toggle('online', isLogined);
    status.classList.toggle('offline', !isLogined);
  }

  render() {
    this.renderSidebar(chatSocket.otherUsers);
    this.renderMain();
    this.container.append(this.header.render(), this.main, this.sidebar, this.footer.render());
    return this.container;
  }
}
