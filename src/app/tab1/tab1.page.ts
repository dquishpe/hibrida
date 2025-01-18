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
  IonCardSubtitle,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, analyticsOutline } from 'ionicons/icons';
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
    IonCardSubtitle,
    IonThumbnail,
  ],
})
export class Tab1Page {
  // Atributos existentes
  topPrediction: any | null = null;

  // Sugerencias para las predicciones
  suggestions: { [key: string]: { message: string, videoLink: string, playlistLink: string } } = {
    Angry: {
      message: 'Anger can be difficult to manage. Try to practice relaxation techniques.',
      videoLink: 'https://youtu.be/3opO2_k2uhI?si=jBIP5lv4PaSzdlrW', // Anger Management Relaxation Techniques
      playlistLink: 'https://youtu.be/m-H-H-hYrT4?si=5dGp2-o0ZxNTVRAW' // Relaxing Music to Reduce Anger
    },
    Disgust: {
      message: 'Disgust can be triggered by many things. Consider deep breathing exercises.',
      videoLink: 'https://youtu.be/7E68A8rE_BA?si=1v87SV6Q5VRT1wSB', // Deep Breathing to Calm Down
      playlistLink: 'https://youtu.be/m-H-H-hYrT4?si=5dGp2-o0ZxNTVRAW' // Mindfulness Music for Relaxation
    },
    Fear: {
      message: 'Fear is a natural response. Exposure therapy may help in reducing its impact.',
      videoLink: 'https://youtu.be/4hLhwQp2xOo?si=SveMjzwcigRpm0qN', // Overcome Fear Breathing & Meditation
      playlistLink: 'https://youtu.be/m-H-H-hYrT4?si=5dGp2-o0ZxNTVRAW' // Calming Music for Overcoming Anxiety
    },
    Happy: {
      message: 'Happiness is great! Keep doing things that bring you joy.',
      videoLink: 'https://youtu.be/4hLhwQp2xOo?si=SveMjzwcigRpm0qN', // Happy Vibes Only
      playlistLink: 'https://youtu.be/c_Gdi945_RI?si=ZThSRA-cpqy3fzbd' // Happy Music for Positive Energy
    },
    Neutral: {
      message: 'Neutral emotions are often a sign of balance. Take this moment to relax.',
      videoLink: 'https://www.youtube.com/live/UOJ4V3DAAx8?si=JAAw-tm4r8rXjeQo', // Calm and Peaceful Music
      playlistLink: 'https://youtu.be/eXsU_EUMWOE?si=xmYjyvRY-UhJpTco' // Chillout Music for Focus & Balance
    },
    Sad: {
      message: 'Sadness is part of life. Try reaching out to a friend or counselor.',
      videoLink: 'https://youtu.be/7E68A8rE_BA?si=1v87SV6Q5VRT1wSB', // How to Cope with Sadness
      playlistLink: 'https://youtu.be/eXsU_EUMWOE?si=xmYjyvRY-UhJpTco' // Healing Music for Sadness
    },
    Surprise: {
      message: 'Surprise can be exciting! Embrace the moment and see what happens next.',
      videoLink: 'https://youtu.be/Mhj15W23IjA?si=AWYAjJcRKEsstu1O', // Inspirational Speech on Embracing Surprises
      playlistLink: 'https://youtu.be/OO2kPK5-qno?si=rq4wR3J8v4Ihvzhm' // Uplifting Music for Surprises
    },
  };

  @ViewChild('image', { static: false }) imageElement!: ElementRef<HTMLImageElement>;

  imageReady = signal(false);
  imageUrl = signal('');
  modelLoaded = signal(false);
  classLabels: string[] = [];
  predictions: any[] = [];

  constructor(private teachablemachine: TeachablemachineService) {
    addIcons({ cloudUploadOutline, analyticsOutline });
  }

  async predict() {
    try {
      const image = this.imageElement.nativeElement;
      this.predictions = await this.teachablemachine.predict(image);

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

  async ngOnInit() {
    await this.teachablemachine.loadModel();
    this.classLabels = this.teachablemachine.getClassLabels();
    this.modelLoaded.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imageUrl.set(reader.result as string);
        this.imageReady.set(true); // Ocultar el mensaje y botón después de subir la foto
      };

      reader.readAsDataURL(file);
    }
  }
}
