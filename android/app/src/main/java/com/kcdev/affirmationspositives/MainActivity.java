package com.kcdev.affirmationspositives;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // ✅ Vérifie si l'app est ouverte depuis le widget au démarrage
        handleWidgetIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // ✅ Vérifie si l'app revient au premier plan depuis le widget
        handleWidgetIntent(intent);
    }

    private void handleWidgetIntent(Intent intent) {
        if (intent == null) return;
        if ("widget".equals(intent.getStringExtra("from"))) {
            // ✅ Injecte ?from=widget dans la WebView Capacitor
            // App.tsx lit window.location.search pour déclencher la pub
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "window.history.replaceState(null, '', '/?from=widget');",
                    null
                )
            );
        }
    }
}