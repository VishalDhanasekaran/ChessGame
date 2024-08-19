import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-place-holder',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './place-holder.component.html',
  styleUrl: './place-holder.component.css'
})
export class PlaceHolderComponent {

}
