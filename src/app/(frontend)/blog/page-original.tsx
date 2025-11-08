import React from 'react'

interface Post {
  id: string
  title: string
  slug: string
}

export default async function BlogIndexPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts`)
  const { docs }: { docs: Post[] } = await res.json()

  return (
    <main className="prose mx-auto py-10">
      <h1>Blog</h1>
      <ul>
        {docs.map((post) => (
          <li key={post.id}>
            <a href={`/blog/${post.slug}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </main>
  )
}
