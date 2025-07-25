 /* Password Manager Service Module
 * 
 * This module provides the core business logic for password management operations.
 * 
 * Architecture Decisions:
 * - Singleton pattern: Ensures single source of truth for password data
 * - Dependency injection: Storage service injected for flexibility
 * - Interface-based design: Enables testing and future extensions
 * - In-memory caching: Improves performance by avoiding repeated storage reads
 * 
 * Data Structure Choices:
 * - Array<PasswordEntry>: Ordered collection for chronological display
 * - In-memory cache: Fast access for frequent operations
 * - Immutable operations: Returns copies to prevent external mutation
 * 
 * Business Logic Patterns:
 * - CRUD operations: Complete data management functionality
 * - Search functionality: Case-insensitive partial matching
 * - Automatic persistence: Changes immediately saved to storage
 */
import { PasswordEntry } from '../models/Password';
import { IStorageService } from './StorageService';

/**
 * Interface defining password management contract
 * 
 * Interface benefits:
 * - Clear contract for password operations
 * - Enables mock implementations for testing
 * - Supports multiple password management strategies
 * - Type safety for all operations
 */
export interface IPasswordManager {
  /** Retrieve all stored passwords */
  getAllPasswords(): PasswordEntry[];
  /** Add new password entry */
  addPassword(passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): PasswordEntry;
  /** Update existing password entry */
  updatePassword(id: string, passwordData: Partial<Pick<PasswordEntry, 'website' | 'username' | 'password' | 'notes'>>): PasswordEntry | null;
  /** Remove password entry */
  deletePassword(id: string): boolean;
  /** Search passwords by website or username */
  searchPasswords(searchTerm: string): PasswordEntry[];
  /** Find specific password by ID */
  getPasswordById(id: string): PasswordEntry | null;
}

/**
 * Concrete password manager implementation with singleton pattern
 * 
 * Singleton chosen because:
 * - Single source of truth for password data
 * - Consistent state across application components
 * - Memory efficiency with shared cache
 * - Simplified dependency management
 */
export class PasswordManager implements IPasswordManager {
  /** In-memory cache of password entries for performance */
  private passwords: PasswordEntry[] = [];
  /** Injected storage service for persistence operations */
  private storageService: IStorageService;
  /** Static instance for singleton pattern */
  private static instance: PasswordManager;

  /**
   * Private constructor with dependency injection
   * 
   * @param storageService - Storage implementation to use
   * 
   * Private constructor enforces singleton pattern
   * Dependency injection allows different storage strategies
   */
  private constructor(storageService: IStorageService) {
    this.storageService = storageService;
    // Load existing data on initialization
    this.loadPasswords();
  }

  /**
   * Singleton access method with dependency injection
   * 
   * @param storageService - Storage service to use
   * @returns Single PasswordManager instance
   * 
   * Note: Storage service only used on first instantiation
   */
  public static getInstance(storageService: IStorageService): PasswordManager {
    if (!PasswordManager.instance) {
      PasswordManager.instance = new PasswordManager(storageService);
    }
    return PasswordManager.instance;
  }

  /**
   * Load passwords from storage into memory cache
   * 
   * Private method ensures controlled data loading
   * Called during initialization and after external changes
   */
  private loadPasswords(): void {
    this.passwords = this.storageService.getPasswords();
  }

  /**
   * Persist current password state to storage
   * 
   * Private method ensures consistent persistence
   * Called after every data modification
   */
  private savePasswords(): void {
    this.storageService.savePasswords(this.passwords);
  }

  /**
   * Retrieve all passwords with immutability protection
   * 
   * Returns Copy of password array
   * 
   * Spread operator creates shallow copy to prevent external mutation
   * Protects internal state while providing access to data
   */
  public getAllPasswords(): PasswordEntry[] {
    return [...this.passwords]; // Spread operator creates protective copy
  }

  /**
   * Add new password entry with automatic persistence
   * 
   * @param passwordData - Password data without system-generated fields
   * @returns Newly created PasswordEntry instance
   * 
   * Design decisions:
   * - Omit utility type excludes system-managed fields
   * - Automatic ID and timestamp generation
   * - Immediate persistence ensures data safety
   * - Return new instance for confirmation
   */
  public addPassword(passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): PasswordEntry {
    // Create new PasswordEntry with automatic ID and timestamps
    const newPassword = new PasswordEntry(
      passwordData.website,
      passwordData.username,
      passwordData.password,
      passwordData.notes
    );

    // Add to in-memory cache
    this.passwords.push(newPassword);
    // Persist changes immediately
    this.savePasswords();
    return newPassword;
  }

  /**
   * Update existing password with partial data
   * 
   * @param id - Unique identifier of password to update
   * @param passwordData - Partial update data
   * @returns Updated PasswordEntry or null if not found
   * 
   * Partial update pattern allows updating only specific fields
   * Pick utility type restricts updates to safe, mutable fields
   * Null return indicates operation failure
   */
  public updatePassword(
    id: string, 
    passwordData: Partial<Pick<PasswordEntry, 'website' | 'username' | 'password' | 'notes'>>
  ): PasswordEntry | null {
    // Find password by ID using array.find for efficiency
    const password = this.passwords.find(p => p.id === id);
    if (!password) return null;

    // Use PasswordEntry's update method for consistency
    password.update(passwordData);
    // Persist changes immediately
    this.savePasswords();
    return password;
  }

  /**
   * Delete password entry by ID
   * 
   * @param id - Unique identifier of password to delete
   * @returns Boolean indicating success
   * 
   * Array.filter creates new array without deleted item
   * Length comparison confirms deletion occurred
   * Boolean return provides clear success indication
   */
  public deletePassword(id: string): boolean {
    const initialLength = this.passwords.length;
    // Filter out the password with matching ID
    this.passwords = this.passwords.filter(p => p.id !== id);
    
    // Check if deletion occurred and persist if so
    if (this.passwords.length < initialLength) {
      this.savePasswords();
      return true;
    }
    return false;
  }

  /**
   * Search passwords by website or username
   * 
   * @param searchTerm - Text to search for
   * @returns Array of matching PasswordEntry instances
   * 
   * Search implementation:
   * - Case-insensitive matching using toLowerCase()
   * - Partial string matching using includes()
   * - Searches both website and username fields
   * - Empty search returns all passwords
   * - No modification of original data
   */
  public searchPasswords(searchTerm: string): PasswordEntry[] {
    // Empty search returns all passwords for convenience
    if (!searchTerm.trim()) return this.getAllPasswords();

    // Convert to lowercase for case-insensitive search
    const term = searchTerm.toLowerCase();
    return this.passwords.filter(password =>
      // Search in website field
      password.website.toLowerCase().includes(term) ||
      // Search in username field
      password.username.toLowerCase().includes(term)
    );
  }

  /**
   * Find password by unique identifier
   * 
   * @param id - Unique password identifier
   * @returns PasswordEntry instance or null if not found
   * 
   * Simple lookup using array.find for efficiency
   * Null return indicates password not found
   */
  public getPasswordById(id: string): PasswordEntry | null {
    return this.passwords.find(p => p.id === id) || null;
  }

  /**
   * Clear all password data (utility method)
   * 
   * Useful for:
   * - User logout functionality
   * - Data reset operations
   * - Testing scenarios
   * 
   * Clears both memory cache and persistent storage
   */
  public clearAllPasswords(): void {
    this.passwords = [];
    this.storageService.clearPasswords();
  }
}