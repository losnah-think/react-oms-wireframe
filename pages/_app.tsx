import '../src/App.css'
import 'react-quill/dist/quill.snow.css'
import type { AppProps } from 'next/app'
import { GridStyles } from '../src/design-system/components'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GridStyles />
      <Component {...pageProps} />
    </>
  )
}
