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

export const resetPasswordValidation = vine.compile(
  vine.object({
    code: vine.string().trim().maxLength(255),
    password: vine.string().trim().maxLength(255),
  })
)

export const resetLinkValidation = vine.compile(
  vine.object({
    username: vine.string().trim().maxLength(255),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    username: vine.string().trim().maxLength(255),
    password: vine.string().trim().maxLength(255),
  })
)
