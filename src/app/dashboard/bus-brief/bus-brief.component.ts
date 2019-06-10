import { Component, OnInit, Input, Output } from '@angular/core';
import { BusDetails } from 'src/app/shared/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bus-brief',
  templateUrl: './bus-brief.component.html',
  styleUrls: ['./bus-brief.component.scss']
})
export class BusBriefComponent implements OnInit {

  @Input()
  busDetail: BusDetails;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  seeBusDetails() {
    this.router.navigate(['/bus-details'], {
      queryParams: {
        id: this.busDetail.id,
        current_station: this.busDetail.busData.current_station,
        eta: this.busDetail.busData.eta
      }
    });
  }

}
