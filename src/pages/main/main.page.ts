import Header from '../../core/components/header/header';
import Footer from '../../core/components/footer/footer';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';
import chatSocket from '../../core/services/socket.services';

import './main.page.scss';
import type { User } from '../../app/types';

export default class MainPage extends Page {
  header: Header;
  footer: Footer;
  main: HTMLElement;
  sidebar: HTMLElement;

  constructor(id: string) {
    super(id);
    this.header = new Header();
    this.footer = new Footer();
    this.main = dom.create({ tag: 'main', classNames: ['main'] });
    this.sidebar = dom.create({ tag: 'aside', classNames: ['sidebar'] });

    chatSocket.updateUsers = (otherUsers: Record<string, User>) => {
      this.renderSidebar(otherUsers);
    };
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
    const userName = dom.create({ tag: 'p', classNames: ['users__name'], text: login });
    const userStatus = dom.create({ tag: 'div', classNames: ['users__status'] });
    const messages = dom.create({ tag: 'p', classNames: ['users__messages'], text: String(23) });

    userStatus.style.backgroundColor = isLogined ? 'green' : 'red';

    user.append(userStatus, userName, messages);
    return user;
  }

  render() {
    this.renderSidebar(chatSocket.otherUsers);
    this.container.append(this.header.render(), this.main, this.sidebar, this.footer.render());
    return this.container;
  }
}
