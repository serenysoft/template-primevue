import { i18n } from '#helpers/index'
import User from '#models/user'
import { createRegisterValidator, verifyRegisterValidator } from '#validators/register'
import type { HttpContext } from '@adonisjs/core/http'
import config from '@adonisjs/core/services/config'
import encryption from '@adonisjs/core/services/encryption'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class RegisterController {
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createRegisterValidator)

    await User.create(payload)

    await this.sendVerifyEmail(payload.username)

    return response.noContent()
  }

  async verify({ request, response }: HttpContext) {
    const payload = await request.validateUsing(verifyRegisterValidator)
    const username = encryption.decrypt(payload.code)
    const user = await User.findBy({ username })

    if (!user) {
      return response.notFound()
    }

    if (!user.verifiedAt) {
      user.verifiedAt = DateTime.local()
      await user.save()
    }

    return response.json({ username })
  }

  async resend({ request, response }: HttpContext) {
    const payload = await request.validateUsing(verifyRegisterValidator)
    const username = encryption.decrypt(payload.code) as string

    await this.sendVerifyEmail(username)

    return response.noContent()
  }

  private async sendVerifyEmail(username: string) {
    const { t } = i18n()
    const baseUrl = config.get('app.appUrl')

    await mail.send((message) => {
      message
        .to(username)
        .subject(t('messages.email_confirmation_subject'))
        .htmlView('emails/register_confirmation_html', {
          link: `${baseUrl}/verify/${username}`,
        })
    })
  }
}
