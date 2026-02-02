import { PageIDs } from '../../app/types';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';

import './about.page.scss';

export default class AboutPage extends Page {
  content = {
    DESCRIP_APP:
      'The app was developed to demonstrate the Fun Chat assignment as part of the RSSchool JS/FE 2025Q3 course.',
    DESCRIP_WORK: 'Users and messages are deleted once per day.',
    TITLE: 'Fun Chat',
    LINK_AUTHOR: 'https://github.com/Artem-WebDeveloper',
  };

  authorLink: HTMLAnchorElement;
  btnGoBack: HTMLAnchorElement;

  constructor(id: string) {
    super(id);
    this.btnGoBack = dom.create({ tag: 'a', classNames: ['btn', 'btn__link'], text: 'Go back' });
    this.authorLink = dom.create({
      tag: 'a',
      classNames: ['author-link'],
      text: 'Author ArtemWebdev',
    });
  }

  renderAbout() {
    const box = dom.create({ tag: 'div', classNames: ['about'] });
    const title = dom.create({ tag: 'h3', classNames: ['about__title'], text: this.content.TITLE });
    box.append(title);

    [this.content.DESCRIP_APP, this.content.DESCRIP_WORK].forEach((text) => {
      const p = dom.create({ tag: 'p', text: text });
      box.append(p);
    });

    this.authorLink.href = this.content.LINK_AUTHOR;
    this.btnGoBack.href = `#${PageIDs.LOGIN_PAGE}`;
    box.append(this.authorLink, this.btnGoBack);

    this.container.append(box);
  }

  render() {
    this.renderAbout();
    return this.container;
  }
}
