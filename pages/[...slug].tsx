import IndexPage from "./index";
export default IndexPage;

export const getServerSideProps = async (ctx: any) => {
  const page = ctx.query?.page ?? null;
  // In dev allow previewing without login. Also if mocks are enabled in production,
  // render the app (skip login) so mock data can be viewed.
  if (
    process.env.NEXT_PUBLIC_DEV_NO_AUTH === "1" ||
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1"
  ) {
    return { props: { session: true, initialPage: page } };
  }
  return { props: { session: false, initialPage: page } };
};
