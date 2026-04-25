import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { VoiceHome } from "./screens/VoiceHome";
import { VoiceHomeV2 } from "./screens/VoiceHomeV2";
import { Dashboard } from "./screens/Dashboard";
import { Schedule } from "./screens/Schedule";
import { Connect } from "./screens/Connect";
import { Wellbeing } from "./screens/Wellbeing";
import { NewsFeed } from "./screens/NewsFeed";
import { Profile } from "./screens/Profile";
import { ConversationView } from "./screens/ConversationView";
import { PastDocuments } from "./screens/PastDocuments";
import { Splash } from "./screens/Splash";

export const router = createBrowserRouter([
  { path: "/splash", Component: Splash },
  { path: "/home-v2", Component: VoiceHomeV2 },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: VoiceHomeV2 },
      { path: "conversation", Component: ConversationView },
      { path: "insights", Component: Dashboard },
      { path: "schedule", Component: Schedule },
      { path: "social", Component: Connect },
      { path: "wellbeing", Component: Wellbeing },
      { path: "news", Component: NewsFeed },
      { path: "profile", Component: Profile },
      { path: "documents", Component: PastDocuments },
    ],
  },
]);