import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn } from "typeorm"
import { MinLength, IsNotEmpty, IsEmail, IsOptional } from "class-validator";
import * as bcrypt from 'bcryptjs';

@Entity()
@Unique(['username'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @MinLength(6)
    @IsEmail()
    @IsNotEmpty()
    username: string;
    //Validate with IsEmail Validator

    @Column()
    @MinLength(6)
    password: string;

    @Column()
    @IsNotEmpty()
    role: string;

    @Column()
    @IsOptional()
    @IsNotEmpty()
    resetToken: string;

    @Column()
    @IsOptional()
    @IsNotEmpty()
    refreshToken: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @CreateDateColumn()
    updatedAt: Date;

    hashPassword(){
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }

    checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    }

}
