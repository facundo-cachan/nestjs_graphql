import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validate JWT token from external SSO
   * In a real implementation, this would verify the token with the SSO provider
   */
  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode JWT token without validation (for development/testing)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a JWT token (for testing purposes)
   */
  generateToken(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload);
  }
}
