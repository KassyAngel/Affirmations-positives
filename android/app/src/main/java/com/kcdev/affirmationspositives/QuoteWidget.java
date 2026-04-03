package com.kcdev.affirmationspositives;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;

/**
 * QuoteWidget.java
 *
 * ✅ Citation calculée DIRECTEMENT depuis heure + jour — aucune dépendance aux alarmes
 * ✅ 4 tranches horaires : matin (6-11h), midi (12-17h), soir (18-21h), nuit (22-5h)
 * ✅ Dans chaque tranche : 2 citations alternent (pair/impair selon dayOfYear)
 *    → 8 citations différentes par jour possibles
 * ✅ updatePeriodMillis=1800000 dans widget_info.xml → Android appelle onUpdate toutes les 30min
 *    → le widget se met à jour naturellement sans alarme à gérer
 * ✅ Thread séparé pour lecture JSON (fix Samsung main thread timeout)
 * ✅ Fallback hardcodé si tout échoue → widget jamais noir
 */
public class QuoteWidget extends AppWidgetProvider {

    private static final String TAG = "QuoteWidget";
    private static final String ACTION_UPDATE_WIDGET = "com.kcdev.affirmationspositives.UPDATE_WIDGET";

    private static final String[] MESSAGES_FR = {
        "Vous êtes plus fort(e) que vous ne le pensez.",
        "Chaque jour est une nouvelle opportunité de grandir.",
        "Vous méritez tout le bonheur du monde.",
        "Votre potentiel est illimité.",
        "Croyez en vous, vous pouvez tout accomplir.",
        "La persévérance est la clé du succès.",
        "Vous avez la force d'affronter n'importe quel défi.",
        "Chaque petit pas vous rapproche de vos rêves.",
        "Votre valeur ne dépend pas de l'opinion des autres.",
        "Aujourd'hui est le meilleur jour pour commencer.",
        "Vous êtes capable de choses extraordinaires.",
        "La confiance en soi se construit jour après jour.",
    };

    private static final String[] MESSAGES_EN = {
        "You are stronger than you think.",
        "Every day is a new opportunity to grow.",
        "You deserve all the happiness in the world.",
        "Your potential is unlimited.",
        "Believe in yourself, you can achieve anything.",
        "Perseverance is the key to success.",
        "You have the strength to face any challenge.",
        "Every small step brings you closer to your dreams.",
        "Your worth doesn't depend on others' opinions.",
        "Today is the best day to start.",
        "You are capable of extraordinary things.",
        "Self-confidence is built day by day.",
    };

    private static final String   CAPACITOR_PREFS = "CapacitorStorage";
    private static final String[] LANG_KEYS = {
        "_cap_app_language", "_cap_i18nextLng", "app_language", "i18nextLng",
    };

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, QuoteWidget.class));
            final Context appCtx = context.getApplicationContext();
            new Thread(() -> {
                for (int id : ids) updateAppWidget(appCtx, mgr, id);
            }).start();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        final Context appCtx = context.getApplicationContext();
        new Thread(() -> {
            for (int id : appWidgetIds) updateAppWidget(appCtx, appWidgetManager, id);
        }).start();
    }

    @Override
    public void onEnabled(Context context) {
        // ✅ Alarme de secours — au cas où updatePeriodMillis ne suffit pas
        scheduleAlarm(context);
    }

    @Override
    public void onDisabled(Context context) {
        cancelAlarm(context);
    }

    // ─── Mise à jour principale ───────────────────────────────────────────────

    static void updateAppWidget(Context context, AppWidgetManager mgr, int widgetId) {
        try {
            String lang    = getLanguage(context);
            String message = getMessageToDisplay(context, lang);
            String title   = getTitleForHour(lang);

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
            views.setTextViewText(R.id.widget_title, title);
            views.setTextViewText(R.id.widget_quote, message);

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("from", "widget");
            PendingIntent pi = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_quote, pi);

            mgr.updateAppWidget(widgetId, views);
            Log.d(TAG, "Widget mis à jour : " + message.substring(0, Math.min(50, message.length())));

        } catch (Exception e) {
            Log.e(TAG, "updateAppWidget : " + e.getMessage(), e);
            try {
                RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
                fallback.setTextViewText(R.id.widget_title, "Message du jour");
                fallback.setTextViewText(R.id.widget_quote, "Vous êtes capable de choses extraordinaires.");
                mgr.updateAppWidget(widgetId, fallback);
            } catch (Exception e2) {
                Log.e(TAG, "Erreur fallback : " + e2.getMessage(), e2);
            }
        }
    }

    // ─── Titre selon l'heure ──────────────────────────────────────────────────

    private static String getTitleForHour(String lang) {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        boolean fr = "fr".equals(lang);
        if (hour >= 6  && hour < 12) return fr ? "✨ PENSÉE DU MATIN"  : "✨ MORNING THOUGHT";
        if (hour >= 12 && hour < 18) return fr ? "☀️ MESSAGE DU JOUR"  : "☀️ DAILY MESSAGE";
        if (hour >= 18 && hour < 22) return fr ? "🌙 PENSÉE DU SOIR"   : "🌙 EVENING THOUGHT";
        return                               fr ? "🌟 AFFIRMATION"       : "🌟 AFFIRMATION";
    }

    // ─── Sélection de la citation ─────────────────────────────────────────────
    //
    //  ✅ LOGIQUE SANS ALARME :
    //
    //  On découpe la journée en 4 tranches :
    //    Matin  (6h-11h)  → période "morning"
    //    Midi   (12h-17h) → période "noon"
    //    Soir   (18h-21h) → période "evening"
    //    Nuit   (22h-5h)  → période "morning" (affirmation de préparation)
    //
    //  Dans chaque tranche : 2 citations alternent selon dayOfYear pair/impair
    //    → jour pair   : baseIndex = (dayOfYear / 2) % longueur
    //    → jour impair : baseIndex = (dayOfYear / 2 + 1) % longueur
    //
    //  Résultat : la citation change automatiquement à 6h, 12h, 18h, 22h
    //  sans aucune alarme — juste en lisant l'heure courante.

    private static String getMessageToDisplay(Context context, String lang) {
        // Lecture depuis quotes.json en assets (source principale)
        try {
            String quote = loadFromAssetsJson(context, lang);
            if (quote != null && !quote.isEmpty()) return quote;
        } catch (Exception e) {
            Log.w(TAG, "quotes.json : " + e.getMessage());
        }

        // Fallback hardcodé
        return getDailyFallbackMessage(lang);
    }

    // ─── Lecture quotes.json ──────────────────────────────────────────────────

    private static String loadFromAssetsJson(Context context, String lang) throws Exception {
        InputStream is = null;
        for (String path : new String[]{"public/quotes.json", "quotes.json"}) {
            try { is = context.getAssets().open(path); break; } catch (Exception ignored) {}
        }
        if (is == null) return null;

        byte[] buffer = new byte[is.available()];
        is.read(buffer);
        is.close();

        JSONObject root = new JSONObject(new String(buffer, StandardCharsets.UTF_8));

        Calendar cal      = Calendar.getInstance();
        int hour          = cal.get(Calendar.HOUR_OF_DAY);
        int dayOfYear     = cal.get(Calendar.DAY_OF_YEAR);

        // ✅ Période selon l'heure courante
        String period;
        if (hour >= 6 && hour < 12)      period = "morning";
        else if (hour >= 12 && hour < 18) period = "noon";
        else if (hour >= 18 && hour < 22) period = "evening";
        else                              period = "morning"; // 22h-5h → citation de préparation

        JSONArray quotes = null;
        if (root.has(period))     quotes = root.getJSONArray(period);
        else if (root.has("morning")) quotes = root.getJSONArray("morning");

        if (quotes == null || quotes.length() == 0) return null;

        // ✅ Alternance pair/impair selon le jour
        // → 2 citations différentes par tranche horaire par jour
        int half  = quotes.length() / 2;
        int base  = (dayOfYear % 2 == 0)
            ? (dayOfYear / 2) % Math.max(half, 1)
            : (dayOfYear / 2 + 1) % Math.max(half, 1);

        // Décalage pour la tranche soir (pour ne pas répéter la même que matin)
        int offset = 0;
        if (period.equals("noon"))    offset = quotes.length() / 3;
        if (period.equals("evening")) offset = (quotes.length() * 2) / 3;

        int index = (base + offset) % quotes.length();

        JSONObject quoteObj = quotes.getJSONObject(index);

        // Format {"fr":"...","en":"..."}
        String fromLang = quoteObj.optString(lang, "").trim();
        if (!fromLang.isEmpty()) return fromLang;

        // Anciens formats
        for (String f : new String[]{"text", "body"}) {
            String v = quoteObj.optString(f, "").trim();
            if (!v.isEmpty()) return v;
        }
        return null;
    }

    // ─── Fallback statique (calculé depuis heure+jour, pas de SharedPreferences) ──

    private static String getDailyFallbackMessage(String lang) {
        Calendar cal  = Calendar.getInstance();
        int hour      = cal.get(Calendar.HOUR_OF_DAY);
        int dayOfYear = cal.get(Calendar.DAY_OF_YEAR);

        String[] messages = "fr".equals(lang) ? MESSAGES_FR : MESSAGES_EN;

        // Décalage selon tranche horaire → citation différente à chaque tranche
        int slotOffset = 0;
        if (hour >= 6  && hour < 12) slotOffset = 0;
        if (hour >= 12 && hour < 18) slotOffset = messages.length / 3;
        if (hour >= 18 && hour < 22) slotOffset = (messages.length * 2) / 3;

        int index = ((dayOfYear % (messages.length / 2)) + slotOffset) % messages.length;
        return messages[index];
    }

    // ─── Langue ───────────────────────────────────────────────────────────────

    private static String getLanguage(Context context) {
        try {
            Context storageCtx = context;
            try { storageCtx = context.createDeviceProtectedStorageContext(); } catch (Exception ignored) {}
            SharedPreferences prefs = storageCtx.getSharedPreferences(CAPACITOR_PREFS, Context.MODE_PRIVATE);
            for (String key : LANG_KEYS) {
                String l = prefs.getString(key, null);
                if (l != null && !l.isEmpty()) {
                    l = l.replace("\"", "").trim();
                    if (l.startsWith("fr")) return "fr";
                    if (l.startsWith("en")) return "en";
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "getLanguage : " + e.getMessage());
        }
        return "fr";
    }

    // ─── Alarme de secours (complément à updatePeriodMillis) ─────────────────

    private static void scheduleAlarm(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 1, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Alarme toutes les 2h — complément à updatePeriodMillis
            long interval = 2 * 60 * 60 * 1000L;
            long trigger  = System.currentTimeMillis() + interval;

            try {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi);
            } catch (SecurityException e) {
                am.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    trigger,
                    interval,
                    pi
                );
            }

            Log.d(TAG, "Alarme de secours planifiée dans 2h");
        } catch (Exception e) {
            Log.e(TAG, "scheduleAlarm : " + e.getMessage());
        }
    }

    private static void cancelAlarm(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 1, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
        } catch (Exception e) {
            Log.e(TAG, "cancelAlarm : " + e.getMessage());
        }
    }
}