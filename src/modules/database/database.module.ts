import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('app.database.host'),
        port: configService.get('app.database.port'),
        username: configService.get('app.database.username'),
        password: configService.get('app.database.password'),
        database: configService.get('app.database.database'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}