import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { Hero } from './_components/Hero'
import { Services } from './_components/Services'
import { Portfolio } from './_components/Portfolio'
import { About } from './_components/About'
import { ContactCTA } from './_components/ContactCTA'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const home = await payload.findGlobal({ slug: 'home' })

  return (
    <main>
      <div className="bg-light-bg dark:bg-zinc-900 text-gray-800 dark:text-gray-300 font-sans">
        <div className="container mx-auto px-6 py-12 md:py-20">
          <Hero />
          <Services />
          <Portfolio />
          <About aboutImage={home.aboutImage} />
          <ContactCTA />
        </div>
      </div>
    </main>
  )
}
