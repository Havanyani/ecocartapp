import { AlertGroupingService } from '../../services/AlertGroupingService';

describe('AlertGroupingService', () => {
  const mockAlert1 = {
    id: 'alert1',
    type: 'performance',
    severity: 'warning',
    message: 'High latency detected',
    timestamp: new Date('2024-02-19T10:00:00Z')
  };

  const mockAlert2 = {
    id: 'alert2',
    type: 'performance',
    severity: 'warning',
    message: 'High latency continues',
    timestamp: new Date('2024-02-19T10:05:00Z')
  };

  it('determines if alerts should be grouped', () => {
    expect(AlertGroupingService.shouldGroup(mockAlert1, mockAlert2)).toBe(true);

    const differentTypeAlert = { ...mockAlert2, type: 'error' };
    expect(AlertGroupingService.shouldGroup(mockAlert1, differentTypeAlert)).toBe(false);
  });

  it('summarizes grouped alerts correctly', () => {
    const summary = AlertGroupingService.summarizeGroup([mockAlert1, mockAlert2]);
    
    expect(summary).toContain('Group Summary');
    expect(summary).toContain('2 alerts');
    expect(summary).toContain('performance');
  });
}); 