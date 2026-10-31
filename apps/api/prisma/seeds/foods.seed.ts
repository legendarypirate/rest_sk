import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AvailabilityStatus,
  FoodType,
  RecordStatus,
} from '../../src/generated/prisma/client.js';

import type { PrismaClient } from '../../src/generated/prisma/client.js';

const FOODS_CSV = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/foods.csv',
);

const CATEGORIES = [
  { code: 'C1', name: '1-р хоол', sortOrder: 1 },
  { code: 'C2', name: '2-р хоол', sortOrder: 2 },
  { code: 'PIECE', name: 'Ширхэгийн хоол', sortOrder: 3 },
  { code: 'DRINK', name: 'Уух зүйлс', sortOrder: 4 },
] as const;

type FoodRow = {
  code: string;
  name: string;
  categoryName: string;
  foodType: FoodType;
  price: string;
};

function parseFoodType(value: string): FoodType {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (
    normalized === 'e food' ||
    normalized === 'а хоол' ||
    normalized === 'а-хоол' ||
    normalized === 'a food'
  ) {
    return FoodType.E_FOOD;
  }
  return FoodType.ORDERED;
}

function parseFoodsCsv(contents: string): FoodRow[] {
  const lines = contents
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const [, ...rows] = lines;

  return rows.map((line, index) => {
    const [code, name, category, type, price] = line
      .split(',')
      .map((part) => part.trim());
    if (!code || !name || !category || !type || !price) {
      throw new Error(`Invalid foods.csv row ${index + 2}: ${line}`);
    }
    return {
      code,
      name,
      categoryName: category,
      foodType: parseFoodType(type),
      price,
    };
  });
}

async function ensureCategory(
  prisma: PrismaClient,
  restaurantId: string,
  spec: (typeof CATEGORIES)[number],
) {
  const existing = await prisma.menuCategory.findFirst({
    where: { restaurantId, code: spec.code, deletedAt: null },
  });
  if (existing) {
    return prisma.menuCategory.update({
      where: { id: existing.id },
      data: {
        name: spec.name,
        sortOrder: spec.sortOrder,
        status: RecordStatus.ACTIVE,
        availability: AvailabilityStatus.AVAILABLE,
        rowVersion: { increment: 1 },
      },
    });
  }
  return prisma.menuCategory.create({
    data: {
      restaurantId,
      code: spec.code,
      name: spec.name,
      sortOrder: spec.sortOrder,
      status: RecordStatus.ACTIVE,
      availability: AvailabilityStatus.AVAILABLE,
    },
  });
}

export async function seedFoods(prisma: PrismaClient) {
  const foods = parseFoodsCsv(readFileSync(FOODS_CSV, 'utf8'));

  const restaurant =
    (await prisma.restaurant.findFirst({ where: { deletedAt: null } })) ??
    (await prisma.restaurant.create({
      data: {
        code: 'KHONGOR',
        name: 'Хонгор',
        legalName: 'Хонгор',
        timezone: 'Asia/Ulaanbaatar',
        locale: 'mn',
        currency: 'MNT',
        status: RecordStatus.ACTIVE,
        setting: { create: { currency: 'MNT', kioskEnabled: true } },
      },
    }));

  const categories = await Promise.all(
    CATEGORIES.map((spec) => ensureCategory(prisma, restaurant.id, spec)),
  );
  const categoryByName = new Map(categories.map((row) => [row.name, row]));

  const skuSet = new Set(foods.map((food) => food.code));

  for (const [index, food] of foods.entries()) {
    const category = categoryByName.get(food.categoryName);
    if (!category) {
      throw new Error(
        `Unknown category "${food.categoryName}" for ${food.code}`,
      );
    }

    const existing = await prisma.menuItem.findUnique({
      where: {
        categoryId_sku: { categoryId: category.id, sku: food.code },
      },
    });

    if (existing) {
      await prisma.menuItem.update({
        where: { id: existing.id },
        data: {
          name: food.name,
          foodType: food.foodType,
          currency: 'MNT',
          price: food.price,
          sortOrder: index,
          status: RecordStatus.ACTIVE,
          availability: AvailabilityStatus.AVAILABLE,
          deletedAt: null,
          rowVersion: { increment: 1 },
        },
      });
      continue;
    }

    await prisma.menuItem.create({
      data: {
        categoryId: category.id,
        sku: food.code,
        name: food.name,
        foodType: food.foodType,
        currency: 'MNT',
        price: food.price,
        sortOrder: index,
        status: RecordStatus.ACTIVE,
        availability: AvailabilityStatus.AVAILABLE,
      },
    });
  }

  await prisma.menuItem.updateMany({
    where: {
      deletedAt: null,
      sku: { notIn: [...skuSet] },
      category: { restaurantId: restaurant.id },
    },
    data: { deletedAt: new Date() },
  });

  await prisma.menuCategory.updateMany({
    where: {
      restaurantId: restaurant.id,
      deletedAt: null,
      code: { notIn: CATEGORIES.map((row) => row.code) },
    },
    data: { deletedAt: new Date() },
  });

  return foods.length;
}
