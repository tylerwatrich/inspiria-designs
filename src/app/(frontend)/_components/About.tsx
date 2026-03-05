import React from 'react'
import { Media } from '@/components/Media'
import { CheckIcon } from '@/components/Icons'
import { Media as MediaType } from '@/payload-types'

interface AboutProps {
  aboutImage?: number | MediaType | null
}

const valueProps = [
  {
    label: 'Client-Centric Approach',
    description: 'Your goals are our priority from start to finish.',
  },
  {
    label: 'Creative Excellence',
    description: 'We push boundaries to deliver innovative and memorable designs.',
  },
  {
    label: 'On-Time Delivery',
    description: 'We respect your time and deadlines, ensuring projects are completed efficiently.',
  },
]

export const About = ({ aboutImage }: AboutProps) => (
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
          "We're your dedicated partner, focused on delivering exceptional results. Our process is collaborative, transparent, and streamlined to bring your vision to life with efficiency and precision."
        }
      </p>
      <ul className="space-y-3">
        {valueProps.map(({ label, description }) => (
          <li key={label} className="flex items-start">
            <CheckIcon className="w-6 h-6 text-brand-blue-500 mr-3 flex-shrink-0 mt-1" />
            <span>
              <span className="font-semibold">{label}:</span> {description}
            </span>
          </li>
        ))}
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
