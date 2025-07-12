import { dbService, type UserData } from './db'; // Import dbService and UserData
import { BehaviorSubject } from 'rxjs';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  isGuest: boolean;
  // token?: string; // Optional: Add if using JWTs
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isGuest: false,
};

class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>(initialAuthState);
  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    // Optional: Check localStorage/sessionStorage for existing session on init
    this.loadAuthState();
  }

  getAuthState(): AuthState {
    return this.authStateSubject.getValue();
  }

  subscribe(callback: (state: AuthState) => void) {
    const subscription = this.authState$.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  private updateAuthState(newState: Partial<AuthState>) {
    const updatedState = { ...this.getAuthState(), ...newState };
    this.authStateSubject.next(updatedState);
    this.persistAuthState(updatedState); // Persist changes
  }

  private persistAuthState(state: AuthState) {
    try {
      // Avoid storing sensitive data like passwords
      const stateToPersist = {
        isAuthenticated: state.isAuthenticated,
        userId: state.user?.id, // Store only ID, refetch user data on load if needed
        isGuest: state.isGuest,
      };
      localStorage.setItem('authState', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error('Failed to persist auth state:', error);
    }
  }

  private async loadAuthState() {
     try {
       const persistedStateJSON = localStorage.getItem('authState');
       if (persistedStateJSON) {
         const persistedState = JSON.parse(persistedStateJSON);
         if (persistedState.isAuthenticated && persistedState.userId) {
           // Refetch user data based on stored ID
           const user = await dbService.getUser(persistedState.userId);
           if (user) {
             this.authStateSubject.next({
               isAuthenticated: true,
               user: user,
               isGuest: persistedState.isGuest || false,
             });
           } else {
             // User not found, clear persisted state
             localStorage.removeItem('authState');
             this.authStateSubject.next(initialAuthState);
           }
         } else {
           this.authStateSubject.next(initialAuthState);
         }
       } else {
         this.authStateSubject.next(initialAuthState);
       }
     } catch (error) {
       console.error('Failed to load auth state:', error);
       this.authStateSubject.next(initialAuthState); // Reset on error
     }
   }

  async loginWithGoogle(): Promise<void> {
    console.log('loginWithGoogle called. This would typically trigger a Google login flow.');
    // This is a mock implementation.
    // In a real app, you would use Firebase Auth, Auth0, or similar to handle the OAuth flow.
    // After successful Google login, you'd get user info and create/get a user from your DB.
    const mockGoogleUser: UserData = {
      id: 'google-user-123',
      email: 'user@google.com',
      username: 'Google User',
      role: 'user',
      avatarSeed: 'google-seed',
      // Fill in other UserData fields as needed
      skills: [],
      interests: [],
      preferredLLMs: [],
      promptEngineering: { totalPrompts: 0, successfulPrompts: 0, challengesWon: 0, reputation: 0 },
      contributions: { totalContributions: 0, artifacts: 0, codeReviews: 0, documentation: 0, promptEngineering: 0 },
      knowledgeGraph: { nodes: [], edges: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if user exists, if not create them
    let user = await dbService.getUserByEmail(mockGoogleUser.email);
    if (!user) {
      user = await dbService.createUser(mockGoogleUser);
    }

    this.updateAuthState({
      isAuthenticated: true,
      user: user,
      isGuest: false,
    });
  }

  async login(email: string, password: string): Promise<AuthState> {
    try {
      // Hardcoded admin credentials
      if (email === 'admin' && password === 'Passw0rd123') {
        const adminUser: UserData = {
          id: 'admin-id',
          username: 'Admin',
          email: 'admin@example.com',
          role: 'admin',
          avatarSeed: 'admin-seed',
          skills: [],
          interests: [],
          preferredLLMs: [],
          promptEngineering: { totalPrompts: 0, successfulPrompts: 0, challengesWon: 0, reputation: 0 },
          contributions: { totalContributions: 0, artifacts: 0, codeReviews: 0, documentation: 0, promptEngineering: 0 },
          knowledgeGraph: { nodes: [], edges: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newState: AuthState = {
          isAuthenticated: true,
          user: adminUser,
          isGuest: false,
        };

        this.updateAuthState(newState);
        return newState;
      }

      // Existing logic for other users
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // In a real app, you'd verify the password here

      const newState: AuthState = {
        isAuthenticated: true,
        user,
        isGuest: false,
      };

      this.updateAuthState(newState);
      return newState;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async loginAsGuest(): Promise<AuthState> {
    try {
      const guestSeed = crypto.randomUUID();
      const guestId = `guest-${guestSeed.substring(0, 8)}`;
      const guestUsername = `Guest-${guestSeed.substring(0, 4)}`;

      // Create a guest user entry in the database
      const createdGuestUser = await dbService.createUser({
        id: guestId, // Use generated guest ID
        username: guestUsername,
        email: '', // Guests typically don't have email initially
        role: 'viewer',
        isAnonymous: true, // Mark as anonymous/guest
        avatarSeed: guestSeed,
        // Initialize other fields as needed for UserData
        skills: [],
        interests: [],
        preferredLLMs: [],
        promptEngineering: { totalPrompts: 0, successfulPrompts: 0, challengesWon: 0, reputation: 0 },
        contributions: { totalContributions: 0, artifacts: 0, codeReviews: 0, documentation: 0, promptEngineering: 0 },
        knowledgeGraph: { nodes: [], edges: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (!createdGuestUser) {
        throw new Error("Failed to create guest user in DB");
      }

      // Prepare the user data for the auth state (should match UserData)
      const authUser: UserData = {
        // ... copy all fields from createdGuestUser ...
        id: createdGuestUser.id,
        username: createdGuestUser.username,
        email: createdGuestUser.email,
        role: createdGuestUser.role,
        skills: createdGuestUser.skills,
        interests: createdGuestUser.interests,
        avatarSeed: createdGuestUser.avatarSeed,
        createdAt: createdGuestUser.createdAt,
        updatedAt: createdGuestUser.updatedAt,
        isAnonymous: true,
        preferredLLMs: createdGuestUser.preferredLLMs,
        promptEngineering: createdGuestUser.promptEngineering,
        contributions: createdGuestUser.contributions,
        knowledgeGraph: createdGuestUser.knowledgeGraph,
      };

      const newState: AuthState = {
        isAuthenticated: true,
        user: authUser,
        isGuest: true
      };
      this.updateAuthState(newState);
      return newState;

    } catch (error) {
      console.error('Guest login failed:', error);
      this.updateAuthState(initialAuthState); // Reset on error
      throw error; // Re-throw error
    }
  }

  // Placeholder for guest registration
  async registerGuest(guestUserId: string, registrationData: { email: string /*, password?: string */ }): Promise<UserData | null> {
    try {
      const guestUser = await dbService.getUser(guestUserId);
      if (!guestUser || !guestUser.isAnonymous) {
        throw new Error("Invalid guest user ID or user is already registered.");
      }

      // Check if email is already taken by another non-guest user
      const existingUser = await dbService.getUserByEmail(registrationData.email);
      if (existingUser && !existingUser.isAnonymous) {
          throw new Error("Email is already in use by a registered user.");
      }

      // Update the guest user record to become a registered user
      const updates: Partial<UserData> = {
        email: registrationData.email,
        isAnonymous: false, // Mark as registered
        updatedAt: new Date().toISOString(),
        // TODO: Handle password hashing and storage securely if implementing password auth
        // role: 'developer', // Optionally assign a default role on registration
      };

      // Use dbService.updateUser to apply changes
      const updatedUser = await dbService.updateUser(guestUserId, updates);

      if (!updatedUser) {
        throw new Error("Failed to update user record during registration.");
      }

      // Update the authentication state to reflect the registered user
      this.updateAuthState({
        user: updatedUser,
        isGuest: false, // No longer a guest
      });

      return updatedUser;

    } catch (error) {
      console.error("Guest registration failed:", error);
      // Don't reset auth state here, let the user retry
      throw error; // Re-throw error
    }
  }

  async logout() {
    this.updateAuthState(initialAuthState);
    localStorage.removeItem('authState'); // Clear persisted state on logout
    // Optional: Call backend logout endpoint if applicable
  }

  getCurrentUser(): UserData | null {
    return this.getAuthState().user;
  }

  isGuestUser(): boolean {
    return this.getAuthState().isGuest;
  }

  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }
}

export const authService = new AuthService();

export { UserData };
