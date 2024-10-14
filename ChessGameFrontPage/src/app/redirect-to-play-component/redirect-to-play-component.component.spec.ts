import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectToPlayComponentComponent } from './redirect-to-play-component.component';

describe('RedirectToPlayComponentComponent', () => {
  let component: RedirectToPlayComponentComponent;
  let fixture: ComponentFixture<RedirectToPlayComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectToPlayComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedirectToPlayComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
