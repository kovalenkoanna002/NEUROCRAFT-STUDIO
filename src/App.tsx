import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import "./styles/styles.scss";
import { RequireAuth } from "./auth/RequireAuth";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import Loader from "./components/Loader/Loader";

const LoginForm = lazy(() =>
  import("./pages/Login/LoginForm").then((m) => ({ default: m.LoginForm }))
);
const RegisterForm = lazy(() =>
  import("./pages/Registration/RegisterForm").then((m) => ({
    default: m.RegisterForm,
  }))
);
const CodeGeneration = lazy(
  () => import("./pages/CodeGeneration/CodeGeneration")
);
const VisualizationArchitecture = lazy(
  () => import("./pages/VisualizationArсhitecture/VisualizationArсhitecture")
);
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase/KnowledgeBase"));
const Account = lazy(() => import("./pages/Account/Account"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const Playground = lazy(() => import("./pages/Playground/Playground"));

const PageFallback = () => (
  <div style={{ padding: "160px 24px" }}>
    <Loader />
  </div>
);

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  useEffect(() => {
    if (hash || (state as { scrollTo?: string } | null)?.scrollTo) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, state]);
  return null;
}

function RoutedContent() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registration" element={<RegisterForm />} />
          <Route path="/codegeneration" element={<CodeGeneration />} />
          <Route
            path="/visualization"
            element={<VisualizationArchitecture />}
          />
          <Route path="/knowledgebase" element={<KnowledgeBase />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route path="/playground" element={<Playground />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RoutedContent />
    </BrowserRouter>
  );
}

export default App;
