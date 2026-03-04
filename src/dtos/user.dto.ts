import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick(
    {
        firstName: true,
        lastName: true,
        email: true,
        profile: true,

        password: true
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
export const UpdateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    profile: true,
    
})
.partial()
.merge(
    z.object({
        password: z.string().optional(),
    })
);

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;