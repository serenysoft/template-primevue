/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/register/create', [AuthController, 'create'])
    router.post('/register/verify', [AuthController, 'verify'])
    router.post('/register/resend', [AuthController, 'resend'])
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('api')
