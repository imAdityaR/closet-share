import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: integer('id').primaryKey(),
  productDisplay: text('productDisplay').notNull(),
  gender: text('gender'),
  masterCategory: text('masterCategory'),
  subCategory: text('subCategory'),
  articleType: text('articleType'),
  baseColour: text('baseColour'),
  season: text('season'),
  year: integer('year'),
  usage: text('usage'),
  rentalPricePerDay: integer('rentalPricePerDay'),
  securityDeposit: integer('securityDeposit'),
  imageUrl: text('imageUrl'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wishlist = pgTable('wishlist', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: [table.userId, table.productId],
}));

export const cart = pgTable('cart', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: [table.userId, table.productId],
}));

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending'),
  totalPaid: integer('total_paid').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  rentalDays: integer('rental_days').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: [table.orderId, table.productId],
}));