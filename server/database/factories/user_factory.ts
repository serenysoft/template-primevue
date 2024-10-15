import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      name: faker.internet.email(),
      username: faker.internet.email(),
      password: faker.internet.password(),
    }
  })
  .build()
