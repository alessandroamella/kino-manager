import { Injectable } from '@nestjs/common';
import { Gender } from '../generated/prisma/client';

@Injectable()
export class SharedService {
  public getGenderSuffixItalian(gender: Gender) {
    switch (gender) {
      case Gender.F: // female
        return 'a';
      case Gender.X: // idk
        return 'Ə';
      default:
        return 'o'; // default to masculine (correct form for Italian)
    }
  }
}
