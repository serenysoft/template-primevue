import i18nManager from '@adonisjs/i18n/services/main'

export function i18n() {
  const locale = i18nManager.locale(i18nManager.defaultLocale)

  return {
    t: (identifier: string, data?: Record<string, any>, fallbackMessage?: string) => {
      return locale.t(identifier, data, fallbackMessage)
    },
  }
}
