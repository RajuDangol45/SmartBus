import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseDatabase, AngularFireModule } from '@angular/fire';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private buses = [];
  public lastRead: Date;
  public hasCrashed = false;

  private stations = [
    'Kathmandu',
    'Bhaktapur',
    'Patan'
  ];

  private dataStoreInterval = 60000;
  private dataDeleteInterval = 3600000;

  private fireList;
  private receivedData;

  private currentBusId = 'BA 75 55 53';

  constructor(
    private fireStore: AngularFirestore,
    private fireDb: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.fireStore.collection('buses').snapshotChanges().subscribe(res => {
      this.buses = res.map(e => {
        return {
          id: e.payload.doc.id,
          busData: e.payload.doc.data()
        };
      });
      this.lastRead = new Date();
    });
    this.storeBusData();
    // this.deleteStoredData();

    this.fireList = this.fireDb.list('/');
    this.fireList.snapshotChanges().subscribe(res => {
      this.receivedData = {
        busStop: res[0].payload.node_.value_,
        humidity: res[1].payload.node_.value_,
        speed: res[2].payload.node_.value_,
        status: res[3].payload.node_.value_,
        temperature: res[4].payload.node_.value_,
        time: res[5].payload.node_.value_,
        towards: res[6].payload.node_.value_
      };
      this.receivedData.speed = this.receivedData.speed * 30;
      if (this.receivedData.status === 'false' && !this.hasCrashed) {
        this.hasCrashed = true;
        if (this.buses.length > 0) {
          this.buses.forEach(bus => {
            this.fireStore.collection(bus.id).add({
              date: new Date(),
              temperature: bus.busData.temperature,
              crash_status: bus.busData.crash_status,
              humidity: bus.busData.humidity,
              speed: bus.busData.speed,
              eta: bus.busData.eta
            });
          });
        }
      } else if(this.receivedData.status === 'true' && this.hasCrashed) {
        this.hasCrashed = false;
      }
      this.fireStore.collection('buses').doc(this.currentBusId).set({
        crash_status: (this.receivedData.status === 'true') ? 'not crashed' : 'crashed',
        current_station: this.stations[this.receivedData.busStop],
        eta: this.receivedData.time,
        humidity: this.receivedData.humidity,
        speed: this.receivedData.speed,
        temperature: this.receivedData.temperature
      });
    });
  }

  storeBusData() {
    setInterval(() => {
      if (this.buses.length > 0) {
        this.buses.forEach(bus => {
          this.fireStore.collection(bus.id).add({
            date: new Date(),
            temperature: bus.busData.temperature,
            crash_status: bus.busData.crash_status,
            humidity: bus.busData.humidity,
            speed: bus.busData.speed,
            eta: bus.busData.eta
          });
        });
      }
    }, this.dataStoreInterval);
  }

  deleteStoredData() {
    setInterval(() => {
      if (this.buses.length > 0) {
        this.buses.forEach(bus => {
          this.fireStore.collection(bus.id).snapshotChanges().subscribe(res => {
            const ids = res.map(e => {
              return {
                id: e.payload.doc.id
              };
            });
            ids.forEach(dataId => {
              this.fireStore.collection(bus.id).doc(dataId.id).delete();
            });
          });
        });
      }
    }, this.dataDeleteInterval);
  }

  refreshPage() {
    location.reload();
  }

  deleteData() {
    if (this.buses.length > 0) {
      this.buses.forEach(bus => {
        this.fireStore.collection(bus.id).snapshotChanges().subscribe(res => {
          const ids = res.map(e => {
            return {
              id: e.payload.doc.id
            };
          });
          ids.forEach(dataId => {
            this.fireStore.collection(bus.id).doc(dataId.id).delete();
          });
        });
      });
    }
  }
}
