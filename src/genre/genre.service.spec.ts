import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { Repository } from 'typeorm';
import { Genre } from './entity/genre.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

const mockGenreRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('GenreService', () => {
  let service: GenreService;
  let repository: Repository<Genre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepository,
        },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
    repository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre successfully', async () => {
      const createGenreDto = { name: 'Fantasy' };
      const savedGenre = { id: 1, ...createGenreDto };

      jest.spyOn(repository, 'save').mockResolvedValue(savedGenre as Genre);

      const result = await service.create(createGenreDto);

      expect(repository.save).toHaveBeenCalledWith(createGenreDto);
      expect(result).toEqual(savedGenre);
    });

    it('should a feature that returns a NotFoundException for duplicate genres', () => {
      const createGenreDto = { name: 'Fantasy' };
      const duplicateGenre = { id: 1, name: 'Fantasy' };

      jest
        .spyOn(mockGenreRepository, 'findOne')
        .mockResolvedValue(duplicateGenre);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createGenreDto.name },
      });
      expect(service.create(createGenreDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      const genres = [{ id: 1, name: 'Fantasy' }];

      jest.spyOn(repository, 'find').mockResolvedValue(genres as Genre[]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre if found', async () => {
      const genre = { id: 1, name: 'Fantasy' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(genre as Genre);

      const result = await service.findOne(genre.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: genre.id },
      });
      expect(result).toEqual(genre);
    });

    it('should throw a NotFoundException if genre is not found', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the genre if it exists', async () => {
      const updateGenreDto = {
        name: 'Updated Fantasy',
      };
      const existingGenre = {
        id: 1,
        name: 'Fantasy',
      };
      const updatedGenre = {
        id: 1,
        ...updateGenreDto,
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(existingGenre as Genre)
        .mockResolvedValueOnce(updatedGenre as Genre);

      const result = await service.update(1, updateGenreDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.update).toHaveBeenCalledWith(1, updateGenreDto);
      expect(result).toEqual(updatedGenre);
    });

    it('should throw a NotFoundException if genre to update does not exist', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(service.update(1, { name: 'Fantasy' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a genre and return the id', async () => {
      const genre = {
        id: 1,
        name: 'Fantasy',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(genre as Genre);

      const result = await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.delete).toHaveBeenCalledWith(genre.id);
      expect(result).toEqual(genre.id);
    });

    it('should throw a NotFoundException if genre to delete does not exist', () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
