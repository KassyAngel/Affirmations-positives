package com.kcdev.affirmationspositives;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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
 * ✅ 6 citations par jour : 2 matin / 2 midi / 2 soir
 *    - Slot A = jour pair   (DAY_OF_YEAR % 2 == 0)
 *    - Slot B = jour impair (DAY_OF_YEAR % 2 == 1)
 *    - Index calculé avec DAY_OF_YEAR → stable toute la journée, change chaque jour
 * ✅ Mise à jour toutes les 4h (6h / 10h / 14h / 18h / 22h)
 * ✅ Thread séparé pour la lecture JSON (fix Samsung main thread timeout)
 * ✅ Fallback hardcodé si tout échoue → widget jamais noir
 */
public class QuoteWidget extends AppWidgetProvider {

    private static final String TAG = "QuoteWidget";
    private static final String ACTION_UPDATE_WIDGET = "com.kcdev.affirmationspositives.UPDATE_WIDGET";

    // Heures de mise à jour : 6h, 10h, 14h, 18h, 22h
    // → 2 citations matin (6h + 10h), 2 midi (14h), 2 soir (18h + 22h)
    private static final int[] UPDATE_HOURS = { 6, 10, 14, 18, 22 };

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
    private static final String[] QUOTE_KEYS = {
        "_cap_current_widget_quote", "current_widget_quote",
    };
    private static final String[] LANG_KEYS = {
        "_cap_app_language", "_cap_i18nextLng", "app_language", "i18nextLng",
    };
    private static final String WIDGET_PREFS = "QuoteWidgetPrefs";
    private static final String KEY_INDEX    = "fallback_index";
    private static final String KEY_LAST_DAY = "last_day";

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
                scheduleNextUpdate(appCtx);
            }).start();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        final Context appCtx = context.getApplicationContext();
        new Thread(() -> {
            for (int id : appWidgetIds) updateAppWidget(appCtx, appWidgetManager, id);
            scheduleNextUpdate(appCtx);
        }).start();
    }

    @Override public void onEnabled(Context context)  { scheduleNextUpdate(context); }
    @Override public void onDisabled(Context context) { cancelUpdates(context); }

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
            Log.d(TAG, "Widget OK : " + message.substring(0, Math.min(40, message.length())));

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
        if (hour < 12) return fr ? "✨ PENSÉE DU MATIN"  : "✨ MORNING THOUGHT";
        if (hour < 18) return fr ? "☀️ MESSAGE DU JOUR"  : "☀️ DAILY MESSAGE";
        return                     fr ? "🌙 PENSÉE DU SOIR"  : "🌙 EVENING THOUGHT";
    }

    // ─── Sélection de la citation ─────────────────────────────────────────────
    //
    //  Logique 6 citations/jour :
    //
    //  On découpe les 24h en 5 slots (UPDATE_HOURS) → 2 par grande période :
    //    6h  → matin  slot A  (index = dayOfYear * 2)
    //   10h  → matin  slot B  (index = dayOfYear * 2 + 1)
    //   14h  → midi   slot A  (index = dayOfYear * 2)
    //   18h  → soir   slot A  (index = dayOfYear * 2)
    //   22h  → soir   slot B  (index = dayOfYear * 2 + 1)
    //
    //  "slot A/B" = on alterne l'index dans le tableau JSON selon l'heure
    //  pour que les deux citations de la même période soient différentes.

    private static String getMessageToDisplay(Context context, String lang) {
        // 1. CapacitorStorage (citation écrite par l'app React)
        try {
            Context storageCtx = context;
            try { storageCtx = context.createDeviceProtectedStorageContext(); } catch (Exception ignored) {}

            SharedPreferences prefs = storageCtx.getSharedPreferences(CAPACITOR_PREFS, Context.MODE_PRIVATE);
            String raw = null;
            for (String key : QUOTE_KEYS) {
                raw = prefs.getString(key, null);
                if (raw != null && !raw.isEmpty()) break;
            }

            if (raw != null && !raw.isEmpty()) {
                raw = raw.trim();
                if (raw.startsWith("\"") && raw.endsWith("\"") && !raw.contains("{")) {
                    String text = raw.substring(1, raw.length() - 1)
                                    .replace("\\\"", "\"").replace("\\n", "\n").trim();
                    if (!text.isEmpty()) return text;
                }
                if (raw.contains("{")) {
                    String cleaned = raw.startsWith("\"")
                        ? raw.substring(1, raw.length() - 1).replace("\\\"", "\"") : raw;
                    JSONObject json = new JSONObject(cleaned);
                    for (String field : new String[]{lang, "body", "text"}) {
                        String v = json.optString(field, "").trim();
                        if (!v.isEmpty()) return v;
                    }
                }
                if (!raw.startsWith("{")) return raw;
            }
        } catch (Exception e) {
            Log.w(TAG, "CapacitorStorage : " + e.getMessage());
        }

        // 2. quotes.json depuis les assets
        try {
            String quote = loadFromAssetsJson(context, lang);
            if (quote != null && !quote.isEmpty()) return quote;
        } catch (Exception e) {
            Log.w(TAG, "quotes.json : " + e.getMessage());
        }

        // 3. Fallback hardcodé
        return getDailyFallbackMessage(context, lang);
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

        Calendar cal    = Calendar.getInstance();
        int hour        = cal.get(Calendar.HOUR_OF_DAY);
        int dayOfYear   = cal.get(Calendar.DAY_OF_YEAR);

        // Période
        String period = hour < 12 ? "morning" : (hour < 18 ? "noon" : "evening");

        JSONArray quotes = root.has(period)
            ? root.getJSONArray(period)
            : root.has("morning") ? root.getJSONArray("morning") : null;

        if (quotes == null || quotes.length() == 0) return null;

        // ✅ 2 citations par période :
        //    slot A (6h, 14h, 18h) → index pair   du jour
        //    slot B (10h, 22h)     → index impair  du jour
        boolean slotB = (hour == 10 || hour == 22);
        int baseIndex = (dayOfYear * 2) % quotes.length();
        int index     = slotB
            ? (baseIndex + 1) % quotes.length()
            : baseIndex;

        JSONObject quoteObj = quotes.getJSONObject(index);

        // Format nouveau : {"fr":"...","en":"..."}
        String fromLang = quoteObj.optString(lang, "").trim();
        if (!fromLang.isEmpty()) return fromLang;

        // Anciens formats
        for (String f : new String[]{"text", "body"}) {
            String v = quoteObj.optString(f, "").trim();
            if (!v.isEmpty()) return v;
        }
        return null;
    }

    // ─── Fallback rotatif ─────────────────────────────────────────────────────

    private static String getDailyFallbackMessage(Context context, String lang) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE);
            int today   = Calendar.getInstance().get(Calendar.DAY_OF_YEAR);
            int lastDay = prefs.getInt(KEY_LAST_DAY, -1);
            int index   = prefs.getInt(KEY_INDEX, 0);
            String[] messages = "fr".equals(lang) ? MESSAGES_FR : MESSAGES_EN;
            if (today != lastDay) {
                index = (index + 1) % messages.length;
                prefs.edit().putInt(KEY_INDEX, index).putInt(KEY_LAST_DAY, today).apply();
            }
            return messages[index];
        } catch (Exception e) {
            return "fr".equals(lang)
                ? "Vous êtes capable de choses extraordinaires."
                : "You are capable of extraordinary things.";
        }
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

    // ─── Alarme — prochaine heure de mise à jour ──────────────────────────────

    private static void scheduleNextUpdate(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Trouver la prochaine heure dans UPDATE_HOURS
            Calendar now  = Calendar.getInstance();
            Calendar next = Calendar.getInstance();
            int currentHour = now.get(Calendar.HOUR_OF_DAY);

            int nextHour = -1;
            for (int h : UPDATE_HOURS) {
                if (h > currentHour) { nextHour = h; break; }
            }
            if (nextHour == -1) {
                // Après 22h → première heure du lendemain (6h)
                next.add(Calendar.DAY_OF_YEAR, 1);
                nextHour = UPDATE_HOURS[0];
            }

            next.set(Calendar.HOUR_OF_DAY, nextHour);
            next.set(Calendar.MINUTE, 0);
            next.set(Calendar.SECOND, 0);
            next.set(Calendar.MILLISECOND, 0);

            try {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), pi);
            } catch (SecurityException e) {
                am.set(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), pi);
            }

            Log.d(TAG, "Prochaine mise à jour widget : " + nextHour + "h");

        } catch (Exception e) {
            Log.e(TAG, "scheduleNextUpdate : " + e.getMessage());
        }
    }

    private static void cancelUpdates(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
        } catch (Exception e) {
            Log.e(TAG, "cancelUpdates : " + e.getMessage());
        }
    }
}