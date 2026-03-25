import { Module } from '@nestjs/common';
import { RoastController } from './roast.controller';
import { RoastService } from './roast.service';
import { GithubModule } from '../github/github.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [GithubModule, GeminiModule],
  controllers: [RoastController],
  providers: [RoastService],
  exports: [RoastService],
})
export class RoastModule {}