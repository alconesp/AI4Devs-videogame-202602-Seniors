const AUDIO_SETTINGS_STORAGE_KEY = 'tiro-al-plato-audio-settings';

export const DEFAULT_AUDIO_SETTINGS = Object.freeze({
  muted: false,
  musicVolume: 0.88,
  sfxVolume: 0.96
});

export function clampAudioVolume(volume) {
  return Math.round(Math.min(Math.max(Number(volume) || 0, 0), 1) * 100) / 100;
}

export function getAudioSettingsFromRegistry(registry) {
  const muted = registry?.get('audioMuted');
  const masterVolume = registry?.get('audioVolume');
  const musicVolume = registry?.get('audioMusicVolume');
  const sfxVolume = registry?.get('audioSfxVolume');
  const fallbackVolume = typeof masterVolume === 'number'
    ? clampAudioVolume(masterVolume)
    : undefined;

  return {
    muted: typeof muted === 'boolean' ? muted : DEFAULT_AUDIO_SETTINGS.muted,
    musicVolume: typeof musicVolume === 'number'
      ? clampAudioVolume(musicVolume)
      : (fallbackVolume ?? DEFAULT_AUDIO_SETTINGS.musicVolume),
    sfxVolume: typeof sfxVolume === 'number'
      ? clampAudioVolume(sfxVolume)
      : (fallbackVolume ?? DEFAULT_AUDIO_SETTINGS.sfxVolume)
  };
}

export function applyAudioSettingsToRegistry(registry, settings) {
  const normalizedSettings = normalizeAudioSettings(settings);

  registry?.set('audioMuted', normalizedSettings.muted);
  registry?.set('audioMusicVolume', normalizedSettings.musicVolume);
  registry?.set('audioSfxVolume', normalizedSettings.sfxVolume);
  registry?.set('audioVolume', Math.max(normalizedSettings.musicVolume, normalizedSettings.sfxVolume));

  return normalizedSettings;
}

export function loadStoredAudioSettings() {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }

  try {
    const rawSettings = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return { ...DEFAULT_AUDIO_SETTINGS };
    }

    return normalizeAudioSettings(JSON.parse(rawSettings));
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export function saveAudioSettings(settings) {
  const normalizedSettings = normalizeAudioSettings(settings);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(normalizedSettings));
    } catch {
      // Ignore storage failures and keep runtime settings.
    }
  }

  return normalizedSettings;
}

export function syncStoredAudioSettings(registry, settings) {
  const normalizedSettings = saveAudioSettings(settings);
  applyAudioSettingsToRegistry(registry, normalizedSettings);
  return normalizedSettings;
}

function normalizeAudioSettings(settings) {
  const fallbackVolume = clampAudioVolume(settings?.volume ?? DEFAULT_AUDIO_SETTINGS.musicVolume);

  return {
    muted: Boolean(settings?.muted),
    musicVolume: clampAudioVolume(settings?.musicVolume ?? fallbackVolume ?? DEFAULT_AUDIO_SETTINGS.musicVolume),
    sfxVolume: clampAudioVolume(settings?.sfxVolume ?? fallbackVolume ?? DEFAULT_AUDIO_SETTINGS.sfxVolume)
  };
}