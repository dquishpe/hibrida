import { Component } from '@angular/core';
import { IonCardSubtitle } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [
    IonCardSubtitle,
    ExploreContainerComponent,
    IonicModule,
    CommonModule,
  ],
})
export class Tab3Page {
  constructor() {}

  members = [
    {
      name: 'Dhamar Quishpe',
      role: 'Computer Science Engineering Student',
      photo: 'assets/images/quishpe_dhamar.jpeg', // Replace with your image path
    },
    {
      name: 'Randy Rivera',
      role: 'Computer Science Engineering Student',
      photo: 'assets/images/rivera_randy.jpeg', // Replace with your image path
    },
    {
      name: 'Jose Marin',
      role: 'Computer Science Engineering Student',
      photo: 'assets/images/marin_jose.jpg', // Replace with your image path
    },
  ];
}
