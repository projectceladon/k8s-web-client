export interface UserRequest {
  username: string;
  password: string;
}

export interface UserRegister extends UserRequest {
  nodeSelector: boolean;
  cpwd?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  nodeSelector: boolean;
}
