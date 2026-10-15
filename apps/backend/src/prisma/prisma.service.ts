import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const dbUrl = config.get<string>('DATABASE_URL');
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found');
    }
    super({ adapter: new PrismaPg({ connectionString: dbUrl }) });
  }

  async onModuleInit() {
    const dbUrl = this.config.get<string>('DATABASE_URL');
    const url = new URL(dbUrl);
    this.logger.debug(
      `Connecting to database at ${dbUrl.slice(0, 13)}${url.username}:${'*'.repeat(8)}@${url.host}${url.pathname}${url.search}`,
    );
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
