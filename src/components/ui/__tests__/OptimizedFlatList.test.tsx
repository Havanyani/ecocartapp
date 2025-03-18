import { PerformanceMonitor } from '@/utils/Performance';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { OptimizedFlatList } from '../OptimizedFlatList';

// Mock PerformanceMonitor
jest.mock('@/utils/Performance', () => ({
    PerformanceMonitor: {
        trackResponseTime: jest.fn(),
        addBreadcrumb: jest.fn(),
    },
}));

describe('OptimizedFlatList', () => {
    const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
    }));

    const renderItem = ({ item }: { item: typeof mockData[0] }) => (
        <View testID={`item-${item.id}`}>
            <Text>{item.title}</Text>
        </View>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with basic props', () => {
        const { getByTestId } = render(
            <OptimizedFlatList
                data={mockData.slice(0, 10)}
                renderItem={renderItem}
                testID="flat-list"
            />
        );

        expect(getByTestId('flat-list')).toBeTruthy();
    });

    it('applies optimization configurations based on level', () => {
        const { getByTestId, rerender } = render(
            <OptimizedFlatList
                data={mockData}
                renderItem={renderItem}
                optimizationLevel="high"
                testID="flat-list"
            />
        );

        const highOptimizationList = getByTestId('flat-list');
        expect(highOptimizationList.props.initialNumToRender).toBe(5);
        expect(highOptimizationList.props.windowSize).toBe(7);
        expect(highOptimizationList.props.maxToRenderPerBatch).toBe(15);

        // Re-render with low optimization
        rerender(
            <OptimizedFlatList
                data={mockData}
                renderItem={renderItem}
                optimizationLevel="low"
                testID="flat-list"
            />
        );
        
        const lowOptimizationList = getByTestId('flat-list');
        expect(lowOptimizationList.props.initialNumToRender).toBe(10);
        expect(lowOptimizationList.props.windowSize).toBe(3);
        expect(lowOptimizationList.props.maxToRenderPerBatch).toBe(5);
    });

    it('tracks performance when enabled', () => {
        const { getByTestId } = render(
            <OptimizedFlatList
                data={mockData.slice(0, 5)}
                renderItem={renderItem}
                trackPerformance={true}
                testID="flat-list"
            />
        );

        // Verify performance monitoring is initialized
        expect(PerformanceMonitor.addBreadcrumb).toHaveBeenCalledWith(
            'lifecycle',
            'OptimizedFlatList mounted'
        );

        // Simulate scroll
        act(() => {
            fireEvent.scroll(getByTestId('flat-list'), {
                nativeEvent: {
                    contentOffset: { y: 100, x: 0 },
                    contentSize: { height: 500, width: 100 },
                    layoutMeasurement: { height: 100, width: 100 },
                },
            });
        });

        expect(PerformanceMonitor.addBreadcrumb).toHaveBeenCalledWith(
            'scroll',
            'List scrolled'
        );
    });

    it('handles fixed item height correctly', () => {
        const itemHeight = 50;
        const { getByTestId } = render(
            <OptimizedFlatList
                data={mockData}
                renderItem={renderItem}
                itemHeight={itemHeight}
                testID="flat-list"
            />
        );

        const flatList = getByTestId('flat-list');
        expect(flatList.props.getItemLayout).toBeDefined();

        // Test getItemLayout function
        const index = 5;
        const layout = flatList.props.getItemLayout(null, index);
        expect(layout).toEqual({
            length: itemHeight,
            offset: itemHeight * index,
            index,
        });
    });

    it('handles empty data gracefully', () => {
        const { getByTestId } = render(
            <OptimizedFlatList
                data={[]}
                renderItem={renderItem}
                testID="flat-list"
            />
        );

        expect(getByTestId('flat-list')).toBeTruthy();
    });

    it('supports accessibility features', () => {
        const { getByTestId } = render(
            <OptimizedFlatList
                data={mockData.slice(0, 5)}
                renderItem={renderItem}
                testID="flat-list"
            />
        );

        const flatList = getByTestId('flat-list');
        expect(flatList.props.accessible).toBe(true);
        expect(flatList.props.accessibilityRole).toBe('list');
    });

    it('cleans up performance monitoring on unmount', () => {
        const { unmount } = render(
            <OptimizedFlatList
                data={mockData}
                renderItem={renderItem}
                trackPerformance={true}
            />
        );

        unmount();

        expect(PerformanceMonitor.addBreadcrumb).toHaveBeenCalledWith(
            'lifecycle',
            'OptimizedFlatList unmounted'
        );
    });
}); 