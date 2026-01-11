import { DynamicModule, Module, Provider } from '@nestjs/common';
import { HttpfService } from './httpf.service';
import {
  HttpfModuleAsyncOptions,
  HttpfModuleOptions,
  HttpfModuleOptionsFactory,
} from './httpf-module-option.interface';
import got from 'got';
import { GOT, HTTPF_MODULE_OPTIONS } from './httpf.constants';

@Module({
  providers: [
    HttpfService,
    {
      provide: GOT,
      useValue: got,
    },
  ],
  exports: [HttpfService],
})
export class HttpfModule {
  static register(config: HttpfModuleOptions): DynamicModule {
    return {
      module: HttpfModule,
      global: config.global,
      providers: [
        {
          provide: GOT,
          useValue: got.extend(config),
        },
      ],
    };
  }

  static registerAsync(options: HttpfModuleAsyncOptions): DynamicModule {
    return {
      module: HttpfModule,
      global: options.global,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: GOT,
          useFactory: (config: HttpfModuleOptions) => got.extend(config),
          inject: [HTTPF_MODULE_OPTIONS],
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(
    options: HttpfModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    if (!options.useClass) {
      throw new Error(
        'Invalid configuration. Must provide useClass, useExisting or useFactory',
      );
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: HttpfModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: HTTPF_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = options.useExisting || options.useClass;
    if (!inject) {
      throw new Error(
        'Invalid configuration. Must provide useClass, useExisting or useFactory',
      );
    }
    return {
      provide: HTTPF_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HttpfModuleOptionsFactory) =>
        optionsFactory.createHttpOptions(),
      inject: [inject],
    };
  }
}
