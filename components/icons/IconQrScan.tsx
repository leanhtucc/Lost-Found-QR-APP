import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgIconQrScan = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 25 25" {...props}>
    <Path
      fill="#F6F0FF"
      d="M0 6.25V0h6.25v2.5H2.5v3.75zM0 25v-6.25h2.5v3.75h3.75V25zm18.75 0v-2.5h3.75v-3.75H25V25zM22.5 6.25V2.5h-3.75V0H25v6.25zm-3.125 13.125h1.875v1.875h-1.875zm0-3.75h1.875V17.5h-1.875zM17.5 17.5h1.875v1.875H17.5zm-1.875 1.875H17.5v1.875h-1.875zM13.75 17.5h1.875v1.875H13.75zm3.75-3.75h1.875v1.875H17.5zm-1.875 1.875H17.5V17.5h-1.875zM13.75 13.75h1.875v1.875H13.75zm7.5-10v7.5h-7.5v-7.5zm-10 10v7.5h-7.5v-7.5zm0-10v7.5h-7.5v-7.5zM9.375 19.375v-3.75h-3.75v3.75zm0-10v-3.75h-3.75v3.75zm10 0v-3.75h-3.75v3.75z"
    />
  </Svg>
);
export default SvgIconQrScan;
