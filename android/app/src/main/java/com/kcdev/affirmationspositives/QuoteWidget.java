package com.kcdev.affirmationspositives;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Calendar;

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
        "Votre sourire peut changer le monde qui vous entoure.",
        "Osez rêver grand et agir en conséquence.",
        "Chaque épreuve vous rend plus sage et plus fort(e).",
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
        "Your smile can change the world around you.",
        "Dare to dream big and act accordingly.",
        "Every trial makes you wiser and stronger.",
    };

    private static final String CAPACITOR_PREFS = "CapacitorStorage";

    private static final String[] QUOTE_KEYS = {
        "_cap_current_widget_quote",
        "current_widget_quote",
    };

    private static final String[] LANG_KEYS = {
        "_cap_app_language",
        "_cap_i18nextLng",
        "app_language",
        "i18nextLng",
    };

    private static final String WIDGET_PREFS = "QuoteWidgetPrefs";
    private static final String KEY_INDEX    = "fallback_index";
    private static final String KEY_LAST_DAY = "last_day";

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, QuoteWidget.class));
            for (int id : ids) {
                updateAppWidget(context, mgr, id);
            }
            scheduleNextUpdate(context);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, id);
        }
        scheduleNextUpdate(context);
    }

    @Override
    public void onEnabled(Context context) {
        scheduleNextUpdate(context);
    }

    @Override
    public void onDisabled(Context context) {
        cancelUpdates(context);
    }

    // ─── Mise à jour — bloc entier protégé par try/catch ─────────────────────
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            String lang    = getLanguage(context);
            String message = getMessageToDisplay(context, lang);
            String title   = "fr".equals(lang) ? "Message du jour" : "Message of the day";

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
            views.setTextViewText(R.id.widget_title, title);
            views.setTextViewText(R.id.widget_quote, message);

            // ✅ FIX : Intent simple sans Uri custom
            // Uri.parse("https://affirmations/?from=widget") causait une
            // exception silencieuse sur Samsung et MIUI (domaine invalide).
            // On utilise un Extra à la place.
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("from", "widget");

            PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_quote, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
            Log.d(TAG, "Widget OK : " + message.substring(0, Math.min(40, message.length())));

        } catch (Exception e) {
            Log.e(TAG, "Erreur updateAppWidget : " + e.getMessage(), e);
            // Fallback minimal — ne peut pas échouer
            try {
                RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
                fallback.setTextViewText(R.id.widget_title, "Message du jour");
                fallback.setTextViewText(R.id.widget_quote, "Vous êtes capable de choses extraordinaires.");
                appWidgetManager.updateAppWidget(appWidgetId, fallback);
            } catch (Exception e2) {
                Log.e(TAG, "Erreur fallback : " + e2.getMessage(), e2);
            }
        }
    }

    // ─── Message ──────────────────────────────────────────────────────────────
    private static String getMessageToDisplay(Context context, String lang) {
        try {
            // ✅ createDeviceProtectedStorageContext — permet de lire les prefs
            // même avant le premier déverrouillage de l'appareil
            Context storageCtx = context;
            try {
                storageCtx = context.createDeviceProtectedStorageContext();
            } catch (Exception ignored) {}

            SharedPreferences prefs = storageCtx.getSharedPreferences(
                CAPACITOR_PREFS, Context.MODE_PRIVATE
            );

            String raw = null;
            for (String key : QUOTE_KEYS) {
                raw = prefs.getString(key, null);
                if (raw != null && !raw.isEmpty()) break;
            }

            if (raw != null && !raw.isEmpty()) {
                raw = raw.trim();

                if (raw.startsWith("\"") && raw.endsWith("\"") && !raw.contains("{")) {
                    String text = raw.substring(1, raw.length() - 1)
                                    .replace("\\\"", "\"")
                                    .replace("\\n", "\n")
                                    .trim();
                    if (!text.isEmpty()) return text;
                }

                if (raw.contains("{")) {
                    if (raw.startsWith("\"")) {
                        raw = raw.substring(1, raw.length() - 1).replace("\\\"", "\"");
                    }
                    JSONObject json = new JSONObject(raw);
                    String body = json.optString("body", "").trim();
                    if (!body.isEmpty()) return body;
                }

                if (!raw.isEmpty()) return raw;
            }
        } catch (Exception e) {
            Log.w(TAG, "getMessageToDisplay : " + e.getMessage());
        }

        return getDailyFallbackMessage(context, lang);
    }

    // ─── Fallback quotidien ───────────────────────────────────────────────────
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
            Log.w(TAG, "getDailyFallbackMessage : " + e.getMessage());
            return "fr".equals(lang)
                ? "Vous êtes capable de choses extraordinaires."
                : "You are capable of extraordinary things.";
        }
    }

    // ─── Langue ───────────────────────────────────────────────────────────────
    private static String getLanguage(Context context) {
        try {
            Context storageCtx = context;
            try {
                storageCtx = context.createDeviceProtectedStorageContext();
            } catch (Exception ignored) {}

            SharedPreferences prefs = storageCtx.getSharedPreferences(
                CAPACITOR_PREFS, Context.MODE_PRIVATE
            );
            for (String key : LANG_KEYS) {
                String lang = prefs.getString(key, null);
                if (lang != null && !lang.isEmpty()) {
                    lang = lang.replace("\"", "").trim();
                    if (lang.startsWith("fr")) return "fr";
                    if (lang.startsWith("en")) return "en";
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "getLanguage : " + e.getMessage());
        }
        return "fr";
    }

    // ─── Alarme quotidienne 8h ────────────────────────────────────────────────
    private static void scheduleNextUpdate(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;
            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 8);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            if (cal.getTimeInMillis() <= System.currentTimeMillis()) {
                cal.add(Calendar.DAY_OF_YEAR, 1);
            }
            try {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
            } catch (SecurityException e) {
                alarmManager.set(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
            }
        } catch (Exception e) {
            Log.e(TAG, "scheduleNextUpdate : " + e.getMessage());
        }
    }

    private static void cancelUpdates(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;
            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            alarmManager.cancel(pi);
        } catch (Exception e) {
            Log.e(TAG, "cancelUpdates : " + e.getMessage());
        }
    }
}