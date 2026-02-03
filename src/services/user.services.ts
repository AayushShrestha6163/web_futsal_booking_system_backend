import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

let userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        // create user
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO){
        const user =  await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        // generate jwt
        const payload = { // user identifier
            id: user._id,
            email: user.email,
            
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // 30 days
        return { token, user }
    }
    
        async updateUser(userId: string, updateData: Partial<UpdateUserDTO>){
        if(updateData.password){
            const hashedPassword = await bcryptjs.hash(updateData.password, 10);
            updateData.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, updateData);
        if(!updatedUser){
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }
    async getUserById(userId: string){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }
}
