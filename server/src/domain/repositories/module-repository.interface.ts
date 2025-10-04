import { Module } from '../entities/module.entity';

export interface IModuleRepository {
  findById(id: string): Promise<Module | null>;
  findAll(): Promise<Module[]>;
  findByLevel(level: string): Promise<Module[]>;
  findByLocation(location: string): Promise<Module[]>;
  create(module: Module): Promise<Module>;
  update(id: string, module: Partial<Module>): Promise<Module | null>;
  delete(id: string): Promise<boolean>;
}