import dom from '../../templates/creator';
import rssIcon from '../icons/rss.icon';

import './footer.scss';

export default class Footer {
  content = {
    LINK_AUTHOR: 'https://github.com/Artem-WebDeveloper',
  };

  container: HTMLElement;
  authorLink: HTMLAnchorElement;

  constructor() {
    this.container = dom.create({ tag: 'footer', classNames: ['footer'] });
    this.authorLink = dom.create({
      tag: 'a',
      classNames: ['author-link'],
      text: 'Author ArtemWebdev',
    });
  }

  renderFooter() {
    const year = new Date().getFullYear();
    const yearElement = dom.create({ tag: 'p', classNames: ['footer__year'], text: String(year) });

    const logoElement = dom.create({ tag: 'div', classNames: ['footer__logo'] });
    const logo = rssIcon({ size: 40, color: '#000' });
    logoElement.append(logo, 'RSS School');

    this.authorLink.href = this.content.LINK_AUTHOR;
    this.authorLink.target = '_blank';
    this.container.append(logoElement, this.authorLink, yearElement);
  }

  render() {
    this.renderFooter();
    return this.container;
  }
}
