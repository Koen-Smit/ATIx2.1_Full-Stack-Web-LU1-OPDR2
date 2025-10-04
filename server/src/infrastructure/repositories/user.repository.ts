import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserFavorite } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { UserDocument } from '../database/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.userModel.findById(id);
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email });
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findAll(): Promise<User[]> {
    try {
      console.log('UserRepository.findAll() called');
      const userDocs = await this.userModel.find();
      console.log(`Found ${userDocs.length} users in database`);
      
      const users = userDocs.map(doc => {
        console.log('Mapping user document:', doc._id);
        return this.mapToEntity(doc);
      });
      
      console.log('Successfully mapped all users');
      return users;
    } catch (error) {
      console.error('Error in UserRepository.findAll():', error);
      throw error;
    }
  }

  async create(user: User): Promise<User> {
    const userDoc = new this.userModel({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      favorites: user.favorites.map(fav => ({
        module_id: fav.moduleId,
        added_at: fav.addedAt,
        module_name: fav.moduleName,
        studycredit: fav.studyCredit,
        location: fav.location,
      })),
    });
    
    const savedDoc = await userDoc.save();
    return this.mapToEntity(savedDoc);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const updateData: Record<string, any> = {};
    
    if (userData.firstname) updateData.firstname = userData.firstname;
    if (userData.lastname) updateData.lastname = userData.lastname;
    if (userData.email) updateData.email = userData.email;
    if (userData.password) updateData.password = userData.password;
    if (userData.favorites) {
      updateData.favorites = userData.favorites.map(fav => ({
        module_id: fav.moduleId,
        added_at: fav.addedAt,
        module_name: fav.moduleName,
        studycredit: fav.studyCredit,
        location: fav.location,
      }));
    }

    const userDoc = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }

  private mapToEntity(userDoc: UserDocument): User {
    try {
      console.log('Mapping user document to entity, _id:', userDoc._id);
      console.log('UserDoc id property:', userDoc.id);
      console.log('UserDoc keys:', Object.keys(userDoc));
      
      const favorites = userDoc.favorites?.map(fav => 
        new UserFavorite(
          fav.module_id,
          fav.added_at,
          fav.module_name,
          fav.studycredit,
          fav.location,
        )
      ) || [];

      let id: string;
      if (userDoc._id) {
        id = userDoc._id.toString();
      } else if (userDoc.id) {
        id = String(userDoc.id);
      } else {
        id = Math.random().toString(36).substr(2, 9);
        console.warn('No _id or id found for user document, generating temporary ID:', id);
      }
      
      console.log('Using ID:', id);

      const user = new User(
        id,
        userDoc.firstname,
        userDoc.lastname,
        userDoc.email,
        userDoc.password,
        favorites,
        userDoc.created_at || new Date(),
        userDoc.updated_at || new Date(),
      );
      
      console.log('Successfully created User entity');
      return user;
    } catch (error) {
      console.error('Error in mapToEntity:', error);
      console.error('UserDoc:', userDoc);
      throw error;
    }
  }
}