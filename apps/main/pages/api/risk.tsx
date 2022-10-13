import { withSentry } from '@sentry/nextjs'
import { getRisk } from 'apps/main/handlers/risk/get'
import { apply } from 'apps/main/helpers/apply'
import { NextApiHandler } from 'next'
import { userJwt } from 'server/jwt'

// eslint-disable-next-line func-style
const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await getRisk(req, res)
    default:
      return res.status(405).end()
  }
}

export default withSentry(apply(userJwt, handler))
