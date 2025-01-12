import { Component } from '@angular/core';
import { IonCard, IonBadge, IonCardHeader, IonCardTitle, IonCardContent, IonSelect, IonSelectOption, IonTextarea, IonButton, IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ProviderService } from '../services/provider.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSelect, IonSelectOption, IonTextarea, IonButton, IonBadge,
    IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent]
})

export class Tab2Page {
  dataList: any[] = [];
  filteredDataList: any[] = [];
  chart: any;
  collectionName = 'reviews';
  constructor(private providerService: ProviderService) { }
  myForm: FormGroup = new FormGroup({
    score: new FormControl("", Validators.required),
    opinion: new FormControl("", Validators.required)
  });
  onSubmit() {
    const currentDate = this.getCurrentDate(); // Fecha actual
    const existingEntry = this.dataList.find(datum => datum.date === currentDate);
    if (existingEntry) {
      alert('Ya has enviado una respuesta para el día de hoy.'); // Mensaje de advertencia
      return; // Salir sin guardar
    }
    const formData = { ...this.myForm.value, date: currentDate };
    this.providerService.createDocument(this.collectionName, formData).then(() => {
      this.myForm.reset();
      this.loadData();
    });
  }
  getCurrentDate(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  ngOnInit() {
    this.loadData();
  }
  averageScore: number = 0;
  feedbackMessage: string = '';
  loadData() {
    this.providerService.readCollection(this.collectionName).subscribe((data) => {
      this.dataList = data;
      this.dataList.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });
      this.filterCurrentWeekData();  // Filtra los datos de la semana actual
      this.createChart();  
      this.calculateWeeklyAverage();
      this.updateFeedbackMessage();
    });
  }
  filterCurrentWeekData() {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));  // Lunes como primer día
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - (now.getDay() === 0 ? 6 : now.getDay() - 1)));  // Sábado como último día
    
    this.filteredDataList = this.dataList.filter(datum => {
      const [day, month, year] = datum.date.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= startOfWeek && date <= endOfWeek;  // Comparación del rango completo de la semana
    });
  }
  
  calculateWeeklyAverage() {
    const now = new Date();
    // Ajustar el primer día de la semana a lunes
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() || 7) + 1);
    const weeklyData = this.dataList.filter(datum => {
      const [day, month, year] = datum.date.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= startOfWeek;
    });
    const validScores = weeklyData.map(datum => parseInt(datum.score, 10)).filter(score => !isNaN(score)); // Filtrar solo puntajes válidos
    if (validScores.length > 0) {
      const totalScore = validScores.reduce((sum, score) => sum + score, 0);
      this.averageScore = totalScore / validScores.length; // Calcular promedio sin contar días sin registro
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
      this.feedbackMessage = `Parece que ha sido una semana desafiante.Tu promedio es ${roundedAverage}. ¡Ánimo!`;
    } else {
      this.feedbackMessage = `Es un momento difícil, con un promedio de ${roundedAverage}. Pero todo mejora con el tiempo.`;
    }
  }
  createChart() {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() || 7) + 1);

    const weeklyData = this.dataList.filter(datum => {
      const [day, month, year] = datum.date.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= startOfWeek && date <= now; // Asegura que estén dentro de la semana
    });

    weeklyData.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    const scores = weeklyData.map(datum => datum.score);
    const labels = weeklyData.map(datum => datum.date);

    const canvas = document.getElementById('scoreChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context.');
      return;
    }

    if (this.chart) {
      this.chart.destroy(); // Destruir gráfico previo si existe
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,  // Usar las fechas filtradas
        datasets: [{
          label: 'Score Over Time',
          data: scores,    // Usar los puntajes correspondientes
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgb(252, 252, 252)',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0, // Mínimo valor del eje Y
            max: 5, // Máximo valor del eje Y
            ticks: {
              stepSize: 1 // Opcional: define los pasos entre los valores del eje Y
            }
          }
        }
      }
    });
  }

}