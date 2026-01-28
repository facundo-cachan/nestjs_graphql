import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService, JwtPayload } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
    decode: jest.fn(),
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
      };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should return null for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should decode token successfully', () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
      };

      mockJwtService.decode.mockReturnValue(payload);

      const result = service.decodeToken('some-token');

      expect(result).toEqual(payload);
      expect(jwtService.decode).toHaveBeenCalledWith('some-token');
    });

    it('should return null on decode error', () => {
      mockJwtService.decode.mockImplementation(() => {
        throw new Error('Decode error');
      });

      const result = service.decodeToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a token', () => {
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
      };

      mockJwtService.sign.mockReturnValue('generated-token');

      const result = service.generateToken(payload);

      expect(result).toBe('generated-token');
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });
});
