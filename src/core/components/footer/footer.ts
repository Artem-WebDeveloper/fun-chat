import dom from '../../templates/creator';

export default class Footer {
  container: HTMLElement;

  constructor() {
    this.container = dom.create({ tag: 'footer', classNames: ['footer'] });
  }

  render() {
    return this.container;
  }
}
