import path from 'node:path';

export function rendererUrlFromArg() {
  const flag = process.argv.find((arg) => arg.startsWith('--renderer-url='));
  return (
    flag?.slice('--renderer-url='.length) ?? process.env.ELECTRON_RENDERER_URL
  );
}

export function isDevSession() {
  return Boolean(rendererUrlFromArg());
}

export function packagedRendererRoot(appPath: string) {
  return path.join(appPath, 'out');
}

export function applyDevRuntimeFlags() {
  if (!isDevSession()) {
    return;
  }
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}
