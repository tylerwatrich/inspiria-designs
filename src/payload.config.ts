// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { fileURLToPath } from 'url'

// import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import { ArticleTypes } from './collections/ArticleTypes'
import { Categories } from './collections/Categories'
import { Industries } from './collections/Industries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Home } from './globals/Home'
import { Posts } from './collections/Posts'
import { TargetAudience } from './collections/TargetAudience'
import { Users } from './collections/Users'
import { FAQs } from './collections/FAQs'
import { Leads } from './collections/Leads'
import { SearchLogs } from './collections/SearchLogs'
import { PageViews } from './collections/PageViews'
import { PageVisits } from './collections/PageVisits'
import { TrackingEvents } from './collections/TrackingEvents'
import { ArticleSuggestions } from './collections/ArticleSuggestions'
import { QualityReviews } from './collections/QualityReviews'
import { CTAs } from './collections/CTAs'
import { AutomationSettings } from './globals/AutomationSettings'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const storagePlugin = process.env.VERCEL_ENV
  ? vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    })
  : undefined

const generateTitle: GenerateTitle = ({ doc }) => {
  return doc?.title ? `${doc.title} | Inspiria Digital` : 'Inspiria Digital'
}

const generateURL: GenerateURL = ({ doc, collectionConfig }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  if (!doc?.slug) return baseUrl

  const slug = Array.isArray(doc.slug) ? doc.slug.join('/') : doc.slug

  // Only use /blog/ prefix for posts collection
  if (collectionConfig?.slug === 'posts') {
    return `${baseUrl}/blog/${slug}`
  }

  // All other collections (pages, etc.) use root path
  return `${baseUrl}/${slug}`
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    TargetAudience,
    ArticleTypes,
    Industries,
    Leads,
    FAQs,
    SearchLogs,
    PageViews,
    PageVisits,
    TrackingEvents,
    ArticleSuggestions,
    QualityReviews,
    CTAs,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, Home, SiteSettings, AutomationSettings],
  plugins: [
    ...plugins,
    ...(storagePlugin ? [storagePlugin] : []),
    // seoPlugin({
    //   collections: ['pages'],
    //   uploadsCollection: 'media',
    //   generateTitle,
    //   generateURL,
    //   tabbedUI: true, // Adds a separate "SEO" tab in the admin
    // }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
