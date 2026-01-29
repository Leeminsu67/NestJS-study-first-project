import { Test, TestingModule } from '@nestjs/testing';
import { DirectorService } from './director.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Director } from './entitie/director.entity';
import { Repository } from 'typeorm';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { NotFoundException } from '@nestjs/common';

const mockDirectorRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('DirectorService', () => {
  let directorService: DirectorService;
  let directorRepository: Repository<Director>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectorService,
        {
          provide: getRepositoryToken(Director),
          useValue: mockDirectorRepository,
        },
      ],
    }).compile();

    directorService = module.get<DirectorService>(DirectorService);
    directorRepository = module.get<Repository<Director>>(
      getRepositoryToken(Director),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(directorService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new director', async () => {
      const createDirectorDto = {
        name: 'mingdev',
      };
      jest
        .spyOn(mockDirectorRepository, 'save')
        .mockResolvedValue(createDirectorDto);

      const result = await directorService.create(
        createDirectorDto as CreateDirectorDto,
      );

      expect(directorRepository.save).toHaveBeenCalledWith(createDirectorDto);
      expect(result).toEqual(createDirectorDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of directors', async () => {
      const directorItems = [
        {
          id: 1,
          name: 'code',
        },
        {
          id: 2,
          name: 'ming',
        },
      ];

      jest
        .spyOn(mockDirectorRepository, 'find')
        .mockResolvedValue(directorItems);

      const result = await directorService.findAll();

      expect(directorRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(directorItems);
    });
  });

  describe('findOne', () => {
    it('should return a single director by id', async () => {
      const director = {
        id: 1,
        name: 'ming',
      };
      const id = 1;

      jest
        .spyOn(mockDirectorRepository, 'findOne')
        .mockResolvedValue(director as Director);

      const result = await directorService.findOne(id);

      expect(directorRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(director);
    });
  });

  describe('update', () => {
    it('should update a director', async () => {
      const updateDirectorDto: UpdateDirectorDto = {
        name: 'ming',
      };
      const existingDirector = {
        id: 1,
        name: 'ming',
      };
      const updatedDirector = { id: 1, name: 'ming2' };

      jest
        .spyOn(mockDirectorRepository, 'findOne')
        .mockResolvedValueOnce(existingDirector)
        .mockResolvedValueOnce(updatedDirector);

      const result = await directorService.update(1, updateDirectorDto);

      expect(directorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(directorRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        updateDirectorDto,
      );
      expect(result).toEqual(updatedDirector);
    });

    it('should throw NotFoundException if director does not exist', () => {
      jest.spyOn(mockDirectorRepository, 'findOne').mockResolvedValue(null);

      expect(directorService.update(1, { name: 'ming' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a director by id', async () => {
      const director = {
        id: 1,
        name: 'ming',
      };

      jest.spyOn(mockDirectorRepository, 'findOne').mockResolvedValue(director);

      const result = await directorService.remove(1);

      expect(directorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(directorRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    it('should throw NotFoundException if director does not exist', () => {
      jest.spyOn(mockDirectorRepository, 'findOne').mockResolvedValue(null);

      expect(directorService.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
