// ─── Supported languages ──────────────────────────────────────────────────────

export type LanguageCode = 'en' | 'pl' | 'de' | 'es' | 'fr' | 'it';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English'  },
  { code: 'pl', label: 'Polski'   },
  { code: 'de', label: 'Deutsch'  },
  { code: 'es', label: 'Español'  },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
];

// ─── English (source of truth — defines all keys) ─────────────────────────────

const en = {
  // Navigation
  'nav.settings': 'Settings',

  // Home
  'home.loading':           'Loading…',
  'home.today':             'Today',
  'home.noLocation.title':  'No location set',
  'home.noLocation.body':   "Set your city in Settings to get today's watering recommendation.",
  'home.noLocation.button': 'Open Settings',
  'home.weather.loading':   'Fetching weather…',
  'home.weather.error':     'Could not load weather data.',
  'home.footer':            'Pull down to refresh · data updates every 30 min',
  'home.weatherSummary':    'Weather summary',

  // Decision labels
  'decision.water':     'Water today',
  'decision.skip':      'Skip today',
  'decision.uncertain': 'Check later',

  // Decision reasons — {{mm}} and {{temp}} are numeric placeholders
  'reason.recentRain':   'Do not water today — {{mm}} mm of rain fell recently.',
  'reason.forecastRain': 'Do not water today — {{mm}} mm of rain expected soon.',
  'reason.hotAndDry':    'Water today — it is hot ({{temp}}°C) and no rain expected.',
  'reason.default':      'Water today — no meaningful rain recently or in the forecast.',
  'reason.noData':       'Not enough weather data yet. Try again in a moment.',

  // Weather summary labels
  'weather.recentRain':   'Rain last 24h',
  'weather.forecastRain': 'Rain next 24h',
  'weather.todayHigh':    "Today's high",

  // Plan badges
  'badge.free':    'Free plan',
  'badge.premium': '⭐ Premium',

  // Settings — locations
  'settings.locations':                   'Locations ({{n}} / {{max}})',
  'settings.locations.none':              'No location added yet.',
  'settings.locations.search':            'Search city…',
  'settings.locations.add':               'Add',
  'settings.locations.useGPS':            '📍  Use my current location',
  'settings.locations.remove.title':      'Remove location',
  'settings.locations.remove.message':    'Remove "{{name}}"?',
  'settings.locations.remove.cancel':     'Cancel',
  'settings.locations.remove.confirm':    'Remove',
  'settings.locations.locked':            'Upgrade to track up to {{max}} locations.',

  // Settings — reminder
  'settings.reminder':        'Daily Reminder',
  'settings.reminder.enable': 'Enable reminder',
  'settings.reminder.time':   'Reminder time',
  'settings.reminder.locked': "Get a daily push notification with today's watering recommendation.",

  // Settings — language
  'settings.language':      'Language',
  'settings.language.auto': 'Auto',

  // Settings — plan
  'settings.plan':              'Plan',
  'settings.plan.free':         'Free plan',
  'settings.plan.free.hint':    '1 location · Banner ads · No reminders',
  'settings.plan.premium':      'Premium',
  'settings.plan.premium.hint': 'Up to 4 locations · No ads · Daily reminder',
  'settings.plan.active':       "⭐ You're on Premium",
  'settings.plan.active.hint':  'No ads · Up to 4 locations · Daily reminder',

  // Settings — developer
  'settings.dev':           'Developer Tools',
  'settings.dev.mock':      'Mock premium',
  'settings.dev.mock.hint': 'Toggle premium UI without billing.',

  // Settings — about
  'settings.about':        'About',
  'settings.about.credit': 'Weather data provided by Open-Meteo (open-meteo.com) — free and open-source.',

  // Shared buttons
  'settings.upgrade':      'Upgrade to Premium',
  'settings.upgrade.chip': 'Upgrade',
  'locked.title':          'Premium feature',

  // Premium modal
  'premium.title':                   '⭐ Go Premium',
  'premium.subtitle':                'One simple upgrade, better experience.',
  'premium.feature.noAds':           'No ads',
  'premium.feature.reminder':        'Daily reminder notification at your chosen time',
  'premium.feature.locations':       'Up to 4 locations',
  'premium.package.monthly':         'Monthly',
  'premium.package.annual':          'Annual',
  'premium.package.bestValue':       'Best value',
  'premium.subscribe':               'Subscribe — {{price}}',
  'premium.restore':                 'Restore purchases',
  'premium.legal':                   'Subscription renews automatically. Cancel anytime.',
  'premium.cancelled':               'Purchase cancelled',
  'premium.cancelled.body':          'No charge was made.',
  'premium.failed':                  'Purchase failed',
  'premium.restored':                'Restored',
  'premium.restored.body':           'Your premium access has been restored.',
  'premium.nothingToRestore':        'Nothing to restore',
  'premium.nothingToRestore.body':   'No previous purchase found for this account.',

  // Alerts
  'alert.ok':                      'OK',
  'alert.cancel':                   'Cancel',
  'alert.enterCity':                'Enter a city name first.',
  'alert.cityNotFound':             'City not found',
  'alert.cityNotFound.body':        '"{{name}}" returned no results. Try a different spelling.',
  'alert.addError':                 'Error',
  'alert.locationError':            'Location error',
  'alert.permissionRequired':       'Permission required',
  'alert.permissionRequired.body':  'Enable notifications in your device settings.',

  // Notification
  'notification.title': 'JustSimple Lawn',
  'notification.body':  "Check today's watering recommendation! 🌱",
} as const;

export type TranslationKey = keyof typeof en;
export type Translations   = typeof en;

// ─── Polish ───────────────────────────────────────────────────────────────────

const pl: Translations = {
  'nav.settings': 'Ustawienia',

  'home.loading':           'Ładowanie…',
  'home.today':             'Dziś',
  'home.noLocation.title':  'Brak lokalizacji',
  'home.noLocation.body':   'Ustaw miasto w Ustawieniach, aby otrzymać dzisiejsze zalecenie podlewania.',
  'home.noLocation.button': 'Otwórz ustawienia',
  'home.weather.loading':   'Pobieranie pogody…',
  'home.weather.error':     'Nie można załadować danych pogodowych.',
  'home.footer':            'Pociągnij, aby odświeżyć · dane co 30 min',
  'home.weatherSummary':    'Podsumowanie pogody',

  'decision.water':     'Podlej dziś',
  'decision.skip':      'Pomiń dziś',
  'decision.uncertain': 'Sprawdź później',

  'reason.recentRain':   'Nie podlewaj dziś — ostatnio spadło {{mm}} mm deszczu.',
  'reason.forecastRain': 'Nie podlewaj dziś — wkrótce oczekiwane {{mm}} mm deszczu.',
  'reason.hotAndDry':    'Podlej dziś — jest gorąco ({{temp}}°C) i brak opadów.',
  'reason.default':      'Podlej dziś — brak znaczących opadów ostatnio ani w prognozie.',
  'reason.noData':       'Za mało danych pogodowych. Spróbuj ponownie za chwilę.',

  'weather.recentRain':   'Deszcz ostatnie 24h',
  'weather.forecastRain': 'Deszcz następne 24h',
  'weather.todayHigh':    'Maks. temp. dziś',

  'badge.free':    'Plan darmowy',
  'badge.premium': '⭐ Premium',

  'settings.locations':                'Lokalizacje ({{n}} / {{max}})',
  'settings.locations.none':           'Brak dodanych lokalizacji.',
  'settings.locations.search':         'Wyszukaj miasto…',
  'settings.locations.add':            'Dodaj',
  'settings.locations.useGPS':         '📍  Użyj mojej lokalizacji',
  'settings.locations.remove.title':   'Usuń lokalizację',
  'settings.locations.remove.message': 'Usunąć "{{name}}"?',
  'settings.locations.remove.cancel':  'Anuluj',
  'settings.locations.remove.confirm': 'Usuń',
  'settings.locations.locked':         'Przejdź na Premium, aby śledzić do {{max}} lokalizacji.',

  'settings.reminder':        'Codzienne przypomnienie',
  'settings.reminder.enable': 'Włącz przypomnienie',
  'settings.reminder.time':   'Godzina przypomnienia',
  'settings.reminder.locked': 'Otrzymuj codzienne powiadomienie z zaleceniem podlewania.',

  'settings.language':      'Język',
  'settings.language.auto': 'Automatyczny',

  'settings.plan':              'Plan',
  'settings.plan.free':         'Plan darmowy',
  'settings.plan.free.hint':    '1 lokalizacja · Reklamy · Brak przypomnień',
  'settings.plan.premium':      'Premium',
  'settings.plan.premium.hint': 'Do 4 lokalizacji · Brak reklam · Codzienne przypomnienie',
  'settings.plan.active':       '⭐ Masz plan Premium',
  'settings.plan.active.hint':  'Brak reklam · Do 4 lokalizacji · Codzienne przypomnienie',

  'settings.dev':           'Narzędzia deweloperskie',
  'settings.dev.mock':      'Symuluj Premium',
  'settings.dev.mock.hint': 'Przełącz UI Premium bez płatności.',

  'settings.about':        'O aplikacji',
  'settings.about.credit': 'Dane pogodowe: Open-Meteo (open-meteo.com) — bezpłatne i open-source.',

  'settings.upgrade':      'Przejdź na Premium',
  'settings.upgrade.chip': 'Upgrade',
  'locked.title':          'Funkcja Premium',

  'premium.title':                 '⭐ Przejdź na Premium',
  'premium.subtitle':              'Jedna prosta zmiana, lepsze doświadczenie.',
  'premium.feature.noAds':         'Brak reklam',
  'premium.feature.reminder':      'Codzienne powiadomienie o podlewaniu',
  'premium.feature.locations':     'Do 4 lokalizacji',
  'premium.package.monthly':       'Miesięcznie',
  'premium.package.annual':        'Rocznie',
  'premium.package.bestValue':     'Najlepsza oferta',
  'premium.subscribe':             'Subskrybuj — {{price}}',
  'premium.restore':               'Przywróć zakupy',
  'premium.legal':                 'Subskrypcja odnawia się automatycznie. Anuluj w dowolnym momencie.',
  'premium.cancelled':             'Zakup anulowany',
  'premium.cancelled.body':        'Żadna płatność nie została pobrana.',
  'premium.failed':                'Błąd zakupu',
  'premium.restored':              'Przywrócono',
  'premium.restored.body':         'Twój dostęp Premium został przywrócony.',
  'premium.nothingToRestore':      'Brak zakupów do przywrócenia',
  'premium.nothingToRestore.body': 'Nie znaleziono wcześniejszego zakupu dla tego konta.',

  'alert.ok':                     'OK',
  'alert.cancel':                  'Anuluj',
  'alert.enterCity':               'Najpierw wpisz nazwę miasta.',
  'alert.cityNotFound':            'Nie znaleziono miasta',
  'alert.cityNotFound.body':       '"{{name}}" nie zwróciło wyników. Spróbuj innej pisowni.',
  'alert.addError':                'Błąd',
  'alert.locationError':           'Błąd lokalizacji',
  'alert.permissionRequired':      'Wymagane uprawnienie',
  'alert.permissionRequired.body': 'Włącz powiadomienia w ustawieniach urządzenia.',

  'notification.title': 'JustSimple Lawn',
  'notification.body':  'Sprawdź dzisiejsze zalecenie podlewania! 🌱',
};

// ─── German ───────────────────────────────────────────────────────────────────

const de: Translations = {
  'nav.settings': 'Einstellungen',

  'home.loading':           'Laden…',
  'home.today':             'Heute',
  'home.noLocation.title':  'Kein Ort festgelegt',
  'home.noLocation.body':   'Lege deinen Ort in den Einstellungen fest, um die heutige Bewässerungsempfehlung zu erhalten.',
  'home.noLocation.button': 'Einstellungen öffnen',
  'home.weather.loading':   'Wetter wird geladen…',
  'home.weather.error':     'Wetterdaten konnten nicht geladen werden.',
  'home.footer':            'Zum Aktualisieren nach unten ziehen · Daten alle 30 Min.',
  'home.weatherSummary':    'Wetterübersicht',

  'decision.water':     'Heute gießen',
  'decision.skip':      'Heute überspringen',
  'decision.uncertain': 'Später prüfen',

  'reason.recentRain':   'Heute nicht gießen — {{mm}} mm Regen kürzlich gefallen.',
  'reason.forecastRain': 'Heute nicht gießen — {{mm}} mm Regen bald erwartet.',
  'reason.hotAndDry':    'Heute gießen — es ist heiß ({{temp}}°C) und kein Regen erwartet.',
  'reason.default':      'Heute gießen — kein nennenswerter Regen kürzlich oder in der Prognose.',
  'reason.noData':       'Noch nicht genug Wetterdaten. Gleich nochmal versuchen.',

  'weather.recentRain':   'Regen letzte 24h',
  'weather.forecastRain': 'Regen nächste 24h',
  'weather.todayHigh':    'Heutige Höchsttemp.',

  'badge.free':    'Kostenlos',
  'badge.premium': '⭐ Premium',

  'settings.locations':                'Orte ({{n}} / {{max}})',
  'settings.locations.none':           'Noch kein Ort hinzugefügt.',
  'settings.locations.search':         'Stadt suchen…',
  'settings.locations.add':            'Hinzufügen',
  'settings.locations.useGPS':         '📍  Aktuellen Standort verwenden',
  'settings.locations.remove.title':   'Ort entfernen',
  'settings.locations.remove.message': '"{{name}}" entfernen?',
  'settings.locations.remove.cancel':  'Abbrechen',
  'settings.locations.remove.confirm': 'Entfernen',
  'settings.locations.locked':         'Upgrade auf Premium, um bis zu {{max}} Orte zu verfolgen.',

  'settings.reminder':        'Tägliche Erinnerung',
  'settings.reminder.enable': 'Erinnerung aktivieren',
  'settings.reminder.time':   'Erinnerungszeit',
  'settings.reminder.locked': 'Erhalte täglich eine Benachrichtigung mit der Bewässerungsempfehlung.',

  'settings.language':      'Sprache',
  'settings.language.auto': 'Automatisch',

  'settings.plan':              'Tarif',
  'settings.plan.free':         'Kostenloser Tarif',
  'settings.plan.free.hint':    '1 Ort · Werbung · Keine Erinnerungen',
  'settings.plan.premium':      'Premium',
  'settings.plan.premium.hint': 'Bis zu 4 Orte · Keine Werbung · Tägliche Erinnerung',
  'settings.plan.active':       '⭐ Du hast Premium',
  'settings.plan.active.hint':  'Keine Werbung · Bis zu 4 Orte · Tägliche Erinnerung',

  'settings.dev':           'Entwickler-Tools',
  'settings.dev.mock':      'Premium simulieren',
  'settings.dev.mock.hint': 'Premium-UI ohne Zahlung umschalten.',

  'settings.about':        'Über',
  'settings.about.credit': 'Wetterdaten von Open-Meteo (open-meteo.com) — kostenlos und Open-Source.',

  'settings.upgrade':      'Auf Premium upgraden',
  'settings.upgrade.chip': 'Upgrade',
  'locked.title':          'Premium-Funktion',

  'premium.title':                 '⭐ Zu Premium wechseln',
  'premium.subtitle':              'Ein einfaches Upgrade, bessere Erfahrung.',
  'premium.feature.noAds':         'Keine Werbung',
  'premium.feature.reminder':      'Tägliche Erinnerungsbenachrichtigung',
  'premium.feature.locations':     'Bis zu 4 Orte',
  'premium.package.monthly':       'Monatlich',
  'premium.package.annual':        'Jährlich',
  'premium.package.bestValue':     'Bestes Angebot',
  'premium.subscribe':             'Abonnieren — {{price}}',
  'premium.restore':               'Käufe wiederherstellen',
  'premium.legal':                 'Abonnement verlängert sich automatisch. Jederzeit kündbar.',
  'premium.cancelled':             'Kauf abgebrochen',
  'premium.cancelled.body':        'Es wurde nichts berechnet.',
  'premium.failed':                'Kauf fehlgeschlagen',
  'premium.restored':              'Wiederhergestellt',
  'premium.restored.body':         'Dein Premium-Zugang wurde wiederhergestellt.',
  'premium.nothingToRestore':      'Nichts wiederherzustellen',
  'premium.nothingToRestore.body': 'Kein früherer Kauf für dieses Konto gefunden.',

  'alert.ok':                     'OK',
  'alert.cancel':                  'Abbrechen',
  'alert.enterCity':               'Bitte zuerst einen Stadtnamen eingeben.',
  'alert.cityNotFound':            'Stadt nicht gefunden',
  'alert.cityNotFound.body':       '"{{name}}" hat keine Ergebnisse. Andere Schreibweise versuchen.',
  'alert.addError':                'Fehler',
  'alert.locationError':           'Standortfehler',
  'alert.permissionRequired':      'Berechtigung erforderlich',
  'alert.permissionRequired.body': 'Benachrichtigungen in den Geräteeinstellungen aktivieren.',

  'notification.title': 'JustSimple Lawn',
  'notification.body':  'Heutige Bewässerungsempfehlung prüfen! 🌱',
};

// ─── Spanish ──────────────────────────────────────────────────────────────────

const es: Translations = {
  'nav.settings': 'Ajustes',

  'home.loading':           'Cargando…',
  'home.today':             'Hoy',
  'home.noLocation.title':  'Sin ubicación',
  'home.noLocation.body':   'Configura tu ciudad en Ajustes para obtener la recomendación de riego de hoy.',
  'home.noLocation.button': 'Abrir ajustes',
  'home.weather.loading':   'Obteniendo el tiempo…',
  'home.weather.error':     'No se pudieron cargar los datos meteorológicos.',
  'home.footer':            'Desliza para actualizar · datos cada 30 min',
  'home.weatherSummary':    'Resumen del tiempo',

  'decision.water':     'Regar hoy',
  'decision.skip':      'Saltar hoy',
  'decision.uncertain': 'Revisar más tarde',

  'reason.recentRain':   'No riegues hoy — han caído {{mm}} mm de lluvia recientemente.',
  'reason.forecastRain': 'No riegues hoy — se esperan {{mm}} mm de lluvia pronto.',
  'reason.hotAndDry':    'Riega hoy — hace calor ({{temp}}°C) y no se espera lluvia.',
  'reason.default':      'Riega hoy — no ha llovido recientemente ni se espera lluvia.',
  'reason.noData':       'Datos meteorológicos insuficientes. Inténtalo de nuevo en un momento.',

  'weather.recentRain':   'Lluvia últimas 24h',
  'weather.forecastRain': 'Lluvia próximas 24h',
  'weather.todayHigh':    'Máx. de hoy',

  'badge.free':    'Plan gratuito',
  'badge.premium': '⭐ Premium',

  'settings.locations':                'Ubicaciones ({{n}} / {{max}})',
  'settings.locations.none':           'No hay ubicaciones añadidas.',
  'settings.locations.search':         'Buscar ciudad…',
  'settings.locations.add':            'Añadir',
  'settings.locations.useGPS':         '📍  Usar mi ubicación actual',
  'settings.locations.remove.title':   'Eliminar ubicación',
  'settings.locations.remove.message': '¿Eliminar "{{name}}"?',
  'settings.locations.remove.cancel':  'Cancelar',
  'settings.locations.remove.confirm': 'Eliminar',
  'settings.locations.locked':         'Actualiza para seguir hasta {{max}} ubicaciones.',

  'settings.reminder':        'Recordatorio diario',
  'settings.reminder.enable': 'Activar recordatorio',
  'settings.reminder.time':   'Hora del recordatorio',
  'settings.reminder.locked': 'Recibe una notificación diaria con la recomendación de riego.',

  'settings.language':      'Idioma',
  'settings.language.auto': 'Automático',

  'settings.plan':              'Plan',
  'settings.plan.free':         'Plan gratuito',
  'settings.plan.free.hint':    '1 ubicación · Anuncios · Sin recordatorios',
  'settings.plan.premium':      'Premium',
  'settings.plan.premium.hint': 'Hasta 4 ubicaciones · Sin anuncios · Recordatorio diario',
  'settings.plan.active':       '⭐ Tienes Premium',
  'settings.plan.active.hint':  'Sin anuncios · Hasta 4 ubicaciones · Recordatorio diario',

  'settings.dev':           'Herramientas de desarrollo',
  'settings.dev.mock':      'Simular Premium',
  'settings.dev.mock.hint': 'Alternar UI Premium sin pagar.',

  'settings.about':        'Acerca de',
  'settings.about.credit': 'Datos meteorológicos de Open-Meteo (open-meteo.com) — gratuito y de código abierto.',

  'settings.upgrade':      'Actualizar a Premium',
  'settings.upgrade.chip': 'Actualizar',
  'locked.title':          'Función Premium',

  'premium.title':                 '⭐ Hazte Premium',
  'premium.subtitle':              'Una actualización sencilla, mejor experiencia.',
  'premium.feature.noAds':         'Sin anuncios',
  'premium.feature.reminder':      'Notificación diaria de riego',
  'premium.feature.locations':     'Hasta 4 ubicaciones',
  'premium.package.monthly':       'Mensual',
  'premium.package.annual':        'Anual',
  'premium.package.bestValue':     'Mejor oferta',
  'premium.subscribe':             'Suscribirse — {{price}}',
  'premium.restore':               'Restaurar compras',
  'premium.legal':                 'La suscripción se renueva automáticamente. Cancela cuando quieras.',
  'premium.cancelled':             'Compra cancelada',
  'premium.cancelled.body':        'No se ha realizado ningún cargo.',
  'premium.failed':                'Error en la compra',
  'premium.restored':              'Restaurado',
  'premium.restored.body':         'Tu acceso Premium ha sido restaurado.',
  'premium.nothingToRestore':      'Nada que restaurar',
  'premium.nothingToRestore.body': 'No se encontró ninguna compra anterior para esta cuenta.',

  'alert.ok':                     'OK',
  'alert.cancel':                  'Cancelar',
  'alert.enterCity':               'Introduce primero un nombre de ciudad.',
  'alert.cityNotFound':            'Ciudad no encontrada',
  'alert.cityNotFound.body':       '"{{name}}" no devolvió resultados. Prueba con otra ortografía.',
  'alert.addError':                'Error',
  'alert.locationError':           'Error de ubicación',
  'alert.permissionRequired':      'Permiso requerido',
  'alert.permissionRequired.body': 'Activa las notificaciones en los ajustes del dispositivo.',

  'notification.title': 'JustSimple Lawn',
  'notification.body':  '¡Revisa la recomendación de riego de hoy! 🌱',
};

// ─── French ───────────────────────────────────────────────────────────────────

const fr: Translations = {
  'nav.settings': 'Paramètres',

  'home.loading':           'Chargement…',
  'home.today':             "Aujourd'hui",
  'home.noLocation.title':  'Aucun lieu défini',
  'home.noLocation.body':   "Configurez votre ville dans les Paramètres pour obtenir la recommandation d'arrosage du jour.",
  'home.noLocation.button': 'Ouvrir les paramètres',
  'home.weather.loading':   'Récupération de la météo…',
  'home.weather.error':     'Impossible de charger les données météo.',
  'home.footer':            'Tirer vers le bas pour actualiser · données toutes les 30 min',
  'home.weatherSummary':    'Résumé météo',

  'decision.water':     "Arroser aujourd'hui",
  'decision.skip':      "Ignorer aujourd'hui",
  'decision.uncertain': 'Vérifier plus tard',

  'reason.recentRain':   "Ne pas arroser aujourd'hui — {{mm}} mm de pluie récemment.",
  'reason.forecastRain': "Ne pas arroser aujourd'hui — {{mm}} mm de pluie attendus.",
  'reason.hotAndDry':    "Arroser aujourd'hui — il fait chaud ({{temp}}°C) et pas de pluie prévue.",
  'reason.default':      "Arroser aujourd'hui — aucune pluie significative récente ou prévue.",
  'reason.noData':       'Données météo insuffisantes. Réessayez dans un instant.',

  'weather.recentRain':   'Pluie dernières 24h',
  'weather.forecastRain': 'Pluie prochaines 24h',
  'weather.todayHigh':    "Max. d'aujourd'hui",

  'badge.free':    'Plan gratuit',
  'badge.premium': '⭐ Premium',

  'settings.locations':                'Lieux ({{n}} / {{max}})',
  'settings.locations.none':           'Aucun lieu ajouté.',
  'settings.locations.search':         'Rechercher une ville…',
  'settings.locations.add':            'Ajouter',
  'settings.locations.useGPS':         '📍  Utiliser ma position actuelle',
  'settings.locations.remove.title':   'Supprimer le lieu',
  'settings.locations.remove.message': 'Supprimer "{{name}}" ?',
  'settings.locations.remove.cancel':  'Annuler',
  'settings.locations.remove.confirm': 'Supprimer',
  'settings.locations.locked':         "Passez à Premium pour suivre jusqu'à {{max}} lieux.",

  'settings.reminder':        'Rappel quotidien',
  'settings.reminder.enable': 'Activer le rappel',
  'settings.reminder.time':   'Heure du rappel',
  'settings.reminder.locked': "Recevez une notification quotidienne avec la recommandation d'arrosage.",

  'settings.language':      'Langue',
  'settings.language.auto': 'Automatique',

  'settings.plan':              'Abonnement',
  'settings.plan.free':         'Plan gratuit',
  'settings.plan.free.hint':    '1 lieu · Publicités · Sans rappels',
  'settings.plan.premium':      'Premium',
  'settings.plan.premium.hint': "Jusqu'à 4 lieux · Sans pub · Rappel quotidien",
  'settings.plan.active':       '⭐ Vous êtes Premium',
  'settings.plan.active.hint':  "Sans pub · Jusqu'à 4 lieux · Rappel quotidien",

  'settings.dev':           'Outils de développement',
  'settings.dev.mock':      'Simuler Premium',
  'settings.dev.mock.hint': 'Basculer UI Premium sans paiement.',

  'settings.about':        'À propos',
  'settings.about.credit': 'Données météo par Open-Meteo (open-meteo.com) — gratuit et open-source.',

  'settings.upgrade':      'Passer à Premium',
  'settings.upgrade.chip': 'Upgrade',
  'locked.title':          'Fonction Premium',

  'premium.title':                 '⭐ Passer à Premium',
  'premium.subtitle':              'Une mise à niveau simple, meilleure expérience.',
  'premium.feature.noAds':         'Sans publicité',
  'premium.feature.reminder':      "Notification quotidienne d'arrosage",
  'premium.feature.locations':     "Jusqu'à 4 lieux",
  'premium.package.monthly':       'Mensuel',
  'premium.package.annual':        'Annuel',
  'premium.package.bestValue':     'Meilleure offre',
  'premium.subscribe':             "S'abonner — {{price}}",
  'premium.restore':               'Restaurer les achats',
  'premium.legal':                 "L'abonnement se renouvelle automatiquement. Annulable à tout moment.",
  'premium.cancelled':             'Achat annulé',
  'premium.cancelled.body':        'Aucun débit effectué.',
  'premium.failed':                "Échec de l'achat",
  'premium.restored':              'Restauré',
  'premium.restored.body':         'Votre accès Premium a été restauré.',
  'premium.nothingToRestore':      'Rien à restaurer',
  'premium.nothingToRestore.body': 'Aucun achat précédent trouvé pour ce compte.',

  'alert.ok':                     'OK',
  'alert.cancel':                  'Annuler',
  'alert.enterCity':               "Entrez d'abord un nom de ville.",
  'alert.cityNotFound':            'Ville introuvable',
  'alert.cityNotFound.body':       "\"{{name}}\" n'a retourné aucun résultat. Essayez une autre orthographe.",
  'alert.addError':                'Erreur',
  'alert.locationError':           'Erreur de localisation',
  'alert.permissionRequired':      'Autorisation requise',
  'alert.permissionRequired.body': 'Activez les notifications dans les paramètres de votre appareil.',

  'notification.title': 'JustSimple Lawn',
  'notification.body':  "Consultez la recommandation d'arrosage du jour ! 🌱",
};

// ─── Italian ──────────────────────────────────────────────────────────────────

const it: Translations = {
  'nav.settings': 'Impostazioni',

  'home.loading':           'Caricamento…',
  'home.today':             'Oggi',
  'home.noLocation.title':  'Nessuna posizione impostata',
  'home.noLocation.body':   'Imposta la tua città nelle Impostazioni per ottenere il consiglio di irrigazione di oggi.',
  'home.noLocation.button': 'Apri impostazioni',
  'home.weather.loading':   'Caricamento meteo…',
  'home.weather.error':     'Impossibile caricare i dati meteo.',
  'home.footer':            'Trascina per aggiornare · dati ogni 30 min',
  'home.weatherSummary':    'Riepilogo meteo',

  'decision.water':     'Irrigare oggi',
  'decision.skip':      'Salta oggi',
  'decision.uncertain': 'Controlla più tardi',

  'reason.recentRain':   'Non irrigare oggi — sono caduti {{mm}} mm di pioggia di recente.',
  'reason.forecastRain': 'Non irrigare oggi — previsti {{mm}} mm di pioggia a breve.',
  'reason.hotAndDry':    'Irrigare oggi — fa caldo ({{temp}}°C) e non è prevista pioggia.',
  'reason.default':      'Irrigare oggi — nessuna pioggia significativa recente o prevista.',
  'reason.noData':       'Dati meteo insufficienti. Riprova tra un momento.',

  'weather.recentRain':   'Pioggia ultime 24h',
  'weather.forecastRain': 'Pioggia prossime 24h',
  'weather.todayHigh':    'Massima di oggi',

  'badge.free':    'Piano gratuito',
  'badge.premium': '⭐ Premium',

  'settings.locations':                'Posizioni ({{n}} / {{max}})',
  'settings.locations.none':           'Nessuna posizione aggiunta.',
  'settings.locations.search':         'Cerca città…',
  'settings.locations.add':            'Aggiungi',
  'settings.locations.useGPS':         '📍  Usa la mia posizione attuale',
  'settings.locations.remove.title':   'Rimuovi posizione',
  'settings.locations.remove.message': 'Rimuovere "{{name}}"?',
  'settings.locations.remove.cancel':  'Annulla',
  'settings.locations.remove.confirm': 'Rimuovi',
  'settings.locations.locked':         'Passa a Premium per seguire fino a {{max}} posizioni.',

  'settings.reminder':        'Promemoria quotidiano',
  'settings.reminder.enable': 'Attiva promemoria',
  'settings.reminder.time':   'Orario promemoria',
  'settings.reminder.locked': 'Ricevi una notifica quotidiana con il consiglio di irrigazione.',

  'settings.language':      'Lingua',
  'settings.language.auto': 'Automatico',

  'settings.plan':              'Piano',
  'settings.plan.free':         'Piano gratuito',
  'settings.plan.free.hint':    '1 posizione · Pubblicità · Nessun promemoria',
  'settings.plan.premium':      'Premium',
  'settings.plan.premium.hint': 'Fino a 4 posizioni · Nessuna pubblicità · Promemoria quotidiano',
  'settings.plan.active':       '⭐ Sei Premium',
  'settings.plan.active.hint':  'Nessuna pubblicità · Fino a 4 posizioni · Promemoria quotidiano',

  'settings.dev':           'Strumenti sviluppatore',
  'settings.dev.mock':      'Simula Premium',
  'settings.dev.mock.hint': 'Attiva UI Premium senza pagamento.',

  'settings.about':        'Informazioni',
  'settings.about.credit': 'Dati meteo forniti da Open-Meteo (open-meteo.com) — gratuito e open-source.',

  'settings.upgrade':      'Passa a Premium',
  'settings.upgrade.chip': 'Upgrade',
  'locked.title':          'Funzione Premium',

  'premium.title':                 '⭐ Vai Premium',
  'premium.subtitle':              'Un semplice upgrade, esperienza migliore.',
  'premium.feature.noAds':         'Nessuna pubblicità',
  'premium.feature.reminder':      'Notifica quotidiana di irrigazione',
  'premium.feature.locations':     'Fino a 4 posizioni',
  'premium.package.monthly':       'Mensile',
  'premium.package.annual':        'Annuale',
  'premium.package.bestValue':     'Miglior offerta',
  'premium.subscribe':             'Abbonati — {{price}}',
  'premium.restore':               'Ripristina acquisti',
  'premium.legal':                 "L'abbonamento si rinnova automaticamente. Annulla in qualsiasi momento.",
  'premium.cancelled':             'Acquisto annullato',
  'premium.cancelled.body':        'Nessun addebito effettuato.',
  'premium.failed':                'Acquisto fallito',
  'premium.restored':              'Ripristinato',
  'premium.restored.body':         'Il tuo accesso Premium è stato ripristinato.',
  'premium.nothingToRestore':      'Niente da ripristinare',
  'premium.nothingToRestore.body': 'Nessun acquisto precedente trovato per questo account.',

  'alert.ok':                     'OK',
  'alert.cancel':                  'Annulla',
  'alert.enterCity':               'Inserisci prima il nome di una città.',
  'alert.cityNotFound':            'Città non trovata',
  'alert.cityNotFound.body':       '"{{name}}" non ha restituito risultati. Prova un\'altra ortografia.',
  'alert.addError':                'Errore',
  'alert.locationError':           'Errore di posizione',
  'alert.permissionRequired':      'Autorizzazione richiesta',
  'alert.permissionRequired.body': 'Abilita le notifiche nelle impostazioni del dispositivo.',

  'notification.title': 'JustSimple Lawn',
  'notification.body':  'Controlla il consiglio di irrigazione di oggi! 🌱',
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const TRANSLATIONS: Record<LanguageCode, Translations> = { en, pl, de, es, fr, it };
