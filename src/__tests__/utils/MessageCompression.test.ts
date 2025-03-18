import { Buffer } from 'buffer';
import { deflate, inflate } from 'pako';
import { ErrorHandler } from '../../utils/ErrorHandler';
import {  MessageCompression  } from '../../utils/MessageHandling';

// Mock dependencies
jest.mock('pako', () => ({
  deflate: jest.fn(),
  inflate: jest.fn()
}));

jest.mock('../../utils/ErrorHandler', () => ({
  ErrorHandler: {
    handleError: jest.fn()
  }
}));

describe('MessageCompression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default configuration before each test
    MessageCompression.configure({
      minSize: 1024,
      level: 6,
      maxSize: 1024 * 1024 * 10,
      enabled: true
    });
  });

  describe('configure', () => {
    it('updates configuration correctly', () => {
      MessageCompression.configure({
        level: 9,
        minSize: 2048
      });

      expect(MessageCompression.shouldCompress('x'.repeat(2000))).toBe(false);
      expect(MessageCompression.shouldCompress('x'.repeat(2500))).toBe(true);
    });

    it('validates compression level', () => {
      expect(() => {
        MessageCompression.configure({ level: 10 as any });
      }).toThrow('Compression level must be between 1 and 9');

      expect(() => {
        MessageCompression.configure({ level: 0 as any });
      }).toThrow('Compression level must be between 1 and 9');
    });

    it('validates size constraints', () => {
      expect(() => {
        MessageCompression.configure({ minSize: -1 });
      }).toThrow('Minimum size cannot be negative');

      expect(() => {
        MessageCompression.configure({
          minSize: 2000,
          maxSize: 1000
        });
      }).toThrow('Maximum size cannot be less than minimum size');
    });
  });

  describe('shouldCompress', () => {
    it('returns false when compression is disabled', () => {
      MessageCompression.configure({ enabled: false });
      expect(MessageCompression.shouldCompress('x'.repeat(2000))).toBe(false);
    });

    it('returns false for messages smaller than minSize', () => {
      expect(MessageCompression.shouldCompress('small message')).toBe(false);
    });

    it('returns false for messages larger than maxSize', () => {
      const hugeMessage = 'x'.repeat(1024 * 1024 * 11); // 11MB
      expect(MessageCompression.shouldCompress(hugeMessage)).toBe(false);
    });

    it('returns true for messages within size constraints', () => {
      const message = 'x'.repeat(2000); // 2KB
      expect(MessageCompression.shouldCompress(message)).toBe(true);
    });
  });

  describe('compress', () => {
    it('returns uncompressed data when compression is not needed', async () => {
      const message = 'small message';
      const result = await MessageCompression.compress(message);

      expect(result).toEqual({
        data: message,
        compressed: false,
        ratio: 1
      });
      expect(deflate).not.toHaveBeenCalled();
    });

    it('compresses data when size constraints are met', async () => {
      const message = 'x'.repeat(2000);
      const mockCompressed = Buffer.from('compressed');
      (deflate as jest.Mock).mockReturnValue(mockCompressed);

      const result = await MessageCompression.compress(message);

      expect(result.compressed).toBe(true);
      expect(deflate).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({ level: 6 })
      );
    });

    it('handles compression errors correctly', async () => {
      const message = 'x'.repeat(2000);
      const error = new Error('Compression failed');
      (deflate as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(MessageCompression.compress(message)).rejects.toThrow('Message compression failed');
      expect(ErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('decompress', () => {
    it('decompresses data correctly', async () => {
      const originalMessage = 'Hello, World!';
      const mockDecompressed = Buffer.from(originalMessage);
      (inflate as jest.Mock).mockReturnValue(mockDecompressed);

      const result = await MessageCompression.decompress('base64data');

      expect(result).toBe(originalMessage);
      expect(inflate).toHaveBeenCalled();
    });

    it('handles decompression errors correctly', async () => {
      const error = new Error('Decompression failed');
      (inflate as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(MessageCompression.decompress('invalid-data')).rejects.toThrow('Message decompression failed');
      expect(ErrorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('getCompressionStats', () => {
    it('returns correct compression statistics', async () => {
      const message = 'x'.repeat(2000);
      const mockCompressed = Buffer.from('x'.repeat(1000));
      (deflate as jest.Mock).mockReturnValue(mockCompressed);

      const stats = await MessageCompression.getCompressionStats(message);

      expect(stats).toEqual({
        originalSize: 2000,
        compressedSize: expect.any(Number),
        ratio: expect.any(Number),
        savings: expect.any(Number)
      });
      expect(stats.savings).toBe(stats.originalSize - stats.compressedSize);
    });

    it('handles uncompressed data correctly', async () => {
      const message = 'small';
      const stats = await MessageCompression.getCompressionStats(message);

      expect(stats.originalSize).toBe(message.length);
      expect(stats.ratio).toBe(1);
      expect(stats.savings).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('creates CompressionError with original error', async () => {
      const originalError = new Error('Original error');
      (deflate as jest.Mock).mockImplementation(() => {
        throw originalError;
      });

      try {
        await MessageCompression.compress('x'.repeat(2000));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('CompressionError');
        expect(error.message).toBe('Message compression failed');
        expect(error.originalError).toBe(originalError);
      }
    });

    it('handles non-Error objects in catch blocks', async () => {
      (deflate as jest.Mock).mockImplementation(() => {
        throw 'String error'; // Non-Error object
      });

      try {
        await MessageCompression.compress('x'.repeat(2000));
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('CompressionError');
        expect(error.originalError).toBeInstanceOf(Error);
        expect(error.originalError.message).toBe('String error');
      }
    });
  });
}); 