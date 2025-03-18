import { ReactNode } from 'react';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

// Base Component Props
export interface BaseComponentProps {
  style?: ViewStyle;
  children?: ReactNode;
  testID?: string;
}

// Button Component Props
export interface ButtonProps extends BaseComponentProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  textStyle?: TextStyle;
}

// Input Component Props
export interface InputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  textContentType?: string;
  textStyle?: TextStyle;
}

// Card Component Props
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  onPress?: () => void;
  elevation?: number;
  borderRadius?: number;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// List Item Component Props
export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// Modal Component Props
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  statusBarTranslucent?: boolean;
  contentStyle?: ViewStyle;
}

// Image Component Props
export interface ImageProps extends BaseComponentProps {
  source: string | number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  width?: number;
  height?: number;
  borderRadius?: number;
  imageStyle?: ImageStyle;
}

// Badge Component Props
export interface BadgeProps extends BaseComponentProps {
  value: number | string;
  max?: number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  textStyle?: TextStyle;
}

// Avatar Component Props
export interface AvatarProps extends BaseComponentProps {
  source?: string | number;
  size?: number;
  name?: string;
  initials?: string;
  color?: string;
  textStyle?: TextStyle;
}

// Progress Bar Component Props
export interface ProgressBarProps extends BaseComponentProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
}

// Switch Component Props
export interface SwitchProps extends BaseComponentProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
  disabled?: boolean;
}

// Checkbox Component Props
export interface CheckboxProps extends BaseComponentProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  color?: string;
  disabled?: boolean;
  labelStyle?: TextStyle;
}

// Radio Button Component Props
export interface RadioButtonProps extends BaseComponentProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
  color?: string;
  disabled?: boolean;
  labelStyle?: TextStyle;
}

// Slider Component Props
export interface SliderProps extends BaseComponentProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  disabled?: boolean;
}

// Toast Component Props
export interface ToastProps extends BaseComponentProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  onClose?: () => void;
  textStyle?: TextStyle;
}

// Loading Component Props
export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  textStyle?: TextStyle;
}

// Error Component Props
export interface ErrorProps extends BaseComponentProps {
  message: string;
  onRetry?: () => void;
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

// Empty State Component Props
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  message?: string;
  image?: string | number;
  buttonText?: string;
  onButtonPress?: () => void;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

// Search Bar Component Props
export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

// Tab Bar Component Props
export interface TabBarProps extends BaseComponentProps {
  tabs: Array<{
    label: string;
    value: string;
    icon?: ReactNode;
  }>;
  value: string;
  onChange: (value: string) => void;
  color?: string;
  indicatorColor?: string;
  labelStyle?: TextStyle;
  indicatorStyle?: ViewStyle;
}

// Accordion Component Props
export interface AccordionProps extends BaseComponentProps {
  sections: Array<{
    title: string;
    content: ReactNode;
  }>;
  expandedSection?: number;
  onChange: (index: number) => void;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
}

// Carousel Component Props
export interface CarouselProps extends BaseComponentProps {
  items: Array<{
    id: string;
    image: string;
    title?: string;
    subtitle?: string;
  }>;
  onItemPress?: (item: any) => void;
  autoPlay?: boolean;
  interval?: number;
  showPagination?: boolean;
  paginationColor?: string;
  paginationActiveColor?: string;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// Chart Component Props
export interface ChartProps extends BaseComponentProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  width?: number;
  showLegend?: boolean;
  legendStyle?: TextStyle;
  axisStyle?: TextStyle;
  gridStyle?: ViewStyle;
}

// Calendar Component Props
export interface CalendarProps extends BaseComponentProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  markedDates?: Record<string, {
    marked?: boolean;
    dotColor?: string;
    textColor?: string;
  }>;
  theme?: {
    calendarBackground?: string;
    textSectionTitleColor?: string;
    selectedDayBackgroundColor?: string;
    selectedDayTextColor?: string;
    todayTextColor?: string;
    dayTextColor?: string;
    textDisabledColor?: string;
    dotColor?: string;
    monthTextColor?: string;
  };
}

// Rating Component Props
export interface RatingProps extends BaseComponentProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: number;
  color?: string;
  disabled?: boolean;
}

// Tag Component Props
export interface TagProps extends BaseComponentProps {
  label: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  textStyle?: TextStyle;
}

// Tooltip Component Props
export interface TooltipProps extends BaseComponentProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  backgroundColor?: string;
  textColor?: string;
  textStyle?: TextStyle;
}

// Skeleton Component Props
export interface SkeletonProps extends BaseComponentProps {
  width: number;
  height: number;
  borderRadius?: number;
  animation?: 'pulse' | 'wave' | 'none';
  backgroundColor?: string;
  highlightColor?: string;
}

// Divider Component Props
export interface DividerProps extends BaseComponentProps {
  color?: string;
  thickness?: number;
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

// Icon Component Props
export interface IconProps extends BaseComponentProps {
  name: string;
  size?: number;
  color?: string;
  type?: 'material' | 'ionicon' | 'font-awesome';
  onPress?: () => void;
}

// Text Component Props
export interface TextProps extends BaseComponentProps {
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  textStyle?: TextStyle;
}

// Container Component Props
export interface ContainerProps extends BaseComponentProps {
  fluid?: boolean;
  padding?: number | string;
  margin?: number | string;
  backgroundColor?: string;
  borderRadius?: number;
  elevation?: number;
  flex?: number;
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  wrap?: 'wrap' | 'nowrap';
}

// Grid Component Props
export interface GridProps extends BaseComponentProps {
  columns: number;
  spacing?: number;
  padding?: number;
  children: ReactNode;
}

// Grid Item Component Props
export interface GridItemProps extends BaseComponentProps {
  span?: number;
  offset?: number;
  children: ReactNode;
}

// Form Component Props
export interface FormProps extends BaseComponentProps {
  onSubmit: (values: any) => void;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  children: ReactNode;
}

// Form Field Component Props
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  rules?: Array<{
    required?: boolean;
    message?: string;
    validator?: (value: any) => boolean | Promise<boolean>;
  }>;
  children: ReactNode;
}

// Form Error Component Props
export interface FormErrorProps extends BaseComponentProps {
  name: string;
  textStyle?: TextStyle;
}

// Form Submit Button Component Props
export interface FormSubmitButtonProps extends ButtonProps {
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

// Form Reset Button Component Props
export interface FormResetButtonProps extends ButtonProps {
  confirmText?: string;
  cancelText?: string;
} 