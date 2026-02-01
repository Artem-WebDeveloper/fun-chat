import dom from '../../templates/creator';

import './header.scss';

export default class Header {
  container: HTMLElement;

  constructor() {
    this.container = dom.create({ tag: 'header', classNames: ['header'] });
  }

  render() {
    return this.container;
  }
}
