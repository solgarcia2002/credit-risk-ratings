import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import Calculator from "../components/calculator";
const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Credit Risk Rating Calculator</title>
        <meta name="description" content="Credit risk rating calculator, developed by Sol Garcia. Calculates risk for apps, consuming and exporting cvs files" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome <FavoriteIcon fontSize={'large'}/> to <SportsEsportsIcon fontSize={'large'}/> Risk Calculator
        </h1>

        <p className={styles.description}> This is the funniest risk calculator . Based on the list of companies and
          the daily financial metrics for those companies you can evaluate the credit risk rating of each app.
        </p>

<Calculator />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.linkedin.com/in/javascriptninja/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Sol Garcia ;)
        </a>
      </footer>
    </div>
  )
}

export default Home
