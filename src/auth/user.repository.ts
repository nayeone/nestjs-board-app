import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Board } from '../boards/boards.entity';
import { AuthCredentialsDto } from './dto/auth-credential.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ username, password: hashedPassword });
    // 위의 코드 한 줄과 아래 코드 세 줄은 동일한 말
    // const user = new User();
    // user.username = username;
    // user.password = password; // user.password = hashedPassword;

    try {
      await user.save();
    } catch (error) {
      // console.log('error', error);
      if (error.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
