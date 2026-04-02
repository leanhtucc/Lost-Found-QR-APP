import { TouchableOpacity } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Rect } from 'react-native-svg';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  style?: any;
}

const CustomSwitch = ({
  value,
  onValueChange,
  activeColor = '#34C759',
  inactiveColor = '#E5E5EA',
  style,
}: CustomSwitchProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onValueChange(!value)} style={style}>
      <Svg width={51} height={31} viewBox="0 0 51 31">
        <Defs>
          <ClipPath id="clip">
            <Rect width={51} height={31} rx={15.5} />
          </ClipPath>
        </Defs>
        <G clipPath="url(#clip)">
          <Rect width={51} height={31} rx={15.5} fill={value ? activeColor : inactiveColor} />
          <Circle cx={value ? 35 : 16} cy={15.5} r={13} fill="#FFFFFF" />
        </G>
      </Svg>
    </TouchableOpacity>
  );
};

export default CustomSwitch;
