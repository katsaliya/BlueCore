import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { VoiceHomeV2 } from "./screens/VoiceHomeV2";
import { Schedule } from "./screens/Schedule";
import { Connect } from "./screens/Connect";
import { Profile } from "./screens/Profile";
import { PastDocuments } from "./screens/PastDocuments";
import Landing from "./screens/Landing";
import { DocumentPreview } from "./screens/DocumentPreview";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Onboarding from "./screens/Onboarding";
import { ManagerHome } from "./screens/ManagerHome";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  { path: "/onboarding", Component: Onboarding },
  { path: "/manager-home", Component: ManagerHome },
  { path: "/document-preview", Component: DocumentPreview },
  {
    Component: Root,
    children: [
      { path: "/home-v2", Component: VoiceHomeV2 },
      { path: "/social", Component: Connect },
      { path: "/documents", Component: PastDocuments },
      { path: "/profile", Component: Profile },
      { path: "/schedule", Component: Schedule },
    ],
  },
]);