import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentTicketModalComponent } from './incident-ticket-modal.component';

describe('IncidentTicketModalComponent', () => {
  let component: IncidentTicketModalComponent;
  let fixture: ComponentFixture<IncidentTicketModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentTicketModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentTicketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
