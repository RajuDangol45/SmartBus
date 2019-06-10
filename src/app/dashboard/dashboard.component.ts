import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseDatabase } from '@angular/fire';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private buses = [];
  public lastRead: Date;
  public hasCrashed = false;

  private dataStoreInterval = 60000;
  private dataDeleteInterval = 3600000;

  constructor(
    private fireStore: AngularFirestore
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
    // this.storeBusData();
    // this.deleteStoredData();
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
