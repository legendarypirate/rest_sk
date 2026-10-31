import {
  RESOURCE_ACTIONS,
  STANDARD_RESOURCE_ACTIONS,
} from '@packages/types';

export const RESOURCE_ACTION_LABELS: Record<string, string> = {
  read: 'Унших',
  add: 'Нэмэх',
  edit: 'Засах',
  print: 'Хэвлэх',
  export: 'Экспорт',
  import: 'Импорт',
  delete: 'Устгах',
  list: 'Жагсаалт',
  view: 'Харах',
  write: 'Бичилт',
  manage: 'Удирдах',
  approve: 'Батлах',
  reject: 'Татгалзах',
  assign: 'Оноох',
  restore: 'Сэргээх',
  archive: 'Архивлах',
  download: 'Татах',
  upload: 'Оруулах',
  share: 'Хуваалцах',
  impersonate: 'Төлөөлөн нэвтрэх',
};

export const RESOURCE_ACTION_HINTS: Record<string, string> = {
  read: 'Цэс болон жагсаалтыг харах. Бусад үйлдэл сонгоход автоматаар олгоно.',
  add: 'Шинэ бичлэг үүсгэх.',
  edit: 'Одоо байгаа бичлэгийг засах.',
  print: 'Хэвлэх, хэвлэх хуудас гаргах.',
  export: 'Өгөгдөл файл руу гаргах.',
  import: 'Файлнаас өгөгдөл оруулах.',
  delete: 'Бичлэг устгах.',
  list: 'Жагсаалт харах.',
  view: 'Дэлгэрэнгүй харах.',
  write:
    'Нэмэх, засах, устгахыг нэгтгэсэн хуучин эрх. Оронд нь Нэмэх/Засах/Устгахыг ашиглана.',
  manage:
    'Энэ нөөцийг бүхэлд нь тохируулах: нэмэх, засах, устгах, зөвшөөрөл оноох. Унших нь зөвхөн харна.',
  approve: 'Хүсэлт батлах.',
  reject: 'Хүсэлт татгалзах.',
  assign: 'Системийн эрх эсвэл хариуцагч оноох.',
  restore: 'Устгасныг сэргээх.',
  archive: 'Архивлах.',
  download: 'Файл татах.',
  upload: 'Файл оруулах.',
  share: 'Хуваалцах.',
  impersonate:
    'Өөр хэрэглэгчээр нэвтэрч, түүний эрхээр системтэй ажиллах (дэмжлэг). Одоогоор энэ үйлдэл холбогдоогүй — чек хийгээд хэрэглэгчээр нэвтэрч болохгүй.',
};

export const RESOURCE_ACTION_OPTIONS = RESOURCE_ACTIONS.map((value) => ({
  value,
  label: RESOURCE_ACTION_LABELS[value] ?? value,
}));

export const DEFAULT_RESOURCE_ACTIONS = [...STANDARD_RESOURCE_ACTIONS];

export function resourceActionLabel(action: string) {
  return RESOURCE_ACTION_LABELS[action] ?? action;
}

export function resourceActionHint(action: string) {
  return RESOURCE_ACTION_HINTS[action];
}

export function mergeResourceActionOptions(selected: string[]) {
  const known = new Set<string>(
    RESOURCE_ACTION_OPTIONS.map((option) => option.value),
  );
  const extras = selected
    .filter((action) => !known.has(action))
    .map((action) => ({
      value: action,
      label: resourceActionLabel(action),
    }));

  return extras.length > 0
    ? [...RESOURCE_ACTION_OPTIONS, ...extras]
    : RESOURCE_ACTION_OPTIONS;
}
