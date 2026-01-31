import { PageIDs } from '../../../app/types';
import dom from '../../templates/creator';

import './button-about.scss';

export default function ButtonAbout(type: 'login' | 'main') {
  const btnAbout = dom.create({
    tag: 'a',
    classNames: ['btn-about', `btn-about--${type === 'login' ? 'login' : 'main'}`],
  });

  btnAbout.href = `#${PageIDs.ABOUT_PAGE}`;

  const icon = dom.create({ tag: 'span', classNames: ['btn-about__icon'], text: 'ℹ' });
  const text = dom.create({ tag: 'span', classNames: ['btn-about__text'], text: 'About' });

  btnAbout.append(icon, text);

  return btnAbout;
}
