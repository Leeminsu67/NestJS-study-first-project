import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Genre } from './entity/genre.entity';

const mockGenreService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GenreController', () => {
  let controller: GenreController;
  let service: GenreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [
        GenreService,
        {
          provide: GenreService,
          useValue: mockGenreService,
        },
      ],
    }).compile();
    controller = module.get<GenreController>(GenreController);
    service = module.get<GenreService>(GenreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call create method from GenreService with correct DTO', () => {
      const createGenreDto = { name: 'Fantasy' };
      const result = { id: 1, name: 'Fantasy' };

      jest
        .spyOn(mockGenreService, 'create')
        .mockResolvedValue(result as CreateGenreDto & Genre);

      expect(
        controller.create(createGenreDto as CreateGenreDto),
      ).resolves.toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createGenreDto);
    });
  });

  describe('findAll', () => {
    it('should call genreService.findAll and return an array of genres', () => {
      const result = [{ id: 1, name: 'Fantasy' }];

      jest
        .spyOn(mockGenreService, 'findAll')
        .mockResolvedValue(result as Genre[]);

      expect(controller.findAll()).resolves.toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should call genreService.findOne and return a genre', () => {
      const result = { id: 1, name: 'Fantasy' };

      jest
        .spyOn(mockGenreService, 'findOne')
        .mockResolvedValue(result as Genre);

      expect(controller.findOne(1)).resolves.toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call genreService.update with correct parameters and return updated genre', () => {
      const id = 1;
      const updateGenreDto = {
        name: 'updateFantasy',
      };
      const result = { id: 1, ...updateGenreDto };

      jest.spyOn(service, 'update').mockResolvedValue(result as Genre);

      expect(controller.update(id, updateGenreDto)).resolves.toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, updateGenreDto);
    });
  });

  describe('remove', () => {
    it('should call genreService.remove with correct id and return id of the removed genre', () => {
      const id = 1;

      jest.spyOn(service, 'remove').mockResolvedValue(id);

      expect(controller.remove(id)).resolves.toBe(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
