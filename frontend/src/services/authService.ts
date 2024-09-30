import { AuthContextType } from '../types/user';

class AuthService {
    private static instance: AuthService;
    private authContext?: AuthContextType;

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public setAuthContext(authContext: AuthContextType) {
        this.authContext = authContext;
    }

    public async logout() {
        if (this.authContext) {
            await this.authContext.logout();
        }
    }

    public async refreshToken() {
        if (this.authContext) {
            await this.authContext.refreshToken();
        }
    }
}

export default AuthService.getInstance();
