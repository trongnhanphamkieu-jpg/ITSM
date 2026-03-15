import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Global pipe to sanitize string inputs against XSS.
 * Strips HTML tags and dangerous patterns from all string fields.
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    if (typeof value !== 'object' || value === null) return value;
    return this.sanitizeObject(value);
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        result[key] = this.sanitizeString(val);
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          typeof item === 'object' && item !== null ? this.sanitizeObject(item) : item,
        );
      } else if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
        result[key] = this.sanitizeObject(val);
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:\s*text\/html/gi, '');
  }
}
