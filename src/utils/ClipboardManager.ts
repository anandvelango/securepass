/**
 * Clipboard Management Utility Module
 * 
 * This module provides secure clipboard operations with fallback support.
 * 
 * Architecture Decisions:
 * - Singleton pattern: Single instance for consistent behavior
 * - Progressive enhancement: Modern API with legacy fallback
 * - Error handling: Graceful degradation for unsupported environments
 * 
 * Browser Compatibility Strategy:
 * - Primary: navigator.clipboard (modern, secure contexts)
 * - Fallback: document.execCommand (legacy browsers)
 * - Error handling: Returns boolean for operation success
 * 
 * Security Considerations:
 * - Requires secure context (HTTPS) for modern API
 * - Fallback works in non-secure contexts
 * - No sensitive data logging in error cases
 */
export class ClipboardManager {
  private static instance: ClipboardManager;
  /** Static instance for singleton pattern */

  /** Private constructor enforces singleton pattern */
  private constructor() {}

  /**
   * Get singleton instance with lazy initialization
   * 
   * @returns Single ClipboardManager instance
   */
  public static getInstance(): ClipboardManager {
    if (!ClipboardManager.instance) {
      ClipboardManager.instance = new ClipboardManager();
    }
    return ClipboardManager.instance;
  }

  /**
   * Copy text to clipboard with progressive enhancement
   * 
   * @param text - Text content to copy
   * @returns Promise<boolean> indicating success
   * 
   * Implementation strategy:
   * 1. Try modern navigator.clipboard API (secure contexts)
   * 2. Fall back to legacy document.execCommand (older browsers)
   * 3. Return boolean for consistent error handling
   * 
   * Security requirements:
   * - navigator.clipboard requires HTTPS or localhost
   * - window.isSecureContext checks security requirements
   * - Fallback works in non-secure contexts
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      // Modern API: Preferred for secure contexts
      if (navigator.clipboard && window.isSecureContext) {
        // Async clipboard API with proper error handling
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        /**
         * Legacy fallback implementation
         * 
         * Creates temporary textarea element for text selection:
         * - Hidden positioning prevents visual disruption
         * - Focus and select enable copy command
         * - execCommand performs actual copy operation
         * - Element cleanup prevents memory leaks
         */
        const textArea = document.createElement('textarea');
        textArea.value = text;
        // Position off-screen to hide from user
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        // Add to DOM for selection
        document.body.appendChild(textArea);
        // Focus and select text for copy command
        textArea.focus();
        textArea.select();
        
        // Execute legacy copy command
        const success = document.execCommand('copy');
        // Clean up temporary element
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      // Log error for debugging without exposing sensitive data
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}