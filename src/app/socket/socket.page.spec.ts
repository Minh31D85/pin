import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketPage } from './socket';

describe('SocketPage', () => {
  let component: SocketPage;
  let fixture: ComponentFixture<SocketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SocketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
