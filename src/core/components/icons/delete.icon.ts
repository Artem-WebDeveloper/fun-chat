import dom from '../../templates/creator';
import type { IconOptions } from '../../../app/types';

export default function deleteIcon({ size = 24, className = '', color = '' }: IconOptions = {}) {
  const wrapper = dom.create({ tag: 'div' });

  if (className) {
    wrapper.className = className;
  }

  wrapper.innerHTML = `
    <svg
      width="${size}"
      height="${size}"
      viewBox="5 5 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 8L8 16M8 8L16 16"
        stroke="${color || 'currentColor'}"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;

  return wrapper;
}
