import { get } from 'apps/main/handlers/tos/get'
import { apply } from 'apps/main/helpers/apply'
import { userJwt } from 'apps/main/helpers/useJwt'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
