import Header from '../../core/components/header/header';
import Footer from '../../core/components/footer/footer';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';

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
  }

  render() {
    this.container.append(this.header.render(), this.main, this.sidebar, this.footer.render());
    return this.container;
  }
}
