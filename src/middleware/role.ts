import { Request, Response, NextFunction } from "express"; 
import { Users} from "../entity/Users";
import { AppDataSource } from "../data-source";

export const checkRole = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const {userId } = res.locals.jwtPayLoad;
        const userRepository = AppDataSource.getRepository(Users);
        let user: Users;
        try{
            user = await userRepository.findOneOrFail(userId);
        }catch(e){
            return res.status(401).json({message: 'Not Authorized'});
        }
        const {role} = user;
        if(roles.includes(role)){
            next();
        } else {
            res.status(401).json({message: 'Not Authorized'});
        }
    }
};