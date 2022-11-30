import {AdoptedStylesheets, ShadowHost} from '@alorel/preact-shadow-root';
import {staticComponent} from '@alorel/preact-static-component';
import type {VNode} from 'preact';
import type {FunctionComponent} from 'preact/compat';
import type {JSXInternal} from 'preact/src/jsx';
import makeConstructableCss from '../util/make-constructable-css.mjs';

type SvgProps = Omit<BaseProps, 'viewBox' | 'children'>;

type ChevronProps = Omit<SvgProps, 'd'>;

interface ChevronBaseProps extends ChevronProps {
  chevRotate?: number;
}

const ChevronBase: FunctionComponent<ChevronBaseProps> = ({chevRotate, style, ...rest}) => (
  <BaseSvg
    fill={'#f8f9fa'}
    viewBox={'0 0 24 24'}
    style={chevRotate ? {transform: `rotate(${chevRotate}deg)`, ...style} : style}
    {...rest}>
    <path
      d={'M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'}
      opacity={'.1'}/>
    <path
      d={'M9.46967 16.4697C9.17678 16.7626 9.17678 17.2374 9.46967 17.5303C9.76256 17.8232 10.2374 17.8232 10.5303 17.5303L9.46967 16.4697ZM15 12L15.5303 12.5303C15.8232 12.2374 15.8232 11.7626 15.5303 11.4697L15 12ZM10.5303 6.46967C10.2374 6.17678 9.76256 6.17678 9.46967 6.46967C9.17678 6.76256 9.17678 7.23744 9.46967 7.53033L10.5303 6.46967ZM10.5303 17.5303L15.5303 12.5303L14.4697 11.4697L9.46967 16.4697L10.5303 17.5303ZM15.5303 11.4697L10.5303 6.46967L9.46967 7.53033L14.4697 12.5303L15.5303 11.4697ZM20.25 12C20.25 16.5563 16.5563 20.25 12 20.25V21.75C17.3848 21.75 21.75 17.3848 21.75 12H20.25ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75V2.25C6.61522 2.25 2.25 6.61522 2.25 12H3.75ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75Z'}/>
  </BaseSvg>
);

export const ChevronRightSvg = staticComponent<ChevronProps>(ChevronBase);
ChevronRightSvg.displayName = 'ChevronRightSvg';

export const ChevronDownSvg = staticComponent<ChevronProps>(props => (<ChevronBase chevRotate={90} {...props}/>));
ChevronDownSvg.displayName = 'ChevronDownSvg';

export const ChevronLeftSvg = staticComponent<ChevronProps>(props => (<ChevronBase chevRotate={180} {...props}/>));
ChevronLeftSvg.displayName = 'ChevronLeftSvg';

export const ChevronUpSvg = staticComponent<ChevronProps>(props => (<ChevronBase chevRotate={270} {...props}/>));
ChevronUpSvg.displayName = 'ChevronUpSvg';

type NoSpaceProps = Omit<SvgProps, 'xmlSpace'>;
export const BinSvg = staticComponent<NoSpaceProps>(props => (
  <BaseSvg xmlSpace={'preserve'} viewBox={'0 0 512 512'} {...props}>
    <path fill={'#6c994e'}
      d={'M314.412,113.127H197.588c-10.886,0-19.711-8.825-19.711-19.711v-38.72\tC177.877,24.536,202.413,0,232.573,0h46.854c30.159,0,54.697,24.536,54.697,54.695v38.719\tC334.123,104.302,325.298,113.127,314.412,113.127z M217.299,73.705h77.401V54.695c0-8.422-6.852-15.273-15.274-15.273h-46.854\tc-8.422,0-15.273,6.852-15.273,15.273L217.299,73.705L217.299,73.705z'}/>
    <path fill={'#7eb35b'}
      d={'M345.472,72.19H166.528c-31.038,0-56.198,25.16-56.198,56.198v22.857h291.341v-22.857\tC401.67,97.35,376.51,72.19,345.472,72.19z'}/>
    <path opacity={'.1'}
      d={'M211.582,72.19h-45.054c-31.038,0-56.198,25.16-56.198,56.198v22.857\th45.054v-22.857C155.384,97.35,180.544,72.19,211.582,72.19z'}/>
    <path fill={'#7eb35b'}
      d={'M97.295,160.597l28.644,313.576c1.958,21.425,19.924,37.826,41.438,37.826h177.244\tc21.514,0,39.482-16.401,41.438-37.826l28.644-313.576H97.295z'}/>
    <path opacity={'.1'}
      d={'M170.993,474.174l-28.644-313.576H97.295l28.644,313.576\tC127.897,495.599,145.863,512,167.377,512h45.054C190.917,512,172.949,495.599,170.993,474.174z'}/>
    <path fill={'#6c994e'}
      d={'M401.67,119.558H110.33c-20.567,0-37.239,16.672-37.239,37.239v26.133h365.818v-26.133\tC438.909,136.23,422.237,119.558,401.67,119.558z'}/>
    <path opacity={'.1'}
      d={'M155.384,119.558H110.33c-20.567,0-37.239,16.672-37.239,37.239v26.133\th45.054v-26.133C118.145,136.23,134.817,119.558,155.384,119.558z'}/>
  </BaseSvg>
));
BinSvg.displayName = 'BinSvg';

export const TargetSvg = staticComponent<NoSpaceProps>(props => (
  <BaseSvg xmlSpace={'preserve'} viewBox={'0 0 512 512'} {...props}>
    <path fill={'#bfe4f8'}
      d={'M256,42.667C138.368,42.667,42.667,138.368,42.667,256S138.368,469.333,256,469.333\tS469.333,373.632,469.333,256S373.632,42.667,256,42.667z M256,432.762c-97.467,0-176.762-79.295-176.762-176.762\tS158.533,79.238,256,79.238S432.762,158.533,432.762,256S353.467,432.762,256,432.762z'}/>
    <path fill={'#ff5023'} d={'M207 238H305V275H207z'}/>
    <path fill={'#802812'} d={'M256 238H305V275H256z'}/>
    <path fill={'#93c7ef'}
      d={'M256,42.667v36.571c97.467,0,176.762,79.295,176.762,176.762S353.467,432.762,256,432.762v36.571\tc117.632,0,213.333-95.701,213.333-213.333S373.632,42.667,256,42.667z'}/>
    <path fill={'#ff5023'} d={'M238 0H275V134H238zM0 238H134V275H0zM238 378H275V512H238z'}/>
    <path fill={'#802812'} d={'M256 0H274V134H256zM256 378H274V512H256zM378 238H512V275H378z'}/>
  </BaseSvg>
));
TargetSvg.displayName = 'TargetSvg';

export const PlaySvg = staticComponent<NoSpaceProps>(props => (
  <BaseSvg xmlSpace={'preserve'} viewBox={'0 0 58 58'} {...props}>
    <circle cx={29} cy={29} r={29} fill={'#30c78d'}/>
    <g fill={'#fff'}>
      <path d={'M44 29 22 44 22 29 22 14z'}/>
      <path
        d={'M22,45c-0.16,0-0.321-0.038-0.467-0.116C21.205,44.711,21,44.371,21,44V14 c0-0.371,0.205-0.711,0.533-0.884c0.328-0.174,0.724-0.15,1.031,0.058l22,15C44.836,28.36,45,28.669,45,29s-0.164,0.64-0.437,0.826 l-22,15C22.394,44.941,22.197,45,22,45z M23,15.893v26.215L42.225,29L23,15.893z'}/>
    </g>
  </BaseSvg>
));
PlaySvg.displayName = 'PlaySvg';

export const PauseSvg = staticComponent<NoSpaceProps>(props => (
  <BaseSvg xmlSpace={'preserve'} viewBox={'0 0 496 496'} {...props}>
    <path fill={'#e56767'}
      d={'M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.002,0,111.062,0,248.085\tc0,137.002,111.07,248.071,248.083,248.071C385.088,496.155,496.158,385.086,496.158,248.085z'}/>
    <path fill={'#fff'}
      d={'M223 121h-60c-6 0-10 4-10 10v234c0 6 4 10 10 10h60c6 0 10-4 10-10V131C233 126 229 121 223 121zM333 121h-60c-6 0-10 4-10 10v234c0 6 4 10 10 10h60c6 0 10-4 10-10V131C343 126 339 121 333 121z'}/>
  </BaseSvg>
));
PauseSvg.displayName = 'PauseSvg';

interface BaseProps extends Omit<JSXInternal.SVGAttributes<SVGSVGElement>, 'xmlns' | 'style' | 'className' | 'class'> {
  class?: string;

  style?: JSXInternal.CSSProperties;
}

const svgSheet = makeConstructableCss('svg{width:1rem;height:1rem}');
const BaseSvg: FunctionComponent<BaseProps> = ({class: className, ...props}: BaseProps): VNode => (
  <span class={className}>
    <ShadowHost adoptedStyleSheets={svgSheet}>
      <AdoptedStylesheets/>
      <svg xmlns={'http://www.w3.org/2000/svg'} {...props}/>
    </ShadowHost>
  </span>
);
