import { registerPlugin } from '@capacitor/core';

interface WidgetPluginInterface {
  checkWidgetOpen(): Promise<{ fromWidget: boolean }>;
}

const WidgetPlugin = registerPlugin<WidgetPluginInterface>('WidgetPlugin');

/**
 * Appelle le plugin natif et retourne true si l'app
 * a été ouverte depuis le widget Android.
 * Consomme le flag : un seul appel par session.
 */
export async function checkOpenedFromWidget(): Promise<boolean> {
  try {
    const { fromWidget } = await WidgetPlugin.checkWidgetOpen();
    return fromWidget;
  } catch {
    return false;
  }
}