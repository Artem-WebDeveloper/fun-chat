type ElementParameters<T extends keyof HTMLElementTagNameMap> = {
  tag: T;
  id?: string;
  classNames?: string[];
  text?: string;
};

class Creator {
  create<T extends keyof HTMLElementTagNameMap>(params: ElementParameters<T>) {
    const elem = document.createElement(params.tag);

    if (params.id) elem.id = params.id;
    if (params.classNames) elem.classList.add(...params.classNames);
    if (params.text) elem.textContent = params.text;

    return elem;
  }
}

const dom = new Creator();
export default dom;
