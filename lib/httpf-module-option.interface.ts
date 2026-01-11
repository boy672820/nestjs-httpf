import {
  FactoryProvider,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import { Options } from 'got';

export interface HttpfModuleOptions extends Options {
  global?: boolean;
}

export interface HttpfModuleOptionsFactory {
  createHttpOptions(): Promise<HttpfModuleOptions> | HttpfModuleOptions;
}

export interface HttpfModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  useExisting?: Type<HttpfModuleOptionsFactory>;
  useClass?: Type<HttpfModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<HttpfModuleOptions> | HttpfModuleOptions;
  inject?: FactoryProvider['inject'];
  /**
   * Extra providers to be registered
   */
  extraProviders?: Provider[];
  /**
   * Set to true to register HttpModule as a global module
   */
  global?: boolean;
}
