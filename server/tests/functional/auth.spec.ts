import { UserFactory } from '#database/factories/user_factory'
import encryption from '@adonisjs/core/services/encryption'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Authentication', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('Should handle success login', async ({ client }) => {
    const user = await UserFactory.merge({
      verifiedAt: DateTime.now(),
      password: '123456789',
    }).create()

    const response = await client.post('api/login').json({
      username: user.username,
      password: '123456789',
    })

    response.assertStatus(200)
    response.assertBodyContains({ username: user.username })
  })

  test('Should handle invalid username', async ({ client }) => {
    await UserFactory.create()

    const response = await client.post('api/login').json({
      username: 'invalid@template-primevue.com',
      password: '123456789',
    })

    response.assertStatus(404)
  })

  test('Should handle unverified user', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('api/login').json({
      username: user.username,
      password: '123456789',
    })

    response.assertStatus(400)
    response.assertBody({ error: 'userNotVerified' })
  })

  test('Should handle login with invalid credentials', async ({ client }) => {
    const user = await UserFactory.merge({
      verifiedAt: DateTime.now(),
      password: '123456789',
    }).create()

    const response = await client.post('api/login').json({
      username: user.username,
      password: 'invalid',
    })

    response.assertStatus(400)
    response.assertBody({ error: 'invalidCredentials' })
  })

  test('Should handle reset password', async ({ client }) => {
    const user = await UserFactory.merge({
      verifiedAt: DateTime.now(),
      password: '123456789',
    }).create()

    const code = encryption.encrypt(user.username)

    const response = await client.post('api/reset-password').json({
      code,
      password: 'newpasswd',
    })

    response.assertStatus(200)
    response.assertBodyContains({ username: user.username })
  })

  test('Should register new user', async ({ client }) => {
    const username = 'john@template-primevue.com'

    const response = await client.post('api/register/create').json({
      name: 'John',
      username,
      password: '123456789',
    })

    response.assertStatus(200)
    response.assertBodyContains({ username })
  })

  test('Should validate unique username', async ({ client }) => {
    const user = await UserFactory.merge({ username: 'john@template-primevue.com' }).create()

    const response = await client.post('api/register/create').json({
      name: 'John',
      username: user.username,
      password: '123456789',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'username',
          rule: 'unique',
        },
      ],
    })
  })

  test('Should verify email', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const encrypted = encryption.encrypt(user.username)

    const response = await client.post(`api/register/verify`).json({
      code: encrypted,
    })

    response.assertStatus(200)
    response.assertBody({ username: user.username })

    await user.refresh()
    assert.isNotNull(user.verifiedAt)
  })

  test('Should resend verify email', async ({ client }) => {
    const user = await UserFactory.create()
    const encrypted = encryption.encrypt(user.username)

    const response = await client.post(`api/register/resend`).json({
      code: encrypted,
    })

    response.assertStatus(204)
  })

  test('Should send reset password email', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post(`api/reset-link`).json({
      username: user.username,
    })

    response.assertStatus(204)
  })

  test('Should reset password', async ({ client }) => {
    const user = await UserFactory.create()
    const encrypted = encryption.encrypt(user.username)

    const response = await client.post(`api/reset-password`).json({
      code: encrypted,
      password: 'abcd1234',
    })

    response.assertStatus(200)
    response.assertBodyContains({ username: user.username })
  })
})
