import { PageIDs } from './types';
import Page from '../core/templates/page';
import AboutPage from '../pages/about/about';
import MainPage from '../pages/main/main.page';
import LoginPage from '../pages/login/login.page';
import ErrorPage from '../pages/error/error.page';

type RouteConfig = {
  path: string;
  component: new (id: string) => Page;
  title?: string;
};

export default class App {
  private container: HTMLElement;

  private routes: RouteConfig[] = [
    { path: PageIDs.MAIN_PAGE, component: MainPage, title: 'fun-chat | Chat' },
    { path: PageIDs.ABOUT_PAGE, component: AboutPage, title: 'fun-chat | About' },
    { path: PageIDs.LOGIN_PAGE, component: LoginPage, title: 'fun-chat | Login' },
  ];

  constructor() {
    this.container = document.body;
  }

  renderPage(pageId: string) {
    this.container.replaceChildren();

    const route = this.routes.find((route) => route.path === pageId);
    const page = route ? new route.component(pageId) : new ErrorPage('error-page');

    if (route?.title) {
      document.title = route.title;
    }

    this.container.append(page.render());
  }

  private enableRouteChange() {
    const handleRoute = () => {
      const hash = window.location.hash.slice(1);
      this.renderPage(hash || PageIDs.LOGIN_PAGE);
    };

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
  }

  run() {
    // this.renderPage('about-page');
    this.enableRouteChange();
  }
}
