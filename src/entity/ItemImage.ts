import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Item } from './Item';

@Entity()
export class ItemImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  url: string;

  @ManyToOne(type => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_item_id' })
  item: Item;

  @Column('uuid')
  fk_item_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
