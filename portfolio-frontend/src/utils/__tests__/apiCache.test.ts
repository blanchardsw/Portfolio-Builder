/**
 * Unit tests for APICache utility
 * 
 * Tests cover:
 * - Cache storage and retrieval
 * - TTL (Time-To-Live) expiration logic
 * - Cache invalidation functionality
 * - Automatic cleanup of expired entries
 * - Edge cases and error handling
 */

import { apiCache } from '../apiCache';

describe('APICache', () => {
  beforeEach(() => {
    // Clear cache before each test
    apiCache.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers();
  });

  describe('set and get operations', () => {
    it('should store and retrieve data correctly', () => {
      // Arrange
      const testData = { name: 'John Doe', email: 'john@example.com' };
      const cacheKey = 'test-data';

      // Act
      apiCache.set(cacheKey, testData);
      const result = apiCache.get(cacheKey);

      // Assert
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      // Act
      const result = apiCache.get('non-existent-key');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle different data types correctly', () => {
      // Arrange
      const stringData = 'test string';
      const numberData = 42;
      const arrayData = [1, 2, 3];
      const objectData = { nested: { value: true } };
      const booleanData = false;

      // Act
      apiCache.set('string', stringData);
      apiCache.set('number', numberData);
      apiCache.set('array', arrayData);
      apiCache.set('object', objectData);
      apiCache.set('boolean', booleanData);

      // Assert
      expect(apiCache.get('string')).toBe(stringData);
      expect(apiCache.get('number')).toBe(numberData);
      expect(apiCache.get('array')).toEqual(arrayData);
      expect(apiCache.get('object')).toEqual(objectData);
      expect(apiCache.get('boolean')).toBe(booleanData);
    });

    it('should overwrite existing cache entries', () => {
      // Arrange
      const key = 'test-key';
      const originalData = { version: 1 };
      const updatedData = { version: 2 };

      // Act
      apiCache.set(key, originalData);
      expect(apiCache.get(key)).toEqual(originalData);

      apiCache.set(key, updatedData);
      const result = apiCache.get(key);

      // Assert
      expect(result).toEqual(updatedData);
      expect(result).not.toEqual(originalData);
    });
  });

  describe('TTL (Time-To-Live) functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should use default TTL when none specified', () => {
      // Arrange
      const testData = { message: 'test' };
      const key = 'default-ttl-test';

      // Act
      apiCache.set(key, testData);
      
      // Fast-forward time by 4 minutes (less than default 5 minutes)
      jest.advanceTimersByTime(4 * 60 * 1000);
      const resultBeforeExpiry = apiCache.get(key);

      // Fast-forward time by 2 more minutes (total 6 minutes, past default 5 minutes)
      jest.advanceTimersByTime(2 * 60 * 1000);
      const resultAfterExpiry = apiCache.get(key);

      // Assert
      expect(resultBeforeExpiry).toEqual(testData);
      expect(resultAfterExpiry).toBeNull();
    });

    it('should respect custom TTL values', () => {
      // Arrange
      const testData = { message: 'custom ttl test' };
      const key = 'custom-ttl-test';
      const customTTL = 30 * 1000; // 30 seconds

      // Act
      apiCache.set(key, testData, customTTL);
      
      // Fast-forward time by 25 seconds (less than 30 seconds)
      jest.advanceTimersByTime(25 * 1000);
      const resultBeforeExpiry = apiCache.get(key);

      // Fast-forward time by 10 more seconds (total 35 seconds, past 30 seconds)
      jest.advanceTimersByTime(10 * 1000);
      const resultAfterExpiry = apiCache.get(key);

      // Assert
      expect(resultBeforeExpiry).toEqual(testData);
      expect(resultAfterExpiry).toBeNull();
    });

    it('should handle very short TTL values', () => {
      // Arrange
      const testData = { message: 'short ttl test' };
      const key = 'short-ttl-test';
      const shortTTL = 100; // 100 milliseconds

      // Act
      apiCache.set(key, testData, shortTTL);
      
      // Immediately check (should still be valid)
      const immediateResult = apiCache.get(key);

      // Fast-forward time by 150 milliseconds
      jest.advanceTimersByTime(150);
      const expiredResult = apiCache.get(key);

      // Assert
      expect(immediateResult).toEqual(testData);
      expect(expiredResult).toBeNull();
    });

    it('should handle very long TTL values', () => {
      // Arrange
      const testData = { message: 'long ttl test' };
      const key = 'long-ttl-test';
      const longTTL = 24 * 60 * 60 * 1000; // 24 hours

      // Act
      apiCache.set(key, testData, longTTL);
      
      // Fast-forward time by 12 hours
      jest.advanceTimersByTime(12 * 60 * 60 * 1000);
      const resultAfterHalfTime = apiCache.get(key);

      // Fast-forward time by 13 more hours (total 25 hours, past 24 hours)
      jest.advanceTimersByTime(13 * 60 * 60 * 1000);
      const resultAfterExpiry = apiCache.get(key);

      // Assert
      expect(resultAfterHalfTime).toEqual(testData);
      expect(resultAfterExpiry).toBeNull();
    });

    it('should automatically clean up expired entries', () => {
      // Arrange
      const testData = { message: 'cleanup test' };
      const key = 'cleanup-test';
      const ttl = 1000; // 1 second

      // Act
      apiCache.set(key, testData, ttl);
      expect(apiCache.get(key)).toEqual(testData);

      // Fast-forward time past expiry
      jest.advanceTimersByTime(1500);
      const expiredResult = apiCache.get(key);

      // Try to get again (should still be null, confirming cleanup)
      const secondAttempt = apiCache.get(key);

      // Assert
      expect(expiredResult).toBeNull();
      expect(secondAttempt).toBeNull();
    });
  });

  describe('invalidate functionality', () => {
    it('should remove specific cache entries', () => {
      // Arrange
      const data1 = { id: 1, name: 'Item 1' };
      const data2 = { id: 2, name: 'Item 2' };
      const key1 = 'item-1';
      const key2 = 'item-2';

      apiCache.set(key1, data1);
      apiCache.set(key2, data2);

      // Verify both are cached
      expect(apiCache.get(key1)).toEqual(data1);
      expect(apiCache.get(key2)).toEqual(data2);

      // Act
      apiCache.invalidate(key1);

      // Assert
      expect(apiCache.get(key1)).toBeNull();
      expect(apiCache.get(key2)).toEqual(data2); // Should still exist
    });

    it('should handle invalidation of non-existent keys gracefully', () => {
      // Act & Assert - Should not throw error
      expect(() => {
        apiCache.invalidate('non-existent-key');
      }).not.toThrow();
    });

    it('should allow re-caching after invalidation', () => {
      // Arrange
      const originalData = { version: 1 };
      const newData = { version: 2 };
      const key = 'invalidation-test';

      // Act
      apiCache.set(key, originalData);
      expect(apiCache.get(key)).toEqual(originalData);

      apiCache.invalidate(key);
      expect(apiCache.get(key)).toBeNull();

      apiCache.set(key, newData);
      const result = apiCache.get(key);

      // Assert
      expect(result).toEqual(newData);
    });
  });

  describe('clear functionality', () => {
    it('should remove all cache entries', () => {
      // Arrange
      const data1 = { id: 1 };
      const data2 = { id: 2 };
      const data3 = { id: 3 };

      apiCache.set('key1', data1);
      apiCache.set('key2', data2);
      apiCache.set('key3', data3);

      // Verify all are cached
      expect(apiCache.get('key1')).toEqual(data1);
      expect(apiCache.get('key2')).toEqual(data2);
      expect(apiCache.get('key3')).toEqual(data3);

      // Act
      apiCache.clear();

      // Assert
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toBeNull();
      expect(apiCache.get('key3')).toBeNull();
    });

    it('should allow caching after clear', () => {
      // Arrange
      apiCache.set('test-key', { data: 'test' });
      apiCache.clear();

      // Act
      const newData = { data: 'new test' };
      apiCache.set('test-key', newData);
      const result = apiCache.get('test-key');

      // Assert
      expect(result).toEqual(newData);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined values', () => {
      // Act
      apiCache.set('null-test', null);
      apiCache.set('undefined-test', undefined);

      // Assert
      expect(apiCache.get('null-test')).toBeNull();
      expect(apiCache.get('undefined-test')).toBeUndefined();
    });

    it('should handle empty strings and zero values', () => {
      // Act
      apiCache.set('empty-string', '');
      apiCache.set('zero-number', 0);
      apiCache.set('false-boolean', false);

      // Assert
      expect(apiCache.get('empty-string')).toBe('');
      expect(apiCache.get('zero-number')).toBe(0);
      expect(apiCache.get('false-boolean')).toBe(false);
    });

    it('should handle special characters in keys', () => {
      // Arrange
      const specialKeys = [
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key with spaces',
        'key/with/slashes',
        'key@with#special$chars%'
      ];
      const testData = { message: 'special key test' };

      // Act & Assert
      specialKeys.forEach(key => {
        apiCache.set(key, testData);
        expect(apiCache.get(key)).toEqual(testData);
      });
    });

    it('should handle very long keys', () => {
      // Arrange
      const longKey = 'a'.repeat(1000); // 1000 character key
      const testData = { message: 'long key test' };

      // Act
      apiCache.set(longKey, testData);
      const result = apiCache.get(longKey);

      // Assert
      expect(result).toEqual(testData);
    });

    it('should handle circular references in objects', () => {
      // Arrange
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      // Act & Assert - Should not throw error during storage/retrieval
      expect(() => {
        apiCache.set('circular-test', circularObj);
        const result = apiCache.get('circular-test');
        expect(result).toBe(circularObj);
      }).not.toThrow();
    });
  });

  describe('performance considerations', () => {
    it('should handle large numbers of cache entries', () => {
      // Arrange
      const entryCount = 1000;
      const testData = { message: 'performance test' };

      // Act
      for (let i = 0; i < entryCount; i++) {
        apiCache.set(`key-${i}`, { ...testData, id: i });
      }

      // Assert - Should be able to retrieve all entries
      for (let i = 0; i < entryCount; i++) {
        const result = apiCache.get(`key-${i}`);
        expect(result).toEqual({ ...testData, id: i });
      }
    });

    it('should handle large data objects', () => {
      // Arrange
      const largeData = {
        array: new Array(10000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` })),
        string: 'x'.repeat(10000),
        nested: {
          deep: {
            very: {
              deep: {
                object: 'test'
              }
            }
          }
        }
      };

      // Act
      apiCache.set('large-data-test', largeData);
      const result = apiCache.get('large-data-test');

      // Assert
      expect(result).toEqual(largeData);
      expect((result as any).array).toHaveLength(10000);
      expect((result as any).string).toHaveLength(10000);
    });
  });
});
