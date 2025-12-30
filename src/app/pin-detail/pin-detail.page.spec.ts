import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PinDetailPage } from './pin-detail.page';

describe('PinDetailPage', () => {
  let component: PinDetailPage;
  let fixture: ComponentFixture<PinDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PinDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
