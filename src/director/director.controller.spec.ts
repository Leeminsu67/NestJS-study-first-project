import { Test, TestingModule } from '@nestjs/testing';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';

const mockDirectorService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DirectorController', () => {
  let directorController: DirectorController;
  let directorService: DirectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectorController],
      providers: [
        {
          provide: DirectorService,
          useValue: mockDirectorService,
        },
      ],
    }).compile();
    directorController = module.get<DirectorController>(DirectorController);
    directorService = module.get<DirectorService>(DirectorService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(directorController).toBeDefined();
  });

  describe('create', () => {
    it('should call create method from DirectorService with correct DTO', () => {
      const createDirectorDto = { name: 'ming' };
      const result = { name: 'ming' };

      jest.spyOn(mockDirectorService, 'create').mockResolvedValue(result);

      expect(
        directorController.create(createDirectorDto as CreateDirectorDto),
      ).resolves.toEqual(result);
      expect(directorService.create).toHaveBeenCalledWith(createDirectorDto);
    });
  });

  describe('findAll', () => {
    it('should call findAll method from DirectorService', () => {
      const result = [{ id: 1, name: 'ming' }];

      jest.spyOn(mockDirectorService, 'findAll').mockResolvedValue(result);

      expect(directorController.findAll()).resolves.toEqual(result);
      expect(directorService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call findOne method from DirectorService with correct ID', () => {
      const result = { id: 1, name: 'ming' };

      jest.spyOn(mockDirectorService, 'findOne').mockResolvedValue(result);

      expect(directorController.findOne(1)).resolves.toEqual(result);
      expect(directorService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call update method from DirectorService with correct ID and DTO', () => {
      const updateDirectorDto = { name: 'ming' };
      const result = {
        id: 1,
        name: 'ming2',
      };

      jest.spyOn(mockDirectorService, 'update').mockResolvedValue(result);

      expect(directorController.update(1, updateDirectorDto)).resolves.toEqual(
        result,
      );
      expect(directorService.update).toHaveBeenCalledWith(1, updateDirectorDto);
    });
  });

  describe('remove', () => {
    it('should call remove method from DirectorService with correct ID', () => {
      const result = 1;

      jest.spyOn(directorService, 'remove').mockResolvedValue(result);

      expect(directorController.remove(1)).resolves.toBe(result);
      expect(directorService.remove).toHaveBeenCalledWith(1);
    });
  });
});
