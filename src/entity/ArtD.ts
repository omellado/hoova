import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { Art } from "./Arts"

@Entity()
export class Opcion {
    @PrimaryGeneratedColumn()
    art: string

    @Column()
    url: string

    @ManyToOne(() => Art, (art) => art.id)
    id: number
}