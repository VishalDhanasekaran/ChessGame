import { Component } from "@angular/core";

@Component({
  selector: "app-redirect-to-play-component",
  standalone: true,
  imports: [],
  templateUrl: "./redirect-to-play-component.component.html",
  styleUrl: "./redirect-to-play-component.component.css",
})
export class RedirectToPlayComponentComponent {
  redirectToExternalUrl(): void {
    window.open("http://localhost:5173", "_self");
  }
}
