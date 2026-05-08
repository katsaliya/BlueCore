import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { VoiceHomeV2 } from "./screens/VoiceHomeV2";
import { Dashboard } from "./screens/Dashboard";
import { Schedule } from "./screens/Schedule";
import { Connect } from "./screens/Connect";
import { NewsFeed } from "./screens/NewsFeed";
import { Profile } from "./screens/Profile";
import { PastDocuments } from "./screens/PastDocuments";
import Landing from "./screens/Landing";
import { DocumentPreview } from "./screens/DocumentPreview";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/app", Component: VoiceHomeV2 },
  { path: "/document-preview", Component: DocumentPreview },
  { path: "/home-v2", Component: VoiceHomeV2 },
  {
    Component: Root,
    children: [
      { path: "/social", Component: Connect },
      { path: "/documents", Component: PastDocuments },
      { path: "/profile", Component: Profile },
      { path: "/insights", Component: Dashboard },
      { path: "/schedule", Component: Schedule },
      { path: "/news", Component: NewsFeed },
    ],
  },
]);