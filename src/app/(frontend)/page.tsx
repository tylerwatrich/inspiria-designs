// import PageTemplate, { generateMetadata } from './[slug]/page'

// export default PageTemplate

// export { generateMetadata }

import { getPayload } from 'payload'
import config from '@payload-config'
import { Media } from '@/components/Media'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const home = await payload.findGlobal({ slug: 'home' })

  return (
    <main>
      <div>Hello</div>
      <h1> {home.heroTitle}</h1>
      <Media resource={home.aboutImage} />
    </main>
  )
}
