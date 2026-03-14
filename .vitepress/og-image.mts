import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

interface Writing {
  writingSlug: string
  title: string
  photo: {
    by: string
    image: string
    href: string
  }
}

function loadImageAsBase64(filePath: string): string {
  const buffer = readFileSync(filePath)
  const ext = filePath.endsWith('.png') ? 'png' : 'jpeg'
  return `data:image/${ext};base64,${buffer.toString('base64')}`
}

function loadFont(path: string): ArrayBuffer {
  const buffer = readFileSync(path)
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

async function resizeArticlePhoto(imagePath: string, width: number, height: number): Promise<string> {
  const buffer = await sharp(imagePath)
    .resize(width, height, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

function buildMarkup(writing: Writing, profileSrc: string, bgPhotoSrc: string, cardPhotoSrc: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
      },
      children: [
        // Article photo as background
        {
          type: 'img',
          props: {
            src: bgPhotoSrc,
            width: 1200,
            height: 630,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0.3,
            },
          },
        },
        // Gradient overlay
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '630px',
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(26, 26, 46, 0.7) 50%, rgba(255, 122, 61, 0.3) 100%)',
            },
          },
        },
        // Main layout: left content + right photo
        {
          type: 'div',
          props: {
            style: {
              position: 'relative',
              display: 'flex',
              width: '100%',
              height: '100%',
            },
            children: [
              // Left content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                    padding: '60px',
                    paddingRight: '40px',
                  },
                  children: [
                    // Top: Site name
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '24px',
                          color: '#ff7a3d',
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                        },
                        children: 'tinas.dev',
                      },
                    },
                    // Middle: Title
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: writing.title.length > 60 ? '42px' : '52px',
                          color: '#ffffff',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          letterSpacing: '-0.03em',
                        },
                        children: writing.title,
                      },
                    },
                    // Bottom: Profile + name
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: profileSrc,
                              width: 56,
                              height: 56,
                              style: {
                                borderRadius: '50%',
                                border: '3px solid #ff7a3d',
                              },
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '22px',
                                color: '#ffffff',
                                fontWeight: 600,
                              },
                              children: 'Ahmet Tınastepe',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              // Right side: Article photo card
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '60px',
                  },
                  children: {
                    type: 'img',
                    props: {
                      src: cardPhotoSrc,
                      width: 340,
                      height: 220,
                      style: {
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        border: '2px solid rgba(255, 122, 61, 0.4)',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  }
}

export async function generateOgImages(fontPath: string) {
  const writings: Writing[] = JSON.parse(
    readFileSync(resolve(__dirname, 'theme/components/writings.json'), 'utf-8'),
  )

  const font = loadFont(fontPath)
  const profileSrc = loadImageAsBase64(resolve(publicDir, 'profile.png'))

  for (const writing of writings) {
    const imagePath = writing.photo.image.startsWith('/')
      ? writing.photo.image.slice(1)
      : writing.photo.image
    const fullImagePath = resolve(publicDir, imagePath)

    const [bgPhotoSrc, cardPhotoSrc] = await Promise.all([
      resizeArticlePhoto(fullImagePath, 1200, 630),
      resizeArticlePhoto(fullImagePath, 340, 220),
    ])

    const markup = buildMarkup(writing, profileSrc, bgPhotoSrc, cardPhotoSrc)

    const svg = await satori(markup as any, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    })

    const outputPath = resolve(publicDir, 'og', `${writing.writingSlug}.jpg`)
    await mkdir(dirname(outputPath), { recursive: true })
    const jpgBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
    await writeFile(outputPath, jpgBuffer)

    console.warn(`Generated: writing/${writing.writingSlug}.jpg`)
  }
}
