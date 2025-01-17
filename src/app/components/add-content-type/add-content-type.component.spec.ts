import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContentTypeComponent } from './add-content-type.component';

describe('AddContentTypeComponent', () => {
  let component: AddContentTypeComponent;
  let fixture: ComponentFixture<AddContentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContentTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddContentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
