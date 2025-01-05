import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';
import { TeachablemachineService } from '../services/teachablemachine.service';
import { PercentPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonCardHeader,
    IonCardTitle,
    CommonModule,
    PercentPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class Tab1Page {
  // Declare existing attributes
  topPrediction: any | null = null;

  // Add the suggestions for predictions
  suggestions: { [key: string]: string } = {
    Angry:
      'Anger can be difficult to manage. Try to practice relaxation techniques.',
    Disgust:
      'Disgust can be triggered by many things. Consider deep breathing exercises.',
    Fear: 'Fear is a natural response. Exposure therapy may help in reducing its impact.',
    Happy: 'Happiness is great! Keep doing things that bring you joy.',
    Neutral:
      'Neutral emotions are often a sign of balance. Take this moment to relax.',
    Sad: 'Sadness is part of life. Try reaching out to a friend or counselor.',
    Surprise:
      'Surprise can be exciting! Embrace the moment and see what happens next.',
  };

  /* Declare la referencia al elemento con el id image */
  @ViewChild('image', { static: false })
  imageElement!: ElementRef<HTMLImageElement>;

  imageReady = signal(false);
  imageUrl = signal('');

  /* Declare los atributos para almacenar el modelo y la lista de clases */
  modelLoaded = signal(false);
  classLabels: string[] = [];

  /* Lista de predicciones */
  predictions: any[] = [];

  /* Registre el servicio en el constructor */
  constructor(private teachablemachine: TeachablemachineService) {
    addIcons({ cloudUploadOutline });
  }

  async predict() {
    try {
      const image = this.imageElement.nativeElement;
      this.predictions = await this.teachablemachine.predict(image);

      // Determine the most probable prediction
      if (this.predictions?.length > 0) {
        this.topPrediction = this.predictions.reduce((max, current) =>
          current.probability > max.probability ? current : max
        );
      }
    } catch (error) {
      console.error(error);
      alert('Error al realizar la predicción.');
    }
  }

  /* Método ngOnInit para cargar el modelo y las clases */
  async ngOnInit() {
    await this.teachablemachine.loadModel();
    this.classLabels = this.teachablemachine.getClassLabels();
    this.modelLoaded.set(true);
  }
  /* El método onSubmit para enviar los datos del formulario mediante el servicio */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();

      // Convertir el archivo a una URL base64 para mostrarlo en el html
      reader.onload = () => {
        this.imageUrl.set(reader.result as string);
        this.imageReady.set(true);
      };

      reader.readAsDataURL(file); // Leer el archivo como base64
    }
  }
}
