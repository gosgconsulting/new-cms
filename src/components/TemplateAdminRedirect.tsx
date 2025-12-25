import { Navigate, useParams } from "react-router-dom";

const TemplateAdminRedirect = () => {
  const { templateSlug } = useParams<{ templateSlug: string }>();
  return <Navigate to={`/template/${templateSlug}/auth`} replace />;
};

export default TemplateAdminRedirect;


