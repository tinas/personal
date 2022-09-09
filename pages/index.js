import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Ahmet Tınastepe</title>
        <meta
          name="description"
          content="Merhaba ben Ahmet, Full-Stack yazılım geliştiricisiyim. Web sayfamdaki bağlantılardan benimle iletişime geçebilirsiniz."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Merhaba Ben Ahmet 👋</h1>
      </main>
    </div>
  )
}
