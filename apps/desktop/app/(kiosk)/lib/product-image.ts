const DRINK_CATEGORY = 'Ундаа';

export function isDrinkCategory(category: string) {
  return category.trim().toLowerCase() === DRINK_CATEGORY.toLowerCase();
}

export function productImageSrc(category: string, imageUrl?: string | null) {
  if (imageUrl) {
    return imageUrl;
  }
  return isDrinkCategory(category) ? '/drink.jpg' : '/image.jpg';
}
