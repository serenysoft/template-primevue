import { uniqueRule } from '#rules/unique'
import vine from '@vinejs/vine'

export const createRegisterValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    username: vine
      .string()
      .trim()
      .email()
      .maxLength(255)
      .use(
        uniqueRule({
          table: 'users',
          column: 'username',
        })
      ),
    password: vine.string().trim(),
  })
)

export const verifyRegisterValidator = vine.compile(
  vine.object({
    code: vine.string().trim().maxLength(255),
  })
)
