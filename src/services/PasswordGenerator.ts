/**
 * Password Generation Service Module
 * 
 * This module implements secure password generation using cryptographic randomness.
 * 
 * Architecture Decisions:
 * - Abstract base class: Enables different generation strategies
 * - Singleton pattern: Ensures consistent behavior and memory efficiency
 * - Strategy pattern: Allows pluggable character set generation
 * - Cryptographic randomness: Uses Web Crypto API for security
 * 
 * Data Structures:
 * - String concatenation for character sets: Simple and efficient
 * - Uint32Array for random values: Cryptographically secure
 * - Percentage-based strength scoring: Intuitive for users
 */

import { IPasswordGeneratorOptions } from '../models/Password';

/**
 * Abstract base class defining password generation contract
 * 
 * Abstract class chosen over interface because:
 * - Provides shared implementation for strength calculation
 * - Enforces consistent method signatures
 * - Allows future shared functionality
 * - Template method pattern for generation process
 */
export abstract class BasePasswordGenerator {
  /**
   * Abstract method for character set generation
   * Protected visibility allows subclass access while hiding implementation
   */
  protected abstract getCharacterSet(options: IPasswordGeneratorOptions): string;
  
  /**
   * Abstract method for password generation
   * Public interface that subclasses must implement
   */
  public abstract generatePassword(options: IPasswordGeneratorOptions): string;
  
  /**
   * Shared password strength calculation algorithm
   * 
   * @param password - Password to analyze
   * @returns Strength score (0-100)
   * 
   * Algorithm design:
   * - Additive scoring: Multiple criteria contribute to strength
   * - Length bonuses: Longer passwords are exponentially stronger
   * - Character variety: Different character types increase complexity
   * - Uniqueness bonus: Rewards diverse character usage
   * - Capped at 100: Provides consistent scale for UI
   */
  public calculateStrength(password: string): number {
    if (!password) return 0;

    let score = 0;
    
    // Length bonuses - exponential improvement for longer passwords
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety bonuses - each type adds significant strength
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    // Complexity bonus - rewards character diversity within the password
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.7) score += 10;

    // Cap at 100 for consistent UI representation
    return Math.min(100, score);
  }

  /**
   * Convert numeric strength to categorical level
   * 
   * @param strength - Numeric strength (0-100)
   * @returns Human-readable strength level
   * 
   * Thresholds chosen based on security best practices:
   * - <30: Weak (insufficient for most uses)
   * - 30-59: Fair (basic security)
   * - 60-79: Good (recommended for most uses)
   * - 80+: Strong (excellent security)
   */
  public getStrengthLevel(strength: number): 'Weak' | 'Fair' | 'Good' | 'Strong' {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  }

  /**
   * Map strength levels to visual indicators
   * 
   * @param strength - Numeric strength (0-100)
   * @returns Tailwind CSS class for color coding
   * 
   * Color psychology:
   * - Red: Danger/weak passwords
   * - Yellow: Caution/fair passwords
   * - Blue: Good/recommended passwords
   * - Green: Excellent/strong passwords
   */
  public getStrengthColor(strength: number): string {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  }
}

/**
 * Concrete implementation using cryptographically secure random generation
 * 
 * Singleton pattern implementation:
 * - Private constructor prevents external instantiation
 * - Static instance ensures single point of access
 * - getInstance() provides controlled access
 * 
 * Security considerations:
 * - Uses Web Crypto API for true randomness
 * - Fallback character set prevents empty passwords
 * - Modulo operation for uniform distribution
 */
export class SecurePasswordGenerator extends BasePasswordGenerator {
  /** Static instance for singleton pattern */
  private static instance: SecurePasswordGenerator;

  /** Private constructor enforces singleton pattern */
  private constructor() {
    super();
  }

  /**
   * Singleton access method
   * 
   * @returns Single instance of SecurePasswordGenerator
   * 
   * Lazy initialization ensures instance is created only when needed
   */
  public static getInstance(): SecurePasswordGenerator {
    if (!SecurePasswordGenerator.instance) {
      SecurePasswordGenerator.instance = new SecurePasswordGenerator();
    }
    return SecurePasswordGenerator.instance;
  }

  /**
   * Generate character set based on user preferences
   * 
   * @param options - User-selected character type preferences
   * @returns String containing all allowed characters
   * 
   * Implementation details:
   * - String concatenation: Simple and efficient for small character sets
   * - Conditional inclusion: Respects user preferences
   * - Fallback to lowercase: Prevents empty character sets
   * - Standard character ranges: Ensures compatibility
   */
  protected getCharacterSet(options: IPasswordGeneratorOptions): string {
    let charset = '';
    
    if (options.includeLowercase) {
      // Standard lowercase ASCII letters
      charset += 'abcdefghijklmnopqrstuvwxyz';
    }
    if (options.includeUppercase) {
      // Standard uppercase ASCII letters
      charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (options.includeNumbers) {
      // Standard numeric digits
      charset += '0123456789';
    }
    if (options.includeSymbols) {
      // Common symbols that are safe for most systems
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    // Fallback prevents empty character set which would cause errors
    return charset || 'abcdefghijklmnopqrstuvwxyz'; // Fallback
  }

  /**
   * Generate cryptographically secure password
   * 
   * @param options - Password generation preferences
   * @returns Randomly generated password
   * 
   * Security implementation:
   * - crypto.getRandomValues(): Uses OS entropy for true randomness
   * - Uint32Array: Provides sufficient range for uniform distribution
   * - Modulo operation: Maps random values to character set indices
   * - No predictable patterns: Each character is independently random
   */
  public generatePassword(options: IPasswordGeneratorOptions): string {
    const charset = this.getCharacterSet(options);
    let password = '';

    // Generate array of cryptographically secure random values
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    // Convert random values to characters using modulo operation
    for (let i = 0; i < options.length; i++) {
      const randomIndex = array[i] % charset.length;
      password += charset[randomIndex];
    }

    return password;
  }
}