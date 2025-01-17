import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDefaultTopicComponent } from './add-default-topic.component';

describe('AddDefaultTopicComponent', () => {
  let component: AddDefaultTopicComponent;
  let fixture: ComponentFixture<AddDefaultTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDefaultTopicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDefaultTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
