/**
 * SegmentedControl.tsx
 * 
 * A custom segmented control component that allows users to switch between
 * different options with an animated selection indicator.
 */

import React from 'react';
import {
    Animated,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ViewStyle,
} from 'react-native';

interface SegmentedControlProps {
  tabs: string[];
  currentIndex: number;
  onChange: (index: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  activeTextColor?: string;
  inactiveTextColor?: string;
  segmentBackgroundColor?: string;
  activeSegmentBackgroundColor?: string;
  paddingVertical?: number;
}

export default function SegmentedControl({
  tabs,
  currentIndex,
  onChange,
  containerStyle,
  activeTextColor = '#34C759',
  inactiveTextColor = '#757575',
  segmentBackgroundColor = '#F0F0F0',
  activeSegmentBackgroundColor = '#FFFFFF',
  paddingVertical = 4,
}: SegmentedControlProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [segmentWidths, setSegmentWidths] = React.useState<number[]>([]);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(0)).current;
  const selectedWidth = React.useRef(new Animated.Value(0)).current;
  
  // Handle container layout
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };
  
  // Handle segment layout and width
  const handleSegmentLayout = (event: LayoutChangeEvent, index: number) => {
    const { width } = event.nativeEvent.layout;
    const newWidths = [...segmentWidths];
    newWidths[index] = width;
    
    if (newWidths.filter(Boolean).length === tabs.length) {
      setSegmentWidths(newWidths);
    }
  };
  
  // Animate when currentIndex changes
  React.useEffect(() => {
    if (segmentWidths.length === 0 || !containerWidth) return;
    
    const getOffset = () => {
      let offset = 0;
      for (let i = 0; i < currentIndex; i++) {
        offset += segmentWidths[i] || 0;
      }
      return offset;
    };
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: getOffset(),
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(selectedWidth, {
        toValue: segmentWidths[currentIndex] || 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentIndex, segmentWidths, containerWidth, translateX, selectedWidth]);
  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: segmentBackgroundColor },
        containerStyle,
      ]}
      onLayout={handleLayout}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.selectedSegment,
            {
              transform: [{ translateX }],
              width: selectedWidth,
              backgroundColor: activeSegmentBackgroundColor,
            },
          ]}
        />
      )}
      
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={[styles.segment, { paddingVertical }]}
          onPress={() => onChange(index)}
          onLayout={(event) => handleSegmentLayout(event, index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              { color: index === currentIndex ? activeTextColor : inactiveTextColor },
            ]}
            numberOfLines={1}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedSegment: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    zIndex: 0,
  },
}); 