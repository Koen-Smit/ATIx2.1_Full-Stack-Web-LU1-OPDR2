import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module } from '../../domain/entities/module.entity';
import type { IModuleRepository } from '../../domain/repositories/module-repository.interface';
import { ModuleDocument } from '../database/module.schema';

@Injectable()
export class ModuleRepository implements IModuleRepository {
  constructor(
    @InjectModel('Module') private readonly moduleModel: Model<ModuleDocument>,
  ) {}

  async findById(id: string): Promise<Module | null> {
    const moduleDoc = await this.moduleModel.findById(id);
    return moduleDoc ? this.mapToEntity(moduleDoc) : null;
  }

  async findAll(): Promise<Module[]> {
    // console.log('ModuleRepository.findAll() called');
    const moduleDocs = await this.moduleModel.find();
    // console.log(`Found ${moduleDocs.length} modules in database`);
    return moduleDocs.map(doc => this.mapToEntity(doc));
  }

  async findByLevel(level: string): Promise<Module[]> {
    const moduleDocs = await this.moduleModel.find({ level });
    return moduleDocs.map(doc => this.mapToEntity(doc));
  }

  async findByLocation(location: string): Promise<Module[]> {
    const moduleDocs = await this.moduleModel.find({ location });
    return moduleDocs.map(doc => this.mapToEntity(doc));
  }

  async findByName(name: string): Promise<Module[]> {
    // Use case-insensitive search with regex
    const moduleDocs = await this.moduleModel.find({ 
      name: { $regex: name, $options: 'i' } 
    });
    return moduleDocs.map(doc => this.mapToEntity(doc));
  }

  async create(module: Module): Promise<Module> {
    const moduleDoc = new this.moduleModel({
      name: module.name,
      shortdescription: module.shortDescription,
      description: module.description,
      content: module.content,
      studycredit: module.studyCredit,
      location: module.location,
      contact_id: module.contactId,
      level: module.level,
      learningoutcomes: module.learningOutcomes,
    });
    
    const savedDoc = await moduleDoc.save();
    return this.mapToEntity(savedDoc);
  }

  async update(id: string, moduleData: Partial<Module>): Promise<Module | null> {
    const updateData: Record<string, any> = {};
    
    if (moduleData.name) updateData.name = moduleData.name;
    if (moduleData.shortDescription) updateData.shortdescription = moduleData.shortDescription;
    if (moduleData.description) updateData.description = moduleData.description;
    if (moduleData.content) updateData.content = moduleData.content;
    if (moduleData.studyCredit) updateData.studycredit = moduleData.studyCredit;
    if (moduleData.location) updateData.location = moduleData.location;
    if (moduleData.contactId) updateData.contact_id = moduleData.contactId;
    if (moduleData.level) updateData.level = moduleData.level;
    if (moduleData.learningOutcomes) updateData.learningoutcomes = moduleData.learningOutcomes;

    const moduleDoc = await this.moduleModel.findByIdAndUpdate(id, updateData, { new: true });
    return moduleDoc ? this.mapToEntity(moduleDoc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.moduleModel.findByIdAndDelete(id);
    return !!result;
  }

  private mapToEntity(moduleDoc: ModuleDocument): Module {
    return new Module(
      String(moduleDoc._id),
      moduleDoc.name,
      moduleDoc.shortdescription,
      moduleDoc.description,
      moduleDoc.content,
      moduleDoc.studycredit,
      moduleDoc.location,
      moduleDoc.contact_id,
      moduleDoc.level,
      moduleDoc.learningoutcomes,
      moduleDoc.created_at,
      moduleDoc.updated_at,
    );
  }
}