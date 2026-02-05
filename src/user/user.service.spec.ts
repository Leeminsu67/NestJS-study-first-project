import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

// DB I/O 제거
// 외부 의존성 격리 -> 순수한 비즈니스 로직만 테스트
// 엣지 케이스 시뮬레이션 용이이
const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

// 파일 최상단에 추가해야 함
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;

  // 각 케이스마다 새로운 인스턴스 생성(테스트 격리)
  beforeEach(async () => {
    // NestJS 환경에 맞게 똑같이 가져올 수 있도록 할 수 있음
    // NestJS IoC 컨테이너의 격리된 테스트 인스턴스 생성성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        // InjectRepository(User)가 주입받는 DI 토큰 반환환
        // UserService가 의존하는 UserRepository를 모킹
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  // 실행했던 파라미터, 기록들을 삭제한다
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 존재 확인 테스트
  // Smoke Test: DI 구성이 정상적으로 작동하는지 확인
  // 실패시 -> Provider 설정 오류 의심
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@codefactory.ai',
        password: 'testtest',
      };
      const hashRounds = 10;
      const hashedPassword = 'hashedpassword';
      const result = {
        id: 1,
        email: createUserDto.email,
        password: hashedPassword,
        role: 0,
      };

      // findOne이 두 번 호출됨: 1) 중복확인(null) 2) 저장 후 반환(result)
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValueOnce(null) // 첫 번째 호출: 이메일 중복 확인
        .mockResolvedValueOnce(result); // 두 번째 호출: 저장 후 사용자 반환
      // ConfigService.get은 동기 함수이므로 mockReturnValue 사용
      jest.spyOn(mockConfigService, 'get').mockReturnValue(hashRounds);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((password, hashRounds) => hashedPassword);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValueOnce({
        id: 1,
        email: createUserDto.email,
        password: hashedPassword,
        role: 0,
      });

      const createdUser = await userService.create(createUserDto);

      expect(createdUser).toEqual(result);
      // 첫 번째 findOne 호출 검증 (이메일 중복 확인)
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          email: createUserDto.email,
        },
      });
      // 두 번째 findOne 호출 검증 (저장 후 사용자 반환)
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          email: createUserDto.email,
        },
      });
      expect(mockConfigService.get).toHaveBeenCalledWith(expect.anything());
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        hashRounds,
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@codefactory.ai',
        password: 'testtest',
      };

      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValue({ id: 1, email: createUserDto.email });

      expect(userService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });
  });

  // findAll 메서드 테스트
  describe('findAll', () => {
    // 모든 사용자를 반환해야함
    // 테스트의 제목 실제 일어나야하는 행동을 기술
    it('should return all users', async () => {
      const users = [{ id: 1, email: 'test@codefactory.ai' }];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  // findOne 메서드 테스트
  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 1,
        email: 'test@codefactory.ai',
        password: 'hashedpassword',
        role: 0,
        createdMovies: [],
        likedMovies: [],
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      // mockUserRepository.findOne.mockResolvedValue(user);

      const result = await userService.findOne(user.id);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a user if it exists and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@gmail.com',
        password: 'testtest',
      };
      const hashRounds = 10;
      const hashedPassword = 'hashedpassword';
      const user = {
        id: 1,
        email: updateUserDto.email,
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(mockConfigService, 'get').mockReturnValue(hashRounds);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((password, hashRounds) => hashedPassword);
      jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValueOnce({ ...user, password: hashedPassword });

      const result = await userService.update(1, updateUserDto);

      expect(result).toEqual({ ...user, password: hashedPassword });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      // expect(mockConfigService.get).toHaveBeenCalledWith(expect.anything());
      expect(bcrypt.hash).toHaveBeenCalledWith(
        updateUserDto.password,
        hashRounds,
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        {
          id: 1,
        },
        {
          ...updateUserDto,
          password: hashedPassword,
        },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@codefactory.ai',
        password: 'testtest',
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(userService.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  // remove 메서드 테스트
  describe('remove', () => {
    it('should delete a user by id', async () => {
      // const user = {
      //   id: 1,
      //   email: 'test@codefactory.ai',
      //   password: 'hashedpassword',
      //   role: 0,
      //   createdMovies: [],
      //   likedMovies: [],
      // };

      // jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      // const result = await userService.findOne(user.id);

      // expect(result).toEqual(user);
      // expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      //   where: { id: user.id },
      // });

      // const deleteResult = await userService.remove(user.id);

      // expect(deleteResult).toEqual({ message: `삭제되었습니다: ${user.id}` });
      // expect(mockUserRepository.delete).toHaveBeenCalledWith(user.id);

      const id = 999;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue({ id: 1 });

      const result = await userService.remove(id);

      expect(result).toEqual({ message: `삭제되었습니다: ${id}` });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException if user to delete is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(userService.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });
});
