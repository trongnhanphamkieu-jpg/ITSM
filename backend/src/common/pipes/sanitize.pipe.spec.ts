import { SanitizePipe } from './sanitize.pipe';
import { ArgumentMetadata } from '@nestjs/common';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: Object, data: '' };
  const queryMeta: ArgumentMetadata = { type: 'query', metatype: Object, data: '' };

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  it('should strip <script> tags from strings', () => {
    const input = { name: 'hello<script>alert("xss")</script>world' };
    const result = pipe.transform(input, bodyMeta);
    expect(result.name).toBe('helloworld');
  });

  it('should strip HTML tags', () => {
    const input = { desc: '<b>bold</b> and <img src=x onerror=alert(1)>' };
    const result = pipe.transform(input, bodyMeta);
    expect(result.desc).toBe('bold and ');
  });

  it('should strip javascript: URIs', () => {
    const input = { url: 'javascript:alert(1)' };
    const result = pipe.transform(input, bodyMeta);
    expect(result.url).not.toContain('javascript:');
  });

  it('should strip inline event handlers', () => {
    const input = { text: 'test onclick=steal()' };
    const result = pipe.transform(input, bodyMeta);
    expect(result.text).not.toContain('onclick=');
  });

  it('should recursively sanitize nested objects', () => {
    const input = {
      category: { name: '<script>xss</script>IT' },
      items: [{ note: '<b>bold</b>' }],
    };
    const result = pipe.transform(input, bodyMeta);
    expect(result.category.name).toBe('IT');
    expect(result.items[0].note).toBe('bold');
  });

  it('should skip non-body metadata', () => {
    const input = { name: '<script>xss</script>' };
    const result = pipe.transform(input, queryMeta);
    expect(result.name).toBe('<script>xss</script>');
  });

  it('should pass through non-string fields', () => {
    const input = { amount: 1000, active: true, date: new Date('2026-01-01') };
    const result = pipe.transform(input, bodyMeta);
    expect(result.amount).toBe(1000);
    expect(result.active).toBe(true);
    expect(result.date).toBeInstanceOf(Date);
  });
});
