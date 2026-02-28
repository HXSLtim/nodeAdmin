import { Module } from '@nestjs/common';
import { ConnectionRegistry } from '../../Infrastructure/connectionRegistry';
import { InMemoryMessageStore } from '../../Infrastructure/inMemoryMessageStore';
import { ImGateway } from './imGateway';

@Module({
  providers: [ImGateway, ConnectionRegistry, InMemoryMessageStore],
})
export class ImModule {}
