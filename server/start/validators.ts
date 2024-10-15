import { UniqueOptions, uniqueRule } from '#rules/unique'
import { VineString } from '@vinejs/vine'

declare module '@vinejs/vine' {
  interface VineString {
    unique(options: UniqueOptions): this
  }
}

VineString.macro('unique', function (this: VineString, options: UniqueOptions) {
  return this.use(uniqueRule(options))
})
