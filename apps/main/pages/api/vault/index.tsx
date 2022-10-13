import { createOrUpdate } from 'apps/main/handlers/vault/createOrUpdate'
import { apply } from 'apps/main/helpers/apply'
import { userJwt } from 'apps/main/helpers/useJwt'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await createOrUpdate(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
