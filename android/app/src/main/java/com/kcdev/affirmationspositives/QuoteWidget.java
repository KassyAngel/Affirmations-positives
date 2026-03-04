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

public class QuoteWidget extends AppWidgetProvider {

    private static final String TAG = "QuoteWidget";
    private static final String ACTION_UPDATE_WIDGET = "com.kcdev.affirmationspositives.UPDATE_WIDGET";

    private static final String CAPACITOR_PREFS = "CapacitorStorage";
    private static final String[] QUOTE_KEYS = { "_cap_current_widget_quote", "current_widget_quote" };
    private static final String[] LANG_KEYS  = { "_cap_app_language", "_cap_i18nextLng", "app_language", "i18nextLng" };

    private static final String WIDGET_PREFS  = "QuoteWidgetPrefs";
    private static final String KEY_INDEX_M   = "index_morning";
    private static final String KEY_INDEX_N   = "index_noon";
    private static final String KEY_INDEX_E   = "index_evening";
    private static final String KEY_LAST_DAY  = "last_day";

    private static final int SLOT_MORNING = 0; // 08h–11h59
    private static final int SLOT_NOON    = 1; // 12h–18h59
    private static final int SLOT_EVENING = 2; // 19h–07h59

    private static int getCurrentSlot() {
        int h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (h >= 8  && h < 12) return SLOT_MORNING;
        if (h >= 12 && h < 19) return SLOT_NOON;
        return SLOT_EVENING;
    }

    // ─── Cache JSON en mémoire ────────────────────────────────────────────────
    private static JSONObject cachedQuotes = null;

    private static JSONObject loadQuotesJson(Context context) {
        if (cachedQuotes != null) return cachedQuotes;
        try {
            int resId = context.getResources().getIdentifier("quotes", "raw", context.getPackageName());
            if (resId == 0) return null;
            InputStream is = context.getResources().openRawResource(resId);
            byte[] bytes = new byte[is.available()];
            is.read(bytes);
            is.close();
            cachedQuotes = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
            return cachedQuotes;
        } catch (Exception e) {
            Log.e(TAG, "loadQuotesJson : " + e.getMessage());
            return null;
        }
    }

    // ─── onReceive / callbacks ────────────────────────────────────────────────
    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, QuoteWidget.class));
            for (int id : ids) updateAppWidget(context, mgr, id);
            scheduleNextUpdate(context);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) updateAppWidget(context, mgr, id);
        scheduleNextUpdate(context);
    }

    @Override public void onEnabled(Context c)  { scheduleNextUpdate(c); }
    @Override public void onDisabled(Context c) { cancelUpdates(c); }

    // ─── Mise à jour visuelle ─────────────────────────────────────────────────
    static void updateAppWidget(Context context, AppWidgetManager mgr, int appWidgetId) {
        try {
            String lang    = getLanguage(context);
            String message = getMessageToDisplay(context, lang);
            String title   = "fr".equals(lang) ? "Message du jour" : "Message of the day";

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
            views.setTextViewText(R.id.widget_title, title);
            views.setTextViewText(R.id.widget_quote, message);

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("from", "widget");

            PendingIntent pi = PendingIntent.getActivity(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_quote, pi);
            mgr.updateAppWidget(appWidgetId, views);
            Log.d(TAG, "OK slot=" + getCurrentSlot() + " lang=" + lang);

        } catch (Exception e) {
            Log.e(TAG, "updateAppWidget : " + e.getMessage(), e);
            try {
                RemoteViews fb = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
                fb.setTextViewText(R.id.widget_title, "Message du jour");
                fb.setTextViewText(R.id.widget_quote, "Vous êtes capable de choses extraordinaires.");
                mgr.updateAppWidget(appWidgetId, fb);
            } catch (Exception ignored) {}
        }
    }

    // ─── Priorité : citation de l'app → JSON du créneau ─────────────────────
    private static String getMessageToDisplay(Context context, String lang) {
        // 1. Citation sauvegardée par l'app (Home.tsx)
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
                    String t = raw.substring(1, raw.length()-1).replace("\\\"","\"").replace("\\n","\n").trim();
                    if (!t.isEmpty()) return t;
                }
                if (raw.contains("{")) {
                    if (raw.startsWith("\"")) raw = raw.substring(1, raw.length()-1).replace("\\\"","\"");
                    String body = new JSONObject(raw).optString("body","").trim();
                    if (!body.isEmpty()) return body;
                }
                if (!raw.isEmpty()) return raw;
            }
        } catch (Exception e) {
            Log.w(TAG, "prefs read : " + e.getMessage());
        }

        // 2. Citation depuis quotes.json (res/raw/quotes.json)
        return getJsonSlottedQuote(context, lang);
    }

    // ─── Pioche dans quotes.json selon le créneau et l'index du jour ─────────
    private static String getJsonSlottedQuote(Context context, String lang) {
        try {
            JSONObject json = loadQuotesJson(context);
            if (json == null) return getFallback(lang);

            String slotKey = getCurrentSlot() == SLOT_MORNING ? "morning"
                           : getCurrentSlot() == SLOT_NOON    ? "noon"
                           : "evening";

            JSONArray arr = json.getJSONArray(slotKey);
            if (arr.length() == 0) return getFallback(lang);

            // Index du jour — change chaque jour, indépendant par créneau
            SharedPreferences prefs = context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE);
            int today   = Calendar.getInstance().get(Calendar.DAY_OF_YEAR);
            int lastDay = prefs.getInt(KEY_LAST_DAY, -1);

            String indexKey = getCurrentSlot() == SLOT_MORNING ? KEY_INDEX_M
                            : getCurrentSlot() == SLOT_NOON    ? KEY_INDEX_N
                            : KEY_INDEX_E;

            int index = prefs.getInt(indexKey, 0);

            if (today != lastDay) {
                // Nouveau jour : avance tous les index
                int im = (prefs.getInt(KEY_INDEX_M, 0) + 1) % arr.length();
                int in_ = (prefs.getInt(KEY_INDEX_N, 1) + 1) % arr.length();
                int ie  = (prefs.getInt(KEY_INDEX_E, 2) + 1) % arr.length();
                prefs.edit()
                    .putInt(KEY_INDEX_M, im)
                    .putInt(KEY_INDEX_N, in_)
                    .putInt(KEY_INDEX_E, ie)
                    .putInt(KEY_LAST_DAY, today)
                    .apply();
                index = prefs.getInt(indexKey, 0);
            }

            JSONObject q = arr.getJSONObject(index % arr.length());
            String text = "fr".equals(lang) ? q.optString("fr","") : q.optString("en","");
            return text.isEmpty() ? getFallback(lang) : text;

        } catch (Exception e) {
            Log.w(TAG, "getJsonSlottedQuote : " + e.getMessage());
            return getFallback(lang);
        }
    }

    private static String getFallback(String lang) {
        return "fr".equals(lang)
            ? "Vous êtes capable de choses extraordinaires."
            : "You are capable of extraordinary things.";
    }

    // ─── Langue ──────────────────────────────────────────────────────────────
    private static String getLanguage(Context context) {
        try {
            Context storageCtx = context;
            try { storageCtx = context.createDeviceProtectedStorageContext(); } catch (Exception ignored) {}
            SharedPreferences prefs = storageCtx.getSharedPreferences(CAPACITOR_PREFS, Context.MODE_PRIVATE);
            for (String key : LANG_KEYS) {
                String lang = prefs.getString(key, null);
                if (lang != null && !lang.isEmpty()) {
                    lang = lang.replace("\"","").trim();
                    if (lang.startsWith("fr")) return "fr";
                    if (lang.startsWith("en")) return "en";
                }
            }
        } catch (Exception e) { Log.w(TAG, "getLanguage : " + e.getMessage()); }
        return "fr";
    }

    // ─── Planification 8h / 12h / 19h ────────────────────────────────────────
    private static void scheduleNextUpdate(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
            Calendar next = Calendar.getInstance();
            next.set(Calendar.MINUTE, 0);
            next.set(Calendar.SECOND, 0);
            next.set(Calendar.MILLISECOND, 0);

            if      (hour < 8)  { next.set(Calendar.HOUR_OF_DAY, 8); }
            else if (hour < 12) { next.set(Calendar.HOUR_OF_DAY, 12); }
            else if (hour < 19) { next.set(Calendar.HOUR_OF_DAY, 19); }
            else { next.add(Calendar.DAY_OF_YEAR, 1); next.set(Calendar.HOUR_OF_DAY, 8); }

            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            try { am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), pi); }
            catch (SecurityException e) { am.set(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), pi); }

            Log.d(TAG, "Prochain update: " + next.get(Calendar.HOUR_OF_DAY) + "h");
        } catch (Exception e) { Log.e(TAG, "scheduleNextUpdate : " + e.getMessage()); }
    }

    private static void cancelUpdates(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.cancel(pi);
        } catch (Exception e) { Log.e(TAG, "cancelUpdates : " + e.getMessage()); }
    }
}