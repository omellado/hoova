import { Entity, Column, Unique, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm"
import { IsNotEmpty } from "class-validator";

@Entity()
@Unique(['art'])
export class Art {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    art: string;

    @Column()
    title: string;

    @Column()
    @IsNotEmpty()
    description: string;

    @Column()
    category: string;

    @Column()
    image: string

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @CreateDateColumn()
    updatedAt: Date;

    //@OneToMany(()=> ArtD, (art) => ArtD.Art)
    //ArtD: ArtD[]

}
/*
{
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    "price": 109.95,
    "description": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png",
    "rating": {
        "rate": 3.9,
        "count": 120
    }
}
*/
