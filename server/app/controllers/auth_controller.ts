import { i18n } from '#helpers/index'
import User from '#models/user'
import { createRegisterValidator, loginValidator, verifyRegisterValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import config from '@adonisjs/core/services/config'
import encryption from '@adonisjs/core/services/encryption'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const user = await User.findBy({ username: payload.username })

    if (!user) {
      return response.notFound({ error: 'userNotFound' })
    }

    if (!user.verifiedAt) {
      return response.abort({ error: 'userNotVerified' })
    }

    const isPasswordValid = await hash.verify(user.password, payload.password)

    if (!isPasswordValid) {
      return response.abort({ error: 'invalidCredentials' })
    }

    return response.json(user)
  }

  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createRegisterValidator)

    await User.create(payload)

    await this.sendVerifyEmail(payload.username)

    return response.json({ username: payload.username })
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
    const code = encryption.encrypt(username)

    await mail.send((message) => {
      message
        .to(username)
        .subject(t('messages.email_confirmation_subject'))
        .htmlView('emails/register_confirmation_html', {
          link: `${baseUrl}/verify/${code}`,
        })
    })
  }
}
