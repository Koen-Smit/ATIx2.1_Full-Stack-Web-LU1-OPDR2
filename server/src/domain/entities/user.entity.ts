export class User {
  constructor(
    public readonly _id: string,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly email: string,
    public readonly password: string,
    public readonly favorites: UserFavorite[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public getFullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  public addFavorite(favorite: UserFavorite): User {
    const newFavorites = [...this.favorites, favorite];
    return new User(
      this._id,
      this.firstname,
      this.lastname,
      this.email,
      this.password,
      newFavorites,
      this.createdAt,
      new Date(),
    );
  }

  public removeFavorite(moduleId: string): User {
    const newFavorites = this.favorites.filter(fav => fav.moduleId !== moduleId);
    return new User(
      this._id,
      this.firstname,
      this.lastname,
      this.email,
      this.password,
      newFavorites,
      this.createdAt,
      new Date(),
    );
  }
}

export class UserFavorite {
  constructor(
    public readonly moduleId: string,
    public readonly addedAt: Date,
    public readonly moduleName: string,
    public readonly studyCredit: number,
    public readonly location: string,
  ) {}
}