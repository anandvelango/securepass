 /* Password Manager React Hook Module
 * 
 * This module provides React integration for the password management system.
 * 
 * Architecture Decisions:
 * - Custom hook pattern: Encapsulates password management logic
 * - Class-based hook wrapper: Bridges OOP services with React functional components
 * - State synchronization: Keeps React state in sync with service layer
 * - Callback memoization: Prevents unnecessary re-renders
 * 
 * Data Flow:
 * 1. Hook creates service instances
 * 2. Service operations update internal state
 * 3. Hook refreshes React state from services
 * 4. Components re-render with updated data
 * 
 * Performance Optimizations:
 * - useCallback for stable function references
 * - Single state update per operation
 * - Lazy initialization of services
 */
import { useState, useEffect, useCallback } from 'react';
import { PasswordEntry } from '../models/Password';
import { PasswordManager } from '../services/PasswordManager';
import { StorageServiceFactory } from '../services/StorageService';

/**
 * Bridge class between OOP services and React hooks
 * 
 * Class-based approach chosen because:
 * - Encapsulates service initialization logic
 * - Provides stable interface for React hook
 * - Manages service lifecycle
 * - Handles state synchronization between services and React
 * 
 * Dependency injection pattern:
 * - Receives React state setter in constructor
 * - Uses injected setter to update React state
 * - Maintains separation between business logic and UI state
 */
export class PasswordManagerHook {
  /** Core password management service instance */
  private passwordManager: PasswordManager;
  /** React state setter for triggering re-renders */
  private setPasswords: React.Dispatch<React.SetStateAction<PasswordEntry[]>>;

  /**
   * Constructor with dependency injection
   * 
   * @param setPasswords - React state setter function
   * 
   * Initializes service dependencies:
   * - Creates storage service using factory pattern
   * - Gets singleton password manager instance
   * - Stores React state setter for future updates
   */
  constructor(setPasswords: React.Dispatch<React.SetStateAction<PasswordEntry[]>>) {
    // Use factory to create appropriate storage service
    const storageService = StorageServiceFactory.createStorageService('localStorage');
    // Get singleton password manager instance
    this.passwordManager = PasswordManager.getInstance(storageService);
    // Store React state setter for synchronization
    this.setPasswords = setPasswords;
  }

  /**
   * Synchronize React state with service data
   * 
   * Called after operations that modify password data
   * Ensures React components have latest data for rendering
   */
  public loadPasswords(): void {
    const passwords = this.passwordManager.getAllPasswords();
    this.setPasswords(passwords);
  }

  /**
   * Add new password and update React state
   * 
   * @param passwordData - Password data without system fields
   * @returns Newly created PasswordEntry
   * 
   * Pattern: Operation + State Sync
   * 1. Perform business operation
   * 2. Refresh React state
   * 3. Return operation result
   */
  public addPassword(passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): PasswordEntry {
    const newPassword = this.passwordManager.addPassword(passwordData);
    // Sync React state after modification
    this.loadPasswords();
    return newPassword;
  }

  /**
   * Update existing password and sync state
   * 
   * @param id - Password identifier
   * @param passwordData - Partial update data
   * @returns Updated password or null
   * 
   * Conditional state sync only occurs if update succeeds
   */
  public updatePassword(
    id: string, 
    passwordData: Partial<Pick<PasswordEntry, 'website' | 'username' | 'password' | 'notes'>>
  ): PasswordEntry | null {
    const updatedPassword = this.passwordManager.updatePassword(id, passwordData);
    // Only sync state if update was successful
    if (updatedPassword) {
      this.loadPasswords();
    }
    return updatedPassword;
  }

  /**
   * Delete password and sync state
   * 
   * @param id - Password identifier
   * @returns Success boolean
   * 
   * Conditional state sync based on operation success
   */
  public deletePassword(id: string): boolean {
    const success = this.passwordManager.deletePassword(id);
    // Only sync state if deletion was successful
    if (success) {
      this.loadPasswords();
    }
    return success;
  }

  /**
   * Search passwords without state modification
   * 
   * @param searchTerm - Search query
   * @returns Filtered password array
   * 
   * Read-only operation doesn't require state sync
   * Returns filtered data directly from service
   */
  public searchPasswords(searchTerm: string): PasswordEntry[] {
    return this.passwordManager.searchPasswords(searchTerm);
  }

  /**
   * Get password by ID without state modification
   * 
   * @param id - Password identifier
   * @returns Password entry or null
   * 
   * Read-only operation for direct data access
   */
  public getPasswordById(id: string): PasswordEntry | null {
    return this.passwordManager.getPasswordById(id);
  }
}

/**
 * React hook for password management
 * 
 * @returns Object with password state and management functions
 * 
 * Hook design patterns:
 * - Single state variable for passwords array
 * - Stable function references via useCallback
 * - Automatic initialization via useEffect
 * - Memoized callbacks prevent unnecessary re-renders
 * 
 * State management:
 * - passwords: Current array of password entries
 * - Functions: Memoized operations that update state
 * 
 * Performance considerations:
 * - useCallback prevents function recreation on every render
 * - Single PasswordManagerHook instance per component
 * - Lazy service initialization
 */
export const usePasswordManager = () => {
  /** React state for password entries array */
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  /** Stable hook wrapper instance created once per component */
  const [passwordManagerHook] = useState(() => new PasswordManagerHook(setPasswords));

  /**
   * Initialize password data on component mount
   * 
   * useEffect with empty dependency array ensures:
   * - Runs only once after component mount
   * - Loads initial data from storage
   * - Populates React state for first render
   */
  useEffect(() => {
    passwordManagerHook.loadPasswords();
  }, [passwordManagerHook]);

  /**
   * Memoized add password function
   * 
   * useCallback prevents function recreation unless dependencies change
   * Stable reference prevents unnecessary child component re-renders
   */
  const addPassword = useCallback((passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    return passwordManagerHook.addPassword(passwordData);
  }, [passwordManagerHook]);

  /**
   * Memoized update password function
   * 
   * Stable reference for consistent component behavior
   */
  const updatePassword = useCallback((
    id: string, 
    passwordData: Partial<Pick<PasswordEntry, 'website' | 'username' | 'password' | 'notes'>>
  ) => {
    return passwordManagerHook.updatePassword(id, passwordData);
  }, [passwordManagerHook]);

  /**
   * Memoized delete password function
   * 
   * Stable reference prevents unnecessary re-renders
   */
  const deletePassword = useCallback((id: string) => {
    return passwordManagerHook.deletePassword(id);
  }, [passwordManagerHook]);

  /**
   * Memoized search function
   * 
   * Read-only operation with stable reference
   */
  const searchPasswords = useCallback((searchTerm: string) => {
    return passwordManagerHook.searchPasswords(searchTerm);
  }, [passwordManagerHook]);

  /**
   * Memoized get by ID function
   * 
   * Utility function with stable reference
   */
  const getPasswordById = useCallback((id: string) => {
    return passwordManagerHook.getPasswordById(id);
  }, [passwordManagerHook]);

  /**
   * Hook return object
   * 
   * Provides:
   * - passwords: Current state array
   * - Management functions: All CRUD operations
   * - Search functionality: Query and retrieval
   * 
   * All functions are memoized for performance
   * State updates trigger component re-renders automatically
   */
  return {
    passwords,
    addPassword,
    updatePassword,
    deletePassword,
    searchPasswords,
    getPasswordById
  };
}