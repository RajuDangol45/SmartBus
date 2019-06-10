import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusBriefComponent } from './bus-brief.component';

describe('BusBriefComponent', () => {
  let component: BusBriefComponent;
  let fixture: ComponentFixture<BusBriefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusBriefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusBriefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
