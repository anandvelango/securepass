 /**
 * Password Model Module
 * 
 * This module defines the core data structures and business logic for password entries.
 * 
 * Design Decisions:
 * - Interface + Class pattern: Provides both contract definition and implementation
 * - Immutable ID and timestamps: Ensures data integrity and audit trail
 * - JSON serialization methods: Enables easy persistence and data transfer
 * - Date formatting methods: Provides consistent UI display formatting
 * 
 * Data Types Chosen:
 * - string for ID: Simple, unique identifier that's JSON-serializable
 * - string for dates: ISO format ensures timezone handling and JSON compatibility
 * - optional notes: Flexibility for users who may not need additional information
 */
export interface IPasswordEntry {
/**
 * Interface defining the contract for password entry data structure
 * 
 * Why interface first approach:
 * - Enforces consistent data shape across the application
 * - Enables type checking and IntelliSense support
 * - Facilitates testing with mock objects
 * - Allows for multiple implementations if needed
 */
  id: string;
  /** Unique identifier - string type chosen for simplicity and JSON compatibility */
  /** Website/service name - primary identifier for users */
  website: string;
  /** Username/email - credential identifier */
  username: string;
  /** Encrypted password - stored as string for flexibility */
  password: string;
  /** Optional additional information - flexibility for power users */
  notes?: string;
  /** Creation timestamp - ISO string for timezone handling */
  createdAt: string;
  /** Last modification timestamp - enables audit trail */
  updatedAt: string;
}

/**
 * Configuration interface for password generation
 * 
 * Design rationale:
 * - Boolean flags: Simple on/off switches for character types
 * - Number for length: Allows precise control over password complexity
 * - Separate interface: Keeps password generation concerns isolated
 */
export interface IPasswordGeneratorOptions {
  /** Password length - number type allows validation and slider controls */
  length: number;
  /** Include A-Z characters - boolean for simple toggle */
  includeUppercase: boolean;
  /** Include a-z characters - boolean for simple toggle */
  includeLowercase: boolean;
  /** Include 0-9 characters - boolean for simple toggle */
  includeNumbers: boolean;
  /** Include special characters - boolean for simple toggle */
  includeSymbols: boolean;
}

/**
 * Concrete implementation of password entry with business logic
 * 
 * Class-based approach chosen for:
 * - Encapsulation of data and behavior
 * - Instance methods for data manipulation
 * - Constructor validation and initialization
 * - Inheritance possibilities for specialized password types
 */
export class PasswordEntry implements IPasswordEntry {
  /** Readonly ID prevents accidental modification after creation */
  public readonly id: string;
  /** Public properties allow controlled access while maintaining encapsulation */
  public website: string;
  public username: string;
  public password: string;
  public notes?: string;
  /** Readonly creation timestamp preserves audit trail */
  public readonly createdAt: string;
  /** Mutable update timestamp tracks modifications */
  public updatedAt: string;

  /**
   * Constructor with dependency injection pattern
   * 
   * @param website - Service/website name (required for identification)
   * @param username - User identifier (required for login)
   * @param password - Secret credential (required for authentication)
   * @param notes - Optional additional information
   * @param id - Optional ID for reconstruction from storage
   * 
   * Design decisions:
   * - Required parameters first: Enforces essential data
   * - Optional ID parameter: Supports both new creation and reconstruction
   * - Automatic timestamp generation: Ensures consistency
   */
  constructor(
    website: string,
    username: string,
    password: string,
    notes?: string,
    id?: string
  ) {
    // Generate ID using timestamp - simple, unique, and sortable
    this.id = id || Date.now().toString();
    this.website = website;
    this.username = username;
    this.password = password;
    this.notes = notes;
    // ISO string format chosen for timezone handling and JSON compatibility
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update method with partial data pattern
   * 
   * @param data - Partial update data (only specified fields are updated)
   * 
   * Design rationale:
   * - Partial<> type: Allows updating only specific fields
   * - Pick<> utility: Restricts updates to safe, mutable fields
   * - Automatic timestamp update: Maintains audit trail
   * - Undefined checks: Prevents overwriting with undefined values
   */
  public update(data: Partial<Pick<IPasswordEntry, 'website' | 'username' | 'password' | 'notes'>>): void {
    // Explicit undefined checks prevent accidental data loss
    if (data.website !== undefined) this.website = data.website;
    if (data.username !== undefined) this.username = data.username;
    if (data.password !== undefined) this.password = data.password;
    if (data.notes !== undefined) this.notes = data.notes;
    // Automatic timestamp update ensures data consistency
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Serialization method for persistence
   * 
   * @returns Plain object representation suitable for JSON storage
   * 
   * Why separate serialization:
   * - Explicit control over what gets serialized
   * - Prevents circular references
   * - Enables data transformation if needed
   * - Clear separation between object state and storage format
   */
  public toJSON(): IPasswordEntry {
    return {
      id: this.id,
      website: this.website,
      username: this.username,
      password: this.password,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Static factory method for deserialization
   * 
   * @param data - Raw data from storage
   * @returns Fully constructed PasswordEntry instance
   * 
   * Static method chosen because:
   * - No instance required for creation
   * - Clear factory pattern implementation
   * - Handles data reconstruction from storage
   * - Preserves original timestamps
   */
  public static fromJSON(data: IPasswordEntry): PasswordEntry {
    const entry = new PasswordEntry(
      data.website,
      data.username,
      data.password,
      data.notes,
      data.id
    );
    // Preserve original update timestamp from storage
    entry.updatedAt = data.updatedAt;
    return entry;
  }

  /**
   * Utility method for consistent date formatting
   * 
   * @param dateField - Which timestamp to format
   * @returns Human-readable date string
   * 
   * Design decisions:
   * - Union type parameter: Type-safe field selection
   * - Consistent formatting: Ensures UI consistency
   * - Localized format: Respects user's locale settings
   * - Instance method: Keeps formatting logic with the data
   */
  public getFormattedDate(dateField: 'createdAt' | 'updatedAt'): string {
    return new Date(this[dateField]).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}