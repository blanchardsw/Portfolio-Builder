/**
 * Utility functions for controlling admin/owner access to upload functionality
 * Multiple security approaches available
 */

export class AdminAccessControl {
  
  /**
   * Option 1: URL Parameter (Currently Implemented)
   * Simple and effective for personal portfolios
   */
  static isOwnerModeByURL(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('admin') === 'true' || urlParams.get('owner') === 'true';
  }

  /**
   * Option 2: Secret Key in URL
   * More secure - requires knowing a secret key
   */
  static isOwnerModeBySecret(secretKey: string = 'portfolio2024'): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('key') === secretKey;
  }

  /**
   * Option 3: Local Storage Flag
   * Persistent across sessions, can be set via console
   */
  static isOwnerModeByStorage(): boolean {
    return localStorage.getItem('portfolioOwner') === 'true';
  }

  /**
   * Option 4: Time-based Access
   * Show upload button only during certain hours (your timezone)
   */
  static isOwnerModeByTime(startHour: number = 9, endHour: number = 17): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour <= endHour;
  }

  /**
   * Option 5: IP-based (requires backend support)
   * Show upload button only from specific IP addresses
   */
  static async isOwnerModeByIP(): Promise<boolean> {
    try {
      const response = await fetch('/api/check-owner-ip');
      const data = await response.json();
      return data.isOwner;
    } catch {
      return false;
    }
  }

  /**
   * Combined approach - use multiple methods for extra security
   */
  static async isOwnerMode(): Promise<boolean> {
    // You can combine multiple methods here
    return this.isOwnerModeByURL() || 
           this.isOwnerModeBySecret() || 
           this.isOwnerModeByStorage();
  }

  /**
   * Enable owner mode via console (for Option 3)
   * User can type: AdminAccessControl.enableOwnerMode() in browser console
   */
  static enableOwnerMode(): void {
    localStorage.setItem('portfolioOwner', 'true');
    console.log('Owner mode enabled. Refresh the page to see upload button.');
  }

  /**
   * Disable owner mode
   */
  static disableOwnerMode(): void {
    localStorage.removeItem('portfolioOwner');
    console.log('Owner mode disabled.');
  }
}
