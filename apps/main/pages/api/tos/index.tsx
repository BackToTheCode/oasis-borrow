import { sign } from 'apps/main/handlers/tos/sign'
import { apply } from 'apps/main/helpers/apply'
import { userJwt } from 'apps/main/helpers/useJwt'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await sign(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
