import { Routes } from "@angular/router";
import { HeaderBannerComponent } from "./header-banner/header-banner.component";
import { NotFoundComponent } from "./not-found/not-found.component";

import { PlaceHolderComponent } from "./place-holder/place-holder.component";
import { RedirectToPlayComponentComponent } from "./redirect-to-play-component/redirect-to-play-component.component";
export const routes: Routes = [
  { path: "home", component: HeaderBannerComponent },
  { path: "", component: HeaderBannerComponent },
  { path: "NEWS", component: PlaceHolderComponent },
  { path: "LIVE_SCOREBOARD", component: PlaceHolderComponent },
  { path: "PLAY", component: RedirectToPlayComponentComponent },
  { path: "**", component: NotFoundComponent },
];
