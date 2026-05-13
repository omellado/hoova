import { Request, Response } from 'express';
import { Users } from '../entity/Users'; 
import { validate, ValidationError } from 'class-validator';
import { AppDataSource } from '../data-source';

export class UserController{
    static getAll = async (req: Request, res: Response) => {
        const userRepository = AppDataSource.getRepository(Users);
        try{
            const users = await userRepository.find();
            if(users.length > 0){
               res.send(users);
            }else{
                res.status(404).json({message: 'Not result'});
            }
        }
        catch(e){
            return res.status(400).json({message: 'Something goes wrong!'});
        }
    }

    static getById = async (req: Request, res: Response) => {
        const id = req.params;
        const userRepository = AppDataSource.getRepository(Users);
        try{
            const user = await userRepository.findOneByOrFail(id);
            res.send(user);
        }catch(e){
            res.status(400).json({message: 'Not result.'})
        }
    }

    static newUser = async(req: Request, res: Response) => {
        const { username, password, role} = req.body;
        const user = new Users();
        user.username = username;
        user.password = password;
        user.role = role;
        const validationOpt = {validationError: {target:false, value:false}};
        const errors = await validate(user, validationOpt);
        if(errors.length > 0){
            return res.status(400).json(errors);
        }
        const userRepository = AppDataSource.getRepository(Users);
        try{
            user.hashPassword();
            await userRepository.save(user);
        }catch(e){
            return res.status(409).json({message: 'Username already exist'});
        }
        res.send('User created');

    }   

    static editUser = async(req: Request, res: Response) => {
        let user;
        const id = req.params;
        const {username, role } = req.body;
        const userRepository = AppDataSource.getRepository(Users);
        try{
            user = await userRepository.findOneByOrFail(id);
            user.username = username;
            user.role = role;
        }catch(e){
            return res.status(404).json({message: 'User not found'});
        }
        
        const validationOpt = {validationError: {target:false, value:false}};

        const errors = await validate(user, validationOpt);

        if(errors.length > 0){
            return res.status(400).json(errors);
        }
        try{
            await userRepository.save(user);
        }catch(e){
            return res.status(409).json({message: 'Username already in use'});
        }

        res.status(201).json({message: 'User update'});

    }


    static deleteUser = async(req: Request, res: Response) => {
        const id = req.params;
        const userRepository = AppDataSource.getRepository(Users);
        let user: Users;
        try{
            user = await userRepository.findOneByOrFail(id);
        }catch(e){
            return res.status(404).json({message: 'User not found'});
        }
        userRepository.remove(user);
        res.status(201).json({message: 'User deleted'});
    }

}
export default UserController;
