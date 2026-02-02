import ButtonAbout from '../../core/components/button-about/button-about';
import chatSocket from '../../core/services/socket.services';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';

import './login.page.scss';

export default class LoginPage extends Page {
  DEL_MODAL_ERROR_SEC = 2000;

  form: HTMLFormElement;
  loginInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
  btnSubmit: HTMLButtonElement;
  passwordError: HTMLSpanElement;
  loginError: HTMLSpanElement;

  error: string = '';
  loginIsValid = false;
  passwordIsValid = false;

  constructor(id: string) {
    super(id);
    this.form = dom.create({ tag: 'form', classNames: ['login-form'] });
    this.loginInput = dom.create({ tag: 'input', classNames: ['login-form__login'] });
    this.passwordInput = dom.create({
      tag: 'input',
      classNames: ['login-form__password'],
      type: 'password',
    });

    this.loginError = dom.create({ tag: 'span', classNames: ['login-form__error'] });
    this.passwordError = dom.create({ tag: 'span', classNames: ['login-form__error'] });

    this.btnSubmit = dom.create({ tag: 'button', classNames: ['login-form__btn'], text: 'login' });

    ['input', 'focus'].forEach((event) =>
      this.loginInput.addEventListener(event, this.validateName),
    );

    ['input', 'focus'].forEach((event) =>
      this.passwordInput.addEventListener(event, this.validatePassword),
    );

    this.form.addEventListener('submit', this.submitForm);

    chatSocket.onServerError = (message: string) => {
      this.showServerError(message);
    };
  }

  private renderLoginForm() {
    const title = dom.create({
      tag: 'h2',
      classNames: ['login-form__title'],
      text: 'Member Login',
    });

    const loginWrap = dom.create({ tag: 'div', classNames: ['login-form__login--wrap'] });
    const passwordWrap = dom.create({ tag: 'div', classNames: ['login-form__password--wrap'] });

    loginWrap.append(this.loginInput, this.loginError);
    passwordWrap.append(this.passwordInput, this.passwordError);

    const btnAbout = ButtonAbout('login');

    [this.loginInput, this.passwordInput].forEach((input) => {
      input.required = true;
      input.placeholder = ' ';
      input.autocomplete = 'off';
    });

    this.form.autocomplete = 'off';
    this.form.noValidate = true;

    this.loginInput.placeholder = 'username';
    this.loginInput.name = 'login-input';

    this.passwordInput.name = 'password-input';
    this.passwordInput.placeholder = 'password';

    this.form.append(title, loginWrap, passwordWrap, this.btnSubmit, btnAbout);
    this.container.append(this.form);
  }

  validateName = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (!target.value) {
      this.hideValidateError(this.loginError);
      this.loginIsValid = false;
      return;
    }

    if (target.value.length < 4) {
      this.showValidateError(this.loginError, 'Minimum 4 characters');
      this.loginIsValid = false;
      return;
    }

    if (target.value.length > 12) {
      this.showValidateError(this.loginError, 'Maximum 12 characters');
      this.loginIsValid = false;
      return;
    }

    this.loginIsValid = true;
    this.hideValidateError(this.loginError);
  };

  validatePassword = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const hasUppercase = /\p{Lu}/u.test(target.value);
    const hasLowercase = /\p{Ll}/u.test(target.value);
    const hasMinLength = target.value.length >= 6;

    if (!target.value) {
      this.hideValidateError(this.passwordError);
      this.passwordIsValid = false;
      return;
    }

    if (!hasUppercase || !hasLowercase) {
      this.showValidateError(this.passwordError, 'Use uppercase and lowercase letters');
      this.passwordIsValid = false;
      return;
    }

    if (!hasMinLength) {
      this.showValidateError(this.passwordError, 'Minimum 6 characters');
      this.passwordIsValid = false;
      return;
    }

    this.passwordIsValid = true;
    this.hideValidateError(this.passwordError);
  };

  submitForm = (event: Event) => {
    if (!(event.target instanceof HTMLFormElement)) return;
    event.preventDefault();

    if (!this.loginIsValid) {
      this.loginInput.focus();
      return;
    } else if (!this.passwordIsValid) {
      this.passwordInput.focus();
      return;
    }

    const formData = new FormData(event.target);
    const login = String(formData.get('login-input'));
    const password = String(formData.get('password-input'));

    // Register USER
    chatSocket.loginUser({ login, password });
  };

  showValidateError(elem: HTMLElement, message: string) {
    elem.textContent = message;
    elem.classList.add('login-form__error--visible');
  }

  hideValidateError(elemError: HTMLElement) {
    elemError.textContent = '';
    elemError.classList.remove('login-form__error--visible');
  }

  render() {
    this.renderLoginForm();
    return this.container;
  }
}
