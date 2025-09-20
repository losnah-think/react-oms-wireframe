import LoginPage from "@/features/settings/integration-admin/login";

// Opt-out of global Layout by setting the page component property
(LoginPage as any).disableLayout = true;
// Allow disabling layout in production only when this flag is present
(LoginPage as any).disableLayoutAllowed = true;

export default LoginPage;
