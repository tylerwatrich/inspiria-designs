// import PageTemplate, { generateMetadata } from './[slug]/page'

// export default PageTemplate

// export { generateMetadata }

// import React, { useState } from 'react'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Media } from '@/components/Media'
import { Media as MediaType } from '@/payload-types'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'
import { getServerSideURL } from '@/utilities/getURL'

// --- Data for mapping ---
const servicesData = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    title: 'Web Design & Development',
    description:
      'Fast, mobile-ready websites built to rank on Google — and optimized for AI search tools like ChatGPT and Perplexity that are changing how people find businesses. Not just something that looks good — something that gets found.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    title: 'Brand Identity',
    description:
      'A visual identity that tells your story instantly. Logos, colours, and style that people remember and trust.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'UI/UX Design',
    description:
      'Intuitive digital experiences that keep people engaged and make it easy for them to do what you want them to do.',
  },
]

const portfolioData = [
  {
    imageUrl: 'https://placehold.co/600x400/0d6efd/ffffff?text=Project+One',
    altText: 'Portfolio Project One',
    title: 'Corporate Website',
    category: 'Web Design',
  },
  {
    imageUrl: 'https://placehold.co/600x400/343a40/ffffff?text=Project+Two',
    altText: 'Portfolio Project Two',
    title: 'Mobile App UI',
    category: 'UI/UX Design',
  },
  {
    imageUrl: 'https://placehold.co/600x400/6c757d/ffffff?text=Project+Three',
    altText: 'Portfolio Project Three',
    title: 'Brand Identity Pack',
    category: 'Graphic Design',
  },
]

interface ServiceCardProps {
  // icon is a React element (like your SVG) or another component
  icon: React.ReactNode
  title: string
  description: string
}

// Define the Interface for the component's props
interface PortfolioItemProps {
  imageUrl: string
  altText: string
  title: string
  category: string
  // Next/Image best practice: include width/height if available,
  // or use 'fill' with a defined parent container size.
  width?: number
  height?: number
}

interface MediaItem {
  id: string | number
  alt: string // Assuming 'alt' is a field on your media collection
  url: string // The URL must be present for display
  filename: string
  mimeType: string
  // Add other fields you might use, like width/height
}

// 🚀 UPDATED PROP INTERFACE 🚀

// --- Reusable Components ---
const ServiceCard = ({ icon, title, description }: ServiceCardProps) => (
  <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-floating card">
    <div className="bg-brand-blue-500/10 text-brand-blue-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
)

const PortfolioItem = ({ imageUrl, altText, title, category }: PortfolioItemProps) => (
  <div className="bg-white rounded-2xl shadow-floating card overflow-hidden group">
    <img
      src={imageUrl}
      alt={altText}
      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
    />
    <div className="p-6">
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-brand-blue-500">{category}</p>
    </div>
  </div>
)

const Hero = () => (
  <section className="text-center my-24 md:my-32">
    <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-300 leading-tight mb-4">
      Your business deserves <span className="text-brand-blue-500">to be found.</span>
    </h1>
    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
      We build digital presence that actually works — websites, branding, and online strategy that
      turns visitors into customers and makes your business look like it means business.
    </p>
    <div className="flex justify-center items-center gap-4">
      <a
        href="#about"
        className="bg-brand-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-floating-lg hover:bg-brand-blue-600 transition-all transform hover:scale-105"
      >
        About Us
      </a>
      <a
        href="#services"
        className="bg-white text-gray-700 font-bold py-3 px-8 rounded-lg shadow-floating-lg hover:bg-gray-100 transition-all transform hover:scale-105 border border-gray-200"
      >
        Our Services
      </a>
    </div>
  </section>
)

const Services = () => (
  <section id="services" className="mb-24 md:mb-32">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
        What We Do
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
        Everything your business needs to get online and get competitive.
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {servicesData.map((service, index) => (
        <ServiceCard key={index} {...service} />
      ))}
    </div>
  </section>
)

const Portfolio = () => (
  <section id="portfolio" className="mb-24 md:mb-32">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Recent Work</h2>
      <p className="text-lg text-gray-600 mt-2">
        {"We're proud of the work we do for our clients."}
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {portfolioData.map((item, index) => (
        <PortfolioItem key={index} {...item} />
      ))}
    </div>
  </section>
)

interface AboutProps {
  aboutImage?: number | MediaType | null
}

const About = ({ aboutImage }: AboutProps) => (
  <section
    id="about"
    className="bg-white dark:bg-zinc-800 rounded-2xl shadow-floating p-8 md:p-12 mb-24 md:mb-32 flex flex-col md:flex-row items-center gap-8 md:gap-12"
  >
    <div className="w-full md:w-1/2">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-300 mb-4">
        Why Choose Us?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {
          "We're not a faceless agency running cookie-cutter templates. We take the time to understand your business, move fast, and deliver work that actually moves the needle. No fluff, no runaround."
        }
      </p>
      <ul className="space-y-3">
        <li className="flex items-start">
          <svg
            className="w-6 h-6 text-brand-blue-500 mr-3 flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span>
            <span className="font-semibold">Built for Canada:</span> We know the market and
            understand the landscape.
          </span>
        </li>
        <li className="flex items-start">
          <svg
            className="w-6 h-6 text-brand-blue-500 mr-3 flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span>
            <span className="font-semibold">No runaround:</span> Direct, honest, and moving fast —
            no corporate bloat.
          </span>
        </li>
        <li className="flex items-start">
          <svg
            className="w-6 h-6 text-brand-blue-500 mr-3 flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span>
            <span className="font-semibold">Real results:</span> Websites built to show up on Google
            and optimized for AEO — so AI tools like ChatGPT and Perplexity recommend your business
            too.
          </span>
        </li>
      </ul>
    </div>
    <div className="w-full md:w-1/2 relative min-h-[500px]">
      <Media
        resource={aboutImage}
        fill={true}
        size="(max-width: 768px) 100vw, 50vw"
        imgClassName="rounded-2xl object-cover"
      />
    </div>
  </section>
)

const ContactCTA = () => (
  <section
    id="contact"
    className="bg-brand-blue-500 text-white rounded-2xl shadow-floating-lg p-8 md:p-16 text-center"
  >
    <h2 className="text-3xl md:text-4xl font-bold mb-4">{'Ready to start growing?'}</h2>
    <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
      {'Tell us about your business and where you want to take it. Free consultation, no pressure.'}
    </p>
    <LeadCaptureModal
      triggerLabel="Contact Us Now"
      triggerClassName="bg-white text-brand-blue-600 font-bold py-3 px-8 rounded-lg shadow-floating hover:bg-gray-100 transition-all transform hover:scale-105"
      source="homepage"
    />
  </section>
)

export default async function HomePage() {
  const payload = await getPayload({ config })
  const [home, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'home' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const siteUrl = getServerSideURL()

  const ldJson = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteSettings.siteName,
        url: siteUrl,
        ...(siteSettings.siteDescription ? { description: siteSettings.siteDescription } : {}),
        ...(siteSettings.areaServed ? { areaServed: siteSettings.areaServed } : {}),
        knowsAbout: ['Web Design', 'Web Development', 'Brand Identity', 'UI/UX Design', 'SEO', 'Digital Strategy'],
      },
      {
        '@type': 'WebSite',
        name: siteSettings.siteName,
        url: siteUrl,
      },
    ],
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <div className="bg-light-bg dark:bg-zinc-900 text-gray-800 dark:text-gray-300 font-sans">
        {/* <Header /> */}
        <main className="container mx-auto px-6 py-12 md:py-20">
          <Hero />
          <Services />
          {/* <Portfolio /> */}
          <About aboutImage={home.aboutImage} />
          <ContactCTA />
        </main>
        {/* <Footer /> */}
      </div>
    </main>
  )
}

// OPTIONAL: Define custom metadata for this page
export const metadata = {
  // title: 'My Custom Home',
  // description: 'A brief description of my new home page.',
}
