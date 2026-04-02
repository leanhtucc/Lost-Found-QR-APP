import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgWifi = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 48 48" {...props}>
    <Path fill="#fff" fillOpacity={0.01} d="M0 0h48v48H0z" />
    <Path
      stroke="#ff7b23"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M44 18.965c-6.775-6.42-15.881-8.96-24.5-7.617M38 25.799a19.7 19.7 0 0 0-9.5-5.284M10 25.799a19.8 19.8 0 0 1 4.36-3.299M16 32.314a11.26 11.26 0 0 1 5-2.911"
    />
    <Path
      fill="#ff7b23"
      fillRule="evenodd"
      d="M24 40a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
      clipRule="evenodd"
    />
    <Path
      stroke="#ff7b23"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M40 40 8 8M4 18.965a29 29 0 0 1 3.5-2.84"
    />
  </Svg>
);
export default SvgWifi;
