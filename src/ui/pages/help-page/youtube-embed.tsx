import {ShadowHost} from '@alorel/preact-shadow-root';
import type {VNode} from 'preact';
import makeConstructableCss from '../../util/make-constructable-css.mjs';

const sheet = makeConstructableCss(`:host{position:relative;padding-bottom:56.25%;padding-top:30px;height:0;overflow:hidden;text-align:center}
iframe{border:0;position:absolute;top:0;left:0;width:100%;height:100%}`);

interface Props {
  vidId: string;
}
export default function YoutubeEmbed({vidId}: Props): VNode {
  return (
    <div>
      <ShadowHost adoptedStyleSheets={sheet}>
        <iframe src={`https://www.youtube.com/embed/${vidId}`}
          title={'YouTube'}
          allow={'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'}
          allowFullScreen={true}
          frameBorder={0}/>
        <div>
          <span class={'mr-1'}>Video not loading?</span>
          <a href={`https://youtu.be/${vidId}`} target={'_blank'}>Watch in browser</a>
        </div>
      </ShadowHost>
    </div>
  );
}
