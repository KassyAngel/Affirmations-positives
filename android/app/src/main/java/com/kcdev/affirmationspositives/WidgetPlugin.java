package com.kcdev.affirmationspositives;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    /**
     * Appelé depuis React : retourne true si l'app a été ouverte depuis le widget.
     * Consomme le flag (remet à false) pour ne déclencher la pub qu'une seule fois.
     */
    @PluginMethod
    public void checkWidgetOpen(PluginCall call) {
        boolean wasOpenedFromWidget = MainActivity.openedFromWidget;
        // Consomme le flag
        MainActivity.openedFromWidget = false;

        JSObject result = new JSObject();
        result.put("fromWidget", wasOpenedFromWidget);
        call.resolve(result);
    }
}