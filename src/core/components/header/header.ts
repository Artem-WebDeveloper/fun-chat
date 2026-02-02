import chatSocket from '../../services/socket.services';
import dom from '../../templates/creator';
import ButtonAbout from '../button-about/button-about';
import logoutIcon from '../icons/logout.icon';
import userIcon from '../icons/user.icon';

import './header.scss';

export default class Header {
  content = {
    TITLE: 'Fun Chat',
  };

  container: HTMLElement;
  btnLogout: HTMLButtonElement;

  constructor() {
    this.container = dom.create({ tag: 'header', classNames: ['header'] });
    this.btnLogout = dom.create({
      tag: 'button',
      classNames: ['btn', 'header__btn'],
      text: 'Logout',
    });

    this.btnLogout.addEventListener('click', () => chatSocket.logoutUser());
  }

  renderHeader() {
    const titleApp = dom.create({
      tag: 'h3',
      classNames: ['header__title'],
      text: this.content.TITLE,
    });
    const nameUser = dom.create({ tag: 'p', classNames: ['header__user'] });

    const iconUser = userIcon({ size: 30, color: '#fff' });
    nameUser.append(iconUser);
    nameUser.innerHTML += `<span>${chatSocket.curUser}<span/>`;

    const iconLogout = logoutIcon({ size: 26, color: '#fff' });
    this.btnLogout.append(iconLogout);

    const btnAbout = ButtonAbout('main');
    this.container.append(nameUser, titleApp, this.btnLogout, btnAbout);
  }

  render() {
    this.renderHeader();
    return this.container;
  }
}
