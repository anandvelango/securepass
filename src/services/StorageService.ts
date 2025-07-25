/**
 * Storage Service Module
 * 
 * This module provides abstracted data persistence with multiple storage strategies.
 * 
 * Architecture Patterns:
 * - Strategy pattern: Different storage implementations (localStorage, sessionStorage, etc.)
 * - Factory pattern: Creates appropriate storage service instances
 * - Singleton pattern: Ensures single storage instance per type
 * - Abstract base class: Defines common interface and error handling
 * 
 * Data Structure Decisions:
 * - Array<PasswordEntry>: Ordered collection for chronological display
 * - JSON serialization: Platform-independent data format
 * - String keys: Simple, consistent storage identification
 * 
 * Storage Choice Rationale:
 * - localStorage: Persistent across browser sessions
 * - Client-side only: No server dependency, enhanced privacy
 * - Synchronous API: Simpler error handling and state management
 */

import { PasswordEntry, IPasswordEntry } from '../models/Password';

/**
 * Interface defining storage service contract
 * 
 * Interface-first approach provides:
 * - Clear contract for all storage implementations
 * - Easy testing with mock implementations
 * - Future extensibility for different storage backends
 * - Type safety for storage operations
 */
export interface IStorageService {
  /** Retrieve all stored password entries */
  getPasswords(): PasswordEntry[];
  /** Persist password entries to storage */
  savePasswords(passwords: PasswordEntry[]): void;
  /** Remove all stored password data */
  clearPasswords(): void;
}

/**
 * Abstract base class providing common storage functionality
 * 
 * Abstract class chosen over interface because:
 * - Provides shared error handling implementation
 * - Enforces consistent storage key management
 * - Allows future shared functionality
 * - Template method pattern for storage operations
 */
export abstract class BaseStorageService implements IStorageService {
  /** Storage key for data identification - abstract forces implementation */
  protected abstract storageKey: string;

  /** Abstract methods that concrete classes must implement */
  public abstract getPasswords(): PasswordEntry[];
  public abstract savePasswords(passwords: PasswordEntry[]): void;
  public abstract clearPasswords(): void;

  /**
   * Centralized error handling for all storage operations
   * 
   * @param operation - Description of the failed operation
   * @param error - The error that occurred
   * 
   * Protected visibility allows subclass access while hiding from external code
   * Consistent error logging helps with debugging and monitoring
   */
  protected handleError(operation: string, error: any): void {
    console.error(`Error during ${operation}:`, error);
  }
}

/**
 * localStorage implementation with singleton pattern
 * 
 * localStorage chosen because:
 * - Persistent across browser sessions
 * - Larger storage capacity than sessionStorage
 * - Synchronous API simplifies state management
 * - Widely supported across modern browsers
 * 
 * Singleton pattern ensures:
 * - Single point of access to storage
 * - Consistent state across application
 * - Memory efficiency
 */
export class LocalStorageService extends BaseStorageService {
  /** Storage key for localStorage - namespaced to prevent conflicts */
  protected storageKey = 'secure_pass_passwords';
  /** Static instance for singleton pattern */
  private static instance: LocalStorageService;

  /** Private constructor enforces singleton pattern */
  private constructor() {
    super();
  }

  /**
   * Singleton access method with lazy initialization
   * 
   * @returns Single instance of LocalStorageService
   */
  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  /**
   * Retrieve and deserialize password entries from localStorage
   * 
   * @returns Array of PasswordEntry instances
   * 
   * Implementation details:
   * - Try-catch for robust error handling
   * - JSON.parse for deserialization
   * - PasswordEntry.fromJSON for proper object reconstruction
   * - Empty array fallback for missing data
   * - Error logging for debugging
   */
  public getPasswords(): PasswordEntry[] {
    try {
      // Retrieve raw JSON data from localStorage
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      // Parse JSON and reconstruct PasswordEntry objects
      const passwordData: IPasswordEntry[] = JSON.parse(data);
      return passwordData.map(item => PasswordEntry.fromJSON(item));
    } catch (error) {
      // Log error and return safe fallback
      this.handleError('loading passwords', error);
      return [];
    }
  }

  /**
   * Serialize and store password entries to localStorage
   * 
   * @param passwords - Array of PasswordEntry instances to store
   * 
   * Serialization process:
   * - Convert PasswordEntry instances to plain objects
   * - JSON.stringify for storage format
   * - Error handling for storage failures (quota exceeded, etc.)
   */
  public savePasswords(passwords: PasswordEntry[]): void {
    try {
      // Convert PasswordEntry instances to serializable objects
      const serializedData = passwords.map(password => password.toJSON());
      // Store as JSON string in localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(serializedData));
    } catch (error) {
      // Handle storage errors (quota exceeded, privacy mode, etc.)
      this.handleError('saving passwords', error);
    }
  }

  /**
   * Remove all password data from localStorage
   * 
   * Simple operation with error handling for consistency
   */
  public clearPasswords(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      this.handleError('clearing passwords', error);
    }
  }
}

/**
 * Factory class for creating storage service instances
 * 
 * Factory pattern benefits:
 * - Centralizes object creation logic
 * - Enables easy switching between storage types
 * - Provides type safety for storage selection
 * - Allows future extension with new storage types
 * 
 * Currently supports:
 * - localStorage: Persistent browser storage
 * Future possibilities:
 * - sessionStorage: Session-only storage
 * - IndexedDB: Large-scale client storage
 * - Remote API: Server-based storage
 */
export class StorageServiceFactory {
  /**
   * Create storage service instance based on type
   * 
   * @param type - Storage type identifier
   * @returns Appropriate storage service instance
   * 
   * Default parameter provides sensible fallback
   * Switch statement allows easy extension
   */
  public static createStorageService(type: 'localStorage' = 'localStorage'): IStorageService {
    switch (type) {
      case 'localStorage':
        return LocalStorageService.getInstance();
      default:
        // Explicit error for unsupported types
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }
}