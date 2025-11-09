import React from 'react'

interface Post {
  id: string
  title: string
  slug: string
  content: string
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts?where[slug][equals]=${slug}`,
    { cache: 'no-store' },
  )

  if (!res.ok) {
    throw new Error('Failed to fetch post')
  }

  const { docs }: { docs: Post[] } = await res.json()
  const post = docs[0]

  if (!post) {
    return <h1>Post not found</h1>
  }

  return (
    <article className="prose mx-auto py-10">
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
