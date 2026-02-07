import Header from '../../core/components/header/header';
import Footer from '../../core/components/footer/footer';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';
import chatSocket from '../../core/services/socket.services';

import './main.page.scss';
import type { Message, StatusMessage, User } from '../../app/types';
import formatDate from '../../core/utils/formatDate';
import getStatusMessage from '../../core/utils/getStatusMessage';
import deleteIcon from '../../core/components/icons/delete.icon';
import editIcon from '../../core/components/icons/edit.icon';

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

    this.inputField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.form.requestSubmit();
      }
    });

    chatSocket.updateUsers = (otherUsers: Record<string, User>) => {
      this.renderSidebar(otherUsers);
    };

    chatSocket.updateStatusDialogUser = (isLogined: boolean) => {
      this.updateSelectedUser(isLogined);
    };

    chatSocket.onMessage = (message: Message) => {
      this.displaySendingMessage(message);
      if (message.from !== chatSocket.curUser) {
        chatSocket.sendReadStatus();
      }
    };

    chatSocket.onHistory = () => {
      this.renderMain();
    };

    chatSocket.onMessageStatus = (id: string, status: StatusMessage) => {
      const statusMessages = this.main.querySelectorAll(`.chat__message[data-message-id="${id}"]`);
      console.log(statusMessages, status);
      statusMessages.forEach((message) => {
        const statusElement = message.querySelector('.chat__message-status');
        if (statusElement instanceof HTMLElement) {
          statusElement.textContent = getStatusMessage(status, true);
        }
      });
    };

    chatSocket.onDeleteMessage = (id: string) => {
      const message = this.main.querySelector(`.chat__message[data-message-id="${id}"]`);
      if (message && message instanceof HTMLElement) message.remove();
    };

    this.form.addEventListener('submit', this.submitForm);

    this.sidebar.addEventListener('click', this.selectDialog);

    //TODO добавить событий кроме клика, которые будут тригерить изменения статуса
    this.main.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const deleteButton = target.closest('.chat__message-delete');
      if (deleteButton) {
        const message = deleteButton.closest('.chat__message');
        const id = message?.getAttribute('data-message-id');
        if (id && message) {
          chatSocket.deleteMessage(id);
        }
        event.stopPropagation();
        return;
      }

      const editButton = target.closest('.chat__message-edit');
      if (editButton) {
        console.log('edit!');
        event.stopPropagation();
        return;
      }

      if (!target.closest('.main')) return;
      const separator = document.querySelector('.chat__separator');
      if (separator) separator.remove();

      chatSocket.sendReadStatus();
    });
  }

  renderSidebar(otherUsers: Record<string, User>) {
    this.sidebar.replaceChildren();
    const usersList = dom.create({ tag: 'ul', classNames: ['users__list'] });
    const users = Object.keys(otherUsers);

    users.forEach((user) => {
      const { login, isLogined, unreadCount } = otherUsers[user];
      const userElement = this.createUser(login, isLogined, unreadCount);
      usersList.append(userElement);
    });

    this.sidebar.append(usersList);
  }

  createUser(login: string, isLogined: boolean, unreadCount?: number) {
    const user = dom.create({ tag: 'div', classNames: ['users__item'] });
    user.dataset.user = login;
    if (chatSocket.selectedUser === login) user.classList.add('users__item--active');

    const userName = dom.create({ tag: 'p', classNames: ['users__name'], text: login });
    const userStatus = dom.create({ tag: 'div', classNames: ['users__status'] });
    const messages = dom.create({ tag: 'p', classNames: ['users__messages'] });

    userStatus.style.backgroundColor = isLogined ? 'green' : 'red';
    user.append(userStatus, userName);

    if (unreadCount) {
      messages.textContent = String(unreadCount);
      user.append(messages);
    }

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

      const chat = dom.create({ tag: 'div', classNames: ['chat'] });
      const messages = chatSocket.messages[chatSocket.selectedUser];

      console.log(chatSocket.selectedUser);

      if (!messages || messages.length === 0) {
        const welcome = dom.create({ tag: 'p', text: 'Write your first message!' });
        welcome.classList.add('chat__info');
        chat.append(welcome);
      } else {
        const firstUnreadIndex = messages.findIndex((message) => {
          return !message.status.isReaded && message.from !== chatSocket.curUser;
        });

        messages.forEach((message, i) => {
          if (i === firstUnreadIndex) {
            const separator = dom.create({ tag: 'div', classNames: ['chat__separator'] });
            separator.textContent = 'New Messages';
            chat.append(separator);
          }

          const messageElement = this.createMessage(message);
          chat.append(messageElement);
        });
      }

      this.inputField.placeholder = 'Write a message...';
      this.inputField.name = 'dialog-input';
      this.form.append(this.inputField, this.btnSend);
      this.main.append(header, chat, this.form);
    } else {
      const hint = dom.create({ tag: 'p', text: 'Select a user to send the message...' });
      hint.classList.add('main__info');
      this.main.append(hint);
    }
  }

  createMessage(message: Message) {
    const { id, from, text, datetime, status } = message;
    const isMine = from === chatSocket.curUser;

    const wrap = dom.create({ tag: 'div', classNames: ['chat__message'] });
    wrap.dataset.messageId = id;
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

    const deleteElement = deleteIcon({ size: 14 });
    deleteElement.className = 'chat__message-delete';
    const editElement = editIcon({ size: 15 });
    editElement.className = 'chat__message-edit';

    const header = dom.create({ tag: 'div', classNames: ['chat__message-header'] });
    const footer = dom.create({ tag: 'div', classNames: ['chat__message-footer'] });
    header.append(fromName, dateElement);
    footer.append(statusElement);
    if (isMine) footer.prepend(deleteElement, editElement);

    wrap.append(header, content, footer);

    return wrap;
  }

  submitForm = (event: Event) => {
    event.preventDefault();
    if (!(event.target instanceof HTMLFormElement)) return;

    const formData = new FormData(event.target);
    const input = String(formData.get('dialog-input'));

    if (this.inputField.value === '') {
      this.inputField.focus();
      return;
    }

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

    setTimeout(() => {
      const separator = document.querySelector('.chat__separator');
      if (separator) this.scrollToUnreadMessage();
      else this.scrollToBottom();
    }, 5);
  };

  updateSelectedUser(isLogined: boolean) {
    const status = this.main.querySelector('.main__companion-status');
    console.log(status);
    if (!status) return;
    status.textContent = isLogined ? 'online' : 'offline';
    status.classList.toggle('online', isLogined);
    status.classList.toggle('offline', !isLogined);
  }

  displaySendingMessage(message: Message) {
    const chat = this.main.querySelector('.chat');
    if (!chat) return;

    const welcomeElement = document.querySelector('.chat__info');
    if (welcomeElement) {
      welcomeElement.remove();
    }

    const messageElement = this.createMessage(message);
    chat.append(messageElement);
    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: 'smooth',
    });
  }

  scrollToUnreadMessage() {
    const chat = document.querySelector('.chat');
    const separator = document.querySelector('.chat__separator');
    if (!(chat instanceof HTMLElement) || !(separator instanceof HTMLElement)) return;
    const topPadding = 20;

    const to = separator.offsetTop - chat.offsetTop - topPadding;
    chat.scrollTo({
      top: to,
      behavior: 'smooth',
    });
  }

  scrollToBottom() {
    const chat = document.querySelector('.chat');
    if (!(chat instanceof HTMLElement)) return;

    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: 'smooth',
    });
  }

  render() {
    this.renderSidebar(chatSocket.otherUsers);
    this.renderMain();
    this.container.append(this.header.render(), this.main, this.sidebar, this.footer.render());
    return this.container;
  }
}
