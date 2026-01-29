import dom from '../../templates/creator';

export default class Header {
  container: HTMLElement;

  constructor() {
    this.container = dom.create({ tag: 'header', classNames: ['header'] });
  }

  render() {
    return this.container;
  }
}
