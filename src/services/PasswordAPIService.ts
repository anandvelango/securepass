import { PasswordEntry } from '../models/Password';

class PasswordAPIService {
  private baseURL = 'http://localhost:4000/api/passwords';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getAllPasswords(): Promise<PasswordEntry[]> {
    const data = await this.makeRequest('');
    return data.map((item: any) => PasswordEntry.fromJSON(item));
  }

  async addPassword(passwordData: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PasswordEntry> {
    const data = await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    return PasswordEntry.fromJSON(data);
  }

  async updatePassword(id: string, passwordData: Partial<Pick<PasswordEntry, 'website' | 'username' | 'password' | 'notes'>>): Promise<PasswordEntry | null> {
    const result = await this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    
    // Since updateMany returns count, we need to fetch the updated password
    if (result.count > 0) {
      return this.getPasswordById(id);
    }
    return null;
  }

  async deletePassword(id: string): Promise<boolean> {
    const result = await this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
    return result.success;
  }

  async getPasswordById(id: string): Promise<PasswordEntry | null> {
    try {
      const data = await this.makeRequest(`/${id}`);
      return PasswordEntry.fromJSON(data);
    } catch (error) {
      return null;
    }
  }

  async searchPasswords(searchTerm: string): Promise<PasswordEntry[]> {
    const allPasswords = await this.getAllPasswords();
    if (!searchTerm.trim()) return allPasswords;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allPasswords.filter(password => 
      password.website.toLowerCase().includes(lowerSearchTerm) ||
      password.username.toLowerCase().includes(lowerSearchTerm) ||
      password.notes?.toLowerCase().includes(lowerSearchTerm)
    );
  }
}

export const passwordAPIService = new PasswordAPIService();
