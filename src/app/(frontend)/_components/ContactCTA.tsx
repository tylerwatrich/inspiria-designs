import React from 'react'

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@inspiriadesigns.com'

export const ContactCTA = () => (
  <section
    id="contact"
    className="bg-brand-blue-500 text-white rounded-2xl shadow-floating-lg p-8 md:p-16 text-center"
  >
    <h2 className="text-3xl md:text-4xl font-bold mb-4">
      {"Have an idea? Let's build it together."}
    </h2>
    <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
      {
        "Ready to start your next project? We're here to help. Contact us for a free, no-obligation consultation."
      }
    </p>
    <a
      href={`mailto:${contactEmail}`}
      className="bg-white text-brand-blue-600 font-bold py-3 px-8 rounded-lg shadow-floating hover:bg-gray-100 transition-all transform hover:scale-105"
    >
      Contact Us Now
    </a>
  </section>
)
