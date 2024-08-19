import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderBannerComponent } from './header-banner/header-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , HeaderBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ChessGameFrontPage';
}
