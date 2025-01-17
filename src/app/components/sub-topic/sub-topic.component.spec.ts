import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTopicComponent } from './sub-topic.component';

describe('SubTopicComponent', () => {
  let component: SubTopicComponent;
  let fixture: ComponentFixture<SubTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubTopicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
