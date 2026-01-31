import ButtonAbout from '../../core/components/button-about/button-about';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';

import './login.page.scss';

export default class LoginPage extends Page {
  form: HTMLFormElement;
  loginInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
  btnSubmit: HTMLButtonElement;

  constructor(id: string) {
    super(id);
    this.form = dom.create({ tag: 'form', classNames: ['login-form'] });
    this.loginInput = dom.create({ tag: 'input', classNames: ['login-form__login'] });
    this.passwordInput = dom.create({
      tag: 'input',
      classNames: ['login-form__password'],
      type: 'password',
    });
    this.btnSubmit = dom.create({ tag: 'button', classNames: ['login-form__btn'], text: 'login' });
  }

  private renderLoginForm() {
    const title = dom.create({
      tag: 'h2',
      classNames: ['login-form__title'],
      text: 'Member Login',
    });

    const btnAbout = ButtonAbout('login');

    this.loginInput.placeholder = 'username';
    this.passwordInput.placeholder = 'password';
    this.form.append(title, this.loginInput, this.passwordInput, this.btnSubmit, btnAbout);
    this.container.append(this.form);
  }

  render() {
    this.renderLoginForm();
    return this.container;
  }
}
