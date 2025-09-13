import '../src/App.css'
import 'react-quill/dist/quill.snow.css'
import type { AppProps } from 'next/app'
import { GridStyles } from '../src/design-system/components'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <GridStyles />
      <main id="main-content">
        <Component {...pageProps} />
      </main>
    </>
  )
}
