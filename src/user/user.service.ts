import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { envVariableKeys } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다');
    }

    const hash = await bcrypt.hash(
      password,
      // this.configService.getOrThrow<number>('HASH_ROUNDS'),
      this.configService.get<number>(envVariableKeys.hashRounds)!,
    );

    await this.userRepository.save({
      email,
      password: hash,
    });

    return this.userRepository.findOne({ where: { email } });

    // return this.userRepository.save(createUserDto);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`존재하지 않는 ID 입니다:${id}`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password } = updateUserDto;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`존재하지 않는 ID 입니다:${id}`);
    }

    // if (password) {
    //   const hash = await bcrypt.hash(
    //     password,
    //     this.configService.get<number>(envVariableKeys.hashRounds)!,
    //   );

    //   await this.userRepository.update(
    //     { id },
    //     { ...updateUserDto, password: hash },
    //   );
    // }

    // password가 있으면 hash 생성 후 업데이트, 없으면 그대로 업데이트
    const updateData = password
      ? {
          ...updateUserDto,
          password: await bcrypt.hash(
            password,
            this.configService.get<number>(envVariableKeys.hashRounds)!,
          ),
        }
      : updateUserDto;

    await this.userRepository.update({ id }, updateData);

    return await this.userRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`존재하지 않는 ID 입니다:${id}`);
    }

    await this.userRepository.delete(id);

    return { message: `삭제되었습니다: ${id}` };
  }
}
