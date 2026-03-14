package com.kcdev.affirmationspositives;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Flag statique : survit au chargement de la WebView
    public static boolean openedFromWidget = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetPlugin.class);
        super.onCreate(savedInstanceState);
        checkWidgetIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        checkWidgetIntent(intent);

        // Si React est déjà chargé, on injecte directement
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() ->
                getBridge().getWebView().evaluateJavascript(
                    "if(window.__onWidgetOpen) window.__onWidgetOpen();",
                    null
                )
            );
        }
    }

    private void checkWidgetIntent(Intent intent) {
        if (intent != null && "widget".equals(intent.getStringExtra("from"))) {
            openedFromWidget = true;
        }
    }
}