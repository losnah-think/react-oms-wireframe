import IndexPage from './index'
export default IndexPage

export const getServerSideProps = async (ctx: any) => {
  const page = ctx.query?.page ?? null
  if (process.env.NEXT_PUBLIC_DEV_NO_AUTH === '1' || process.env.NODE_ENV !== 'production') {
    return { props: { session: true, initialPage: page } }
  }
  return { props: { session: false, initialPage: page } }
}
