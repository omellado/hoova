import { AppDataSource } from "../data-source"
import { Request, Response} from 'express';
import { Users } from '../entity/Users'; 
import * as jwt from 'jsonwebtoken';
import config from "../config/config";
import { validate } from "class-validator";
import { transporter } from "./../config/mailer"; 
import { getRepository } from "typeorm";

class AuthController {

    static async login(request: Request, response: Response) {
        const {username, password } = request.body;
        if(!username && !password){
            return response.status(400).json({message: 'Username & Password are required!'});
        }

        const userRepository = AppDataSource.getRepository(Users)
        let user: Users;

        try{
            user = await userRepository.findOneOrFail({where: {username}});
        }
        catch(e){
            return response.status(400).json({message: 'Username or password incorrect!'});
        }

        if(!user.checkPassword(password)){
            return response.status(400).json({message: 'Username or Password incorrect!'});
        }

        const token = jwt.sign({userId: user.id, username: user.username},config.jwtSecret, {expiresIn:'1h'});
        
        const refreshToken = jwt.sign({userId: user.id, username: user.username},config.jwtSecretRefresh, {expiresIn:'1h'});
        user.refreshToken = refreshToken;
        try{
            await userRepository.save(user);
        }catch(error){
            response.status(400).json({message: 'Something goes wronk!'});
        }

        response.json({message:'Ok', token, refreshToken, role: user.role });
    }

    static changePassword = async (req: Request, res: Response) => {
        const {userId} = res.locals.jwtPayLoad;   
        const id = userId;
        const {oldPassword, newPassword} = req.body;
        if(!(oldPassword && newPassword)){
            res.status(400).json({message: 'Old password & new password are required'});
        }
        const userRepository = AppDataSource.getRepository(Users);
        let user: Users;
        try{
            user = await userRepository.findOneByOrFail(id);
        }catch(error){
            res.status(400).json({message: error + 'Something goes wrong!'});
        }
        if(!user.checkPassword(oldPassword)){
            return res.status(401).json({message: 'Check your old password'}); 
        }
        user.password = newPassword;
        const validationOps = {validationError: {target: false, value: false}};
        const errors = await validate(user, validationOps);

        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        user.hashPassword();

        userRepository.save(user);

        res.json({message: 'Password change!'});
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const {username} = req.body;
        if(!username){
            return res.status(400).json({message: 'Username is required!'});
        }
        const message = 'Check your email for a link to reset your password.'
        let verificationLink;
        let emailStatus = 'Ok';
        const userRepository = AppDataSource.getRepository(Users);
        let user: Users;
        try{
            user = await userRepository.findOneOrFail({where: {username}});
            const token = jwt.sign({userId: user.id, username: user.username}, config.jwtSecretReset, {expiresIn: '10m'});
            verificationLink = `http://localhost:4200/new-password/${token}`;
            user.resetToken = token;
        }catch(error){
            return res.json({message});
        }

        try{
            await transporter.sendMail({
                from: '"Forgot password" <hoova.mx@gmail.com',
                to: user.username,
                subject: 'Forgot password',
                html: `
                    <b>Please click on the following link, or paste this into your browser to complete the process:</b>
                    <a href="${verificationLink}">${verificationLink}</a>
                `
            });
        }catch(error){
            emailStatus = error;
            return res.status(400).json({message: 'Something goes wrong!'})
        }

        try{
            await userRepository.save(user);
        }catch(error){
            emailStatus = error;
            return res.status(400).json({message: 'Something goes wrong!'});
        }
        res.json({message, info: emailStatus});
    }

    static createNewPassword = async (req: Request, res: Response) => {
        const { newPassword } = req.body;
        const resetToken = req.headers.reset as string;
        if(!(resetToken && newPassword)){
            res.status(400).json({message: 'All the fields are required!'});
        }
        const userRepository = AppDataSource.getRepository(Users);
        let jwtPayload;
        let user: Users;
        try{
            jwtPayload = jwt.verify(resetToken, config.jwtSecretReset);
            user = await userRepository.findOneOrFail({where: {resetToken}});       
        }catch(eror){
            return res.status(401).json({message: 'Something goes wrong!'});
        }
        user.password = newPassword;
        const validationOps = {validationError: {target: false, value: false} };
        const errors = await validate(user, validationOps);
        if(errors.length > 0){
            return res.status(400).json(errors);
        }
        try{
            user.hashPassword();
            await userRepository.save(user);
        }catch(errors){
            return res.status(401).json({mesaage: 'Something goes wrong!'});
        }
        res.json({message: 'Password change!'});
    }

    static refreshToken = async (req: Request, res: Response) => {
        const refreshToken = req.headers.refresh as string;
        if(!refreshToken){
            res.status(400).json({message: 'Something goes wronk!'});
        }
        const userRepository = AppDataSource.getRepository(Users);
        let user: Users;

        try{
            const verifyResult = jwt.verify(refreshToken, config.jwtSecretRefresh);
            const {username} = verifyResult as Users;
            user = await userRepository.findOneOrFail({where: {username}});
        }catch(error){
            return res.status(400).json({message: 'Something goes wrong!'});
        }
        const token = jwt.sign({userId: user.id, username: user.username}, config.jwtSecret, {expiresIn: '120'});
        res.json({message: 'Ok', token});

    }

}

export default AuthController;