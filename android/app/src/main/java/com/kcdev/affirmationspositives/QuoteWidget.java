package com.kcdev.affirmationspositives;

// Fichier : android/app/src/main/java/com/kcdev/affirmationspositives/QuoteWidget.java

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Calendar;

public class QuoteWidget extends AppWidgetProvider {

    // ─── Messages inspirants embarqués (fallback si aucune notif reçue) ────────
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

    // ─── Clés SharedPreferences ────────────────────────────────────────────────
    // Capacitor stocke localStorage dans "CapacitorStorage"
    // notification-service.ts écrit la clé "current_widget_quote" en JSON {title, body}
    private static final String CAPACITOR_PREFS   = "CapacitorStorage";
    private static final String KEY_CURRENT_QUOTE = "current_widget_quote";
    private static final String KEY_LANGUAGE      = "app_language";

    // Prefs internes du widget (fallback)
    private static final String WIDGET_PREFS      = "QuoteWidgetPrefs";
    private static final String KEY_INDEX         = "fallback_index";
    private static final String KEY_LAST_DAY      = "last_day";

    // ─── Callbacks AppWidget ───────────────────────────────────────────────────
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
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

    // ─── Mise à jour d'un widget ───────────────────────────────────────────────
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        String lang    = getLanguage(context);
        String message = getMessageToDisplay(context, lang);
        String title   = "fr".equals(lang) ? "✨ Message du jour" : "✨ Message of the day";

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_quote, message);

        // Clic sur le widget → ouvre l'app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_quote, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // ─── Récupère le message à afficher ───────────────────────────────────────
    // Priorité :
    //   1) Dernier message inspirant envoyé en notification (via notification-service.ts)
    //      → notification-service.ts sauvegarde dans localStorage la clé "current_widget_quote"
    //      → Capacitor stocke localStorage dans SharedPreferences "CapacitorStorage"
    //   2) Message embarqué qui change chaque jour (fallback sans réseau/app)
    private static String getMessageToDisplay(Context context, String lang) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(
                CAPACITOR_PREFS, Context.MODE_PRIVATE
            );

            String jsonRaw = prefs.getString(KEY_CURRENT_QUOTE, null);

            if (jsonRaw != null && !jsonRaw.isEmpty()) {
                JSONObject json = new JSONObject(jsonRaw);
                String body = json.optString("body", "").trim();
                if (!body.isEmpty()) {
                    return body;
                }
            }
        } catch (Exception ignored) {
            // Lecture silencieuse → on passe au fallback
        }

        return getDailyFallbackMessage(context, lang);
    }

    // ─── Message embarqué qui change chaque jour ───────────────────────────────
    private static String getDailyFallbackMessage(Context context, String lang) {
        SharedPreferences prefs = context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE);

        int today   = Calendar.getInstance().get(Calendar.DAY_OF_YEAR);
        int lastDay = prefs.getInt(KEY_LAST_DAY, -1);
        int index   = prefs.getInt(KEY_INDEX, 0);

        String[] messages = "fr".equals(lang) ? MESSAGES_FR : MESSAGES_EN;

        if (today != lastDay) {
            index = (index + 1) % messages.length;
            prefs.edit()
                .putInt(KEY_INDEX, index)
                .putInt(KEY_LAST_DAY, today)
                .apply();
        }

        return messages[index];
    }

    // ─── Lit la langue choisie dans l'app ─────────────────────────────────────
    private static String getLanguage(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(
                CAPACITOR_PREFS, Context.MODE_PRIVATE
            );
            String lang = prefs.getString(KEY_LANGUAGE, null);
            if (lang != null && !lang.isEmpty()) return lang.replace("\"", "");
        } catch (Exception ignored) {}
        return "fr";
    }

    // ─── Planifier mise à jour automatique chaque jour à 8h ──────────────────
    private static void scheduleNextUpdate(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, QuoteWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

        int[] ids = AppWidgetManager.getInstance(context)
            .getAppWidgetIds(new ComponentName(context, QuoteWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
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
            alarmManager.setExact(AlarmManager.RTC, cal.getTimeInMillis(), pendingIntent);
        } catch (SecurityException e) {
            alarmManager.set(AlarmManager.RTC, cal.getTimeInMillis(), pendingIntent);
        }
    }

    private static void cancelUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, QuoteWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        alarmManager.cancel(pendingIntent);
    }
}