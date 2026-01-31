type ElementParameters<T extends keyof HTMLElementTagNameMap> = {
  tag: T;
  id?: string;
  classNames?: string[];
  text?: string;
  type?: string;
};

class Creator {
  create<T extends keyof HTMLElementTagNameMap>(params: ElementParameters<T>) {
    const elem = document.createElement(params.tag);

    if (params.id) elem.id = params.id;
    if (params.classNames) elem.classList.add(...params.classNames);
    if (params.text) elem.textContent = params.text;
    if (elem instanceof HTMLInputElement && params.type) elem.type = params.type;

    return elem;
  }
}

const dom = new Creator();
export default dom;
