import React from 'react'

interface PortfolioItemProps {
  imageUrl: string
  altText: string
  title: string
  category: string
}

const portfolioItems: PortfolioItemProps[] = [
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

export const Portfolio = () => (
  <section id="portfolio" className="mb-24 md:mb-32">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Recent Work</h2>
      <p className="text-lg text-gray-600 mt-2">
        {"We're proud of the work we do for our clients."}
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {portfolioItems.map((item) => (
        <PortfolioItem key={item.title} {...item} />
      ))}
    </div>
  </section>
)
