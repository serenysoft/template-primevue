import { UserFactory } from '#database/factories/user_factory'
import encryption from '@adonisjs/core/services/encryption'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Register', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('Should register new user', async ({ client }) => {
    const response = await client.post('api/register/create').json({
      name: 'John',
      username: 'john@template-primevue.com',
      password: '123456789',
    })

    response.assertStatus(204)
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
})
