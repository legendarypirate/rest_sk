export const KIOSK_ROUTES = {
  welcome: '/',
  menu: '/menu/',
  cart: '/cart/',
  payment: '/payment/',
  receipt: '/receipt/',
  qr: '/qr/',
  done: '/done/',
} as const;

export function menuHref(service: 'DINE_IN' | 'TAKEAWAY') {
  return `${KIOSK_ROUTES.menu}?service=${service}`;
}
