import generateThemeProperties from '../generateThemeProperties.js';
import { ThemeColors } from '../../types.js';

describe('generateThemeProperties', () => {
  describe('Basic functionality', () => {
    it('should generate CSS custom properties for a simple theme', () => {
      const theme: ThemeColors = {
        primary: '#3b82f6',
        secondary: '#f59e0b',
        accent: '#10b981',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': '#3b82f6',
        '--secondary': '#f59e0b',
        '--accent': '#10b981',
      });
    });

    it('should return empty object for empty theme', () => {
      const theme: ThemeColors = {};
      const result = generateThemeProperties(theme);
      expect(result).toEqual({});
    });

    it('should handle theme with semantic color variants', () => {
      const theme: ThemeColors = {
        primary: '#3b82f6',
        'primary-content': '#ffffff',
        'primary-focus': '#2563eb',
        secondary: '#f59e0b',
        'secondary-content': '#000000',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': '#3b82f6',
        '--primary-content': '#ffffff',
        '--primary-focus': '#2563eb',
        '--secondary': '#f59e0b',
        '--secondary-content': '#000000',
      });
    });
  });

  describe('Color value formats', () => {
    it('should handle hex colors', () => {
      const theme: ThemeColors = {
        primary: '#3b82f6',
        secondary: '#F59E0B', // uppercase
        accent: '#10B981',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': '#3b82f6',
        '--secondary': '#F59E0B',
        '--accent': '#10B981',
      });
    });

    it('should handle RGB colors', () => {
      const theme: ThemeColors = {
        primary: 'rgb(59, 130, 246)',
        secondary: 'rgba(245, 158, 11, 0.8)',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': 'rgb(59, 130, 246)',
        '--secondary': 'rgba(245, 158, 11, 0.8)',
      });
    });

    it('should handle HSL colors', () => {
      const theme: ThemeColors = {
        primary: 'hsl(217, 91%, 60%)',
        secondary: 'hsla(43, 96%, 56%, 0.9)',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': 'hsl(217, 91%, 60%)',
        '--secondary': 'hsla(43, 96%, 56%, 0.9)',
      });
    });

    it('should handle named colors', () => {
      const theme: ThemeColors = {
        primary: 'blue',
        secondary: 'red',
        background: 'transparent',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': 'blue',
        '--secondary': 'red',
        '--background': 'transparent',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle color names with numbers and dashes', () => {
      const theme: ThemeColors = {
        'primary-100': '#dbeafe',
        'secondary-200': '#fed7aa',
        'neutral-50': '#fafafa',
        'base-content': '#1f2937',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary-100': '#dbeafe',
        '--secondary-200': '#fed7aa',
        '--neutral-50': '#fafafa',
        '--base-content': '#1f2937',
      });
    });

    it('should handle special color values', () => {
      const theme: ThemeColors = {
        primary: 'currentColor',
        secondary: 'inherit',
        background: 'var(--some-other-var)',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': 'currentColor',
        '--secondary': 'inherit',
        '--background': 'var(--some-other-var)',
      });
    });

    it('should preserve color values exactly as provided', () => {
      const theme: ThemeColors = {
        primary: '  #3b82f6  ', // with spaces
        secondary: '#F59E0B',
        accent: '',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': '  #3b82f6  ',
        '--secondary': '#F59E0B',
        '--accent': '',
      });
    });
  });

  describe('Type safety', () => {
    it('should work with Record<string, string> type', () => {
      const theme: Record<string, string> = {
        primary: '#3b82f6',
        secondary: '#f59e0b',
      };

      const result = generateThemeProperties(theme);

      expect(result).toEqual({
        '--primary': '#3b82f6',
        '--secondary': '#f59e0b',
      });
    });
  });

  describe('Performance', () => {
    it('should handle large theme objects efficiently', () => {
      const largeTheme: ThemeColors = {};
      
      // Generate a large theme with 1000 colors
      for (let i = 0; i < 1000; i++) {
        largeTheme[`color-${i}`] = `#${i.toString(16).padStart(6, '0')}`;
      }

      const startTime = performance.now();
      const result = generateThemeProperties(largeTheme);
      const endTime = performance.now();

      expect(Object.keys(result)).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
      expect(result['--color-0']).toBe('#000000');
      expect(result['--color-999']).toBe('#0003e7');
    });
  });
});
