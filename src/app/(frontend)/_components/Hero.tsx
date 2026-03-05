import React from 'react'

export const Hero = () => (
  <section className="text-center my-24 md:my-32">
    <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-300 leading-tight mb-4">
      Creative Ideas, <span className="text-brand-blue-500">Stunning Designs</span>.
    </h1>
    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
      Crafting beautiful, user-friendly websites and strategic visual branding that helps your
      business shine.
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
