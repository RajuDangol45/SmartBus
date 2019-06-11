import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as CanvasJS from '../../assets/lib/canvasjs-2.3.1/canvasjs.min';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-bus-details',
  templateUrl: './bus-details.component.html',
  styleUrls: ['./bus-details.component.scss']
})
export class BusDetailsComponent implements OnInit {

  public busID: string;

  private stations = [
    'Kathmandu',
    'Bhaktapur'
  ];

  temperature = [];
  speed = [];
  humidity = [];
  timeLine = [];
  currentStation: string;
  eta: number;
  nextStation: string;
  dataLoaded = false;

  hasCrashed = false;
  crashedAgo = new Date();

  constructor(
    private route: ActivatedRoute,
    private fireStore: AngularFirestore
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.busID = params.id;
      this.currentStation = params.current_station;
      let eta1 = params.eta;
      eta1 = eta1 / 60;
      this.eta = parseInt(eta1);
      this.eta.toString();
      for (let i = 0; i < this.stations.length; i++) {
        if (this.stations[i] === this.currentStation) {
          if (i + 1 === this.stations.length) {
            this.nextStation = this.stations[0];
          } else {
            this.nextStation = this.stations[i + 1];
          }
        }
      }
    });
    this.getBusData();
  }

  getBusData() {
    this.fireStore.collection(this.busID).snapshotChanges().subscribe(res => {
      this.crashedAgo = new Date();
      const timelineData = res.map(e => {
        return {
          busData: e.payload.doc.data()
        };
      });
      this.temperature = [];
      this.speed = [];
      this.humidity = [];
      timelineData.sort((a, b) => {
        return ((b.busData as any).date.seconds) - ((a.busData as any).date.seconds);
      });
      timelineData.reverse();
      timelineData.forEach(timedData => {
        if (this.temperature.length === 24) {
          this.temperature.splice(0, 1);
        }
        this.temperature.push((timedData.busData as any).temperature);
        if (this.speed.length === 24) {
          this.speed.splice(0, 1);
        }
        this.speed.push((timedData.busData as any).speed);
        if (this.humidity.length === 24) {
          this.humidity.splice(0, 1);
        }
        this.humidity.push((timedData.busData as any).humidity);
        if (this.timeLine.length === 24) {
          this.timeLine.splice(0, 1);
        }
        this.timeLine.push(this.localize(this.toDateTime((timedData.busData as any).date.seconds)));
        this.eta = (timedData.busData as any).eta;
        if ((timedData.busData as any).crash_status === 'crashed') {
          if (this.crashedAgo && (this.crashedAgo > (timedData.busData as any).date.seconds)) {
            this.crashedAgo = (timedData.busData as any).date.seconds;
          }
          this.hasCrashed = true;
        } else {
          this.hasCrashed = false;
        }
      });
      this.dataLoaded = true;
      this.loadChart('temperatureChart', 'Temperature', this.temperature, 'Celsius');
      this.loadChart('humidityChart', 'Humidity', this.humidity, '%');
      this.loadChart('speedChart', 'Speed', this.speed, 'km/h');
      this.crashedAgo = this.localize(this.toDateTime(this.crashedAgo));
    });
  }

  loadChart(divId, title, dataForChart, yAxisTitle) {
    const dataPoints = [];
    let index = 0;
    for (const res of dataForChart) {
      dataPoints.push({
        x: this.timeLine[index],
        y: res
      });
      index = index + 1;
    }
    const chart = new CanvasJS.Chart(divId, {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: title
      },
      axisX: {
        interval: 1,
        valueFormatString: 'hh:mm TT'
      },
      axisY: {
        title: yAxisTitle
      },
      data: [
        {
          type: 'line',
          dataPoints: dataPoints
        }]
    })
    chart.render();
  }

  toDateTime(secs) {
    let t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
  }

  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  localize(t) {
    const d = new Date(t + ' UTC');
    return new Date(d.toString());
  }
}

