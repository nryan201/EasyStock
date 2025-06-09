import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPasswordCheckModalComponent } from './app-password-check-modal.component';

describe('AppPasswordCheckModalComponent', () => {
  let component: AppPasswordCheckModalComponent;
  let fixture: ComponentFixture<AppPasswordCheckModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPasswordCheckModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPasswordCheckModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
