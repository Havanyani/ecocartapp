import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TableAlign, TableColumn, TableRow } from '@/types/PerformanceMonitoring';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

interface Props {
  columns: TableColumn[];
  rows: TableRow[];
  title?: string;
}

const alignToFlexAlign = (align: TableAlign = 'left'): 'flex-start' | 'center' | 'flex-end' => {
  const map = {
    left: 'flex-start' as const,
    center: 'center' as const,
    right: 'flex-end' as const
  };
  return map[align];
};

export function PerformanceMetricsTable({
  columns,
  rows,
  title = 'Performance Data'
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      {/* Header */}
      <View style={styles.headerRow}>
        {columns.map(column => (
          <View 
            key={column.id} 
            style={[
              styles.headerCell,
              { flex: column.width, alignItems: alignToFlexAlign(column.align) }
            ]}
          >
            <ThemedText style={styles.headerText}>{column.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Rows */}
      {rows.map(row => (
        <View key={row.id}>
          <View style={styles.dataRow}>
            {columns.map(column => (
              <View 
                key={column.id}
                style={[
                  styles.dataCell,
                  { flex: column.width, alignItems: alignToFlexAlign(column.align) }
                ]}
              >
                <ThemedText>{row.data[column.id]}</ThemedText>
              </View>
            ))}
            {row.expandable && (
              <IconSymbol
                name={expandedRows.has(row.id) ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
                onPress={() => toggleRow(row.id)}
              />
            )}
          </View>

          {/* Expanded Details */}
          {row.expandable && expandedRows.has(row.id) && (
            <View style={styles.expandedDetails}>
              {row.details.map((detail, index) => (
                <View key={index} style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    {detail.label}:
                  </ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {detail.value}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  headerCell: {
    paddingHorizontal: 8,
  },
  headerText: {
    fontWeight: '600',
    color: '#666',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dataCell: {
    paddingHorizontal: 8,
  },
  expandedDetails: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginTop: -1,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '500',
  },
}); 