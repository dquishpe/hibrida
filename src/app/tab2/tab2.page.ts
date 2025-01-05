import { Component } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSelect, IonSelectOption, IonTextarea,IonButton, IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Chart } from 'chart.js/auto';
 /* Importe el servicio */
 import { ProviderService } from '../services/provider.service';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSelect, IonSelectOption, IonTextarea,IonButton,
    IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent]
})
export class Tab2Page {

  /* Arreglo con datos locales */
  dataList: any[] = [];
  chart: any;

  /* Nombre de la colección */
  collectionName = 'reviews';

  /* Inyecte la dependencia a Firestore */
  constructor(private providerService: ProviderService) { }

  /* Instancie un formulario */
  myForm: FormGroup = new FormGroup({
    score: new FormControl("", Validators.required),
    opinion: new FormControl("", Validators.required)
  });

  /* El método onSubmit para enviar los datos del formulario mediante el servicio */
  onSubmit() {
    const currentDate = this.getCurrentDate(); // Obtener la fecha actual
  const formData = { ...this.myForm.value, date: currentDate }; // Combinar datos del formulario con la fecha

  this.providerService.createDocument(this.collectionName, formData).then(() => {
    this.myForm.reset();
    this.loadData(); // Recargar datos para actualizar el gráfico
  });
  }
  getCurrentDate(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

   /* Al inicializar, carga los datos  */
   ngOnInit() {
    this.loadData();
  }

  averageScore: number = 0; // Almacena el promedio
  feedbackMessage: string = ''; // Mensaje basado en el promedio

  loadData() {
    this.providerService.readCollection(this.collectionName).subscribe((data) => {
        this.dataList = data;
        this.createChart(); // Crear el gráfico después de cargar los datos
        this.calculateWeeklyAverage(); // Calcular promedio después de cargar los datos
        this.updateFeedbackMessage();  // Actualizar el mensaje basado en el promedio
    });
  }

  calculateWeeklyAverage() {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Lunes actual
    const weeklyData = this.dataList.filter(datum => {
      const [day, month, year] = datum.date.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= startOfWeek;
    });
  
    if (weeklyData.length > 0) {
      const totalScore = weeklyData.reduce((sum, datum) => sum + parseInt(datum.score, 10), 0);
      this.averageScore = totalScore / weeklyData.length;
    } else {
      this.averageScore = 0; // No hay datos
    }
  }
  
  updateFeedbackMessage() {
    const roundedAverage = this.averageScore.toFixed(2); // Redondea a 2 decimales
  
    if (this.averageScore >= 4.5) {
      this.feedbackMessage = `¡Estás teniendo una semana increíble! Tu promedio es ${roundedAverage}. Sigue así.`;
    } else if (this.averageScore >= 3) {
      this.feedbackMessage = `Tu semana ha sido buena, con un promedio de ${roundedAverage}. Mantén el equilibrio.`;
    } else if (this.averageScore >= 1.5) {
      this.feedbackMessage = `Parece que ha sido una semana desafiante. Tu promedio es ${roundedAverage}. ¡Ánimo!`;
    } else {
      this.feedbackMessage = `Es un momento difícil, con un promedio de ${roundedAverage}. Pero todo mejora con el tiempo.`;
    }
  }
  
  createChart() {
    const scores = this.dataList.map(datum => datum.score); // Obtener valores de score
    const labels = this.dataList.map((datum, index) => datum.date || `Entry ${index + 1}`); // Etiquetas con fecha o índice
  
    const canvas = document.getElementById('scoreChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context.');
      return; // Salir si no hay contexto
    }
    
    if (this.chart) {
      this.chart.destroy(); // Destruir gráfico previo si existe
    }
  
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score Over Time',
          data: scores,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }
  

}
