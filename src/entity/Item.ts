import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Category } from './Category';
import { Site } from './Site';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  brand: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  url: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(type => Site)
  @JoinColumn({ name: 'fk_site_id' })
  site: Site;

  @Column('uuid')
  fk_site_id: string;

  @ManyToOne(type => Category)
  @JoinColumn({ name: 'fk_category_id' })
  category: Category;

  @Column('uuid')
  fk_category_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
