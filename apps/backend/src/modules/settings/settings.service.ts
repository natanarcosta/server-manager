import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingDto, UpsertSettingDto } from '@server-manager/shared';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SettingDto[]> {
    const settings = await this.prisma.setting.findMany();
    return settings;
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  }

  async set(dto: UpsertSettingDto): Promise<SettingDto> {
    return this.prisma.setting.upsert({
      where: { key: dto.key },
      update: { value: dto.value },
      create: { key: dto.key, value: dto.value },
    });
  }

  async delete(key: string): Promise<void> {
    await this.prisma.setting.deleteMany({ where: { key } });
  }
}
