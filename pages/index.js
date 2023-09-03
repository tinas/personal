import Head from 'next/head'

import IconGitHub from 'components/icons/github'
import IconFigma from "../components/icons/figma";
import IconTwitter from 'components/icons/twitter'
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
              <a href="https://github.com/tinas" target="_blank" rel="noreferrer">
                <IconGitHub/>
              </a>
              <a href="https://figma.com/@tinas" target="_blank" rel="noreferrer">
                  <IconFigma/>
              </a>
              <a href="https://twitter.com/tinasdev" target="_blank" rel="noreferrer">
                <IconTwitter/>
              </a>
              <a href="https://instagram.com/tinasdev" target="_blank" rel="noreferrer">
                <IconInstagram/>
              </a>
          </div>
      </main>
    </>
  )
}
