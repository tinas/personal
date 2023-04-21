import Head from 'next/head'
import Link from "next/link"

import IconTwitter from 'components/icons/twitter'
import IconGitHub from 'components/icons/github'
import IconInstagram from 'components/icons/instagram'

import styles from 'styles/Home.module.scss'

export default function Home() {
  return (
    <>
      <Head>
        <title>Ahmet Tınastepe</title>
        <meta
          name="description"
          content="Merhaba ben Ahmet, Full-Stack yazılım geliştiricisiyim. Web sayfamdaki bağlantılardan benimle iletişime geçebilirsiniz."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
          <h1 className={styles.hero}>Ahmet Tınastepe</h1>
          <p className={styles['job-title']}>Software Developer</p>
          <div className={styles.social}>
              <Link href="https://github.com/tinas">
                <IconGitHub className={styles['social__github']}/>
              </Link>
              <Link href="https://twitter.com/tinasdev">
                <IconTwitter className={styles['social__twitter']}/>
              </Link>
              <Link href="https://instagram.com/tinasdev">
                <IconInstagram className={styles['social__instagram']}/>
              </Link>
          </div>
      </main>
    </>
  )
}
