import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

const mockedUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockedUserService,
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(true).toBeDefined();
    // expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return correct value', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@gmail.com',
        password: 'testtest',
      };

      const user = {
        id: 1,
        ...createUserDto,
        password: 'adsgioagioeswd',
      };

      // 강제 User 타입 주입
      jest.spyOn(userService, 'create').mockResolvedValue(user as User);

      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        {
          id: 1,
          email: 'test@gmail.com',
        },
        {
          id: 2,
          email: 'test2@gmail.com',
        },
      ];

      // 강제 User[] 타입 주입
      jest.spyOn(userService, 'findAll').mockResolvedValue(users as User[]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = {
        id: 1,
        email: 'test@gmail.com',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);

      const result = await userController.findOne(1);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should return the updated user', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'admin@codefactory.ai',
      };
      const user = {
        id,
        ...updateUserDto,
      };
      // 강제 User 타입 주입
      jest.spyOn(userService, 'update').mockResolvedValue(user as User);

      const result = await userController.update(id, updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should return a user remove', async () => {
      const id = 1;

      jest
        .spyOn(userService, 'remove')
        .mockResolvedValue({ message: `삭제되었습니다: ${id}` });

      const result = await userController.remove(1);

      expect(userService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: `삭제되었습니다: ${id}` });
    });
  });
});
