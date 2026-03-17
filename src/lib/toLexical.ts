type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }

function makeText(text: string) {
  return {
    detail: 0, format: 0, mode: 'normal', style: '',
    text, type: 'text', version: 1,
  }
}

export function toLexical(blocks: Block[]) {
  const children = blocks.map((block) => {
    if (block.type === 'heading') {
      return {
        children: [makeText(block.text)],
        direction: 'ltr', format: '', indent: 0,
        tag: `h${block.level}`, type: 'heading', version: 1,
      }
    }
    return {
      children: [makeText(block.text)],
      direction: 'ltr', format: '', indent: 0,
      type: 'paragraph', version: 1,
    }
  })
  return {
    root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 },
  }
}
