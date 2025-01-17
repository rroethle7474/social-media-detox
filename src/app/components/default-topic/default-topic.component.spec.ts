import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultTopicComponent } from './default-topic.component';

describe('DefaultTopicComponent', () => {
  let component: DefaultTopicComponent;
  let fixture: ComponentFixture<DefaultTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultTopicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefaultTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
