import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';

export default class ErrorPage extends Page {
  constructor(id: string) {
    super(id);
  }

  render() {
    const message = dom.create({ tag: 'h2', text: '404: This page is not found!' });
    message.style.textAlign = 'center';
    this.container.append(message);
    return this.container;
  }
}
