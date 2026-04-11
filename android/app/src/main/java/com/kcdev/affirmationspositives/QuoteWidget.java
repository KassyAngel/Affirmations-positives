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
 * ✅ Citation qui change vraiment : index incrémental stocké en SharedPreferences
 * ✅ Alarme exacte (setExactAndAllowWhileIdle) toutes les 30min — fiable sous Android 12+
 * ✅ L'alarme se re-planifie elle-même à chaque déclenchement (chaîne auto-entretenue)
 * ✅ Plage horaire respectée : pas de mise à jour entre 22h et 6h
 * ✅ Fallbacks complets : morning (42), noon (42), evening (42) — jamais vide
 * ✅ Thread séparé pour lecture JSON (fix Samsung main thread timeout)
 */
public class QuoteWidget extends AppWidgetProvider {

    private static final String TAG = "QuoteWidget";
    public  static final String ACTION_UPDATE_WIDGET = "com.kcdev.affirmationspositives.UPDATE_WIDGET";

    // ── SharedPreferences pour l'index rotatif ────────────────────────────
    private static final String WIDGET_PREFS    = "widget_prefs";
    private static final String KEY_QUOTE_INDEX = "quote_index";
    private static final String KEY_LAST_POOL   = "last_pool";

    // ── Langue ────────────────────────────────────────────────────────────
    private static final String   CAPACITOR_PREFS = "CapacitorStorage";
    private static final String[] LANG_KEYS = {
        "_cap_app_language", "_cap_i18nextLng", "app_language", "i18nextLng",
    };

    // ═════════════════════════════════════════════════════════════════════
    // FALLBACKS COMPLETS — miroir exact de quotes.json
    // ═════════════════════════════════════════════════════════════════════

    // ── MORNING ──────────────────────────────────────────────────────────
    private static final String[] MORNING_FR = {
        "Je me lève avec l'énergie de quelqu'un qui croit en ses rêves.",
        "Ce matin est une nouvelle chance. Je la saisis.",
        "Je suis capable de bien plus que ce que je m'imagine.",
        "Aujourd'hui, je choisis d'avancer.",
        "Je commence ce jour avec confiance et gratitude.",
        "Mon potentiel est illimité. Je le prouve chaque jour.",
        "Je mérite une belle journée. Et elle commence maintenant.",
        "Je suis assez fort(e) pour tout ce que cette journée apporte.",
        "Chaque matin est une porte ouverte. J'entre avec courage.",
        "Je ne cherche pas la perfection. Je cherche le progrès.",
        "Aujourd'hui, je suis exactement là où je dois être.",
        "Je crois en moi, même quand c'est difficile.",
        "Ce matin, je choisis la force plutôt que la peur.",
        "Je suis unique. Personne ne peut faire ce que je fais, comme je le fais.",
        "Je me lève. Je continue. C'est déjà une victoire.",
        "Je n'ai pas besoin de la permission des autres pour briller.",
        "Je me donne la permission d'être fier(e) de qui je suis.",
        "Ce matin, je suis reconnaissant(e) pour tout ce que je suis.",
        "Je choisis de voir les possibilités, pas les obstacles.",
        "Ma valeur ne dépend pas de l'opinion des autres.",
        "Aujourd'hui je plante des graines que je récolterai demain.",
        "La façon de commencer, c'est d'arrêter d'attendre et d'agir.",
        "Chaque petit effort du matin construit le succès de demain.",
        "Je suis la meilleure version de moi-même en construction.",
        "Ce matin, je choisis de sourire à la vie.",
        "Je suis prêt(e). Le monde aussi.",
        "Aujourd'hui, je suis mon propre héros.",
        "Je me réveille avec l'intention de faire de ce jour quelque chose de beau.",
        "Ce que je ressens ce matin ne définit pas ma journée. Mes actions, si.",
        "Je suis reconnaissant(e) d'être en vie et capable d'agir.",
        "Aujourd'hui, je fais un pas. Un seul suffit.",
        "Je commence cette journée avec un cœur ouvert et une volonté de fer.",
        "Je suis assez. J'ai toujours été assez.",
        "Ce matin, je me rappelle que je suis capable de surmonter n'importe quoi.",
        "La discipline d'aujourd'hui est la liberté de demain.",
        "Je ne suis pas en compétition avec les autres. Je m'améliore moi-même.",
        "Ce matin, ma force intérieure est plus grande que mes doutes.",
        "Chaque jour est une chance de devenir qui je veux être.",
        "Je choisis la gratitude comme point de départ de ma journée.",
        "Aujourd'hui, je me fais confiance.",
        "Je porte en moi tout ce dont j'ai besoin pour réussir.",
        "Ce matin est différent des autres. Et c'est moi qui le décide.",
    };

    private static final String[] MORNING_EN = {
        "I wake up with the energy of someone who believes in their dreams.",
        "This morning is a new chance. I take it.",
        "I am capable of far more than I can imagine.",
        "Today, I choose to move forward.",
        "I begin this day with confidence and gratitude.",
        "My potential is unlimited. I prove it every day.",
        "I deserve a beautiful day. And it starts right now.",
        "I am strong enough for everything this day brings.",
        "Every morning is an open door. I walk through it with courage.",
        "I don't seek perfection. I seek progress.",
        "Today, I am exactly where I need to be.",
        "I believe in myself, even when it's hard.",
        "This morning, I choose strength over fear.",
        "I am unique. No one can do what I do the way I do it.",
        "I get up. I keep going. That is already a victory.",
        "I don't need anyone's permission to shine.",
        "I give myself permission to be proud of who I am.",
        "This morning, I am grateful for everything I am.",
        "I choose to see possibilities, not obstacles.",
        "My worth does not depend on others' opinions.",
        "Today I plant seeds I will harvest tomorrow.",
        "The way to start is to stop waiting and start acting.",
        "Every small morning effort builds tomorrow's success.",
        "I am the best version of myself, under construction.",
        "This morning, I choose to smile at life.",
        "I am ready. So is the world.",
        "Today, I am my own hero.",
        "I wake up with the intention to make this day something beautiful.",
        "What I feel this morning doesn't define my day. My actions do.",
        "I am grateful to be alive and able to act.",
        "Today, I take one step. One is enough.",
        "I start this day with an open heart and an iron will.",
        "I am enough. I have always been enough.",
        "This morning, I remind myself that I can overcome anything.",
        "Today's discipline is tomorrow's freedom.",
        "I am not in competition with others. I am improving myself.",
        "This morning, my inner strength is greater than my doubts.",
        "Every day is a chance to become who I want to be.",
        "I choose gratitude as the starting point of my day.",
        "Today, I trust myself.",
        "I carry within me everything I need to succeed.",
        "This morning is different from the others. And I am the one who decides that.",
    };

    // ── NOON ──────────────────────────────────────────────────────────────
    private static final String[] NOON_FR = {
        "Je continue. Même à mi-chemin, chaque pas compte.",
        "Je suis fier(e) de tout ce que j'ai déjà accompli aujourd'hui.",
        "Je recharge mon énergie avec la certitude que je suis sur la bonne voie.",
        "L'action d'aujourd'hui crée le résultat de demain.",
        "Je suis concentré(e), déterminé(e), et rien ne m'arrête.",
        "Je suis le seul à pouvoir limiter ma grandeur — alors je ne le fais pas.",
        "Chaque effort que je fais maintenant me rapproche de mon but.",
        "Je suis capable de choses incroyables. Je le prouve en ce moment.",
        "Je ne m'arrête pas parce que c'est difficile. Je continue parce que ça en vaut la peine.",
        "À mi-journée, je fais le point : je suis fier(e) de qui je deviens.",
        "Je mérite le succès que je construis pas à pas.",
        "Le doute existe, mais ma détermination est plus forte.",
        "Je ne cherche pas l'approbation des autres. La mienne me suffit.",
        "Je suis en train de construire quelque chose de grand. Brique par brique.",
        "Ma persévérance est ma plus grande force.",
        "Soyez si bon(ne) qu'on ne peut pas m'ignorer.",
        "Je prends soin de moi pour pouvoir donner le meilleur de moi.",
        "Chaque difficulté que je traverse me rend plus fort(e).",
        "Je n'abandonne pas. Les meilleures choses prennent du temps.",
        "Je transforme les obstacles en opportunités.",
        "Je fais confiance au processus. Les résultats arrivent.",
        "Je suis plus courageux(se) que je ne le pense.",
        "Ce que je fais maintenant, mon futur moi m'en remerciera.",
        "Je ne suis pas parfait(e). Mais je suis authentique.",
        "Je choisis de voir ce qui va bien plutôt que ce qui manque.",
        "Ma force vient de qui je suis, pas de ce que les autres pensent.",
        "Je suis en train de réussir, même si je ne le vois pas encore.",
        "Je me rappelle : je suis plus résilient(e) que mes pires journées.",
        "Je fais de mon mieux aujourd'hui. C'est suffisant.",
        "Je suis exactement là où je dois être pour devenir qui je dois être.",
        "La paix intérieure commence par se faire confiance.",
        "Je ne compare pas mon chemin à celui des autres. Je trace le mien.",
        "Chaque petite victoire d'aujourd'hui mérite d'être célébrée.",
        "Je suis en paix avec mon rythme. Je progresse à ma façon.",
        "Mon énergie va là où je mets mon attention. Je la mets sur le positif.",
        "Je suis reconnaissant(e) pour cette journée et ce qu'elle m'apprend.",
        "Je suis une personne forte qui traverse des moments difficiles — pas une personne faible.",
        "Aujourd'hui, je choisis d'être bienveillant(e) envers moi-même.",
        "Ce que je ressens est valide. Et je suis capable d'avancer quand même.",
        "Je suis en train de devenir la personne que j'admire.",
        "Je ne baisse pas les bras. Les plus belles choses demandent de la patience.",
        "Ma vie mérite mon plein engagement. Je le donne.",
    };

    private static final String[] NOON_EN = {
        "I keep going. Even halfway, every step counts.",
        "I am proud of everything I have already accomplished today.",
        "I recharge my energy with the certainty that I am on the right path.",
        "Today's action creates tomorrow's result.",
        "I am focused, determined, and nothing stops me.",
        "I am the only one who can limit my greatness — so I don't.",
        "Every effort I make now brings me closer to my goal.",
        "I am capable of incredible things. I am proving it right now.",
        "I don't stop because it's hard. I keep going because it's worth it.",
        "Midday check-in: I am proud of who I am becoming.",
        "I deserve the success I am building step by step.",
        "Doubt exists, but my determination is stronger.",
        "I don't seek others' approval. My own is enough.",
        "I am building something great. Brick by brick.",
        "My perseverance is my greatest strength.",
        "Be so good they can't ignore you.",
        "I take care of myself so I can give the best of myself.",
        "Every difficulty I overcome makes me stronger.",
        "I don't give up. The best things take time.",
        "I transform obstacles into opportunities.",
        "I trust the process. Results are coming.",
        "I am braver than I think.",
        "What I do now, my future self will thank me for.",
        "I am not perfect. But I am authentic.",
        "I choose to see what is going well rather than what is missing.",
        "My strength comes from who I am, not what others think.",
        "I am succeeding, even if I can't see it yet.",
        "I remind myself: I am more resilient than my worst days.",
        "I do my best today. That is enough.",
        "I am exactly where I need to be to become who I need to be.",
        "Inner peace begins with trusting yourself.",
        "I don't compare my path to others'. I carve my own.",
        "Every small victory today deserves to be celebrated.",
        "I am at peace with my pace. I progress in my own way.",
        "My energy goes where I put my attention. I put it on the positive.",
        "I am grateful for this day and what it teaches me.",
        "I am a strong person going through hard times — not a weak person.",
        "Today, I choose to be kind to myself.",
        "What I feel is valid. And I am able to move forward anyway.",
        "I am becoming the person I admire.",
        "I don't give up. The most beautiful things require patience.",
        "My life deserves my full commitment. I give it.",
    };

    // ── EVENING ───────────────────────────────────────────────────────────
    private static final String[] EVENING_FR = {
        "Ce soir, je suis fier(e) de tout ce que j'ai traversé aujourd'hui.",
        "Je me repose avec la paix de quelqu'un qui a donné le meilleur de soi.",
        "Aujourd'hui a compté. Je l'ai vécu pleinement.",
        "Je laisse aller ce qui m'a pesé et je garde ce qui m'a nourri.",
        "Ce soir, je me dis merci.",
        "J'ai survécu à cette journée. C'est déjà une force.",
        "Chaque soir qui passe me rapproche de la personne que je veux être.",
        "Je mérite de me reposer. Sans culpabilité.",
        "Ce soir, je choisis la paix intérieure.",
        "Je relâche les tensions de la journée. Mon corps et mon esprit méritent le calme.",
        "Même la nuit la plus sombre finit par laisser place à l'aube.",
        "Je suis reconnaissant(e) pour les leçons de cette journée.",
        "Ce soir, je me rappelle que je suis exactement assez.",
        "Je fais confiance à demain. Et à moi pour l'affronter.",
        "Le repos d'aujourd'hui est la force de demain.",
        "Je ferme les yeux avec la certitude que je fais de mon mieux.",
        "Ce soir, je pose les armes et je prends soin de moi.",
        "Je suis plus fort(e) que ce que mes pires pensées veulent me faire croire.",
        "Demain sera une autre chance. Et je serai là pour la saisir.",
        "Ce soir, je lâche prise. Pas en abandonnant — en me faisant confiance.",
        "Je nourris mon âme ce soir pour mieux rayonner demain.",
        "La paix que je ressens ce soir, je l'ai méritée.",
        "Je suis en vie. Je grandis. Je progresse. C'est suffisant.",
        "Ce soir, je me pardonne mes imperfections de la journée.",
        "Je me rappelle que chaque grand voyage se fait une étape à la fois.",
        "Je suis bienveillant(e) envers moi-même ce soir.",
        "Mon histoire n'est pas encore terminée. Le meilleur est à venir.",
        "Ce soir, je reconnais ma valeur, indépendamment de mes résultats.",
        "Je fais confiance à la vie. Elle m'amène exactement où je dois aller.",
        "Le calme de ce soir recharge mon courage pour demain.",
        "Je ne suis pas défini(e) par mes erreurs. Je grandis grâce à elles.",
        "Ce soir, je célèbre chaque petit progrès, même invisible.",
        "Je suis fier(e) d'avoir choisi d'avancer malgré tout.",
        "Ce soir je me rappelle : je suis aimé(e), j'ai de la valeur, je compte.",
        "La personne que je deviens mérite tout le repos et la paix de ce soir.",
        "Je ferme cette journée avec fierté et j'ouvre demain avec espoir.",
        "Ce soir, je suis en paix avec qui je suis et avec ce que je construis.",
        "Je mérite de dormir profondément, apaisé(e) et confiant(e).",
        "Aujourd'hui, j'ai fait de mon mieux. Demain, je ferai encore mieux.",
        "Je me dis bonne nuit avec douceur et sans jugement.",
        "Ce soir, je pose tout ce qui est lourd et je garde la lumière.",
        "Demain matin, je me réveillerai plus fort(e). Je le sais.",
    };

    private static final String[] EVENING_EN = {
        "Tonight, I am proud of everything I went through today.",
        "I rest with the peace of someone who gave their best.",
        "Today mattered. I lived it fully.",
        "I let go of what weighed me down and keep what nourished me.",
        "Tonight, I say thank you to myself.",
        "I survived this day. That is already strength.",
        "Every evening that passes brings me closer to the person I want to be.",
        "I deserve to rest. Without guilt.",
        "Tonight, I choose inner peace.",
        "I release the tensions of the day. My body and mind deserve calm.",
        "Even the darkest night eventually gives way to dawn.",
        "I am grateful for the lessons of this day.",
        "Tonight, I remind myself that I am exactly enough.",
        "I trust tomorrow. And I trust myself to face it.",
        "Today's rest is tomorrow's strength.",
        "I close my eyes with the certainty that I am doing my best.",
        "Tonight, I put down my armor and take care of myself.",
        "I am stronger than what my worst thoughts want me to believe.",
        "Tomorrow will be another chance. And I will be there to take it.",
        "Tonight, I let go. Not by giving up — but by trusting myself.",
        "I nourish my soul tonight to shine brighter tomorrow.",
        "The peace I feel tonight, I have earned it.",
        "I am alive. I am growing. I am progressing. That is enough.",
        "Tonight, I forgive myself for today's imperfections.",
        "I remind myself that every great journey is made one step at a time.",
        "I am kind to myself tonight.",
        "My story is not over yet. The best is yet to come.",
        "Tonight, I recognize my worth, independent of my results.",
        "I trust life. It takes me exactly where I need to go.",
        "Tonight's calm recharges my courage for tomorrow.",
        "I am not defined by my mistakes. I grow through them.",
        "Tonight, I celebrate every small progress, even invisible ones.",
        "I am proud of having chosen to move forward despite everything.",
        "Tonight I remind myself: I am loved, I have value, I matter.",
        "The person I am becoming deserves all the rest and peace of tonight.",
        "I close this day with pride and open tomorrow with hope.",
        "Tonight, I am at peace with who I am and what I am building.",
        "I deserve to sleep deeply, at peace and confident.",
        "Today, I did my best. Tomorrow, I will do even better.",
        "I say goodnight to myself with gentleness and without judgment.",
        "Tonight, I put down everything heavy and keep the light.",
        "Tomorrow morning, I will wake up stronger. I know it.",
    };

    // ═════════════════════════════════════════════════════════════════════
    // Lifecycle
    // ═════════════════════════════════════════════════════════════════════

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE_WIDGET.equals(intent.getAction())) {
            final Context appCtx = context.getApplicationContext();
            AppWidgetManager mgr = AppWidgetManager.getInstance(appCtx);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(appCtx, QuoteWidget.class));

            new Thread(() -> {
                // ✅ Avance l'index AVANT d'afficher → citation différente à chaque alarme
                incrementQuoteIndex(appCtx);
                for (int id : ids) updateAppWidget(appCtx, mgr, id);
                // ✅ Re-planifie la prochaine alarme (chaîne auto-entretenue)
                scheduleNextAlarm(appCtx);
            }).start();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        final Context appCtx = context.getApplicationContext();
        new Thread(() -> {
            for (int id : appWidgetIds) updateAppWidget(appCtx, appWidgetManager, id);
            scheduleNextAlarm(appCtx);
        }).start();
    }

    @Override
    public void onEnabled(Context context) {
        scheduleNextAlarm(context.getApplicationContext());
    }

    @Override
    public void onDisabled(Context context) {
        cancelAlarm(context.getApplicationContext());
    }

    // ═════════════════════════════════════════════════════════════════════
    // Mise à jour du widget
    // ═════════════════════════════════════════════════════════════════════

    static void updateAppWidget(Context context, AppWidgetManager mgr, int widgetId) {
        try {
            String lang    = getLanguage(context);
            String message = getNextQuote(context, lang);
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
            Log.d(TAG, "Widget mis à jour [" + getCurrentPool() + "] : "
                + message.substring(0, Math.min(50, message.length())));

        } catch (Exception e) {
            Log.e(TAG, "updateAppWidget error: " + e.getMessage(), e);
            try {
                RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_quote);
                fallback.setTextViewText(R.id.widget_title, "💪 Affirmation");
                fallback.setTextViewText(R.id.widget_quote,
                    "Vous êtes capable de choses extraordinaires.");
                mgr.updateAppWidget(widgetId, fallback);
            } catch (Exception e2) {
                Log.e(TAG, "Fallback error: " + e2.getMessage());
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════
    // Sélection de la citation avec index rotatif
    // ═════════════════════════════════════════════════════════════════════

    private static String getNextQuote(Context context, String lang) {
        String pool = getCurrentPool();

        SharedPreferences prefs = context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE);
        int index = prefs.getInt(KEY_QUOTE_INDEX, 0);

        // 1. Essai depuis quotes.json en assets
        try {
            JSONArray arr = loadPoolFromJson(context, pool);
            if (arr != null && arr.length() > 0) {
                int safeIndex   = index % arr.length();
                JSONObject obj  = arr.getJSONObject(safeIndex);
                String text     = obj.optString(lang, "").trim();
                if (text.isEmpty()) text = obj.optString("text", "").trim();
                if (text.isEmpty()) text = obj.optString("body", "").trim();
                if (!text.isEmpty()) {
                    Log.d(TAG, "JSON [" + pool + " #" + safeIndex + "]: "
                        + text.substring(0, Math.min(40, text.length())));
                    return text;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "loadPoolFromJson error: " + e.getMessage());
        }

        // 2. Fallback sur les tableaux statiques
        return getFallbackForPool(pool, lang, index);
    }

    private static void incrementQuoteIndex(Context context) {
        try {
            String pool     = getCurrentPool();
            int poolSize    = getPoolSize(context, pool);

            SharedPreferences prefs = context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE);
            String lastPool = prefs.getString(KEY_LAST_POOL, "");
            int index       = prefs.getInt(KEY_QUOTE_INDEX, 0);

            SharedPreferences.Editor editor = prefs.edit();

            if (!pool.equals(lastPool)) {
                // Nouvelle tranche horaire → repart à 0
                editor.putString(KEY_LAST_POOL, pool).putInt(KEY_QUOTE_INDEX, 0);
                Log.d(TAG, "Nouvelle tranche [" + pool + "] → index reset à 0");
            } else {
                int next = (index + 1) % poolSize;
                editor.putInt(KEY_QUOTE_INDEX, next);
                Log.d(TAG, "Index avancé → " + next + " / " + poolSize);
            }

            editor.apply();
        } catch (Exception e) {
            Log.w(TAG, "incrementQuoteIndex error: " + e.getMessage());
        }
    }

    // ── Taille du pool (JSON en priorité, fallback statique sinon) ────────

    private static int getPoolSize(Context context, String pool) {
        try {
            JSONArray arr = loadPoolFromJson(context, pool);
            if (arr != null && arr.length() > 0) return arr.length();
        } catch (Exception ignored) {}
        return getFallbackPool(pool, "fr").length; // fr et en ont la même taille
    }

    // ── Retourne le bon tableau de fallback selon pool + langue ───────────

    private static String getFallbackForPool(String pool, String lang, int index) {
        String[] arr = getFallbackPool(pool, lang);
        return arr[index % arr.length];
    }

    private static String[] getFallbackPool(String pool, String lang) {
        boolean fr = "fr".equals(lang);
        switch (pool) {
            case "noon":    return fr ? NOON_FR    : NOON_EN;
            case "evening": return fr ? EVENING_FR : EVENING_EN;
            default:        return fr ? MORNING_FR : MORNING_EN;
        }
    }

    // ── Charge le pool JSON ───────────────────────────────────────────────

    private static JSONArray loadPoolFromJson(Context context, String pool) throws Exception {
        InputStream is = null;
        for (String path : new String[]{"public/quotes.json", "quotes.json"}) {
            try { is = context.getAssets().open(path); break; } catch (Exception ignored) {}
        }
        if (is == null) return null;

        byte[] buffer = new byte[is.available()];
        is.read(buffer);
        is.close();

        JSONObject root = new JSONObject(new String(buffer, StandardCharsets.UTF_8));
        if (root.has(pool))      return root.getJSONArray(pool);
        if (root.has("morning")) return root.getJSONArray("morning");
        return null;
    }

    // ── Tranche horaire courante ───────────────────────────────────────────

    private static String getCurrentPool() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (hour >= 6  && hour < 12) return "morning";
        if (hour >= 12 && hour < 18) return "noon";
        if (hour >= 18 && hour < 22) return "evening";
        return "morning";
    }

    // ── Titre selon l'heure ───────────────────────────────────────────────

    private static String getTitleForHour(String lang) {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        boolean fr = "fr".equals(lang);
        if (hour >= 6  && hour < 12) return fr ? "✨ PENSÉE DU MATIN"  : "✨ MORNING THOUGHT";
        if (hour >= 12 && hour < 18) return fr ? "☀️ MESSAGE DU JOUR"  : "☀️ DAILY MESSAGE";
        if (hour >= 18 && hour < 22) return fr ? "🌙 PENSÉE DU SOIR"   : "🌙 EVENING THOUGHT";
        return                               fr ? "🌟 AFFIRMATION"       : "🌟 AFFIRMATION";
    }

    // ═════════════════════════════════════════════════════════════════════
    // Langue
    // ═════════════════════════════════════════════════════════════════════

    private static String getLanguage(Context context) {
        try {
            Context storageCtx = context;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                try {
                    storageCtx = context.createDeviceProtectedStorageContext();
                } catch (Exception ignored) {}
            }
            SharedPreferences prefs =
                storageCtx.getSharedPreferences(CAPACITOR_PREFS, Context.MODE_PRIVATE);
            for (String key : LANG_KEYS) {
                String l = prefs.getString(key, null);
                if (l != null && !l.isEmpty()) {
                    l = l.replace("\"", "").trim();
                    if (l.startsWith("fr")) return "fr";
                    if (l.startsWith("en")) return "en";
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "getLanguage error: " + e.getMessage());
        }
        return "fr";
    }

    // ═════════════════════════════════════════════════════════════════════
    // Alarme exacte auto-entretenue
    // ═════════════════════════════════════════════════════════════════════

    static void scheduleNextAlarm(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;

            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 42, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            long triggerAt = getNextTriggerTime();

            try {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                Log.d(TAG, "Prochaine alarme widget : " + new java.util.Date(triggerAt));
            } catch (SecurityException e) {
                am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
                Log.w(TAG, "Alarme inexacte (fallback SecurityException)");
            }

        } catch (Exception e) {
            Log.e(TAG, "scheduleNextAlarm error: " + e.getMessage());
        }
    }

    /**
     * Prochain déclenchement :
     * - Dans la plage 6h–22h → dans 30 minutes
     * - Hors plage (22h–5h59) → demain à 6h00
     */
    private static long getNextTriggerTime() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);

        if (hour >= 6 && hour < 22) {
            return System.currentTimeMillis() + 30 * 60 * 1000L;
        }

        // Hors plage → demain 6h
        Calendar next = Calendar.getInstance();
        if (hour >= 22) next.add(Calendar.DAY_OF_YEAR, 1);
        next.set(Calendar.HOUR_OF_DAY, 6);
        next.set(Calendar.MINUTE, 0);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        return next.getTimeInMillis();
    }

    private static void cancelAlarm(Context context) {
        try {
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent intent = new Intent(context, QuoteWidget.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 42, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
            Log.d(TAG, "Alarme widget annulée");
        } catch (Exception e) {
            Log.e(TAG, "cancelAlarm error: " + e.getMessage());
        }
    }
}