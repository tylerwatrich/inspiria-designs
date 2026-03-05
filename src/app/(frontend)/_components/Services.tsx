import React from 'react'
import { CodeIcon, LayoutIcon, MonitorIcon } from '@/components/Icons'

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const services: ServiceCardProps[] = [
  {
    icon: <CodeIcon />,
    title: 'Web Design & Development',
    description:
      'Crafting responsive, high-performing websites that look amazing on all devices and drive results.',
  },
  {
    icon: <LayoutIcon />,
    title: 'Brand Identity',
    description:
      'We create a cohesive and powerful visual identity—from core logos and style guides to marketing assets—that tells your unique story and drives recognition.',
  },
  {
    icon: <MonitorIcon />,
    title: 'UI/UX Design',
    description:
      'We focus on creating intuitive and enjoyable digital experiences for your users, boosting engagement.',
  },
]

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => (
  <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-floating card">
    <div className="bg-brand-blue-500/10 text-brand-blue-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
)

export const Services = () => (
  <section id="services" className="mb-24 md:mb-32">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
        What We Do
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
        We offer a complete suite of design services.
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service) => (
        <ServiceCard key={service.title} {...service} />
      ))}
    </div>
  </section>
)
