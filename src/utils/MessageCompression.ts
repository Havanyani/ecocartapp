import { promisify } from 'util';
import { gunzip, gzip } from 'zlib';
import { ErrorHandler } from './ErrorHandler';

interface CompressionConfig {
  enabled: boolean;
  level: number;
  minSize: number;
  maxSize: number;
  strategy: number;
}

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  duration: number;
  savings: number;
}

interface CompressionResult {
  data: string;
  compressed: boolean;
  ratio: number;
}

export class MessageCompression {
  private static config: CompressionConfig = {
    enabled: true,
    level: 6,
    minSize: 1024, // Only compress messages larger than 1KB
    maxSize: 1024 * 1024 * 10, // Max 10MB
    strategy: 0 // Default strategy
  };

  static configure(config: Partial<CompressionConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      level: Math.max(0, Math.min(9, config.level || this.config.level)),
      minSize: Math.max(0, config.minSize || this.config.minSize),
      maxSize: Math.max(0, config.maxSize || this.config.maxSize)
    };
  }

  static shouldCompress(message: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    return message.length > this.config.minSize && message.length < this.config.maxSize;
  }

  static async compress(message: string): Promise<CompressionResult> {
    if (!this.shouldCompress(message)) {
      return {
        data: message,
        compressed: false,
        ratio: 1
      };
    }

    try {
      const gzipAsync = promisify(gzip);
      const buffer = await gzipAsync(message, {
        level: this.config.level,
        strategy: this.config.strategy
      });
      const compressedData = buffer.toString('base64');
      return {
        data: compressedData,
        compressed: true,
        ratio: compressedData.length / message.length
      };
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Message compression failed'));
      throw new Error('Message compression failed');
    }
  }

  static async decompress(compressedMessage: string): Promise<string> {
    if (!this.config.enabled) {
      return compressedMessage;
    }

    try {
      const gunzipAsync = promisify(gunzip);
      const buffer = Buffer.from(compressedMessage, 'base64');
      const decompressed = await gunzipAsync(buffer);
      return decompressed.toString('utf8');
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Message decompression failed'));
      throw new Error('Message decompression failed');
    }
  }

  static async getCompressionStats(message: string): Promise<CompressionStats> {
    const startTime = Date.now();
    const originalSize = message.length;

    try {
      const compressed = await this.compress(message);
      const compressedSize = compressed.data.length;
      const duration = Date.now() - startTime;

      return {
        originalSize,
        compressedSize,
        ratio: compressedSize / originalSize,
        duration,
        savings: originalSize - compressedSize
      };
    } catch (error) {
      ErrorHandler.handleError(error instanceof Error ? error : new Error('Failed to get compression stats'));
      throw new Error('Failed to get compression stats');
    }
  }
} 