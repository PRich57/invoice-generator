export interface User {
    id: number;
    email: string;
    name?: string;
}

export interface UserCreate {
    email: string;
    password: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    refreshToken: () => Promise<void>;
}