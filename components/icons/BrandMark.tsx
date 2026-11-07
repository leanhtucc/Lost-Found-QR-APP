import * as React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
  type SvgProps,
} from 'react-native-svg';

interface BrandMarkProps extends SvgProps {
  /** Draw the navy rounded-square app tile behind the pin. */
  tile?: boolean;
}

/** Lost and Found QR brand mark: a location pin holding a QR glyph; amber = the found item. */
const BrandMark = ({ tile = false, ...props }: BrandMarkProps) => (
  <Svg viewBox="0 0 1024 1024" width={32} height={32} {...props}>
    <Defs>
      <LinearGradient id="bm_bg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#12315F" />
        <Stop offset="1" stopColor="#050B14" />
      </LinearGradient>
      <LinearGradient id="bm_pin" x1="0.15" y1="0" x2="0.85" y2="1">
        <Stop offset="0" stopColor="#9ADCFF" />
        <Stop offset="0.5" stopColor="#3AA9FF" />
        <Stop offset="1" stopColor="#1F6FD6" />
      </LinearGradient>
    </Defs>
    {tile ? <Rect width={1024} height={1024} rx={232} fill="url(#bm_bg)" /> : null}
    <Ellipse
      cx={512}
      cy={880}
      rx={190}
      ry={34}
      fill="none"
      stroke="#3AA9FF"
      strokeOpacity={0.55}
      strokeWidth={14}
    />
    <Ellipse
      cx={512}
      cy={880}
      rx={120}
      ry={20}
      fill="none"
      stroke="#8FD3FF"
      strokeOpacity={0.8}
      strokeWidth={12}
    />
    <Path
      d="M512 872 C428 780 258 650 258 440 A254 254 0 1 1 766 440 C766 650 596 780 512 872 Z"
      fill="url(#bm_pin)"
    />
    <Circle cx={512} cy={440} r={168} fill="#08111F" />
    <Rect x={418} y={346} width={82} height={82} rx={18} fill="#F1F6FF" />
    <Rect x={524} y={346} width={82} height={82} rx={18} fill="#F1F6FF" />
    <Rect x={418} y={452} width={82} height={82} rx={18} fill="#F1F6FF" />
    <Rect x={445} y={373} width={28} height={28} rx={8} fill="#08111F" />
    <Rect x={551} y={373} width={28} height={28} rx={8} fill="#08111F" />
    <Rect x={445} y={479} width={28} height={28} rx={8} fill="#08111F" />
    <Rect x={528} y={456} width={74} height={74} rx={20} fill="#FFB020" />
  </Svg>
);

export default BrandMark;
