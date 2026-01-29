import dom from './creator';

export default abstract class Page {
  protected container: HTMLElement;

  constructor(id: string) {
    this.container = dom.create({ tag: 'div', id: id });
  }

  render() {
    return this.container;
  }
}
