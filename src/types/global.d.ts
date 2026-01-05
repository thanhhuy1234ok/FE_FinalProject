declare global {
  interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface ILogin {
    access_token: string;
    user: IUser;
  }

  interface IFetchAccount {
    user: IUser;
  }

  interface IOptionSelect {
    label: string | number;
    value: number | string;
    key?: string;
  }

  interface IUser {
    id: string | number;
    email: string;
    name: string;
    avatar: string;
    role?: {
      id: string | number;
      name: string;
    };
  }
}

export {};
