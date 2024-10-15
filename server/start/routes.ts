/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
const RegisterController = () => import('#controllers/register_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('register/create', [RegisterController, 'create'])
    router.post('register/verify', [RegisterController, 'verify'])
    router.post('register/resend', [RegisterController, 'resend'])
  })
  .prefix('api')
