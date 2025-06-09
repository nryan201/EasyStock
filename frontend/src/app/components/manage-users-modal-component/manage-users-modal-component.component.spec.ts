import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUsersModalComponentComponent } from './manage-users-modal-component.component';

describe('ManageUsersModalComponentComponent', () => {
  let component: ManageUsersModalComponentComponent;
  let fixture: ComponentFixture<ManageUsersModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageUsersModalComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUsersModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
