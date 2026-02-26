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

    private static final String ACTION_UPDATE_WIDGET = "com.kcdev.affirmationspositives.UPDATE_WIDGET";

    // ─── Messages embarqués (fallback) ────────────────────────────────────────
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
    // Capacitor stocke le localStorage dans "CapacitorStorage"
    // Les clés sont stockées telles quelles (sans préfixe supplémentaire)
    private static final String CAPACITOR_PREFS   = "CapacitorStorage";
    private static final String KEY_CURRENT_QUOTE = "current_widget_quote";

    // Capacitor peut aussi stocker la langue sous ces deux formes — on teste les deux
    private static final String KEY_LANGUAGE_1    = "app_language";
    private static final String KEY_LANGUAGE_2    = "i18nextLng";

    // Prefs internes du widget
    private static final String WIDGET_PREFS  = "QuoteWidgetPrefs";
    private static final String KEY_INDEX     = "fallback_index";
    private static final String KEY_LAST_DAY  = "last_day";

    // ─── onReceive ────────────────────────────────────────────────────────────
    // ✅ FIX PRINCIPAL : setExact() ne se répète pas tout seul.
    //    On intercepte notre action custom ici pour re-planifier le lendemain.
    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            // Mettre à jour tous les widgets
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, QuoteWidget.class));
            for (int id : ids) {
                updateAppWidget(context, mgr, id);
            }
            // ✅ Re-planifier pour le lendemain à 8h
            scheduleNextUpdate(context);
        }
    }

    // ─── Callbacks AppWidget ───────────────────────────────────────────────────
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

    // ─── Mise à jour visuelle du widget ───────────────────────────────────────
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        String lang    = getLanguage(context);
        String message = getMessageToDisplay(context, lang);
        String title   = "fr".equals(lang) ? "✨ Message du jour" : "✨ Message of the day";

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_quote, message);

        // Clic → ouvre l'app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_quote, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    // ─── Message à afficher ────────────────────────────────────────────────────
    // Priorité :
    //   1) Quote sauvegardée par notification-service.ts dans CapacitorStorage
    //   2) Message embarqué du jour (fallback sans app ouverte)
    private static String getMessageToDisplay(Context context, String lang) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(
                CAPACITOR_PREFS, Context.MODE_PRIVATE
            );
            String raw = prefs.getString(KEY_CURRENT_QUOTE, null);
            if (raw != null && !raw.isEmpty()) {
                // Capacitor encapsule les valeurs localStorage avec des guillemets JSON.
                // notification-service.ts stocke maintenant le texte BRUT (plus d'objet JSON),
                // donc on reçoit soit : "texte brut" → avec guillemets Capacitor
                // soit (ancienne version) : "{\"body\":\"...\"}" → on gère les deux
                raw = raw.trim();

                // Cas 1 : string Capacitor entre guillemets → "Vous êtes..."
                if (raw.startsWith("\"") && raw.endsWith("\"") && !raw.contains("{")) {
                    String text = raw.substring(1, raw.length() - 1)
                                    .replace("\\\"", "\"")
                                    .replace("\\n", "\n")
                                    .trim();
                    if (!text.isEmpty()) return text;
                }

                // Cas 2 : ancienne version objet JSON {body: "..."}
                if (raw.contains("{")) {
                    // Retirer éventuels guillemets Capacitor externes
                    if (raw.startsWith("\"")) raw = raw.substring(1, raw.length() - 1)
                                                       .replace("\\\"", "\"");
                    JSONObject json = new JSONObject(raw);
                    String body = json.optString("body", "").trim();
                    if (!body.isEmpty()) return body;
                }

                // Cas 3 : texte vraiment brut (sans guillemets)
                if (!raw.isEmpty()) return raw;
            }
        } catch (Exception ignored) {}

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

    // ─── Langue ───────────────────────────────────────────────────────────────
    private static String getLanguage(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(
                CAPACITOR_PREFS, Context.MODE_PRIVATE
            );
            // Tester les deux clés possibles
            for (String key : new String[]{KEY_LANGUAGE_1, KEY_LANGUAGE_2}) {
                String lang = prefs.getString(key, null);
                if (lang != null && !lang.isEmpty()) {
                    lang = lang.replace("\"", "").trim();
                    if (lang.startsWith("fr")) return "fr";
                    if (lang.startsWith("en")) return "en";
                }
            }
        } catch (Exception ignored) {}
        return "fr"; // défaut
    }

    // ─── Planification quotidienne à 8h ──────────────────────────────────────
    // ✅ Utilise notre ACTION custom (pas ACTION_APPWIDGET_UPDATE)
    //    pour que onReceive() puisse intercepter et re-planifier
    private static void scheduleNextUpdate(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, QuoteWidget.class);
        intent.setAction(ACTION_UPDATE_WIDGET); // ✅ action custom

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Prochaine 8h00
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 8);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis()) {
            cal.add(Calendar.DAY_OF_YEAR, 1);
        }

        try {
            // setExactAndAllowWhileIdle : se déclenche même en Doze mode (Android 6+)
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                cal.getTimeInMillis(),
                pendingIntent
            );
        } catch (SecurityException e) {
            alarmManager.set(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pendingIntent);
        }
    }

    private static void cancelUpdates(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, QuoteWidget.class);
        intent.setAction(ACTION_UPDATE_WIDGET);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        alarmManager.cancel(pendingIntent);
    }
}