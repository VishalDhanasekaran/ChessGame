import { Component, Input } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-header-banner',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './header-banner.component.html',
  styleUrl: './header-banner.component.css'
})
export class HeaderBannerComponent {
  @Input() Heading : string = "Pawn-Hub" 
  @Input() Description : string = "A Platform to Play/Watch chess"
}
