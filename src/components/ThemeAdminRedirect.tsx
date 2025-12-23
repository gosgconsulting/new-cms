import { Navigate, useParams } from "react-router-dom";

const ThemeAdminRedirect = () => {
  const { themeSlug } = useParams<{ themeSlug: string }>();
  return <Navigate to={`/theme/${themeSlug}/auth`} replace />;
};

export default ThemeAdminRedirect;

