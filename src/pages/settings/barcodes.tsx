import React, {useEffect} from 'react'
import {useRouter} from 'next/router'

export default function SettingsBarcodesRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/settings/bc')
  }, [router])
  return <div />
}
