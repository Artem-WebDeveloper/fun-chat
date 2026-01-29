import Page from '../../core/templates/page';

export default class AboutPage extends Page {
  constructor(id: string) {
    super(id);
  }

  render() {
    return this.container;
  }
}
